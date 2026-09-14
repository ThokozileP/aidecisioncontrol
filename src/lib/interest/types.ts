export const INTEREST_OPTIONS = [
  'Founding Circle membership',
  'General updates',
  'Speaking or contributing research',
] as const;

export type InterestOption = (typeof INTEREST_OPTIONS)[number];

export interface InterestSubmission {
  id: string;
  email: string;
  interest: InterestOption;
  createdAt: string;
}
