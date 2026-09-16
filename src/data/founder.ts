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
    'entrepreneur with over 10 years of experience across B2B SaaS, software platforms, ' +
    'digital transformation and AI. She is the founder of CARC through Giggle AI Innovation, ' +
    'where she develops AI technology focused on practical applications of artificial ' +
    'intelligence, combining hands-on product leadership with a strong focus on AI governance, ' +
    'human oversight and decision control. She is also the creator of the Decision Context ' +
    'Record™, a framework designed to strengthen transparency, accountability and human control ' +
    'around AI-assisted decisions. Through the AI Decision Control Forum, she brings together ' +
    'practitioners, researchers and industry leaders to examine how organisations can maintain ' +
    'meaningful authority, accountability and operational control as AI systems become ' +
    'increasingly autonomous.',
  doi: '10.5281/zenodo.20663952',
  doiUrl: 'https://zenodo.org/records/20663952',
};
