export interface Founder {
  name: string;
  title: string;
  photo: string;
  bio: string;
  doi: string;
  doiUrl: string;
}

// "Meet the Forum Team" section on the About page.
export const founder: Founder = {
  name: 'Thokozile Phiri',
  title: 'Founder, AI Decision Control Forum',
  photo: '/thokozile-founder.PNG',
  bio:
    'Thokozile Phiri is an AI Product Leader, AI Governance practitioner and technology ' +
    'entrepreneur with over 10 years of experience across B2B SaaS, digital transformation and ' +
    'AI. She is the founder of CARC through Giggle AI Innovation and the creator of the ' +
    'Decision Context Record™, a framework for transparency and human control over ' +
    'AI-assisted decisions. Through the AI Decision Control Forum, she brings together ' +
    'practitioners and industry leaders to strengthen human authority and operational control ' +
    'over increasingly autonomous AI systems.',
  doi: '10.5281/zenodo.20663952',
  doiUrl: 'https://zenodo.org/records/20663952',
};
