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
  // No confirmed LinkedIn page exists yet. Set this once the Forum's
  // LinkedIn presence is created — every template checks for a non-empty
  // value before rendering a link, so nothing invented shows up meanwhile.
  linkedInUrl: '',
} as const;

export function mailto(subject: string): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
}
