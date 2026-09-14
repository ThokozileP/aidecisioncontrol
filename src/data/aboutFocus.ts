export interface FocusArea {
  term: string;
  body: string;
}

export interface FocusCluster {
  label: string;
  areas: FocusArea[];
}

// "Our focus" section on the About page — grouped into two moments: what's
// decided before an AI-supported action occurs, and what's captured at and
// after it.
export const aboutFocusClusters: FocusCluster[] = [
  {
    label: 'Before the decision',
    areas: [
      { term: 'Policy', body: 'What should be allowed, as a matter of organisational rule.' },
      { term: 'Authority', body: 'Who is entitled to decide, and on what basis.' },
      {
        term: 'Context',
        body: 'Under what circumstances the rule and the authority actually apply.',
      },
    ],
  },
  {
    label: 'At and after the decision',
    areas: [
      {
        term: 'Control',
        body: "What happens before execution: what's checked, and what can stop it.",
      },
      { term: 'Evidence', body: 'What gets recorded at the moment the decision is made.' },
      {
        term: 'Accountability',
        body: 'Whether the organisation can explain and reconstruct the decision afterward.',
      },
    ],
  },
];
