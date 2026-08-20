// Central site configuration. Referenced by layouts, components and pages
// so brand facts (name, domain, contact) live in exactly one place.

export const SITE = {
  name: 'AI Decision Control Forum',
  shortName: 'AI Decision Control',
  domain: 'aidecisioncontrol.org',
  url: 'https://aidecisioncontrol.org',
  tagline: 'Advancing operational control of AI decisions in regulated industries.',
  statement: 'Govern the system. Control the decision.',
  supportingStatement: 'From governance requirements to control at the point of execution.',
  email: 'hello@aidecisioncontrol.org',
  linkedInUrl: 'https://www.linkedin.com/company/ai-decision-control-forum',
} as const;

export function mailto(subject: string): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
}
