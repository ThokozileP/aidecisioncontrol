// Selectable option lists for the membership application. Shared between the
// client-side form (React island) and server-side validation so the two can
// never drift out of sync.

export const SECTORS = [
  'Financial Services',
  'Technology',
  'Healthcare',
  'Government / Public Sector',
  'Consulting',
  'Legal',
  'Academia / Research',
  'Insurance',
  'Energy',
  'Telecommunications',
  'Manufacturing',
  'Professional Services',
  'Non-profit / Civil Society',
  'Other',
] as const;

export const AREAS_OF_WORK = [
  'AI Governance',
  'AI Risk Management',
  'AI Regulation / Policy',
  'AI Safety',
  'AI Compliance',
  'Responsible AI',
  'AI Audit / Assurance',
  'Model Risk Management',
  'Data Governance',
  'Cybersecurity',
  'Legal / Regulatory',
  'Product / Technology',
  'AI Research',
  'Ethics',
  'Executive / Leadership',
  'Other',
] as const;

export const AI_EXPERIENCE_LEVELS = [
  'Exploring / Learning',
  'Practitioner',
  'Experienced Practitioner',
  'Senior / Leadership',
  'Researcher / Academic',
  'Policy / Regulatory Expert',
  'Executive / Founder',
] as const;

export const INTERESTS = [
  'AI governance',
  'Controlling AI-driven decisions',
  'AI regulation',
  'AI risk',
  'AI safety',
  'AI compliance',
  'Practical implementation',
  'Industry perspectives',
  'Research and knowledge sharing',
  'Networking',
  'Policy discussions',
  'Events and roundtables',
  'Responsible AI practices',
] as const;

export const MEMBERSHIP_GAINS = [
  'Professional connections',
  'Knowledge and insights',
  'Access to events',
  'Opportunities to contribute',
  'Thought leadership opportunities',
  'Research and publications',
  'Peer discussions',
  'Collaboration opportunities',
  'Exposure to emerging AI governance challenges',
  'Other',
] as const;

export const CONTRIBUTIONS = [
  'Participate in discussions',
  'Share professional insights',
  'Contribute to research',
  'Speak at events',
  'Participate in roundtables',
  'Write articles / opinion pieces',
  'Support working groups',
  'Introduce relevant experts',
  'Volunteer',
  'I would primarily like to learn and participate',
] as const;

export const MAX_INTERESTS = 3;

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia',
  'Costa Rica', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt',
  'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Hong Kong',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Malta', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Morocco', 'Namibia',
  'Netherlands', 'New Zealand', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan',
  'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Vietnam', 'Zambia', 'Zimbabwe', 'Other',
] as const;

export type Sector = (typeof SECTORS)[number];
export type AreaOfWork = (typeof AREAS_OF_WORK)[number];
export type AiExperienceLevel = (typeof AI_EXPERIENCE_LEVELS)[number];
export type Interest = (typeof INTERESTS)[number];
export type MembershipGain = (typeof MEMBERSHIP_GAINS)[number];
export type Contribution = (typeof CONTRIBUTIONS)[number];
export type Country = (typeof COUNTRIES)[number];
