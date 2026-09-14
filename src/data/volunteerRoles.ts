export interface VolunteerRole {
  title: string;
  responsibilities: string;
  /** Suggested weekly time commitment. Omitted (not yet defined) for some roles. */
  commitment?: string;
}

// Open volunteer roles for the Forum's /careers page. The Forum is
// volunteer-run — these are unpaid, flexible roles, not paid positions.
// Role descriptions sourced from the Forum's volunteer role-description
// document (Role Description section for each role); qualifications and
// preferred-experience detail from that document are not reproduced here.
export const volunteerRoles: VolunteerRole[] = [
  {
    title: 'Volunteer Program Manager',
    responsibilities:
      "Support the planning, coordination and delivery of the Forum's programmes, activities and volunteer network. The role helps ensure that initiatives, expert engagements and events are well organised and delivered professionally.",
    commitment: '3–5 hrs/week',
  },
  {
    title: 'AI Governance Research Volunteer',
    responsibilities:
      "Support the Forum's research and intellectual work on AI governance, controllability, accountability, human oversight and AI decision-making.",
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Policy & Regulatory Affairs Volunteer',
    responsibilities:
      'Help the Forum monitor, analyse and communicate developments in AI regulation and public policy, including their implications for organisations deploying AI.',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Events & Community Volunteer',
    responsibilities:
      'Support the organisation of roundtables, webinars, expert discussions and community activities, helping create a professional experience for Forum participants.',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Partnerships & Outreach Volunteer',
    responsibilities:
      "Help develop relationships with institutions, researchers, professional communities, companies and other organisations relevant to the Forum's mission.",
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Communications & Editorial Volunteer',
    responsibilities:
      "Develop clear, credible and engaging content that communicates the Forum's ideas, research, discussions, events and activities to a professional audience.",
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Research & Publications Volunteer',
    responsibilities:
      'Support the development of research papers, policy briefs, reports and other intellectual outputs based on evidence and Forum discussions.',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Digital & Web Volunteer',
    responsibilities:
      "Support the Forum's website, digital presence, online resources and technology infrastructure.",
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Design & Creative Volunteer',
    responsibilities:
      'Create professional visual materials for Forum events, publications, social media, presentations and other communications.',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Regional Community Volunteer',
    responsibilities:
      "Help develop the Forum's professional network and community presence within a specific country or region.",
  },
];
