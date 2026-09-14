export interface Pillar {
  title: string;
  items: string[];
}

// The three working areas the Forum covers — grouping the same underlying
// concepts previously shown as a flat tag list, now organised so the
// homepage reads as three named areas rather than a keyword cloud.
export const pillars: Pillar[] = [
  {
    title: 'Authority & boundaries',
    items: ['Decision authority', 'Runtime authorisation', 'Decision boundaries', 'Agentic AI controls'],
  },
  {
    title: 'Human oversight',
    items: ['Human intervention', 'Escalation', 'Overrides'],
  },
  {
    title: 'Record & accountability',
    items: ['Evidence', 'Accountability', 'Decision reconstruction'],
  },
];
