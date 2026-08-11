# AGENT.md

This file provides context for AI coding agents working on the Unloyd codebase.

## Project Overview

Unloyd is a static documentation and blog template built with Astro 7, TailwindCSS 4, and Sätteri. It is deployed to Cloudflare Pages.

## Tech Stack

- **Astro 7** — Core framework with static output
- **TailwindCSS 4** — Utility-first CSS
- **Sätteri** — Default Markdown parser in Astro 7, extended with custom directives
- **Pagefind** — Static search, runs after build
- **TypeScript** — Used throughout

## Project Structure

```
src/
├── assets/           # Images, fonts, SVG icons
├── components/
│   ├── blog/         # Blog-specific components
│   ├── docs/         # Documentation components
│   ├── mdx/          # MDX component overrides (Card, User, Quote, Badge, Button, Figure, Video)
│   └── ui/           # Shared UI components
├── config/
│   ├── pages/        # UI text per page (blog.ts, home.ts, about.ts, etc.)
│   ├── docsNavigation.ts
│   ├── schema.ts
│   ├── seo.ts
│   └── site.ts       # Main config — SITE, NAV, ROUTES, IMAGE, PAGINATION
├── content/
│   ├── blog/         # Blog posts (.md or .mdx)
│   ├── docs/         # Documentation pages (.md or .mdx)
│   └── legal/        # Legal pages (.md or .mdx)
├── layouts/
│   ├── Layout.astro
│   ├── BlogLayout.astro
│   └── DocsLayout.astro
├── lib/
│   ├── plugins/      # Sätteri custom directive plugins
│   └── utils.ts
├── pages/            # Astro page routes
└── styles/
    ├── prose/        # Markdown content styles
    ├── global.css
    └── utils.css     # Text utility classes
```

## Configuration

All site configuration is in `src/config/`. Import from `src/consts.ts` — it re-exports everything.

```ts
import { SITE, NAV, ROUTES, SEO } from "@/consts";
```

**Do not import directly from individual config files** — always use `@/consts`.

### Environment Variables

Only one variable is required:

```env
PUBLIC_SITE_URL=https://your-site.com
```

Optional:
```env
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
PUBLIC_ANALYTICS_GOOGLE=G-XXXXXXXXXX
PUBLIC_ANALYTICS_YANDEX=XXXXXXXXX
PUBLIC_VERIFICATION_GOOGLE=
PUBLIC_VERIFICATION_BING=
PUBLIC_VERIFICATION_YANDEX=
```

All other values are hardcoded in `src/config/site.ts` with sensible defaults.

## Content

### Adding a Blog Post

Create a `.md` or `.mdx` file in `src/content/blog/`:

```md
---
slug: "post-slug"
title: "Post Title"
description: "Post description."
pubDate: 2026-01-01
category: "Category"
tags: ["tag1", "tag2"]
draft: false
author:
  name: "Author Name"
  role: "Role"
  url: "https://github.com/username"
  email: "author@email.com"
seo:
  title: "Post Title"
  description: "Post description."
  noIndex: false
---
```

### Adding a Docs Page

Create a `.md` or `.mdx` file in `src/content/docs/`:

```md
---
slug: "page-slug"
title: "Page Title"
description: "Page description."
category: "Getting Started"
order: 1
draft: false
author:
  name: "Author Name"
  role: "Role"
  url: "https://github.com/username"
  email: "author@email.com"
seo:
  title: "Page Title"
  description: "Page description."
  noIndex: false
---
```

`category` must match one of the values in `SIDEBAR_CATEGORIES` in `src/config/docsNavigation.ts`. `order` controls the position within the category.

### Adding a Docs Category

Add to both `SIDEBAR_CATEGORIES` and `SIDEBAR_CONFIG` in `src/config/docsNavigation.ts`:

```ts
export const SIDEBAR_CATEGORIES = [
  'Getting Started',
  'Guide',
  'Your New Category', // add here
] as const;

export const SIDEBAR_CONFIG = [
  { category: 'Getting Started', label: 'Getting Started' },
  { category: 'Guide', label: 'Guide' },
  { category: 'Your New Category', label: 'Display Name' }, // and here
];
```

## Custom Directives

Sätteri plugins are in `src/lib/plugins/`. Each plugin handles one directive.

| Directive | Plugin | Output |
| --- | --- | --- |
| `:::callout` / `> [!TYPE]` | `satteri-callout.ts` | `<aside data-callout="type">` |
| `:::steps` | `satteri-steps.ts` | `<div class="steps-wrapper"><ol class="steps">` |
| `::::tabs` / `:::tab` | `satteri-tabs.ts` | Tab UI |
| `:::filetree` | `satteri-filetree.ts` | File tree UI |
| `:::accordion` | `satteri-accordion.ts` | `<details>` |
| `:::card` | `satteri-card.ts` | `<div class="card">` |
| `:::quote` | `satteri-quote.ts` | `<figure class="quote">` |
| `:::grid` | `satteri-grid.ts` | 2-column grid |
| `:user` | `satteri-user.ts` | `<span class="user">` or `<a class="user-link">` |
| `:badge` | `satteri-badge.ts` | Inline badge |
| `:button` | `satteri-button.ts` | Inline button |
| `:icon` | `satteri-icon.ts` | Inline SVG icon |
| `::video` | `satteri-video.ts` | `<iframe>` or `<video>` |
| `

![alt](url)

{caption}` | `satteri-figure.ts` | `<figure>` with `<figcaption>` |

### MDX Components

MDX equivalents are in `src/components/mdx/`:

| Component | Props |
| --- | --- |
| `<Card>` | `title`, `icon`, `href`, `class` |
| `<User>` | `avatar`, `role`, `url`, `class` |
| `<Quote>` | `user`, `avatar`, `role`, `url` |
| `<Badge>` | `variant`, `icon`, `class` |
| `<Button>` | `url`, `icon`, `variant`, `block`, `class` |
| `<Figure>` | `src`, `alt` |
| `<Video>` | `src`, `width`, `height`, `title` |

## Styling

- Global styles and CSS variables: `src/styles/global.css`
- Text utility classes: `src/styles/utils.css`
- Markdown content styles: `src/styles/prose/`
- Component styles are co-located or in `prose/`
- **Do not add inline styles** — use utility classes or CSS variables

### CSS Variables

Key variables defined in `global.css`:

```css
--fg          /* foreground */
--fg-strong   /* strong foreground */
--fg-muted    /* muted foreground */
--bg          /* background */
--bg-subtle   /* subtle background */
--bg-muted    /* muted background */
--border      /* border color */
--accent      /* accent color */
--radius-md   /* border radius */
```

## Important Rules

- **Do not use `@astrojs/mdx` directives** — use Sätteri directives instead
- **Do not add `class` attributes to Sätteri plugin output** unless it matches the existing class convention
- **Do not modify `content.config.ts` schema** without updating all relevant frontmatter
- **Do not hardcode URLs** — always use `ROUTES` from `@/consts`
- **Always import from `@/consts`**, not individual config files
- **`PUBLIC_SITE_URL` must be set** in the hosting platform environment

## Build

```bash
npm run dev      # development server at localhost:4321
npm run build    # astro build && npx pagefind --site dist
npm run preview  # preview production build
```

Pagefind runs automatically after build and generates the search index in `dist/pagefind/`.