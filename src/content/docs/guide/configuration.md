---
slug: 'configuration'
title: "Configuration"
description: "Learn how to customize every aspect of Unloyd — from site name to SEO and navigation."
category: "Guide"
order: 3
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Configuration — Unloyd Guide"
  description: "Learn how to customize every aspect of Unloyd — from site name to SEO and navigation."
  noIndex: false
---

All site configuration in Unloyd is centralized in the `src/config/` directory. This guide explains every config file and how to customize it.

---

## Overview of Config Files

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
:::

## `site.ts` — Site Settings

This is the most important config file. It defines your site's identity, navigation, and footer.

```ts
//src/config/site.ts

//...

export const SITE = {
  name: "My Site",
  tagline: "My Site Tagline",
  description: "My site description",
  url: "https://example.com",
  email: "hyour@email.com",
  locale: "en-US",
  lang: "en",
  dir: "ltr",
  themeColor: "#0a0a0a",
  bgColor: "#000000",
  foundingYear: 2026,
  logo: Logo.src,
  ogImage: Og.src,
} as const;

//...
```

### What You Can Change

| Field | Description |
| ---- | ---- |
| `name` |Site name (appears in header, footer, and title) |
| `tagline` | Short tagline used in hero sections |
| `description` | Site description (used for SEO) |
| `url` | Your site's URL (required for SEO and sitemap) |
| `email` | Contact email (used in contact page and schema) |
| `locale` | Locale for date formatting (en-US, id-ID, etc.) |
| `lang` | Language code for HTML lang attribute |
| `themeColor` | Theme color for browser UI |
| `logo` | Path to your logo image |
| `ogImage` | Default Open Graph image |

## Navigation
```ts
//src/config/site.ts

//...

export const NAV = {
  navBar: [
    { label: "Documentation", href: ROUTES.docs, icon: "logo" },
    { label: "Blog", href: ROUTES.blog, icon: "logo" },
    { label: "Archive", href: ROUTES.archive, icon: "logo" },
  ],
  footerBar: [
    {
      title: "Product",
      items: [
        { label: "Docs", href: ROUTES.docs },
        { label: "Blog", href: ROUTES.blog },
      ],
    },
    // ...
  ],
  Social: [
    { label: "GitHub", href: "https://github.com/username", icon: "github" },
  ],
} as const;

//...
```

Section | Description |
| ---- | ---- |
| `navBar` | Main navigation links in the header |
| `footerBar` | Footer navigation groups |
| `Social` | Social media links |

> [!TIP] 
> Add or remove navigation items by editing these arrays. Use `isExternal: true` for external links.


## `seo.ts` — SEO Settings

Controls meta tags, Open Graph, Twitter Cards, and verification codes.

```ts
//src/config/seo.ts

//...

export const SEO = {
  titleDefault: SITE.name,
  titleTemplate: `%s | ${SITE.name}`,
  titleMaxLength: 60,
  description: SITE.description,
  descriptionMaxLength: 160,
  canonical: SITE.url,
  ogImage: SITE.ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: "summary_large_image",
  twitterSite: "@yourname",
  twitterCreator: "@yourname",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "",
    bing: "",
    yandex: "",
  },
  analytics: {
    google: "",
    yandex: "",
  },
} as const;

//...
```

### What You Can Change
| Field | Description |
| ---- | ---- |
| `titleTemplate` | Title format (`%s` is replaced with page title) |
| `ogImage` | Default image for social sharing (1200×630) |
| `twitterCard` | Twitter card type (`summary`, `summary_large_image`) |
| `verification` | Search engine verification codes |
| `analytics` | Google Analytics and Yandex Metrica IDs |

> [!NOTE]
> Use environment variables for verification codes and analytics IDs. They are sensitive data.

## `docsNavigation.ts` — Sidebar Order

Controls the order of categories and pages in the documentation sidebar.

```ts
//src/config/docsNavigation.ts

//..

export const SIDEBAR_CONFIG = [
  { category: "Getting Started", label: "Getting Started" },
  { category: "Guide", label: "Guide" },
  { category: "Components", label: "Components" },
  { category: "API", label: "API Reference" },
] as const;

//...
```

| Field | Description |
| ---- | ---- |
| `category` | Must match the category field in frontmatter of docs pages |
| `label` | Display name in the sidebar |

> [!TIP]
> Reorder categories by changing the order of items in this array.

## `pages/*.ts `— Page Content
Each static page has its own config file.

### `blog.ts`
...

### `home.ts`
...

### `about.ts`
```ts
//...
export const ABOUT_PAGE = {
  title: "About",
  description: "Learn more about this project and the team behind it.",
  hero: {
    title: "A Modern Documentation Template",
    description: "This is a customizable documentation template...",
    primaryAction: { label: "Get Started", href: ROUTES.docs },
    secondaryAction: { label: "View on GitHub", href: "https://github.com" },
  },
  features: [
    { icon: "sparkle", title: "Modern Stack", description: "..." },
    // ...
  ],
  team: {
    title: "The Team",
    description: "This project is maintained by...",
    members: [
      { name: "Your Name", role: "Developer", avatar: "...", social: "..." },
    ],
  },
  cta: {
    title: "Ready to Get Started?",
    primaryAction: { label: "View Docs", href: ROUTES.docs },
    secondaryAction: { label: "Contact Us", href: ROUTES.contact },
  },
} as const;
//...
```

### `contact.ts`
```ts
//...
export const CONTACT_PAGE = {
  title: "Contact",
  description: "Have a question? Fill out the form below.",
  hero: {
    title: "Get in Touch",
    description: "We'd love to hear from you!",
  },
} as const;
//...
```

### `archive.ts`
```ts
//...
export const ARCHIVE_PAGE = {
  title: "Archive",
  description: "Complete archive of all blog articles.",
  heatmap: {
    label: "Activity Log",
    emptyLabel: "No articles yet",
    emptyDescription: "The archive will be filled once the first article is published.",
    legendLow: "Low",
    legendHigh: "High",
    jumpLabel: "Jump to Year",
  },
  months: {
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  weekdays: {
    short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  colors: {
    level0: "bg-(--bg-muted) ring-1 ring-(--border-subtle) ring-inset",
    level1: "bg-(--accent)/30 ring-1 ring-(--accent)/20 ring-inset",
    level2: "bg-(--accent)/70 ring-1 ring-(--accent)/50 ring-inset",
    level3: "bg-(--accent)",
  },
} as const;
//...
```

### `not-found.ts`
```ts
//...
export const NOT_FOUND_PAGE = {
  title: "Page Not Found",
  description: "Sorry, the page you are looking for does not exist.",
  button: { label: "Back to Home" },
} as const;
//...
```

## `form.ts` — Form Configuration
Controls the contact form labels, placeholders, and messages.

```ts
//...
export const FORM_CONFIG = {
  endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || "",
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
    description: "Thank you for reaching out. We'll get back to you within 24 hours.",
  },
  error: {
    title: "Something went wrong",
    description: "Please check your connection and try again.",
  },
  button: {
    text: "Send Message",
    loading: "Sending...",
  },
} as const;
//...
```

## Environment Variable
Set your Formspree endpoint in `.env`:

```env
#...
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
#...
```

## `schema.ts` — Structured Data
Helpers for JSON-LD structured data [Schema.org](https://schema.org/).

| Function | Purpose |
| ---- | ---- |
| `schemaWebPage` | WebPage schema |
| `schemaArticle` | Article schema for blog posts |
| `schemaBreadcrumb` | Breadcrumb schema |
| `schemaFAQ` | FAQ schema |
| `schemaOrganization` | Organization schema |
| `schemaSoftwareApplication` | Software application schema |

## Environment Variables
Create a `.env` file in the root directory:

```env
# ...
# Required
PUBLIC_SITE_URL=https://your-site.com
PUBLIC_SITE_NAME=Your Site Name
PUBLIC_SITE_DESCRIPTION=Your site description.

# Optional — Form endpoint
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint

# Optional — Analytics
PUBLIC_ANALYTICS_GOOGLE=G-XXXXXXXXXX
PUBLIC_ANALYTICS_YANDEX=XXXXXXXXX

# Optional — Verification
PUBLIC_VERIFICATION_GOOGLE=your-google-verification-code
PUBLIC_VERIFICATION_BING=your-bing-verification-code
PUBLIC_VERIFICATION_YANDEX=your-yandex-verification-code
# ...
```

## Next Steps
:::card[Deployment]{href="/docs/deployment/" icon='learn'}
Deploy your site to production
:::

:::card[Components]{href="/docs/components/" icon='learn'}
Explore all custom directives
:::


