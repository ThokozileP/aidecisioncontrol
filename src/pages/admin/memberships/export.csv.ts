import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getMembershipKv, listAllMembers } from '../../../lib/membership/store';
import { getDisplayStatus } from '../../../lib/membership/status';
import { toCsv } from '../../../lib/csv';

// Protected by src/middleware.ts, which gates every /admin/* path — this
// route lives under /admin/memberships/ specifically so that coverage
// applies here automatically, with no separate auth check needed.
export const prerender = false;

const HEADERS = [
  'Membership ID',
  'First Name',
  'Last Name',
  'Email',
  'Organisation',
  'Job Title',
  'Country',
  'Membership Type',
  'Start Date',
  'Expiry Date',
  'Status',
  'Payment Status',
];

export const GET: APIRoute = async () => {
  let kv;
  try {
    kv = getMembershipKv(env as unknown as { MEMBERSHIPS?: KVNamespace });
  } catch {
    return new Response('Membership storage is not configured.', { status: 503 });
  }

  const members = await listAllMembers(kv);
  const now = new Date();

  const rows = members
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((member) => [
      member.membershipId ?? '',
      member.firstName,
      member.lastName,
      member.email,
      member.organisation,
      member.jobTitle,
      member.country,
      member.membershipId ? 'Professional Member' : '',
      member.startDate ?? '',
      member.expiryDate ?? '',
      getDisplayStatus(member, now),
      member.paymentStatus,
    ]);

  const csv = toCsv(HEADERS, rows);
  const filename = `adcf-memberships-${now.toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
