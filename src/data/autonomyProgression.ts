export interface AutonomyStage {
  stage: string;
  description: string;
}

// The "Why now" progression: as AI moves from prediction to execution,
// the control question becomes more consequential at each stage.
export const autonomyProgression: AutonomyStage[] = [
  { stage: 'Models', description: 'Generate predictions. A human still decides what to do with them.' },
  { stage: 'Assistants', description: 'Generate recommendations. A human still approves the action.' },
  { stage: 'Agents', description: 'Initiate actions directly, inside defined boundaries.' },
  {
    stage: 'Autonomous workflows',
    description: 'Coordinate decisions and execution end to end, with no human in the loop by default.',
  },
];
