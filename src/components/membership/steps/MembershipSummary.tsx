import { Check } from 'lucide-react';
import { MEMBERSHIP_ANNUAL_FEE_CENTS, MEMBERSHIP_DURATION_MONTHS } from '../../../lib/membership/types';

const BENEFITS = [
  '20% discount on eligible Forum events',
  'Selected member resources',
  'Member discussions',
  'Professional networking',
  'Contribution opportunities',
  'Early access to selected programmes',
];

export function MembershipSummary() {
  const feeDisplay = `€${(MEMBERSHIP_ANNUAL_FEE_CENTS / 100).toFixed(0)}`;

  return (
    <div className="membership-summary">
      <p className="tag">Professional Membership</p>
      <p className="membership-summary__price">
        {feeDisplay}
        <span>/ year</span>
      </p>
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
