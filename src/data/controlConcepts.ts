export interface ControlConcept {
  term: string;
  /** Short question shown as the console-cell heading, e.g. "Is this permitted?" */
  heading: string;
  /** Longer explanatory sentence shown as the console-cell body. */
  body: string;
}

// The four control concepts from "The operational gap" homepage section.
export const controlConcepts: ControlConcept[] = [
  {
    term: 'Authorise',
    heading: 'Is this permitted?',
    body: 'Is this AI system permitted to take this action, in this context, right now.',
  },
  {
    term: 'Constrain',
    heading: 'What boundaries apply?',
    body: 'What limits, thresholds or scopes bound this particular decision.',
  },
  {
    term: 'Escalate',
    heading: 'Who takes over?',
    body: 'When must authority move to a human or another control function.',
  },
  {
    term: 'Stop',
    heading: 'What must halt it?',
    body: 'Under what conditions must execution be prevented outright.',
  },
];
