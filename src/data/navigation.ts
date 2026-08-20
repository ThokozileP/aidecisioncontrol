export interface NavItem {
  label: string;
  href: string;
}

// The homepage covers "AI Decision Control" as a concept in depth, so that
// nav item anchors to its definition section rather than duplicating a page.
export const mainNav: NavItem[] = [
  { label: 'AI Decision Control', href: '/#definition' },
  { label: 'Forum', href: '/forum' },
  { label: 'Founding Circle', href: '/founding-circle' },
  { label: 'Events', href: '/events' },
  { label: 'Perspectives', href: '/perspectives' },
  { label: 'About', href: '/about' },
];

export const footerNav: NavItem[] = [
  { label: 'AI Decision Control', href: '/#definition' },
  { label: 'Forum', href: '/forum' },
  { label: 'Founding Circle', href: '/founding-circle' },
  { label: 'Events', href: '/events' },
  { label: 'Perspectives', href: '/perspectives' },
  { label: 'About', href: '/about' },
];
