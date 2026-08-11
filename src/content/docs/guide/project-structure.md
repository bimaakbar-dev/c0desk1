---
slug: "project-structure"
title: "Project Structure"
description: "An overview of the Unloyd folder structure and key files."
category: "Guide"
order: 2
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Project Structure"
  description: "An overview of the Unloyd folder structure and key files."
  noIndex: false
---

Understanding the folder structure is key to customizing Unloyd effectively.

---

## Overview

:::filetree
- unloyd/
  - public/
    - favicons/
    - _headers
  - src/
    - assets/
      - fonts/
      - images/
      - icons/
    - components/
      - blog/
      - docs/
      - mdx/
      - ui/
    - config/
      - pages/
      - docsNavigation.ts
      - schema.ts
      - seo.ts
      - site.ts
    - content/
      - blog/
      - docs/
      - legal/
    - layouts/
      - BlogLayout.astro
      - DocsLayout.astro
      - Layout.astro
    - lib/
      - plugins/
      - utils.ts
    - pages/
      - blog/
      - docs/
      - [slug].astro
      - about.astro
      - contact.astro
      - index.astro
      - 404.astro
      - feed.atom.ts
      - feed.json.ts
      - manifest.json.ts
      - robots.txt.ts
      - rss.xml.ts
      - sitemap.xml.ts
    - styles/
      - prose/
      - global.css
      - utils.css
    - consts.ts
    - content.config.ts
  - astro.config.mjs
  - package.json
  - tsconfig.json
  - .env.example
:::

---

## `public/`

Static assets served directly without processing.

| File / Folder | Purpose |
| --- | --- |
| `favicons/` | Favicon files (PNG, SVG, ICO) |
| `_headers` | Cloudflare Pages HTTP headers config |

---

## `src/`

### `assets/`

| Folder | Purpose |
| --- | --- |
| `images/` | Logo, OG image, cover placeholder, author avatar |
| `fonts/` | Custom font files |
| `icons/` | SVG icons |

### `components/`

| Folder | Purpose |
| --- | --- |
| `blog/` | Blog-specific components (BlogCard, BlogHeader, BlogFooter) |
| `docs/` | Documentation components (DocsNavigation, DocsHeader, Toc) |
| `mdx/` | MDX component overrides |
| `ui/` | Shared UI components (Button, Card, Icon, Section) |

### `config/`

All site configuration lives here. Most customization happens in this folder.

| File | Purpose |
| --- | --- |
| `pages/*.ts` | UI text for static pages (titles, labels, empty states) |
| `docsNavigation.ts` | Docs sidebar order and categories |
| `schema.ts` | JSON-LD structured data helpers |
| `seo.ts` | Meta tags, Open Graph, Twitter Cards |
| `site.ts` | Site identity, navigation, footer, social links |

> [!TIP]
> Start here — edit `site.ts` and `seo.ts` first before anything else.

### `content/`

All Markdown content, managed as Astro Content Collections.

| Folder | Purpose |
| --- | --- |
| `blog/` | Blog posts (`.md` or `.mdx`) |
| `docs/` | Documentation pages, organized by category |
| `legal/` | Legal pages (privacy policy, terms, cookie policy) |

### `layouts/`

| File | Purpose |
| --- | --- |
| `Layout.astro` | Base layout — head, header, footer |
| `BlogLayout.astro` | Blog post layout |
| `DocsLayout.astro` | Documentation layout |

### `lib/`

| File / Folder | Purpose |
| --- | --- |
| `plugins/` | Sätteri custom directives (callout, steps, tabs, filetree, etc.) |
| `utils.ts` | Helpers for date formatting, reading time, and excerpt generation |

### `pages/`

| File / Folder | Purpose |
| --- | --- |
| `blog/` | Blog index and archive |
| `docs/` | Documentation routes (dynamic) |
| `[slug].astro` | Dynamic route for `content/legal/` — renders pages like `/privacy-policy` |
| `about.astro` | About page |
| `contact.astro` | Contact page |
| `index.astro` | Homepage |
| `404.astro` | Custom not-found page |
| `feed.atom.ts` | Atom feed |
| `feed.json.ts` | JSON feed |
| `rss.xml.ts` | RSS feed |
| `manifest.json.ts` | Web app manifest |
| `robots.txt.ts` | Robots.txt |
| `sitemap.xml.ts` | Sitemap |

### `styles/`

| File / Folder | Purpose |
| --- | --- |
| `prose/` | Styles for Markdown content (callout, filetree, tabs, etc.) |
| `global.css` | Global styles, CSS variables, and Tailwind imports |
| `utils.css` | Utility classes for text sizing |

---

## Key Files

### `consts.ts`

Central re-export for all config modules — import from here instead of individual config files.

```ts
export * from "./config/site";
export * from "./config/seo";
export * from "./config/schema";
export * from "./config/docsNavigation";
```

### `content.config.ts`

Defines Content Collections and their frontmatter schemas. There are three collections:

- **`blog`** — supports `title`, `description`, `pubDate`, `lastUpdated`, `cover`, `author`, `category`, `tags`, `draft`, and `seo`
- **`docs`** — same as blog, with `category` typed to `SIDEBAR_CATEGORIES` and an `order` field for sidebar sorting
- **`legal`** — same as blog, without `author` and `category`

Schemas are validated with Zod. If you add new frontmatter fields, update the schema here first.

## Next Steps

:::card[Configuration]{href="/docs/configuration/" icon='learn'}
Deep dive into site configuration
:::