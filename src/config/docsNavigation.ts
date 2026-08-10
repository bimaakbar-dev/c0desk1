//src/config/docsNavigation.ts

export const SIDEBAR_CATEGORIES = [
  'Getting Started',
  "Guide",
  'typography',
  'integration',
  'Components',
  'Uncategorized',
] as const;

export type SidebarCategory = (typeof SIDEBAR_CATEGORIES)[number];

export const SIDEBAR_CONFIG: Array<{ category: SidebarCategory; label: string }> = [
  { category: 'Getting Started', label: 'Getting Started' },
  { category: 'Guide', label: 'Guide' },
  { category: 'typography', label: 'Typography' },
  { category: 'integration', label: 'Integration' },
  { category: 'Components', label: 'Components' },
  { category: 'Uncategorized', label: 'Lainnya' },
];
