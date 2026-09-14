export interface PublishedResearch {
  status: string;
  title: string;
  description: string;
  author: string;
  doi: string;
  doiUrl: string;
}

// Research that predates the Forum's own Perspectives content collection (see
// src/content/perspectives/) and isn't a Forum-published Perspectives article
// in the technical sense — kept as a distinct data entry rather than mixed
// into that collection's schema, which is reserved for actual articles.
export const publishedResearch: PublishedResearch[] = [
  {
    status: 'Published research',
    title: 'The Decision Context Record™',
    description:
      "Defines the runtime evidence required to reconstruct what a clinical AI agent recommended, why it acted, what the clinician saw, and how the workflow resolved — part of the frameworks behind CARC's Evidence Engine.",
    author: 'Thokozile Phiri',
    doi: '10.5281/zenodo.20663952',
    doiUrl: 'https://zenodo.org/records/20663952',
  },
];
