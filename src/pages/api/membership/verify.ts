import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getMembershipKv, getMemberByMembershipId, getActiveMemberByEmail } from '../../../lib/membership/store';
import { isMembershipActive, MEMBERSHIP_EVENT_DISCOUNT_PERCENTAGE } from '../../../lib/membership/status';

export const prerender = false;

const MEMBERSHIP_ID_PATTERN = /^ADCF-M-\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const INELIGIBLE = { valid: false } as const;

/**
 * Membership eligibility check, meant to be called by the Forum's event
 * ticketing system to decide whether to apply the member discount. Returns
 * only what's needed to make that decision — never the member's name,
 * email, organisation, or any other personal/professional information, even
 * on a valid match. `{ valid: false }` is returned uniformly for "not
 * found", "expired", "cancelled" and "pending" alike, so a caller can't use
 * this endpoint to enumerate which emails/IDs exist in the system.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  if (typeof body !== 'object' || body === null) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { membershipId, email } = body as Record<string, unknown>;

  const hasMembershipId = typeof membershipId === 'string' && membershipId.trim().length > 0;
  const hasEmail = typeof email === 'string' && email.trim().length > 0;

  if (hasMembershipId === hasEmail) {
    return json({ error: 'Provide exactly one of membershipId or email.' }, 400);
  }

  if (hasMembershipId && !MEMBERSHIP_ID_PATTERN.test((membershipId as string).trim())) {
    return json({ error: 'Invalid membershipId format.' }, 400);
  }

  if (hasEmail && !EMAIL_PATTERN.test((email as string).trim())) {
    return json({ error: 'Invalid email format.' }, 400);
  }

  let kv;
  try {
    kv = getMembershipKv(env as unknown as { MEMBERSHIPS?: KVNamespace });
  } catch {
    return json({ error: 'Membership storage is not configured.' }, 503);
  }

  const record = hasMembershipId
    ? await getMemberByMembershipId(kv, (membershipId as string).trim())
    : await getActiveMemberByEmail(kv, (email as string).trim());

  if (!record || !isMembershipActive(record)) {
    return json(INELIGIBLE);
  }

  return json({
    valid: true,
    membershipType: record.membershipType,
    expiryDate: record.expiryDate,
    discountPercentage: MEMBERSHIP_EVENT_DISCOUNT_PERCENTAGE,
  });
};
