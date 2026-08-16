---
slug: "project-structure"
title: "Project Structure"
description: "An overview of the Stardux folder structure and its key files."
category: "Guide"
order: 2
draft: false
author:
  name: "Stardux Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Project Structure"
  description: "An overview of the Stardux folder structure and its key files."
  noIndex: false
---

Understanding the project structure makes it easier to customize, extend, and maintain Stardux.

This page provides an overview of the main directories and explains the purpose of the most important files.

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
      - navs/
      - pages/
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

## Root Files

The root directory contains the main project configuration files.

| File | Purpose |
| --- | --- |
| `astro.config.mjs` | Astro configuration and integrations |
| `package.json` | Project dependencies and available scripts |
| `tsconfig.json` | TypeScript configuration |
| `.env.example` | Example environment variables required or supported by the project |

## `public/`

The `public/` directory contains static files that are served directly without being processed by Astro.

| File / Folder | Purpose |
| --- | --- |
| `favicons/` | Favicon files such as PNG, SVG, and ICO |
| `_headers` | HTTP header configuration for Cloudflare Pages |

Use this directory for files that should be available directly from your site's root.

For example:

```text
public/favicons/favicon.svg
```

is available at:

```text
/favicons/favicon.svg
```

## `src/`

The `src/` directory contains most of the application's source code.

### `assets/`

The `assets/` directory contains project assets that can be imported and processed by Astro.

| Folder | Purpose |
| --- | --- |
| `fonts/` | Custom font files |
| `images/` | Images such as logos, Open Graph images, placeholders, and avatars |
| `icons/` | SVG icons and icon assets |

Unlike files in `public/`, assets imported from this directory can be handled by Astro's asset pipeline.

### `components/`

The `components/` directory contains reusable Astro components.

| Folder | Purpose |
| --- | --- |
| `blog/` | Components used by blog pages and posts |
| `docs/` | Components used by the documentation system |
| `mdx/` | Components and overrides available inside MDX content |
| `ui/` | Shared interface components used across the site |

Examples of shared UI components include buttons, cards, icons, sections, and other reusable interface elements.

### `config/`

The `config/` directory contains most of the site's configuration.

This is one of the main places you will edit when customizing Stardux.

| File / Folder | Purpose |
| --- | --- |
| `navs/` | Global navigation and documentation sidebar configuration |
| `pages/` | Static text and UI content for individual pages |
| `form.ts` | Contact form configuration, labels, messages, and endpoint |
| `schema.ts` | JSON-LD structured data helpers |
| `seo.ts` | Default SEO, social metadata, verification, and analytics settings |
| `site.ts` | Core site configuration such as name, description, URL, language, and pagination |

> [!TIP]
> If you are customizing Stardux for the first time, start with `site.ts`, `seo.ts`, and the files inside `navs/`.

For a more detailed explanation of each configuration file, see [Configuration](/docs/configuration/).

### `content/`

The `content/` directory contains your Markdown and MDX content.

These files are managed through Astro Content Collections and validated using the schemas defined in `content.config.ts`.

| Folder | Purpose |
| --- | --- |
| `blog/` | Blog posts |
| `docs/` | Documentation pages |
| `legal/` | Legal pages such as privacy policies and terms of service |

Content files can use either the `.md` or `.mdx` extension.

For example:

:::filetree
- src/content/
  - blog/
    - getting-started.md
  - docs/
    - getting-started/
      - introduction.md
  - legal/
    - privacy-policy.md
:::

### `layouts/`

Layouts define the shared structure used by different types of pages.

| File | Purpose |
| --- | --- |
| `Layout.astro` | Base layout containing shared document structure and site-level UI |
| `BlogLayout.astro` | Layout used for individual blog posts |
| `DocsLayout.astro` | Layout used for documentation pages |

A layout typically handles the page structure while the content itself is provided by pages or Content Collections.

### `lib/`

The `lib/` directory contains reusable application logic and helper functions.

| File / Folder | Purpose |
| --- | --- |
| `plugins/` | Custom Sätteri plugins and directives |
| `utils.ts` | Shared utility functions |

The `plugins/` directory contains functionality for custom Markdown or MDX features such as:

- Callouts
- Steps
- Tabs
- File trees
- Other custom directives

The `utils.ts` file contains shared helpers for tasks such as date formatting, reading time calculation, and excerpt generation.

### `pages/`

The `pages/` directory defines your site's routes.

Astro uses file-based routing, which means each file or folder inside `src/pages/` corresponds to a URL.

| File / Folder | Route / Purpose |
| --- | --- |
| `blog/` | Blog routes, including the blog index and archive |
| `docs/` | Documentation routes |
| `[slug].astro` | Dynamic route for pages from the `legal` collection |
| `about.astro` | `/about` |
| `contact.astro` | `/contact` |
| `index.astro` | `/` |
| `404.astro` | Custom 404 page |
| `manifest.json.ts` | Web app manifest |
| `robots.txt.ts` | `robots.txt` |
| `rss.xml.ts` | RSS feed |
| `sitemap.xml.ts` | Sitemap |

For example:

```text
src/pages/about.astro
```

creates:

```text
/about
```

Dynamic routes are used when multiple pages share the same structure.

For example, `[slug].astro` can render legal pages such as:

```text
/privacy-policy
/terms
```

### `styles/`

The `styles/` directory contains the site's global and content-specific styles.

| File / Folder | Purpose |
| --- | --- |
| `prose/` | Styles for Markdown and MDX content |
| `global.css` | Global styles, theme variables, and Tailwind imports |
| `utils.css` | Additional utility classes |

The `prose/` directory contains styles for content-specific components such as:

- Typography
- Tables
- Callouts
- File trees
- Tabs
- Details
- Links
- Footnotes

## Key Files

Some files play an important role in connecting different parts of the project.

### `consts.ts`

The `consts.ts` file acts as a central entry point for shared constants and configuration modules.

Instead of importing individual configuration files throughout the project, they can be re-exported from a single location.

```ts
export * from "./config/site";
export * from "./config/seo";
export * from "./config/schema";
export * from "./config/pages";
export * from "./config/navs";
```

This allows other files to use a simpler import:

```ts
import { SITE, SEO } from "@consts";
```

instead of:

```ts
import { SITE } from "../config/site";
import { SEO } from "../config/seo";
```

> [!NOTE]
> The available exports depend on how the files inside `config/` are organized. Make sure the paths in `consts.ts` match your actual project structure.

### `content.config.ts`

The `content.config.ts` file defines the Astro Content Collections used by Stardux.

It also defines the frontmatter schema for each content type.

Stardux includes three main collections:

- **`blog`** — Blog posts and articles.
- **`docs`** — Documentation pages.
- **`legal`** — Legal pages such as privacy policies and terms of service.

The frontmatter for each collection is validated using Zod.

For example, the `blog` collection can include fields such as:

```text
title
description
pubDate
lastUpdated
cover
author
category
tags
draft
seo
```

The `docs` collection uses a similar schema, with additional fields for organizing the documentation:

```text
category
order
```

The `category` value is connected to the documentation sidebar configuration, while `order` controls the order of pages within a category.

The `legal` collection uses a simplified schema because legal pages generally do not require fields such as `author` or `category`.

> [!IMPORTANT]
> If you add a new frontmatter field to your content, update the corresponding schema in `content.config.ts` first. Otherwise, the new field may not be recognized or validated correctly.

## Next Steps

Now that you understand the project structure, continue with [Configuration](/docs/configuration/) to customize your site's identity, navigation, SEO, forms, and other settings.