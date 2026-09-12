import type { MembershipRecord } from '../membership/types';
import { MEMBERSHIP_EVENT_DISCOUNT_PERCENTAGE } from '../membership/status';
import { SITE } from '../../consts';

export interface EmailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderMembershipEmail(
  record: MembershipRecord & { membershipId: string; startDate: string; expiryDate: string }
): { subject: string; html: string; text: string } {
  const subject = 'Welcome to the AI Decision Control Forum';
  const eventsUrl = `${SITE.url}/events`;
  const fullName = `${record.firstName} ${record.lastName}`.trim();

  const text = [
    'AI DECISION CONTROL FORUM',
    '',
    'Welcome to the Forum',
    '',
    `Member: ${fullName}`,
    `Membership: ${record.membershipType}`,
    `Membership ID: ${record.membershipId}`,
    `Membership Start: ${formatDate(record.startDate)}`,
    `Membership Valid Until: ${formatDate(record.expiryDate)}`,
    `Membership Benefit: ${MEMBERSHIP_EVENT_DISCOUNT_PERCENTAGE}% discount on eligible AI Decision Control Forum events.`,
    '',
    `Explore Upcoming Events: ${eventsUrl}`,
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; color: #0b1a2e; max-width: 560px; margin: 0 auto;">
      <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; font-weight: 700; color: #082b55;">AI Decision Control Forum</p>
      <h1 style="font-size: 22px; color: #061b3a; margin: 8px 0 16px;">Welcome to the Forum</h1>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #3c5064;">Member</td><td style="padding: 6px 0; font-weight: 700;">${fullName}</td></tr>
        <tr><td style="padding: 6px 0; color: #3c5064;">Membership</td><td style="padding: 6px 0; font-weight: 700;">${record.membershipType}</td></tr>
        <tr><td style="padding: 6px 0; color: #3c5064;">Membership ID</td><td style="padding: 6px 0; font-weight: 700;">${record.membershipId}</td></tr>
        <tr><td style="padding: 6px 0; color: #3c5064;">Membership Start</td><td style="padding: 6px 0;">${formatDate(record.startDate)}</td></tr>
        <tr><td style="padding: 6px 0; color: #3c5064;">Membership Valid Until</td><td style="padding: 6px 0;">${formatDate(record.expiryDate)}</td></tr>
      </table>
      <p style="background: rgba(21,166,223,0.12); color: #082b55; padding: 12px 16px; border-radius: 6px; font-weight: 600;">
        Membership Benefit: ${MEMBERSHIP_EVENT_DISCOUNT_PERCENTAGE}% discount on eligible AI Decision Control Forum events.
      </p>
      <p style="margin-top: 24px;">
        <a href="${eventsUrl}" style="display: inline-block; background: #15a6df; color: #061b3a; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Explore Upcoming Events</a>
      </p>
      <p style="color: #7397aa; font-size: 12px; margin-top: 32px;">${SITE.name} · ${SITE.url}</p>
    </div>
  `;

  return { subject, html, text };
}

/**
 * Sends the post-activation membership confirmation email. No email provider
 * currently exists in this project, so this uses Resend's plain HTTP API
 * (works over `fetch`, so it runs fine on Cloudflare Workers with no SDK).
 *
 * If `RESEND_API_KEY` is not configured, or the send otherwise fails, this
 * returns a `{ sent: false }` result instead of throwing — a missing/broken
 * email provider must never block membership activation, which has already
 * been paid for and recorded by this point. Callers should still wrap this
 * in their own try/catch (defense in depth): a network-level exception from
 * `fetch` itself should equally never fail activation.
 */
export async function sendMembershipConfirmationEmail(
  env: EmailEnv,
  record: MembershipRecord
): Promise<{ sent: boolean; reason?: string }> {
  if (!record.membershipId || !record.startDate || !record.expiryDate) {
    console.error(
      `[membership email] Refusing to send confirmation for a non-activated application ${record.applicationId}.`
    );
    return { sent: false, reason: 'not_activated' };
  }

  if (!env.RESEND_API_KEY) {
    console.warn(
      `[membership email] RESEND_API_KEY is not configured — skipped confirmation email for ${record.membershipId}.`
    );
    return { sent: false, reason: 'not_configured' };
  }

  const from = env.RESEND_FROM_EMAIL || `${SITE.name} <membership@${SITE.domain}>`;
  const { subject, html, text } = renderMembershipEmail(
    record as MembershipRecord & { membershipId: string; startDate: string; expiryDate: string }
  );

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: record.email,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`[membership email] Resend request failed (${response.status}): ${body}`);
    return { sent: false, reason: `http_${response.status}` };
  }

  return { sent: true };
}
