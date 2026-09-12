import { TextField, SelectField } from '../ui/fields';
import { COUNTRIES } from '../../../lib/membership/options';
import type { MembershipDraft, FieldErrors } from '../formState';

interface Props {
  draft: MembershipDraft;
  errors: FieldErrors;
  update: <K extends keyof MembershipDraft>(key: K, value: MembershipDraft[K]) => void;
}

export function PersonalInformationStep({ draft, errors, update }: Props) {
  return (
    <div className="membership-form__grid">
      <TextField
        label="First Name"
        name="firstName"
        value={draft.firstName}
        onChange={(v) => update('firstName', v)}
        required
        autoComplete="given-name"
        error={errors.firstName}
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={draft.lastName}
        onChange={(v) => update('lastName', v)}
        required
        autoComplete="family-name"
        error={errors.lastName}
      />
      <TextField
        label="Email Address"
        name="email"
        type="email"
        value={draft.email}
        onChange={(v) => update('email', v)}
        required
        autoComplete="email"
        error={errors.email}
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
        label="Job Title / Role"
        name="jobTitle"
        value={draft.jobTitle}
        onChange={(v) => update('jobTitle', v)}
        autoComplete="organization-title"
        error={errors.jobTitle}
      />
      <TextField
        label="LinkedIn / Professional Profile"
        name="linkedIn"
        type="url"
        value={draft.linkedIn}
        onChange={(v) => update('linkedIn', v)}
        placeholder="https://www.linkedin.com/in/..."
        error={errors.linkedIn}
      />
    </div>
  );
}
