//src/config/docsNavigation.ts

export const SIDEBAR_CATEGORIES = [
  'Getting Started',
  "Guide",
  'Typography',
  'Integration',
  'Components',
  'Uncategorized',
] as const;

export type SidebarCategory = (typeof SIDEBAR_CATEGORIES)[number];

export const SIDEBAR_CONFIG: Array<{ category: SidebarCategory; label: string }> = [
  { category: 'Getting Started', label: 'Getting Started' },
  { category: 'Guide', label: 'Guide' },
  { category: 'Typography', label: 'Typography' },
  { category: 'Integration', label: 'Integration' },
  { category: 'Components', label: 'Components' },
  { category: 'Uncategorized', label: 'Lainnya' },
];
