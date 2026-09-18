// Single source of truth for the inaugural AI Decision Control Forum event
// (/events/inaugural-forum). Date, venue and speakers are not yet confirmed —
// update the placeholders below in one place once each is locked in, rather
// than hunting through the page for hard-coded copy.

export const inauguralForum = {
  path: '/events/inaugural-forum',
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
  format: 'Invitation-led cross-sector practitioner roundtable',
  audience:
    'AI, technology, risk, compliance, governance and business leaders working with increasingly autonomous AI systems.',
  size: 'A targeted, intimate discussion — kept deliberately small so the conversation stays practitioner-led.',
} as const;

export const coreQuestion =
  'As organisations accelerate toward AI agents and increasingly automated workflows, how do we ensure that humans and organisations remain in control of the decisions AI systems make and the actions they take?';

export interface AutonomyStage {
  stage: string;
  description: string;
}

// The "why this matters" progression: from assistance toward execution.
export const autonomyStages: AutonomyStage[] = [
  { stage: 'AI Assistants', description: 'Surface information and answer questions. A human still decides what to do with it.' },
  { stage: 'AI Copilots', description: 'Work alongside people inside existing tools, drafting and suggesting the next step.' },
  { stage: 'AI Agents', description: 'Take on multi-step tasks and can initiate actions inside defined boundaries.' },
  { stage: 'Automated Workflows', description: 'Chain decisions and actions together end to end, with less routine human checkpoint by default.' },
  {
    stage: 'Increasingly Autonomous Decision-Making',
    description: 'Organisations face growing questions about authority, delegation and oversight as this transition continues.',
  },
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
  {
    name: 'Financial Services',
    challenge: 'Delegating credit, fraud and transaction decisions to AI while preserving auditability and regulatory accountability.',
  },
  {
    name: 'Healthcare',
    challenge: 'Keeping clinical authority with a human as AI takes on diagnostic support and care-pathway automation.',
  },
  {
    name: 'Insurance',
    challenge: 'Maintaining oversight of AI-driven underwriting and claims decisions that directly affect customers.',
  },
  {
    name: 'Energy & Utilities',
    challenge: 'Defining safe boundaries for AI systems acting inside critical infrastructure and grid operations.',
  },
  {
    name: 'Transport & Logistics',
    challenge: 'Establishing intervention points for autonomous systems coordinating movement and routing decisions.',
  },
  {
    name: 'Public Services',
    challenge: 'Demonstrating accountable, auditable decision-making when AI supports services delivered to citizens.',
  },
  {
    name: 'Technology & AI',
    challenge: 'Designing the controls, monitoring and escalation paths that other regulated sectors will rely on.',
  },
];

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
  'Practitioners working in regulated or high-consequence environments',
];
