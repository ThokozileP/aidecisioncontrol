export interface EventTheme {
  title: string;
  description: string;
}

export const eventThemes: EventTheme[] = [
  {
    title: 'Who Controls the Decision?',
    description: 'Operational control for AI in high-stakes environments.',
  },
  {
    title: 'Human Oversight Is Not a Button',
    description: 'Turning oversight requirements into operational mechanisms.',
  },
  {
    title: 'Governing Agents at Runtime',
    description: 'Authority, permissions and escalation for agentic AI.',
  },
  {
    title: 'When AI Must Stop',
    description: 'Designing boundaries for consequential AI actions.',
  },
];

export const eventFormats: string[] = [
  'Invitation-only expert roundtables',
  'Practitioner sessions',
  'Cross-sector discussions',
  'Public educational events',
];
