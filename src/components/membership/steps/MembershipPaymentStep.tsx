import { CheckboxField } from '../ui/fields';
import { MembershipSummary } from './MembershipSummary';
import { MembershipError } from '../MembershipError';
import type { MembershipDraft, FieldErrors } from '../formState';
import {
  MEMBERSHIP_ANNUAL_FEE_CENTS,
  MEMBERSHIP_MONTHLY_EQUIVALENT_CENTS,
  MEMBERSHIP_DURATION_MONTHS,
  formatEuro,
} from '../../../lib/membership/types';

interface Props {
  draft: MembershipDraft;
  errors: FieldErrors;
  update: <K extends keyof MembershipDraft>(key: K, value: MembershipDraft[K]) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  paymentFailed: boolean;
}

export function MembershipPaymentStep({ draft, errors, update, onSubmit, submitting, submitError, paymentFailed }: Props) {
  const monthlyDisplay = formatEuro(MEMBERSHIP_MONTHLY_EQUIVALENT_CENTS);
  const annualDisplay = formatEuro(MEMBERSHIP_ANNUAL_FEE_CENTS);

  return (
    <div className="membership-form__stack">
      {paymentFailed && <MembershipError onRetry={onSubmit} retrying={submitting} />}

      <MembershipSummary />

      <div className="membership-terms">
        <h3>Membership Terms</h3>
        <div className="membership-terms__body">
          <p>
            By submitting this application, I confirm that the information provided is accurate
            and that I wish to become a Professional Member of the AI Decision Control Forum.
          </p>
          <p>
            Professional Membership costs{' '}
            <strong>
              {monthlyDisplay} per month, billed annually at {annualDisplay}
            </strong>
            , and provides membership benefits for 12 months from activation.
          </p>

          <h4>Use of Membership Fees</h4>
          <p>
            Membership fees support the ongoing operation and development of the AI Decision
            Control Forum. Fees may be used to cover reasonable Forum-related operating expenses,
            including event organisation, technology and platform costs, communications,
            administration, research, community activities and other expenses necessary to
            support the Forum's activities.
          </p>
          <p>
            Membership fees are not a payment for any specific event, service, outcome or
            professional opportunity.
          </p>

          <h4>Event Discount</h4>
          <p>
            Membership includes a <strong>20% discount on eligible AI Decision Control Forum
            event tickets</strong>. Event discounts do not apply to third-party events or events
            explicitly excluded by the Forum.
          </p>
          <p>Membership benefits may be updated or changed as the Forum develops.</p>

          <h4>Refunds</h4>
          <p>
            Membership fees are non-refundable once membership has been activated, except where
            required by applicable law.
          </p>
        </div>
      </div>

      <CheckboxField
        name="agreeToTerms"
        checked={draft.agreeToTerms}
        onChange={(v) => update('agreeToTerms', v)}
        required
        error={errors.agreeToTerms}
        label="I agree to the AI Decision Control Forum membership terms."
      />

      <CheckboxField
        name="agreeToPrivacy"
        checked={draft.agreeToPrivacy}
        onChange={(v) => update('agreeToPrivacy', v)}
        required
        error={errors.agreeToPrivacy}
        label="I agree that the AI Decision Control Forum may process my information for the purpose of administering my membership and communicating with me about Forum activities, in accordance with its Privacy Policy."
      />

      <CheckboxField
        name="wantsUpdates"
        checked={draft.wantsUpdates}
        onChange={(v) => update('wantsUpdates', v)}
        label="I would like to receive updates about Forum events, research, opportunities and initiatives."
      />

      {submitError && (
        <p className="field__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="trust-strip">
        <div className="trust-item">
          <span className="trust-item__mark" aria-hidden="true">
            ✓
          </span>
          <p>Payment is handled by Stripe's secure checkout. This site never sees your card details.</p>
        </div>
        <div className="trust-item">
          <span className="trust-item__mark" aria-hidden="true">
            ✓
          </span>
          <p>
            Your membership activates as soon as payment is confirmed, and covers{' '}
            {MEMBERSHIP_DURATION_MONTHS} months from that date.
          </p>
        </div>
        <div className="trust-item">
          <span className="trust-item__mark" aria-hidden="true">
            ✓
          </span>
          <p>You'll receive a confirmation once your application and payment are processed.</p>
        </div>
      </div>

      <button type="button" className="button button--primary membership-form__submit" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Redirecting to secure payment…' : 'Proceed to Secure Payment'}
      </button>
    </div>
  );
}
