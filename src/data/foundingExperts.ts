export interface FoundingExpert {
  name: string;
  role: string;
  affiliation: string;
  bio: string;
  photo?: string;
  /** Only render an expert once their participation is explicitly confirmed. */
  confirmed: boolean;
}

// No members are confirmed yet. Add entries here as experts confirm —
// pages that list Founding Experts filter on `confirmed` automatically,
// so nothing appears until it is explicitly set to true.
export const foundingExperts: FoundingExpert[] = [];

export const relevantBackgrounds: string[] = [
  'AI risk and model risk',
  'Healthcare AI',
  'Financial services',
  'AI engineering',
  'Agentic AI',
  'Algorithm assurance and audit',
  'AI regulation',
  'Responsible AI',
  'Operational risk',
  'Human oversight',
  'AI safety',
  'Clinical implementation',
];

export const foundingExpertCommitments: string[] = [
  'Participate in selected expert roundtables',
  'Challenge and refine emerging concepts',
  'Identify real operational control problems',
  'Contribute perspectives from their discipline',
  "Help shape the Forum's first practitioner agenda",
  'Optionally contribute to publications, case discussions and events',
];
