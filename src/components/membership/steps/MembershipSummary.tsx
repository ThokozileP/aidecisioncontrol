import { MEMBERSHIP_ANNUAL_FEE_CENTS, MEMBERSHIP_DURATION_MONTHS, formatEuro } from '../../../lib/membership/types';

export function MembershipSummary() {
  const annualDisplay = formatEuro(MEMBERSHIP_ANNUAL_FEE_CENTS);

  return (
    <div className="summary-card">
      <div className="summary-row">
        <span>Membership type</span>
        <span>Professional Membership</span>
      </div>
      <div className="summary-row">
        <span>Billing</span>
        <span>
          {annualDisplay} annually ({MEMBERSHIP_DURATION_MONTHS} months)
        </span>
      </div>
      <div className="summary-row">
        <span>Event discount</span>
        <span>20% off eligible events</span>
      </div>
      <div className="summary-row summary-row--total">
        <span>Due today</span>
        <span>{annualDisplay}</span>
      </div>
    </div>
  );
}
