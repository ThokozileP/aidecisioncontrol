import { founder } from './founder';

export interface TeamMember {
  name: string;
  role: string;
  affiliation?: string;
  bio: string;
  photo: string;
  photoAlt: string;
  /** Object-position for the portrait crop; defaults to center in the component. */
  photoPosition?: string;
  doi?: string;
  doiUrl?: string;
}

// "Meet the Forum Team" section on the About page.
export const forumTeam: TeamMember[] = [
  {
    name: founder.name,
    role: 'Founder',
    affiliation: 'AI Decision Control Forum',
    bio: founder.bio,
    photo: founder.photo,
    photoAlt: `${founder.name}, Founder of the AI Decision Control Forum`,
    photoPosition: '50% 15%',
    doi: founder.doi,
    doiUrl: founder.doiUrl,
  },
  {
    name: 'Oliver Giudice',
    role: 'Forum Expert',
    affiliation: 'Bank of Italy',
    bio:
      'Oliver Giudice is a researcher and team lead at the Bank of Italy, with expertise ' +
      'spanning AI, digital forensics, financial services and AI ethics. His work explores the ' +
      'governance and auditing of AI systems in regulated environments where transparency, ' +
      'accountability and human oversight are critical, bringing a practical perspective on how ' +
      'organisations can maintain decision authority, controllability and meaningful human ' +
      'intervention as AI becomes increasingly embedded in financial and institutional ' +
      'decision-making. At the AI Decision Control Forum, he contributes expertise on AI ' +
      'auditing, governance, accountability and operational control in regulated environments.',
    photo: '/oliver-giudice-1024.jpg',
    photoAlt: 'Oliver Giudice, Forum Expert',
  },
  {
    name: 'Dr. Karim Hamza',
    role: 'Forum Expert',
    bio:
      'Dr. Karim Hamza is a technology executive, strategic advisor and policy scholar with ' +
      'over 25 years of experience across AI governance, digital transformation, technology ' +
      'strategy and public-sector modernisation. He brings extensive international experience ' +
      'advising governments, financial institutions and enterprises on AI and data governance, ' +
      'institutional readiness and responsible technology adoption, and is the creator of the ' +
      'AIM-5 AI Leadership Maturity & Governance Framework. At the AI Decision Control Forum, ' +
      'he contributes expertise on AI governance, institutional accountability, human oversight ' +
      'and the challenges organisations face as AI systems become increasingly autonomous.',
    photo: '/dr-karim-hamza.jpeg',
    photoAlt: 'Dr. Karim Hamza, Forum Expert',
    photoPosition: '50% 20%',
  },
];
