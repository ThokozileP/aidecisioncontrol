export interface Founder {
  name: string;
  title: string;
  initials: string;
  bio: string;
  doi: string;
  doiUrl: string;
}

// "Who's behind it" section on the About page. `initials` renders as a
// placeholder mark until there's a real photo to swap in.
export const founder: Founder = {
  name: 'Thokozile Phiri',
  title: 'Founder, AI Decision Control Forum',
  initials: 'TP',
  bio:
    "Thokozile Phiri founded the AI Decision Control Forum alongside Giggle AI Innovation and " +
    'CARC (Clinical Agent Runtime Control), a runtime control and evidence layer for autonomous ' +
    'clinical AI agents. She is the publisher of the Decision Context Record™ framework, ' +
    "which defines the runtime evidence CARC's Evidence Engine captures for every clinical agent " +
    'run.',
  doi: '10.5281/zenodo.20663952',
  doiUrl: 'https://zenodo.org/records/20663952',
};
