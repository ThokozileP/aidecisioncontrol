import type { MembershipApplicationInput } from './schema';
import type { MemberSummary, MembershipRecord, PaymentStatus } from './types';
import { toMemberSummary, MEMBERSHIP_ANNUAL_FEE_CENTS, MEMBERSHIP_CURRENCY, MEMBERSHIP_DURATION_MONTHS, MEMBERSHIP_TYPE } from './types';

/**
 * Storage for membership applications and activated memberships.
 *
 * Backed by Cloudflare Workers KV — the only persistence layer this project
 * has. This is a deliberate, documented trade-off, not an oversight:
 *
 * - KV has no transactions or compare-and-swap, so the sequential membership
 *   ID counter (`nextMembershipId` below) is a best-effort read-then-write.
 *   Two activations racing within the same read/write window could in
 *   theory compute the same next number. In practice this project's expected
 *   volume (a professional membership programme, not high-frequency
 *   checkout) makes that collision extremely unlikely — but it is not
 *   impossible. If membership volume ever grows enough for concurrent
 *   activations to be routine, move this counter to a Cloudflare Durable
 *   Object (single-instance, strongly consistent) or a real database with
 *   transactions. Do not "fix" this with more KV reads/writes — KV is
 *   globally eventually-consistent (propagation can take up to ~60s across
 *   regions per Cloudflare's docs), so no read-check-then-write pattern
 *   built on it is actually atomic, however many extra calls it makes.
 * - The same caveat applies to two *different* code paths racing to
 *   activate the *same* checkout session (the Stripe webhook and the
 *   member's browser landing on the success page can both attempt
 *   activation). This is mitigated, not eliminated: activation is a no-op
 *   once `paymentStatus` is already `'paid'`, which covers the realistic
 *   case where one path completes at least one KV round-trip before the
 *   other starts (near-always true in practice, since the webhook and the
 *   browser redirect fire from different triggers seconds apart).
 *
 * See README.md "Known limitations" for the operational summary of this.
 */

const MEMBER_PREFIX = 'member:';
const COUNTER_KEY = 'counter:membership';
const memberKey = (applicationId: string) => `${MEMBER_PREFIX}${applicationId}`;
const sessionKey = (stripeCheckoutSessionId: string) => `session:${stripeCheckoutSessionId}`;
const membershipIdKey = (membershipId: string) => `membershipid:${membershipId}`;
const emailKey = (email: string) => `email:${email.trim().toLowerCase()}`;

export class MembershipStoreNotConfiguredError extends Error {
  constructor() {
    super(
      'The MEMBERSHIPS KV namespace is not bound. Create it with ' +
        '`npx wrangler kv namespace create MEMBERSHIPS`, add the id to wrangler.toml, ' +
        'and restart the dev server. See README.md "Membership application".'
    );
    this.name = 'MembershipStoreNotConfiguredError';
  }
}

export function getMembershipKv(env: { MEMBERSHIPS?: KVNamespace }): KVNamespace {
  if (!env.MEMBERSHIPS) throw new MembershipStoreNotConfiguredError();
  return env.MEMBERSHIPS;
}

/**
 * Looks up an existing *pending* application for reuse when a member retries
 * payment (e.g. after cancelling on Stripe's page) instead of minting a new
 * one every attempt. Returns null — never throws — for anything that isn't a
 * safe reuse: unknown id, already-paid/failed/cancelled record, or an email
 * mismatch. The email check is the only "ownership" proof available (there
 * are no member accounts); it's enough to stop a guessed applicationId from
 * being used to overwrite a stranger's in-progress draft, while the actual
 * membership can still only ever be activated by a real Stripe payment.
 */
export async function findReusableApplication(
  kv: KVNamespace,
  applicationId: string | undefined | null,
  email: string
): Promise<MembershipRecord | null> {
  if (!applicationId) return null;
  const record = await kv.get<MembershipRecord>(memberKey(applicationId), 'json');
  if (!record) return null;
  if (record.paymentStatus !== 'pending') return null;
  if (record.email.trim().toLowerCase() !== email.trim().toLowerCase()) return null;
  return record;
}

/**
 * Creates (or, when `applicationId` refers to a reusable pending record,
 * updates) an application tied to a freshly-created Stripe Checkout Session.
 */
export async function saveApplication(
  kv: KVNamespace,
  applicationId: string,
  stripeCheckoutSessionId: string,
  input: MembershipApplicationInput,
  existing: MembershipRecord | null
): Promise<MembershipRecord> {
  const now = new Date().toISOString();
  const record: MembershipRecord = {
    ...input,
    applicationId,
    membershipId: existing?.membershipId ?? null,
    membershipType: MEMBERSHIP_TYPE,
    annualFeeCents: MEMBERSHIP_ANNUAL_FEE_CENTS,
    currency: MEMBERSHIP_CURRENCY,
    paymentStatus: 'pending',
    startDate: existing?.startDate ?? null,
    expiryDate: existing?.expiryDate ?? null,
    stripeCheckoutSessionId,
    stripeCustomerId: existing?.stripeCustomerId ?? null,
    stripePaymentIntentId: existing?.stripePaymentIntentId ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await Promise.all([
    kv.put(memberKey(applicationId), JSON.stringify(record), { metadata: toMemberSummary(record) }),
    kv.put(sessionKey(stripeCheckoutSessionId), applicationId),
  ]);

  return record;
}

async function nextMembershipId(kv: KVNamespace): Promise<string> {
  const current = await kv.get(COUNTER_KEY);
  const next = (Number.parseInt(current ?? '0', 10) || 0) + 1;
  await kv.put(COUNTER_KEY, String(next));
  return `ADCF-M-${String(next).padStart(6, '0')}`;
}

export interface ActivationResult {
  record: MembershipRecord;
  /** True only when this call actually transitioned the record to 'paid' — false for idempotent no-ops (already paid, or a stale/superseded session). Callers should only send the welcome email when this is true. */
  activated: boolean;
}

/**
 * Idempotently activates the membership tied to a given Stripe Checkout
 * Session. Safe to call from both the webhook and the success page — once
 * `paymentStatus` is `'paid'`, later calls just return the existing record.
 */
export async function activateMembershipForSession(
  kv: KVNamespace,
  params: {
    stripeCheckoutSessionId: string;
    stripeCustomerId: string | null;
    stripePaymentIntentId: string | null;
  }
): Promise<ActivationResult> {
  const applicationId = await kv.get(sessionKey(params.stripeCheckoutSessionId));
  if (!applicationId) {
    throw new Error(`No application found for session ${params.stripeCheckoutSessionId}`);
  }

  const record = await kv.get<MembershipRecord>(memberKey(applicationId), 'json');
  if (!record) {
    throw new Error(`Application ${applicationId} not found`);
  }

  if (record.paymentStatus !== 'pending') {
    // Only a genuinely pending application can become paid. This also
    // covers 'cancelled'/'failed' records: a `checkout.session.completed`
    // event for a session this project has already marked terminal — via a
    // duplicate/replayed/out-of-order webhook delivery — must never flip it
    // to paid. Stripe is the source of truth for *whether* a session was
    // paid, but this project's own recorded state decides whether it's
    // still eligible to be acted on at all.
    return { record, activated: false };
  }

  if (record.stripeCheckoutSessionId !== params.stripeCheckoutSessionId) {
    // A retry has since moved this application on to a newer checkout
    // session — this event belongs to a session that's no longer current
    // (e.g. a late/duplicate delivery for an abandoned attempt). Never let
    // a stale session activate (or otherwise mutate) the live record.
    return { record, activated: false };
  }

  const membershipId = await nextMembershipId(kv);
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + MEMBERSHIP_DURATION_MONTHS);

  const updated: MembershipRecord = {
    ...record,
    membershipId,
    paymentStatus: 'paid',
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    stripeCustomerId: params.stripeCustomerId,
    stripePaymentIntentId: params.stripePaymentIntentId,
    updatedAt: startDate.toISOString(),
  };

  await Promise.all([
    kv.put(memberKey(applicationId), JSON.stringify(updated), { metadata: toMemberSummary(updated) }),
    kv.put(membershipIdKey(membershipId), applicationId),
    kv.put(emailKey(updated.email), applicationId),
  ]);

  return { record: updated, activated: true };
}

/**
 * Marks a checkout attempt as terminally failed/cancelled. Never downgrades
 * an already-paid record, and never acts on a session that a retry has
 * since superseded — both guard against a late/duplicate/out-of-order
 * webhook event corrupting a record that has moved on.
 */
export async function markPaymentTerminal(
  kv: KVNamespace,
  stripeCheckoutSessionId: string,
  status: Extract<PaymentStatus, 'failed' | 'cancelled'>
): Promise<MembershipRecord | null> {
  const applicationId = await kv.get(sessionKey(stripeCheckoutSessionId));
  if (!applicationId) return null;

  const record = await kv.get<MembershipRecord>(memberKey(applicationId), 'json');
  if (!record) return null;
  if (record.paymentStatus !== 'pending') return record;
  if (record.stripeCheckoutSessionId !== stripeCheckoutSessionId) return record;

  const updated: MembershipRecord = { ...record, paymentStatus: status, updatedAt: new Date().toISOString() };
  await kv.put(memberKey(applicationId), JSON.stringify(updated), { metadata: toMemberSummary(updated) });
  return updated;
}

export async function getMemberBySession(kv: KVNamespace, stripeCheckoutSessionId: string): Promise<MembershipRecord | null> {
  const applicationId = await kv.get(sessionKey(stripeCheckoutSessionId));
  if (!applicationId) return null;
  return kv.get<MembershipRecord>(memberKey(applicationId), 'json');
}

export async function getMemberByMembershipId(kv: KVNamespace, membershipId: string): Promise<MembershipRecord | null> {
  const applicationId = await kv.get(membershipIdKey(membershipId));
  if (!applicationId) return null;
  return kv.get<MembershipRecord>(memberKey(applicationId), 'json');
}

/** Returns the most recently *activated* membership for this email, if any — used by the verification endpoint. */
export async function getActiveMemberByEmail(kv: KVNamespace, email: string): Promise<MembershipRecord | null> {
  const applicationId = await kv.get(emailKey(email));
  if (!applicationId) return null;
  return kv.get<MembershipRecord>(memberKey(applicationId), 'json');
}

/**
 * Lists every application/membership for the admin dashboard and CSV export.
 * Reads only KV `list()` metadata (no per-record `get`), so this stays a
 * single cheap pass regardless of table size — the trade-off is that the
 * admin views only the compact `MemberSummary` fields, not the full
 * application (interests, LinkedIn, etc.), which the dashboard doesn't need.
 *
 * KV `list()` returns at most 1000 keys per page; this follows the cursor
 * until exhausted. Fine at this project's expected membership volume — if
 * that changes, this is the point to migrate to a database with real
 * pagination/query support.
 */
export async function listAllMembers(kv: KVNamespace): Promise<MemberSummary[]> {
  const results: MemberSummary[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list<MemberSummary>({ prefix: MEMBER_PREFIX, cursor, limit: 1000 });
    for (const key of page.keys) {
      if (key.metadata) results.push(key.metadata);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return results;
}
