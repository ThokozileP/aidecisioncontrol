import type { VolunteerApplicationRecord } from './types';

/**
 * Storage for volunteer applications (KV) and their CVs (R2) — see
 * README.md "Volunteer applications". Mirrors the binding-getter and
 * not-configured-error pattern from src/lib/membership/store.ts, but this
 * is a one-shot submission with no activation lifecycle, so the store
 * itself stays much smaller: one `put`, no read-then-write sequences.
 */

const APPLICATION_PREFIX = 'volunteer:';
const RATE_LIMIT_PREFIX = 'ratelimit:volunteer:';
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

const applicationKey = (applicantId: string) => `${APPLICATION_PREFIX}${applicantId}`;

export class VolunteerStoreNotConfiguredError extends Error {
  constructor() {
    super(
      'The VOLUNTEERS KV namespace is not bound. Create it with ' +
        '`npx wrangler kv namespace create VOLUNTEERS`, add the id to wrangler.toml, ' +
        'and restart the dev server. See README.md "Volunteer applications".'
    );
    this.name = 'VolunteerStoreNotConfiguredError';
  }
}

export class VolunteerCvBucketNotConfiguredError extends Error {
  constructor() {
    super(
      'The VOLUNTEER_CVS R2 bucket is not bound. Add an [[r2_buckets]] entry to ' +
        'wrangler.toml and restart the dev server. See README.md "Volunteer applications".'
    );
    this.name = 'VolunteerCvBucketNotConfiguredError';
  }
}

export function getVolunteersKv(env: { VOLUNTEERS?: KVNamespace }): KVNamespace {
  if (!env.VOLUNTEERS) throw new VolunteerStoreNotConfiguredError();
  return env.VOLUNTEERS;
}

export function getVolunteerCvBucket(env: { VOLUNTEER_CVS?: R2Bucket }): R2Bucket {
  if (!env.VOLUNTEER_CVS) throw new VolunteerCvBucketNotConfiguredError();
  return env.VOLUNTEER_CVS;
}

export async function saveApplication(kv: KVNamespace, record: VolunteerApplicationRecord): Promise<void> {
  await kv.put(applicationKey(record.applicantId), JSON.stringify(record));
}

export async function uploadCv(bucket: R2Bucket, key: string, data: ArrayBuffer, contentType: string): Promise<void> {
  await bucket.put(key, data, { httpMetadata: { contentType: contentType || 'application/octet-stream' } });
}

/**
 * Best-effort fixed-window rate limit, keyed by connecting IP. KV has no
 * compare-and-swap, so two requests racing within the same window could
 * both read the same count and both be let through — the same
 * eventual-consistency caveat documented at length in
 * src/lib/membership/store.ts, accepted here because this only needs to
 * blunt naive scripted abuse ("a honeypot field or simple rate limit is
 * enough"), not survive an adversarial race.
 */
export async function checkRateLimit(kv: KVNamespace, identifier: string): Promise<boolean> {
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const current = await kv.get(key);
  const count = current ? Number.parseInt(current, 10) || 0 : 0;
  if (count >= RATE_LIMIT_MAX_REQUESTS) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}
