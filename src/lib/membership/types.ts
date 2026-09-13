import type { MembershipApplicationInput } from './schema';

/**
 * Professional Membership is billed as ONE annual payment of €95.88 — not a
 * recurring monthly subscription. €7.99/month is shown throughout the UI as
 * the equivalent monthly rate for pricing communication only; Stripe is
 * never configured with recurring/subscription billing (see
 * src/pages/api/membership/checkout.ts, `mode: 'payment'`).
 */
export const MEMBERSHIP_ANNUAL_FEE_CENTS = 9588;
export const MEMBERSHIP_MONTHLY_EQUIVALENT_CENTS = 799;
export const MEMBERSHIP_CURRENCY = 'eur';
export const MEMBERSHIP_PRODUCT_NAME = 'AI Decision Control Forum — Professional Membership';
export const MEMBERSHIP_DURATION_MONTHS = 12;
export const MEMBERSHIP_TYPE = 'Professional Member' as const;

/** Formats a cents amount as "€X.XX" — the single source of truth for how membership prices are displayed. */
export function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Where a payment attempt currently stands. Set only from confirmed Stripe events. */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

/**
 * A membership application. Created when the member submits the form (before
 * any payment), then updated in place as the Stripe checkout resolves —
 * there is no separate "pending application" vs "membership" record, so
 * admins can see the full lifecycle (including abandoned/failed attempts)
 * from one row.
 *
 * `membershipId`/`startDate`/`expiryDate` are assigned only once
 * `paymentStatus` becomes `'paid'` — a membership is never "Active" before
 * Stripe has confirmed payment.
 */
export interface MembershipRecord extends MembershipApplicationInput {
  applicationId: string;
  membershipId: string | null;
  membershipType: typeof MEMBERSHIP_TYPE;
  annualFeeCents: number;
  currency: string;
  paymentStatus: PaymentStatus;
  startDate: string | null;
  expiryDate: string | null;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Compact projection of a record used for KV `list()` metadata and the admin table/CSV — no interests/gains/contributions/linkedIn, which the dashboard doesn't need. */
export interface MemberSummary {
  applicationId: string;
  membershipId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  jobTitle: string;
  country: string;
  sector: string;
  areasOfWork: string[];
  paymentStatus: PaymentStatus;
  startDate: string | null;
  expiryDate: string | null;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toMemberSummary(record: MembershipRecord): MemberSummary {
  return {
    applicationId: record.applicationId,
    membershipId: record.membershipId,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    organisation: record.organisation,
    jobTitle: record.jobTitle,
    country: record.country,
    sector: record.sector,
    areasOfWork: record.areasOfWork,
    paymentStatus: record.paymentStatus,
    startDate: record.startDate,
    expiryDate: record.expiryDate,
    stripeCheckoutSessionId: record.stripeCheckoutSessionId,
    stripeCustomerId: record.stripeCustomerId,
    stripePaymentIntentId: record.stripePaymentIntentId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
