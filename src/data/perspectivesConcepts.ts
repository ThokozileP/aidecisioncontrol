export interface PerspectiveConcept {
  title: string;
  description: string;
}

// Conceptual placeholders shown until actual Perspectives articles (see
// src/content/perspectives/) are published. Labelled "Coming soon" on the
// page — these are not to be presented as published research.
export const perspectivesConcepts: PerspectiveConcept[] = [
  {
    title: 'From AI Governance to AI Decision Control',
    description: 'Why governing the system and controlling the decision are different problems.',
  },
  {
    title: 'Human Oversight as a Control Mechanism',
    description: 'Why meaningful oversight requires more than approval interfaces.',
  },
  {
    title: 'The Runtime Authority Problem',
    description: 'What changes when AI systems can initiate actions rather than only produce recommendations.',
  },
];
