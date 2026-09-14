import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { INTEREST_OPTIONS } from '../../lib/interest/types';
import type { InterestSubmission } from '../../lib/interest/types';
import { sendInterestNotification } from '../../lib/email/sendInterestNotification';

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const interestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .refine((value) => EMAIL_PATTERN.test(value), 'Enter a valid email address'),
  interest: z.enum(INTEREST_OPTIONS, { message: 'Select what you’re interested in' }),
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type WorkerEnv = {
  MEMBERSHIPS?: KVNamespace;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

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

  const parsed = interestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid submission.', issues: parsed.error.issues }, 400);
  }

  const workerEnv = env as unknown as WorkerEnv;
  const kv = workerEnv.MEMBERSHIPS;
  if (!kv) {
    return json({ error: 'Storage is not configured. See README.md for setup.' }, 503);
  }

  const submission: InterestSubmission = {
    id: crypto.randomUUID(),
    email: parsed.data.email,
    interest: parsed.data.interest,
    createdAt: new Date().toISOString(),
  };

  try {
    // Reuses the existing MEMBERSHIPS KV namespace under its own key prefix
    // rather than provisioning a dedicated namespace for this much smaller,
    // no-admin-UI feature — see README.md "Get involved" form for the
    // trade-off this makes (submissions aren't listed anywhere yet; the
    // only visibility is the notification email below and direct KV lookup).
    await kv.put(`interest:${submission.id}`, JSON.stringify(submission));
  } catch (error) {
    console.error('[interest] Failed to store submission', error);
    return json({ error: 'Could not save your submission. Please try again.' }, 502);
  }

  try {
    await sendInterestNotification(workerEnv, submission);
  } catch (error) {
    // The submission is already durably stored — a failed notification
    // email must never turn into a failure response for the visitor.
    console.error('[interest] Notification email failed (submission still saved)', error);
  }

  return json({ ok: true });
};
