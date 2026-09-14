export interface VolunteerRole {
  title: string;
  responsibilities: string;
  /** Suggested weekly time commitment. Omitted (not yet defined) for some roles. */
  commitment?: string;
}

// Open volunteer roles for the Forum's /careers page. The Forum is
// volunteer-run — these are unpaid, flexible roles, not paid positions.
export const volunteerRoles: VolunteerRole[] = [
  {
    title: 'Volunteer Program Manager',
    responsibilities: 'Coordinate Forum activities, volunteers, meetings and programmes',
    commitment: '3–5 hrs/week',
  },
  {
    title: 'AI Governance Research Volunteer',
    responsibilities:
      'Research AI governance, accountability, controllability, regulation and emerging risks',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Policy & Regulatory Affairs Volunteer',
    responsibilities:
      'Track developments such as the EU AI Act and translate regulatory developments into Forum discussions',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Events & Community Volunteer',
    responsibilities: 'Support roundtables, webinars, expert sessions and community engagement',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Partnerships & Outreach Volunteer',
    responsibilities:
      'Identify and engage institutions, researchers, professional bodies and potential partners',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Communications & Editorial Volunteer',
    responsibilities: 'Develop articles, LinkedIn content, newsletters and Forum communications',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Research & Publications Volunteer',
    responsibilities: 'Help turn expert discussions into reports, briefs and publications',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Digital & Web Volunteer',
    responsibilities: 'Support the website, digital presence, forms and online infrastructure',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Design & Creative Volunteer',
    responsibilities: 'Create visual materials for events, publications and social media',
    commitment: '2–4 hrs/week',
  },
  {
    title: 'Regional Community Volunteer',
    responsibilities:
      "Help build the Forum's presence and network within a particular country or region",
  },
];
