---
slug: 'configuration'
title: "Configuration"
description: "Learn how to customize Unloyd — from site identity to navigation and SEO."
category: "Guide"
order: 3
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Configuration"
  description: "Learn how to customize Unloyd — from site identity to navigation and SEO."
  noIndex: false
---

All configuration lives in `src/config/`. Edit the files there to customize your site without touching any component code.

:::filetree
- src/config/
  - pages/
    - blog.ts
    - docs.ts
    - home.ts
    - about.ts
    - archive.ts
    - contact.ts
    - form.ts
    - not-found.ts
  - docsNavigation.ts
  - schema.ts
  - seo.ts
  - site.ts
  - nav.ts
:::

---

## `site.ts` — Site Identity

The main config file. Most values are pulled from environment variables with sensible fallbacks.

```ts
export const SITE = {
  name: env.PUBLIC_SITE_NAME || "Unloyd",
  tagline: env.PUBLIC_SITE_TAGLINE || "A modern documentation template",
  description: env.PUBLIC_SITE_DESCRIPTION || "...",
  url: env.PUBLIC_SITE_URL || "https://example.com",
  email: env.PUBLIC_SITE_EMAIL || "hello@unloyd.web.id",
  locale: "id-ID",
  lang: "id",
  logo: Logo.src,
  ogImage: Og.src,
} as const;
```

To override these values, set them in your `.env` file — see [Environment Variables](#environment-variables).

### Navigation

`nav.ts` controls the header, mobile nav, footer, and social links.

```ts
export const NAV = {
  navBar: [
    { label: "Documentation", href: ROUTES.docs, icon: "learn" },
    { label: "Blog", href: ROUTES.blog, icon: "blog" },
  ],
  footerBar: [
    {
      title: "Learn",
      items: [{ label: "Docs", href: ROUTES.docs }],
    },
  ],
  Social: [
    { label: "Twitter", href: "https://twitter.com/username", icon: "twitter" },
  ],
} as const;
```

Add or remove items by editing each array. Use `isExternal: true` for links that open outside your site.

### Routes

All internal paths are defined in `ROUTES`. Update them here if you change your site structure.

### Pagination

```ts
export const PAGINATION = {
  postsPerPage: 9,
  postsPerFeed: 20,
  postsPerSitemap: 1000,
} as const;
```

---

## `seo.ts` — SEO & Analytics

Controls meta tags, Open Graph, Twitter Cards, robots, and analytics IDs. Values are read from environment variables.

```ts
export const SEO = {
  titleTemplate: `%s | ${SITE.name}`,
  twitterCard: "summary_large_image",
  twitterSite: "@yourname",
  robots: { index: true, follow: true },
  verification: {
    google: env.PUBLIC_VERIFICATION_GOOGLE || "",
    bing: env.PUBLIC_VERIFICATION_BING || "",
    yandex: env.PUBLIC_VERIFICATION_YANDEX || "",
  },
  analytics: {
    google: env.PUBLIC_ANALYTICS_GOOGLE || "",
    yandex: env.PUBLIC_ANALYTICS_YANDEX || "",
  },
} as const;
```

> [!NOTE]
> All verification codes and analytics IDs should be set via environment variables, not hardcoded here.

---

## `docsNavigation.ts` — Sidebar Order

Controls which categories appear in the documentation sidebar and in what order.

```ts
export const SIDEBAR_CONFIG = [
  { category: "Getting Started", label: "Getting Started" },
  { category: "Guide", label: "Guide" },
  { category: "Components", label: "Components" },
] as const;
```

The `category` value must match the `category` field in your docs frontmatter. Reorder the array to change the sidebar order. To add a new category, add it to both `SIDEBAR_CATEGORIES` and `SIDEBAR_CONFIG`.

---

## `pages/*.ts` — Page Content

Each file controls the UI text for its respective page — titles, descriptions, button labels, and empty states.

| File | Page |
| --- | --- |
| `home.ts` | Landing page |
| `blog.ts` | Blog listing |
| `about.ts` | About page |
| `archive.ts` | Archive & activity heatmap |
| `contact.ts` | Contact page |
| `form.ts` | Contact form labels and messages |
| `not-found.ts` | 404 page |
| `docs.ts` | Documentation page |

Edit these files to change any static text without touching component code.

---

## `schema.ts` — Structured Data

Provides JSON-LD helpers for [Schema.org](https://schema.org/) structured data. All functions read from `SITE` and `ORG` automatically.

| Function | Schema type | Use for |
| --- | --- | --- |
| `schemaWebSite` | WebSite | Root site schema |
| `schemaOrganization` | Organization | Organization identity |
| `schemaWebPage` | WebPage | Static pages |
| `schemaArticle` | Article | Blog posts |
| `schemaBreadcrumb` | BreadcrumbList | Navigation breadcrumbs |
| `schemaSoftwareApplication` | SoftwareApplication | App or tool pages |
| `schemaFAQ` | FAQPage | FAQ sections |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Site
PUBLIC_SITE_URL=https://your-site.com
PUBLIC_SITE_NAME=Your Site Name
PUBLIC_SITE_TAGLINE=Your tagline
PUBLIC_SITE_DESCRIPTION=Your site description
PUBLIC_SITE_EMAIL=your@email.com

# Contact form
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint

# Verification
PUBLIC_VERIFICATION_GOOGLE=
PUBLIC_VERIFICATION_BING=
PUBLIC_VERIFICATION_YANDEX=

# Ads
PUBLIC_ADS_GOOGLE=
PUBLIC_ADS_YANDEX=
PUBLIC_ADS_MONETAG=

# Analytics
PUBLIC_ANALYTICS_GOOGLE=
PUBLIC_ANALYTICS_YANDEX=
```

> [!IMPORTANT]
> All `PUBLIC_*` variables must also be set on your hosting platform, not just in your local `.env` file.

---

## Next Steps

:::card[Deployment]{href="/docs/deployment/" icon='learn'}
Deploy your site to production
:::