---
slug: 'configuration'
title: "Configuration"
description: "Learn how to customize Stardux from site identity to navigation and SEO."
category: "Guide"
order: 3
draft: false
author:
  name: "Stardux Team"
  role: "Developer"
  url: "https://github.com/stardux"
  email: "hello@unloyd.web.id"
seo:
  title: "Configuration"
  description: "Learn how to customize Stardux from site identity to navigation and SEO."
  noIndex: false
lastUpdated: 2026-08-16
---

Stardux keeps its configuration in the `src/config/` directory. You can customize your site's identity, navigation, page content, SEO, forms, and more without modifying component code.

:::filetree
- src/config/
  - navs/
    - docsSidebar.ts
    - globalNavs.ts
    - ...
  - pages/
    - 404.ts
    - about.ts
    - archive.ts
    - blog.ts
    - contact.ts
    - docs.ts
    - landing.ts
    - ...
  - form.ts
  - schema.ts
  - seo.ts
  - site.ts
:::

## `site.ts` — Site Identity

The `site.ts` file contains the main configuration for your website, including its name, description, language, colors, and other global settings.

```ts
export const SITE = {
  name: "Stardux",
  tagline: "A modern documentation",
  description: "A clean, modern, and customizable documentation themes built with Astro",
  url: env.PUBLIC_SITE_URL || "https://your-site.com",
  email: "yourname@mail",
  locale: "en-US",
  lang: "en",
  dir: "ltr",
  charset: "utf-8",
  themeColor: "#0a0a0a",
  bgColor: "#000000",
  foundingYear: 2026,
  logo: Logo.src,
  ogImage: Og.src,
  readingTimeLabel: "min read",
} as const;
```

> [!TIP]
> Some values, such as your site URL, can be overridden through environment variables. See [Environment Variables](#environment-variables) for more information.

### Routes

All internal routes are defined in `ROUTES`.

If you change your site's URL structure, update the corresponding route here so the rest of the application can continue using the correct paths.

### Pagination

Pagination settings are also defined in `site.ts`.

```ts
export const PAGINATION = {
  postsPerPage: 9,
  postsPerFeed: 20,
  postsPerSitemap: 1000,
} as const;
```

You can change these values to control:

- `postsPerPage` → Number of posts displayed on each blog page.
- `postsPerFeed` → Number of posts included in your RSS or Atom feed.
- `postsPerSitemap` → Maximum number of posts included in each sitemap.

## `seo.ts` — SEO & Analytics

The `seo.ts` file controls your site's default SEO settings, including meta tags, Open Graph data, Twitter Cards, robots directives, verification codes, and analytics IDs.

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

The values inside verification and analytics are loaded from environment variables.

> [!NOTE]
> Verification codes and analytics IDs should be configured through environment variables instead of being hardcoded in your source files.

## Navigation

Navigation settings are located in the `src/config/navs/` directory.
:::filetree
- src/config/navs/
  - docsSidebar.ts
  - globalNavs.ts
  - ...
:::

### `globalNavs.ts` Global navigation

This file controls the main navigation, footer navigation, and social links.

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

You can add, remove, or reorder navigation items by editing the corresponding arrays.

For links that point to an external website, add `isExternal: true`.

```ts
{
  label: "GitHub",
  href: "https://github.com/username",
  icon: "github",
  isExternal: true,
}
```

### `docsNavigation.ts` — Sidebar Order

This file controls which documentation categories appear in the sidebar and the order in which they are displayed.

```ts
export const SIDEBAR_CONFIG = [
  { category: "Getting Started", label: "Getting Started" },
  { category: "Guide", label: "Guide" },
  { category: "Components", label: "Components" },
] as const;
```

The `category` value must match the `category` field in your docs frontmatter. Reorder the array to change the sidebar order. To add a new category, add it to both `SIDEBAR_CATEGORIES` and `SIDEBAR_CONFIG`.

For example:

```yaml
---
title: "Configuration"
category: "Guide"
---
```
To change the sidebar order, simply reorder the items inside `SIDEBAR_CONFIG`.

To add a new documentation category, add the category to your sidebar configuration and make sure your documentation files use the same `category` value.

## `pages/*.ts` — Page Content

The `src/config/pages/` directory contains configuration files for individual pages.

These files control static content such as page titles, descriptions, button labels, messages, and empty states.

| File | Page |
| --- | --- |
| `404.ts` | 404 page |
| `about.ts` | About page |
| `archive.ts` | Archive & activity heatmap |
| `blog.ts` | Blog listing |
| `contact.ts` | Contact page |
| `docs.ts` | Documentation page |
| `landing.ts` | Landing page |

For example, you can change a page title or button label directly from its configuration file without editing the page component.

## `schema.ts` — Structured Data

The `schema.ts` file provides helper functions for generating JSON-LD structured data.

These helpers automatically use information from `SITE` and `ORG` where applicable.

| Function | Schema type | Use for |
| --- | --- | --- |
| `schemaWebSite` | WebSite | Root site schema |
| `schemaOrganization` | Organization | Organization identity |
| `schemaWebPage` | WebPage | Static pages |
| `schemaArticle` | Article | Blog posts |
| `schemaBreadcrumb` | BreadcrumbList | Navigation breadcrumbs |
| `schemaSoftwareApplication` | SoftwareApplication | App or tool pages |
| `schemaFAQ` | FAQPage | FAQ sections |

In most cases, you do not need to modify these helper functions. They automatically generate structured data based on your site configuration and page content.

## `form.ts` — Contact Form

The `form.ts` file controls the contact form configuration, including the form endpoint, labels, placeholders, button text, and success or error messages.

```ts
export const FORM_CONFIG = {
  endpoint:
    import.meta.env.PUBLIC_FORM_ENDPOINT ||
    "https://formspree.io/f/your-endpoint",

  labels: {
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
  },

  placeholders: {
    name: "John Doe",
    email: "john@example.com",
    subject: "Your subject...",
    message: "Write your message here...",
  },

  success: {
    title: "Message Sent",
    description:
      "Thank you for reaching out. We'll get back to you within 24 hours.",
  },

  error: {
    title: "Something went wrong",
    description:
      "Please check your connection and try again.",
  },

  button: {
    text: "Send Message",
    loading: "Sending...",
  },

  helper: "Markdown is supported.",
} as const;
```

### Form Endpoint

The form endpoint is loaded from the `PUBLIC_FORM_ENDPOINT` environment variable.

```env
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
```

If the environment variable is not configured, Stardux uses the fallback endpoint defined in `form.ts`.

> [!IMPORTANT]
> Replace the default Formspree URL with your own endpoint before deploying your site.

## Environment Variables

Some configuration values are loaded from environment variables.

Create a `.env` file by copying `.env.example`:

```env

# Site
PUBLIC_SITE_URL=https://your-site.com

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

### Which Variables Do You Need?

Not every environment variable is required.

| Variable                | Required                       | Description                      |
| ----------------------- | ------------------------------ | -------------------------------- |
| `PUBLIC_SITE_URL`       | Recommended                    | Your production site URL         |
| `PUBLIC_FORM_ENDPOINT`  | Only if using the contact form | Form submission endpoint         |
| `PUBLIC_VERIFICATION_*` | Optional                       | Search engine verification codes |
| `PUBLIC_ADS_*`          | Optional                       | Advertising IDs                  |
| `PUBLIC_ANALYTICS_*`    | Optional                       | Analytics IDs                    |

Variables starting with `PUBLIC_` are exposed to the client during the Astro build process.

> [!IMPORTANT]
> Environment variables configured in your local `.env` file are only available on your local machine. Before deploying, add the required variables to your hosting platform's environment settings as well.

## Next Steps

After completing your basic configuration, you can continue customizing your site by editing the navigation, page content, theme, and documentation content.