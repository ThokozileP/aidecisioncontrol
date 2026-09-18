import { useRef, useState, type SyntheticEvent } from 'react';
import { TextField, SelectField, OptionGroup, CheckboxField } from '../membership/ui/fields';
import { SECTORS, COUNTRIES } from '../../lib/membership/options';
import { DISCUSSION_TOPICS, CONTRIBUTOR_INTEREST_OPTIONS } from '../../lib/eventInvitations/options';
import { eventInvitationSchema } from '../../lib/eventInvitations/schema';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  jobTitle: string;
  industry: string;
  country: string;
  linkedIn: string;
  concern: string;
  discussionTopic: string;
  contributorInterest: string;
  consent: boolean;
}

const EMPTY_DRAFT: Draft = {
  firstName: '',
  lastName: '',
  email: '',
  organisation: '',
  jobTitle: '',
  industry: '',
  country: '',
  linkedIn: '',
  concern: '',
  discussionTopic: '',
  contributorInterest: '',
  consent: false,
};

type FieldErrors = Partial<Record<keyof Draft, string>>;

/**
 * Request-to-attend form for the inaugural Forum (/events/inaugural-forum).
 * This is a one-shot submission — no payment, no multi-step wizard — so it
 * follows the single-page pattern of VolunteerApplyModal rather than
 * MembershipForm's step wizard, while reusing the same field components and
 * validation schema shape as the membership form.
 */
export function InvitationRequestForm() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const parsed = eventInvitationSchema.safeParse({
      ...draft,
      contributorInterest: draft.contributorInterest || undefined,
      consent: draft.consent,
    });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Draft | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus('error');
      setSubmitError('Please check the form and try again.');
      return;
    }

    submittingRef.current = true;
    setStatus('submitting');
    setSubmitError(null);
    setErrors({});

    try {
      const response = await fetch('/api/events/inaugural-forum/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, website: honeypot }),
      });
      const data = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not submit your request. Please try again.');
      }
      setStatus('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not submit your request. Please try again.');
      setStatus('error');
      submittingRef.current = false;
    }
  }

  if (status === 'success') {
    return (
      <div className="invitation-form__success" role="status">
        <p className="eyebrow">Thank you</p>
        <h3>Your request has been received.</h3>
        <p>
          Your request to attend the inaugural AI Decision Control Forum has been received. We will
          review your request and contact you with event details as they are confirmed.
        </p>
      </div>
    );
  }

  return (
    <form className="invitation-form" onSubmit={handleSubmit} noValidate>
      <div className="membership-form__grid">
        <TextField
          label="First name"
          name="firstName"
          value={draft.firstName}
          onChange={(v) => update('firstName', v)}
          required
          autoComplete="given-name"
          error={errors.firstName}
        />
        <TextField
          label="Last name"
          name="lastName"
          value={draft.lastName}
          onChange={(v) => update('lastName', v)}
          required
          autoComplete="family-name"
          error={errors.lastName}
        />
      </div>

      <TextField
        label="Professional email"
        name="email"
        type="email"
        value={draft.email}
        onChange={(v) => update('email', v)}
        required
        autoComplete="email"
        error={errors.email}
      />

      <div className="membership-form__grid">
        <TextField
          label="Organisation"
          name="organisation"
          value={draft.organisation}
          onChange={(v) => update('organisation', v)}
          required
          autoComplete="organization"
          error={errors.organisation}
        />
        <TextField
          label="Job title / role"
          name="jobTitle"
          value={draft.jobTitle}
          onChange={(v) => update('jobTitle', v)}
          required
          autoComplete="organization-title"
          error={errors.jobTitle}
        />
      </div>

      <div className="membership-form__grid">
        <SelectField
          label="Industry / sector"
          name="industry"
          value={draft.industry}
          onChange={(v) => update('industry', v)}
          options={SECTORS}
          required
          error={errors.industry}
        />
        <SelectField
          label="Country"
          name="country"
          value={draft.country}
          onChange={(v) => update('country', v)}
          options={COUNTRIES}
          required
          error={errors.country}
        />
      </div>

      <TextField
        label="LinkedIn or professional profile (optional)"
        name="linkedIn"
        type="url"
        value={draft.linkedIn}
        onChange={(v) => update('linkedIn', v)}
        autoComplete="url"
        placeholder="https://www.linkedin.com/in/..."
        error={errors.linkedIn}
      />

      <div className="field">
        <label className="field__label" htmlFor="concern">
          What is your organisation's biggest concern about AI decision autonomy?
          <span className="field__required" aria-hidden="true"> *</span>
        </label>
        <textarea
          id="concern"
          name="concern"
          className="field__control"
          rows={5}
          required
          aria-invalid={Boolean(errors.concern)}
          aria-describedby={errors.concern ? 'concern-error' : undefined}
          value={draft.concern}
          onChange={(event) => update('concern', event.target.value)}
        />
        {errors.concern && (
          <p className="field__error" id="concern-error" role="alert">
            {errors.concern}
          </p>
        )}
      </div>

      <SelectField
        label="Which area of AI decision control would you most like to discuss?"
        name="discussionTopic"
        value={draft.discussionTopic}
        onChange={(v) => update('discussionTopic', v)}
        options={DISCUSSION_TOPICS}
        required
        error={errors.discussionTopic}
      />

      <OptionGroup
        legend="Would you be interested in contributing to a future Forum roundtable? (optional)"
        name="contributorInterest"
        options={CONTRIBUTOR_INTEREST_OPTIONS}
        selected={draft.contributorInterest ? [draft.contributorInterest] : []}
        onChange={(next) => update('contributorInterest', next[0] ?? '')}
        mode="single"
      />

      <CheckboxField
        label="I consent to being contacted by the AI Decision Control Forum about this event."
        name="consent"
        checked={draft.consent}
        onChange={(checked) => update('consent', checked)}
        required
        error={errors.consent}
      />

      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="invitation-website">Leave this field blank</label>
        <input
          id="invitation-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <button type="submit" className="button button--primary invitation-form__submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting…' : 'Request an Invitation'}
      </button>

      {submitError && (
        <p className="field__error" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}
