import { forumTeam } from './team';

export interface ForumExpert {
  name: string;
  role: string;
  affiliation?: string;
  bio: string;
  photo?: string;
  /** Only render an expert once their participation is explicitly confirmed. */
  confirmed: boolean;
}

// Sourced from the "Meet the Forum Team" data on the About page, so a
// confirmed expert's name, role, affiliation and bio stay in sync across
// both pages. Add entries here as further experts confirm — pages that
// list Forum Experts filter on `confirmed` automatically, so nothing
// appears until it is explicitly set to true.
export const forumExperts: ForumExpert[] = forumTeam
  .filter((member) => member.role === 'Forum Expert')
  .map((member) => ({
    name: member.name,
    role: member.role,
    affiliation: member.affiliation,
    bio: member.bio,
    photo: member.photo,
    confirmed: true,
  }));

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

export const forumExpertCommitments: string[] = [
  'Participate in selected expert roundtables',
  'Challenge and refine emerging concepts',
  'Identify real operational control problems',
  'Contribute perspectives from their discipline',
  "Help shape the Forum's first practitioner agenda",
  'Optionally contribute to publications, case discussions and events',
];
