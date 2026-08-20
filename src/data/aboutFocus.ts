export interface FocusArea {
  term: string;
  question: string;
}

// "Our focus" section on the About page.
export const aboutFocusAreas: FocusArea[] = [
  { term: 'Policy', question: 'What should be allowed?' },
  { term: 'Authority', question: 'Who is entitled to decide?' },
  { term: 'Context', question: 'Under what circumstances?' },
  { term: 'Control', question: 'What happens before execution?' },
  { term: 'Evidence', question: 'What should be recorded?' },
  { term: 'Accountability', question: 'Can the organisation explain and reconstruct the decision?' },
];
