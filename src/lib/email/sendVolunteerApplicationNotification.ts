import type { VolunteerApplicationRecord } from '../volunteers/types';
import { SITE } from '../../consts';

export interface EmailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

/**
 * Notifies the Forum's own inbox of a new volunteer application. The
 * application (and CV, in R2) is already durably stored by the caller
 * before this runs, so a missing/failing email provider must never be
 * treated as a failed submission — it just means nobody got pinged and the
 * record still exists to check on later. Mirrors the same
 * not-configured-is-fine pattern as sendInterestNotification and
 * sendMembershipConfirmationEmail.
 */
export async function sendVolunteerApplicationNotification(
  env: EmailEnv,
  record: VolunteerApplicationRecord
): Promise<{ sent: boolean; reason?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn(
      `[volunteer email] RESEND_API_KEY is not configured — skipped notification for ${record.applicantId}.`
    );
    return { sent: false, reason: 'not_configured' };
  }

  const from = env.RESEND_FROM_EMAIL || `${SITE.name} <membership@${SITE.domain}>`;
  const subject = `New volunteer application: ${record.role}`;
  const text = [
    `A new volunteer application was received on ${SITE.domain}.`,
    '',
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `LinkedIn: ${record.linkedin || '—'}`,
    `Role: ${record.role}`,
    `CV: stored at "${record.cvFileKey}" in the VOLUNTEER_CVS R2 bucket`,
    `Submitted: ${record.submittedAt}`,
    '',
    'Motivation:',
    record.motivation,
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
      reply_to: record.email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`[volunteer email] Resend request failed (${response.status}): ${body}`);
    return { sent: false, reason: `http_${response.status}` };
  }

  return { sent: true };
}
