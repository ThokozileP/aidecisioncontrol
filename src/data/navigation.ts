export interface NavItem {
  label: string;
  href: string;
}

// Header nav is deliberately a short 4 items — Expert Circle and Events
// stay reachable via footerNav below and the header's own primary CTA
// (which links to /expert-circle), just not as top-level nav items.
export const mainNav: NavItem[] = [
  { label: 'Forum', href: '/forum' },
  { label: 'Perspectives', href: '/perspectives' },
  { label: 'Membership', href: '/membership' },
  { label: 'About', href: '/about' },
];

export const footerNav: NavItem[] = [
  { label: 'AI Decision Control', href: '/#definition' },
  { label: 'Forum', href: '/forum' },
  { label: 'Expert Circle', href: '/expert-circle' },
  { label: 'Events', href: '/events' },
  { label: 'Perspectives', href: '/perspectives' },
  { label: 'Membership', href: '/membership' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
];
