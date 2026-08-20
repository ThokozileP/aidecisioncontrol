export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
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
