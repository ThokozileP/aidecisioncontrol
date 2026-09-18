import type { EventInvitationRequest } from './types';

/**
 * Storage for inaugural Forum invitation requests. Reuses the existing
 * MEMBERSHIPS KV namespace under its own key prefix rather than
 * provisioning a dedicated namespace for this smaller, no-admin-UI feature
 * — same trade-off as src/pages/api/interest.ts (submissions aren't listed
 * anywhere yet; the only visibility is the notification email and direct KV
 * lookup).
 */

const REQUEST_PREFIX = 'event-invitation:inaugural-forum:';
const RATE_LIMIT_PREFIX = 'ratelimit:event-invitation:inaugural-forum:';
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

const requestKey = (id: string) => `${REQUEST_PREFIX}${id}`;

export async function saveEventInvitationRequest(kv: KVNamespace, record: EventInvitationRequest): Promise<void> {
  await kv.put(requestKey(record.id), JSON.stringify(record));
}

/**
 * Best-effort fixed-window rate limit, keyed by connecting IP. Mirrors
 * src/lib/volunteers/store.ts's checkRateLimit — enough to blunt naive
 * scripted abuse, not meant to survive an adversarial race.
 */
export async function checkEventInvitationRateLimit(kv: KVNamespace, identifier: string): Promise<boolean> {
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const current = await kv.get(key);
  const count = current ? Number.parseInt(current, 10) || 0 : 0;
  if (count >= RATE_LIMIT_MAX_REQUESTS) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}
