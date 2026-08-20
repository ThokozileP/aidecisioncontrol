export interface ControlConcept {
  term: string;
  question: string;
}

// The four control concepts from "The operational gap" homepage section.
export const controlConcepts: ControlConcept[] = [
  {
    term: 'Authorise',
    question: 'Is this AI system permitted to take this action in this context?',
  },
  {
    term: 'Constrain',
    question: 'What boundaries apply to this decision?',
  },
  {
    term: 'Escalate',
    question: 'When must authority move to a human or another control function?',
  },
  {
    term: 'Stop',
    question: 'Under what conditions must execution be prevented?',
  },
];
