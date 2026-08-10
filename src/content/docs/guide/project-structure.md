---
slug: "project-structure"
title: "Project Structure"
description: "A comprehensive overview of the Unloyd folder structure and key files."
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
  description: "A comprehensive overview of the Unloyd folder structure and key files."
  noIndex: false
---

Understanding the folder structure is key to customizing Unloyd effectively. This guide walks you through every important directory and file.

---

## Overview

Here's the complete folder structure of a fresh Unloyd installation:

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
            - form.ts
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
            - maniefest.json.ts
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

## Public Directory
The `public/` directory contains static assets that are served directly without processing.

| File / Folder | Purpose |
| ---- | ---- |
| `favicons/` | Favicon files (PNG, SVG, ICO) |
| `_headers` | Cloudflare Pages headers configuration |

## Source Directory
### `src/assets/`
Contains images, fonts, and other static assets that are processed by Astro.

| File | Purpose |
| ---- | ---- |
| `images/logo.svg` | Site logo |
| `images/og-image.svg` | Default Open Graph image |
| `images/cover.svg` | Placeholder cover image |
| `images/author.jpg` | Placeholder author avatar |
| `fonts/` | Custom font files |
| `icons/` | ... |

### `src/components/`
Reusable Astro components organized by domain.

| Folder | Purpose |
| ---- | ---- |
| `blog/` | Blog-specific components (BlogCard, BlogFooter, BlogHeader) |
| `docs/` | Documentation components (DocsNavigation, DocsHeader, Toc) |
| `mdx/` | MDX component overrides |
| `ui/` | Reusable UI components (Button, Card, Container, Section, Icon) |

### `src/config/`
This is where all site configuration lives. Most of your customization will happen here.

| File | Purpose |
| ---- | ---- |
| `pages/*.ts` | Content for static pages (About, Contact, Archive, 404) |
| `docsNavigation.ts` | Sidebar navigation order |
| `form.ts` | Form labels, placeholders, and messages |
| `schema.ts` | Structured data (JSON-LD) helpers |
| `seo.ts` | Meta tags, Open Graph, Twitter Cards |
| `site.ts` | Site name, URL, navigation, footer, social links |

> [!TIP]
> Start customizing your site by editing `site.ts` and `seo.ts` first.

### `src/content/`
All Markdown content lives here. Astro Content Collections make it type-safe.

| Folder | Purpose |
| ---- | ---- |
| `blog/` | Blog posts as `.md` or `.mdx` |
| `docs/` | Documentation pages (organized by category) |
| `legal/` | Legal pages (privacy policy, terms, cookie policy) |

Each file in these folders uses frontmatter to define metadata.

### `src/layouts/`
Page layouts that wrap content with common structure.

| File | Purpose |
| ---- | ---- |
| `Layout.astro` | Base layout (head, header, footer) |
| `BlogLayout.astro` | Blog post layout | 
| `DocsLayout.astro` | Documentation layout |

### `src/lib/`
Utilities and plugins that extend functionality.

| File / Folder | Purpose |
| ---- | ---- |
| `plugins/` | Sätteri custom directives (callout, steps, tabs, filetree, etc.) |
| `utils.ts` | Date formatting, excerpt generation, reading time |

### `src/pages/`
Static pages and route handlers.

| File / Folder | Purpose |
| ---- | ---- |
| `blog/` | Blog index, archive, and RSS feed |
| `docs/` | Documentation pages (dynamic) |
| `[slug].astro` | ... |
| `about.astro` | About page |
| `contact.astro` | Contact page |
| `index.astro` | Homepage |
| `404.astro` | Custom not-found page |
| `feed.atom.ts` | ... |
| `feed.json.ts` | ... |
| `manifest.json.ts` | ... |
| `robots.txt.ts` | ... |
| `rss.xml.ts` | ... |
| `sitemap.xml.ts` | ... |

### `src/styles/`
Global styles and component-specific styles.

| File / Folder | Purpose |
| ---- | ---- |
| `prose/` | Styling for Markdown content (callout, filetree, tabs, etc.) |
| `global.css` | Global styles, CSS variables, and Tailwind imports |
| `utils.css` | ... |

### Root Files
| File | Purpose |
| ---- | ---- |
| `astro.config.mjs` | Astro configuration (build, integrations, Markdown) |
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `.env.example` | Example environment variables |

## Configuration Files Explained
### `consts.ts`
Central export for all configuration:

```ts
// src/consts.ts
export * from "./config/site";
export * from "./config/seo";
export * from "./config/schema";
export * from "./config/docsNavigation";
```

### `content.config.ts`
Defines content collections and their schemas:

```ts
// src/content.config.ts

// ...

const METADATA = z.object({
  slug: z.string().optional(),
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date().optional(),
  lastUpdated: z.coerce.date().optional(),
  cover: z.object({
    src: z.string(),
    alt: z.string(),
  }).optional(),
});

const SEO = z.object({
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().default(false).optional(),
});

const AUTHOR = z.object({
  author: z.object({
    name: z.string(),
    role: z.string().optional(),
    avatar: z.string().optional(),
    url: z.url().optional(),
    email: z.email().optional(),
  }).optional()
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}", deferRender: true }),
  schema: z.object({
    ...METADATA.shape,
    ...AUTHOR.shape,
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    seo: SEO,
  }),
});

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.{md,mdx}", deferRender: true }),
  schema: z.object({
    ...METADATA.shape,
    ...AUTHOR.shape,
    category: z.enum(SIDEBAR_CATEGORIES).optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
    seo: SEO,
  }),
});

const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "**/*.{md,mdx}", deferRender: true }),
  schema: z.object({
  ...METADATA.shape,
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]).optional(),
  seo: SEO,
  }),
});

// ...

```

## Next Steps

:::card[Configuration]{href="/docs/configuration/" icon='learn'}
Deep dive into site configuration
:::

:::card[Deployment]{href="/docs/deployment/" icon='learn'}
Deploy your site to production
:::

:::card[Components]{href="/docs/components/" icon='learn'}
Explore all custom directives
:::