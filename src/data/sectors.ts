export interface Sector {
  name: string;
  examples: string[];
  question: string;
}

export const sectors: Sector[] = [
  {
    name: 'Healthcare',
    examples: [
      'Clinical decision support',
      'Treatment recommendations',
      'Patient prioritisation',
      'Diagnostic workflows',
      'Clinical agents',
      'Care pathway automation',
    ],
    question: 'When must clinical authority remain with a human?',
  },
  {
    name: 'Financial Services',
    examples: [
      'Credit decisions',
      'Fraud interventions',
      'Transaction decisions',
      'Customer eligibility',
      'Risk assessment',
      'Autonomous financial agents',
    ],
    question: 'Who determines whether an AI-supported financial action is authorised to proceed?',
  },
];

export const otherEnvironments = {
  name: 'Other high-stakes environments',
  description:
    'Public sector, critical infrastructure and other regulated industries face the same underlying question. The Forum expects its scope to widen as practitioner participation grows, without diluting the initial focus on healthcare and financial services.',
};
