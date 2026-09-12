import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { checkAdminAuth, adminAuthChallengeResponse, type AdminEnv } from './lib/admin/auth';

export const onRequest = defineMiddleware((context, next) => {
  if (!context.url.pathname.startsWith('/admin')) {
    return next();
  }

  const result = checkAdminAuth(context.request, env as unknown as AdminEnv);
  if (!result.ok) {
    return adminAuthChallengeResponse(result);
  }

  return next();
});
