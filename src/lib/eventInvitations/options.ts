// Selectable option lists for the inaugural Forum invitation request form.
// Shared between the client-side form (React island) and server-side
// validation so the two can never drift out of sync.

export const DISCUSSION_TOPICS = [
  'Delegating decisions to AI',
  'Human oversight',
  'Intervention and stopping AI systems',
  'Accountability',
  'Monitoring and auditability',
  'Agentic AI and autonomous workflows',
  'Regulatory requirements',
  'Organisational AI controls',
  'Other',
] as const;

export const CONTRIBUTOR_INTEREST_OPTIONS = ['Yes', 'Maybe', 'No'] as const;

export type DiscussionTopic = (typeof DISCUSSION_TOPICS)[number];
export type ContributorInterest = (typeof CONTRIBUTOR_INTEREST_OPTIONS)[number];
