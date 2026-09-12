/**
 * Admin authentication for `/admin/*`.
 *
 * This is deliberately HTTP Basic Auth, checked against two Worker
 * secrets (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) — the simplest approach that
 * is still secure over HTTPS, needs no login page, session store, or new
 * dependency, and works identically for the dashboard page and the CSV
 * export route. There is no existing auth system in this project to extend,
 * and a single internal admin credential does not warrant building one.
 *
 * Trade-offs, by design:
 * - No per-admin accounts, no audit trail of who viewed what. Fine for a
 *   single Forum administrator; revisit if the admin group grows.
 * - No logout (the browser caches Basic Auth credentials for the session/
 *   until closed) — acceptable for an internal tool on a device the admin
 *   controls.
 * - Credentials travel on every request; this is safe only because the site
 *   is served exclusively over HTTPS (Cloudflare terminates TLS in front of
 *   the Worker), never HTTP.
 */

export interface AdminEnv {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
}

const REALM = 'AI Decision Control Forum Admin';

/** Constant-time string comparison so a wrong guess can't be timed character-by-character. */
function timingSafeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLength; i += 1) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

function parseBasicAuth(header: string | null): { username: string; password: string } | null {
  if (!header || !header.startsWith('Basic ')) return null;
  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length).trim());
  } catch {
    return null;
  }
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return null;
  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

export type AdminAuthResult = { ok: true } | { ok: false; reason: 'not_configured' | 'unauthorized' };

/** Fails closed: if the admin credentials aren't configured, access is always denied — never open by default. */
export function checkAdminAuth(request: Request, env: AdminEnv): AdminAuthResult {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    return { ok: false, reason: 'not_configured' };
  }

  const credentials = parseBasicAuth(request.headers.get('authorization'));
  if (!credentials) return { ok: false, reason: 'unauthorized' };

  const usernameMatches = timingSafeEqual(credentials.username, env.ADMIN_USERNAME);
  const passwordMatches = timingSafeEqual(credentials.password, env.ADMIN_PASSWORD);
  return usernameMatches && passwordMatches ? { ok: true } : { ok: false, reason: 'unauthorized' };
}

export function adminAuthChallengeResponse(result: Extract<AdminAuthResult, { ok: false }>): Response {
  const body =
    result.reason === 'not_configured'
      ? 'Admin dashboard is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.'
      : 'Authentication required.';

  return new Response(body, {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  });
}
