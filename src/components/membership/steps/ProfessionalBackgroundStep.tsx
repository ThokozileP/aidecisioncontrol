import { SelectField, OptionGroup } from '../ui/fields';
import { SECTORS, AREAS_OF_WORK, AI_EXPERIENCE_LEVELS } from '../../../lib/membership/options';
import type { MembershipDraft, FieldErrors } from '../formState';

interface Props {
  draft: MembershipDraft;
  errors: FieldErrors;
  update: <K extends keyof MembershipDraft>(key: K, value: MembershipDraft[K]) => void;
}

export function ProfessionalBackgroundStep({ draft, errors, update }: Props) {
  return (
    <div className="membership-form__stack">
      <SelectField
        label="Sector"
        name="sector"
        value={draft.sector}
        onChange={(v) => update('sector', v)}
        options={SECTORS}
        required
        error={errors.sector}
      />

      <OptionGroup
        legend="Area of Work"
        name="areasOfWork"
        options={AREAS_OF_WORK}
        selected={draft.areasOfWork}
        onChange={(next) => update('areasOfWork', next)}
        mode="multiple"
        required
        hint="Select all that apply."
        error={errors.areasOfWork}
      />

      <OptionGroup
        legend="AI Experience"
        name="aiExperience"
        options={AI_EXPERIENCE_LEVELS}
        selected={draft.aiExperience ? [draft.aiExperience] : []}
        onChange={(next) => update('aiExperience', next[0] ?? '')}
        mode="single"
        error={errors.aiExperience}
      />
    </div>
  );
}
