import { CheckboxField } from '../ui/fields';
import { MembershipSummary } from './MembershipSummary';
import { MembershipError } from '../MembershipError';
import type { MembershipDraft, FieldErrors } from '../formState';

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
  return (
    <div className="membership-form__stack">
      {paymentFailed && <MembershipError onRetry={onSubmit} retrying={submitting} />}

      <MembershipSummary />

      <div className="membership-terms">
        <h3>Membership Terms</h3>
        <p>
          By submitting this application, I confirm that the information provided is accurate and
          that I wish to become a Professional Member of the AI Decision Control Forum.
        </p>
        <p>
          Professional Membership costs €95 annually and provides membership benefits for 12
          months from activation.
        </p>
        <p>
          Membership includes a 20% discount on eligible AI Decision Control Forum event tickets.
          Event discounts do not apply to third-party events or events explicitly excluded by the
          Forum.
        </p>
        <p>
          Membership fees are non-refundable once membership has been activated, except where
          required by applicable law.
        </p>
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

      <button type="button" className="button button--primary membership-form__submit" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Redirecting to secure payment…' : 'Proceed to Secure Payment'}
      </button>
    </div>
  );
}
