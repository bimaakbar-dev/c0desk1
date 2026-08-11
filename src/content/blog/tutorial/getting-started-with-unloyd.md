---
slug: "getting-started-with-unloyd"
title: "Getting Started with Unloyd"
description: "A quick introduction to Unloyd — what it is, what it includes, and how to get it running locally in minutes."
pubDate: 2026-08-12T01:45:00Z
category: "Tutorial"
tags: ["astro", "documentation", "template"]
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Getting Started with Unloyd"
  description: "A quick introduction to Unloyd — what it is, what it includes, and how to get it running locally in minutes."
  noIndex: false
---

If you're looking for a clean, modern starting point for your documentation site or blog, Unloyd might be exactly what you need. This post walks through what Unloyd is, what's included, and how to get it running locally in a few minutes.

## What Is Unloyd?

Unloyd is an open-source template built on [Astro 7](https://astro.build) — a framework designed for content-heavy sites that need to be fast. It ships with a documentation system, a blog engine, static search, dark mode, SEO support, and a set of custom Markdown components out of the box.

The goal is simple: give you a solid foundation you can clone, customize, and deploy without having to wire everything up yourself.

## What's Included

Out of the box, Unloyd gives you:

- A **documentation system** with a sidebar, table of contents, and full-text search powered by Pagefind
- A **blog** with pagination, an activity archive, RSS feeds, and author profiles
- **Custom directives** for richer Markdown — callouts, steps, tabs, filetrees, accordions, cards, and more
- **Dark mode** with a built-in theme switcher
- **SEO** — Open Graph, Twitter Cards, JSON-LD structured data, sitemap, and robots.txt
- A **contact form** wired up to Formspree

## Getting It Running

Clone the repo, install dependencies, and copy the example environment file:

```bash
git clone https://github.com/bimaakbar-dev/unloyd.git
cd unloyd
npm install
cp .env.example .env
```

Open `.env` and set your site URL:

```env
PUBLIC_SITE_URL=http://localhost:4321
```

Then start the development server:

```bash
npm run dev
```

Open `http://localhost:4321` and you should see the site running.

## Customizing Your Site

Most customization happens in `src/config/site.ts`. Open it and update your site name, description, navigation, and footer links. No need to touch any component files.

```ts
export const SITE = {
  name: "My Site",
  tagline: "My tagline",
  description: "My site description.",
  // ...
};
```

For documentation pages, create `.md` files in `src/content/docs/` with the right frontmatter. The sidebar order is controlled by `src/config/docsNavigation.ts`.

## Deploying

Unloyd is a static site — it works with any static hosting platform. The recommended option is Cloudflare Pages:

:::steps
1. Push your code to GitHub or GitLab.
2. Connect your repo to Cloudflare Pages.
3. Set build command to `npm run build` and output directory to `dist`.
4. Add `PUBLIC_SITE_URL` to your environment variables.
5. Deploy.
:::

That's it. Cloudflare will build and serve your site automatically on every push.

## What's Next?

From here you can:

- Add your own content to `src/content/docs/` and `src/content/blog/`
- Customize the theme in `src/styles/global.css`
- Explore the custom directives in the [Components](/docs/components/) section
- Set up analytics and a contact form via environment variables

Unloyd is meant to get out of your way — the less time you spend on setup, the more time you have for the content that matters.