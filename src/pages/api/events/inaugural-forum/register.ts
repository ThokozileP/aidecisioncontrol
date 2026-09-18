import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { eventInvitationSchema } from '../../../../lib/eventInvitations/schema';
import { saveEventInvitationRequest, checkEventInvitationRateLimit } from '../../../../lib/eventInvitations/store';
import { sendEventInvitationNotification } from '../../../../lib/email/sendEventInvitationNotification';
import type { EventInvitationRequest } from '../../../../lib/eventInvitations/types';

export const prerender = false;

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
    return json({ success: false, error: 'Invalid JSON body.' }, 400);
  }

  if (typeof body !== 'object' || body === null) {
    return json({ success: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: real applicants never see or fill this field (visually hidden
  // in InvitationForm.tsx). A bot that auto-fills every input does. Report
  // success without doing any real work, so the bot has no signal it was
  // caught — mirrors /api/volunteers/apply.
  const honeypot = (body as Record<string, unknown>).website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ success: true });
  }

  const workerEnv = env as unknown as WorkerEnv;
  const kv = workerEnv.MEMBERSHIPS;
  if (!kv) {
    return json({ success: false, error: 'Storage is not configured. See README.md for setup.' }, 503);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const withinLimit = await checkEventInvitationRateLimit(kv, ip);
  if (!withinLimit) {
    return json(
      { success: false, error: 'Too many requests from this connection. Please try again in a minute.' },
      429
    );
  }

  const parsed = eventInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Please check the form and try again.', issues: parsed.error.issues }, 400);
  }

  const record: EventInvitationRequest = {
    id: crypto.randomUUID(),
    event: 'inaugural-forum',
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    organisation: parsed.data.organisation,
    jobTitle: parsed.data.jobTitle,
    industry: parsed.data.industry,
    country: parsed.data.country,
    linkedIn: parsed.data.linkedIn,
    concern: parsed.data.concern,
    discussionTopic: parsed.data.discussionTopic,
    contributorInterest: parsed.data.contributorInterest,
    createdAt: new Date().toISOString(),
  };

  try {
    await saveEventInvitationRequest(kv, record);
  } catch (error) {
    console.error('[event invitation] Failed to save request', error);
    return json({ success: false, error: 'Could not save your request. Please try again.' }, 502);
  }

  try {
    await sendEventInvitationNotification(workerEnv, record);
  } catch (error) {
    // The request is already durably stored — a failed notification email
    // must never turn into a failure response for the visitor.
    console.error('[event invitation] Notification email failed (request still saved)', error);
  }

  return json({ success: true });
};
