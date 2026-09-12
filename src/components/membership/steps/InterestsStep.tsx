import { OptionGroup } from '../ui/fields';
import { INTERESTS, MEMBERSHIP_GAINS, CONTRIBUTIONS, MAX_INTERESTS } from '../../../lib/membership/options';
import type { MembershipDraft, FieldErrors } from '../formState';

interface Props {
  draft: MembershipDraft;
  errors: FieldErrors;
  update: <K extends keyof MembershipDraft>(key: K, value: MembershipDraft[K]) => void;
}

export function InterestsStep({ draft, errors, update }: Props) {
  return (
    <div className="membership-form__stack">
      <OptionGroup
        legend="What interests you most about the AI Decision Control Forum?"
        name="interests"
        options={INTERESTS}
        selected={draft.interests}
        onChange={(next) => update('interests', next)}
        mode="multiple"
        max={MAX_INTERESTS}
        required
        hint={`Select up to ${MAX_INTERESTS}.`}
        error={errors.interests}
      />

      <OptionGroup
        legend="What would you most like to gain from your membership?"
        name="gains"
        options={MEMBERSHIP_GAINS}
        selected={draft.gains}
        onChange={(next) => update('gains', next)}
        mode="multiple"
        required
        hint="Select all that apply."
        error={errors.gains}
      />

      <OptionGroup
        legend="How would you like to contribute to the Forum?"
        name="contributions"
        options={CONTRIBUTIONS}
        selected={draft.contributions}
        onChange={(next) => update('contributions', next)}
        mode="multiple"
        required
        hint="Select all that apply."
        error={errors.contributions}
      />
    </div>
  );
}
