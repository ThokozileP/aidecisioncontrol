import { Check } from 'lucide-react';
import {
  MEMBERSHIP_ANNUAL_FEE_CENTS,
  MEMBERSHIP_MONTHLY_EQUIVALENT_CENTS,
  MEMBERSHIP_DURATION_MONTHS,
  formatEuro,
} from '../../../lib/membership/types';

const BENEFITS = [
  '20% discount on eligible Forum events',
  'Selected member resources',
  'Member discussions',
  'Professional networking',
  'Contribution opportunities',
  'Early access to selected programmes',
];

export function MembershipSummary() {
  const monthlyDisplay = formatEuro(MEMBERSHIP_MONTHLY_EQUIVALENT_CENTS);
  const annualDisplay = formatEuro(MEMBERSHIP_ANNUAL_FEE_CENTS);

  return (
    <div className="membership-summary">
      <p className="tag">Professional Membership</p>
      <p className="membership-summary__price">
        {monthlyDisplay}
        <span>/month</span>
      </p>
      <p className="membership-summary__billing">Billed annually at {annualDisplay}</p>
      <p className="membership-summary__term">{MEMBERSHIP_DURATION_MONTHS}-month membership</p>
      <ul className="membership-summary__benefits">
        {BENEFITS.map((benefit) => (
          <li key={benefit}>
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
