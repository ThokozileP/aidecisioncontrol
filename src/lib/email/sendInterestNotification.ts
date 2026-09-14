import type { InterestSubmission } from '../interest/types';
import { SITE } from '../../consts';

export interface EmailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

/**
 * Notifies the Forum's own inbox of a new "join" form submission (email +
 * interest). This is a low-volume, no-admin-UI feature — the submission is
 * already durably stored in KV by the caller before this runs, so a missing
 * or failing email provider must never be treated as a failed submission;
 * it just means nobody got pinged and the record still exists to check on
 * later. Mirrors the same not-configured-is-fine pattern as
 * sendMembershipConfirmationEmail.
 */
export async function sendInterestNotification(
  env: EmailEnv,
  submission: InterestSubmission
): Promise<{ sent: boolean; reason?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn(`[interest email] RESEND_API_KEY is not configured — skipped notification for ${submission.id}.`);
    return { sent: false, reason: 'not_configured' };
  }

  const from = env.RESEND_FROM_EMAIL || `${SITE.name} <membership@${SITE.domain}>`;
  const subject = `New interest submission: ${submission.interest}`;
  const text = [
    `A new "Get involved" form submission was received on ${SITE.domain}.`,
    '',
    `Email: ${submission.email}`,
    `Interested in: ${submission.interest}`,
    `Submitted: ${submission.createdAt}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: SITE.email,
      reply_to: submission.email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`[interest email] Resend request failed (${response.status}): ${body}`);
    return { sent: false, reason: `http_${response.status}` };
  }

  return { sent: true };
}
