import {
  personalInfoSchema,
  professionalBackgroundSchema,
  interestsSchema,
  agreementSchema,
  membershipApplicationSchema,
  type MembershipApplicationInput,
} from '../../lib/membership/schema';

export interface MembershipDraft {
  /** Set once the server creates the first checkout session, so a retry after a cancelled/failed payment reuses the same application instead of creating a new one. */
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  organisation: string;
  jobTitle: string;
  linkedIn: string;
  sector: string;
  areasOfWork: string[];
  aiExperience: string;
  interests: string[];
  gains: string[];
  contributions: string[];
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  wantsUpdates: boolean;
}

export type FieldErrors = Partial<Record<keyof MembershipDraft, string>>;

export const DRAFT_STORAGE_KEY = 'adcf-membership-draft-v1';

export function createEmptyDraft(): MembershipDraft {
  return {
    applicationId: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    organisation: '',
    jobTitle: '',
    linkedIn: '',
    sector: '',
    areasOfWork: [],
    aiExperience: '',
    interests: [],
    gains: [],
    contributions: [],
    agreeToTerms: false,
    agreeToPrivacy: false,
    wantsUpdates: false,
  };
}

export function loadDraft(): MembershipDraft {
  if (typeof window === 'undefined') return createEmptyDraft();
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return createEmptyDraft();
    return { ...createEmptyDraft(), ...JSON.parse(raw) };
  } catch {
    return createEmptyDraft();
  }
}

export function saveDraft(draft: MembershipDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage can throw in private-browsing contexts — losing the
    // autosave is acceptable, the form still works within the session.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function issuesToErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof MembershipDraft | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function validateStep(stepIndex: number, draft: MembershipDraft): FieldErrors {
  if (stepIndex === 0) {
    const result = personalInfoSchema.safeParse(draft);
    return result.success ? {} : issuesToErrors(result.error.issues);
  }

  if (stepIndex === 1) {
    const result = professionalBackgroundSchema.safeParse({
      sector: draft.sector,
      areasOfWork: draft.areasOfWork,
      aiExperience: draft.aiExperience || undefined,
    });
    return result.success ? {} : issuesToErrors(result.error.issues);
  }

  if (stepIndex === 2) {
    const result = interestsSchema.safeParse({
      interests: draft.interests,
      gains: draft.gains,
      contributions: draft.contributions,
    });
    return result.success ? {} : issuesToErrors(result.error.issues);
  }

  if (stepIndex === 3) {
    const result = agreementSchema.safeParse({
      agreeToTerms: draft.agreeToTerms,
      agreeToPrivacy: draft.agreeToPrivacy,
      wantsUpdates: draft.wantsUpdates,
    });
    return result.success ? {} : issuesToErrors(result.error.issues);
  }

  return {};
}

/** Runs full validation and returns a typed payload ready to submit, or null if invalid. */
export function toApplicationInput(draft: MembershipDraft): MembershipApplicationInput | null {
  const result = membershipApplicationSchema.safeParse({
    ...draft,
    aiExperience: draft.aiExperience || undefined,
  });
  return result.success ? result.data : null;
}
