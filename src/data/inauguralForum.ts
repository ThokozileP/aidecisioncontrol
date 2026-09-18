// Single source of truth for the inaugural AI Decision Control Forum event.
// Lives at /events. Date, venue and speakers are not yet confirmed — update
// the placeholders below in one place once each is locked in, rather than
// hunting through the page for hard-coded copy.

export const inauguralForum = {
  path: '/events',
  eyebrow: 'Inaugural AI Decision Control Forum',
  title: 'When AI Makes the Decision',
  subtitle: 'How do organisations maintain control as AI becomes increasingly autonomous?',
  seoTitle: 'When AI Makes the Decision | AI Decision Control Forum',
  seoDescription:
    'The inaugural AI Decision Control Forum brings practitioners from regulated sectors together to discuss how organisations can maintain decision authority, accountability and operational control as AI systems become increasingly autonomous.',
  dateHeadline: 'First week of December 2026',
  dateDetail: 'Exact date to be announced',
  locationHeadline: 'Rotterdam, Netherlands',
  locationDetail: 'Venue to be announced',
  format: 'Invitation-led',
  formatDetail: 'Cross-sector practitioner roundtable',
  audience: 'Targeted, intimate discussion',
  audienceDetail: 'AI, risk, compliance & business leaders',
} as const;

export const whyItMattersHeading =
  'As AI moves from recommendation toward execution, control becomes an operational question, not just a policy one.';

export const whyItMattersCaption =
  'This is an ongoing transition, not a claim that AI already acts fully autonomously across organisations today.';

// The "why this matters" progression: from assistance toward execution.
export const autonomyStages = [
  'AI Assistants',
  'AI Copilots',
  'AI Agents',
  'Automated Workflows',
  'Increasingly Autonomous Decision-Making',
];

export const controlThemes = [
  'Decision authority',
  'Delegation',
  'Boundaries',
  'Human oversight',
  'Monitoring',
  'Intervention',
  'Escalation',
  'Accountability',
  'Auditability',
];

export interface CoreQuestion {
  number: string;
  question: string;
}

export const coreQuestions: CoreQuestion[] = [
  { number: '01', question: 'What decisions should organisations allow AI systems to make autonomously?' },
  { number: '02', question: 'Where should human authority remain mandatory?' },
  { number: '03', question: 'What controls should exist before an AI agent is given authority to act?' },
  { number: '04', question: 'How can organisations intervene when an AI system behaves unexpectedly?' },
  { number: '05', question: 'Who remains accountable when an AI system makes or executes a consequential decision?' },
  { number: '06', question: 'How can organisations demonstrate that meaningful human oversight actually exists?' },
  { number: '07', question: 'How can lessons from one regulated sector inform another?' },
];

export interface EventSector {
  name: string;
  challenge: string;
}

// Deliberately separate from src/data/sectors.ts (the homepage's two-sector
// focus, healthcare + financial services) — this event is explicitly
// cross-sector and needs a broader, event-specific list.
export const eventSectors: EventSector[] = [
  { name: 'Financial Services', challenge: 'Credit, fraud and transaction decisions increasingly executed by autonomous agents.' },
  { name: 'Healthcare', challenge: 'Clinical support and care-pathway automation where human authority cannot lapse.' },
  { name: 'Insurance', challenge: 'Underwriting and claims decisions that carry direct financial and legal consequence.' },
  { name: 'Energy & Utilities', challenge: 'Grid and infrastructure systems where automated action carries physical risk.' },
  { name: 'Transport & Logistics', challenge: 'Routing and fleet decisions moving from advisory to autonomous execution.' },
  { name: 'Public Services', challenge: 'Eligibility and resource-allocation decisions affecting citizens directly.' },
  { name: 'Technology & AI', challenge: 'Teams building the agentic systems that other regulated sectors must now control.' },
];

export const otherSectorsNote =
  'Public sector, critical infrastructure and other regulated industries face the same underlying question.';

export interface FormatStep {
  number: string;
  title: string;
  description: string;
}

export const formatSteps: FormatStep[] = [
  { number: '01', title: 'Opening perspective', description: 'A short practitioner provocation on the shift toward AI autonomy.' },
  { number: '02', title: 'Cross-sector perspectives', description: 'Practitioners share how AI decision-making is evolving in their sectors.' },
  { number: '03', title: 'Moderated discussion', description: 'Explore authority, boundaries, intervention, accountability and control.' },
  { number: '04', title: 'Audience discussion', description: 'Participants bring their own organisational challenges and questions.' },
  { number: '05', title: 'What happens next', description: 'Identify the questions and practical challenges the Forum should continue working on.' },
];

export const audienceRoles = [
  'AI and ML leaders',
  'Product and technology leaders',
  'AI governance practitioners',
  'Risk and compliance professionals',
  'Legal and regulatory professionals',
  'Responsible AI practitioners',
  'Digital transformation leaders',
  'Security and operational risk professionals',
  'Leaders responsible for AI-enabled workflows',
  'Practitioners in regulated or high-consequence environments',
];
