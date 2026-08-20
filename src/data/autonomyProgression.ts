export interface AutonomyStage {
  stage: string;
  description: string;
}

// The "Why now" progression: as AI moves from prediction to execution,
// the control question becomes more consequential at each stage.
export const autonomyProgression: AutonomyStage[] = [
  { stage: 'Models', description: 'Generate predictions.' },
  { stage: 'Assistants', description: 'Generate recommendations.' },
  { stage: 'Agents', description: 'Initiate actions.' },
  { stage: 'Autonomous workflows', description: 'Coordinate decisions and execution.' },
];
