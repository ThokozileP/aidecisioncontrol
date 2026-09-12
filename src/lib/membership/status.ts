import type { MemberSummary, MembershipRecord } from './types';

/** Discount applied to eligible Forum events for an active Professional Member. */
export const MEMBERSHIP_EVENT_DISCOUNT_PERCENTAGE = 20;

/** How far ahead of expiry a membership is surfaced as "Expiring Soon" in the admin dashboard. */
export const EXPIRING_SOON_WINDOW_DAYS = 30;

export type DisplayStatus = 'Pending' | 'Active' | 'Expired' | 'Cancelled' | 'Payment Failed';

type ActivenessInput = Pick<MembershipRecord | MemberSummary, 'paymentStatus' | 'expiryDate'>;

/**
 * The single source of truth for "is this membership currently usable".
 * Expiry is computed from the stored date on every check — nothing relies
 * on a scheduled job to flip a status flag, so a membership becomes
 * ineligible the instant `expiryDate` passes, not whenever a cron next runs.
 */
export function isMembershipActive(record: ActivenessInput, now: Date = new Date()): boolean {
  if (record.paymentStatus !== 'paid') return false;
  if (!record.expiryDate) return false;
  return new Date(record.expiryDate).getTime() > now.getTime();
}

export function isExpiringSoon(record: ActivenessInput, now: Date = new Date()): boolean {
  if (!isMembershipActive(record, now)) return false;
  const msUntilExpiry = new Date(record.expiryDate as string).getTime() - now.getTime();
  return msUntilExpiry <= EXPIRING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/** Human-facing status shown in the admin dashboard and CSV export. */
export function getDisplayStatus(record: ActivenessInput, now: Date = new Date()): DisplayStatus {
  switch (record.paymentStatus) {
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Payment Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'paid':
      return isMembershipActive(record, now) ? 'Active' : 'Expired';
    default:
      return 'Pending';
  }
}
