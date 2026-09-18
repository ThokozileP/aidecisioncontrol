import type { EventInvitationRequest } from '../eventInvitations/types';
import { SITE } from '../../consts';

export interface EmailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

/**
 * Notifies the Forum's own inbox of a new inaugural Forum invitation
 * request. The request is already durably stored in KV by the caller
 * before this runs, so a missing/failing email provider must never be
 * treated as a failed submission. Mirrors the same not-configured-is-fine
 * pattern as sendInterestNotification and sendVolunteerApplicationNotification.
 */
export async function sendEventInvitationNotification(
  env: EmailEnv,
  record: EventInvitationRequest
): Promise<{ sent: boolean; reason?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn(`[event invitation email] RESEND_API_KEY is not configured — skipped notification for ${record.id}.`);
    return { sent: false, reason: 'not_configured' };
  }

  const from = env.RESEND_FROM_EMAIL || `${SITE.name} <membership@${SITE.domain}>`;
  const subject = `New invitation request: Inaugural AI Decision Control Forum (${record.organisation})`;
  const text = [
    `A new request to attend the inaugural AI Decision Control Forum was received on ${SITE.domain}.`,
    '',
    `Name: ${record.firstName} ${record.lastName}`,
    `Email: ${record.email}`,
    `Organisation: ${record.organisation}`,
    `Job title / role: ${record.jobTitle}`,
    `Industry / sector: ${record.industry}`,
    `Country: ${record.country}`,
    `LinkedIn: ${record.linkedIn || '—'}`,
    `Discussion topic: ${record.discussionTopic}`,
    `Interested in contributing to a future roundtable: ${record.contributorInterest || '—'}`,
    `Submitted: ${record.createdAt}`,
    '',
    "Biggest concern about AI decision autonomy:",
    record.concern,
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
    console.error(`[event invitation email] Resend request failed (${response.status}): ${body}`);
    return { sent: false, reason: `http_${response.status}` };
  }

  return { sent: true };
}
