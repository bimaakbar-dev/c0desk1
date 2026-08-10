---
slug: 'tech-stack'
title: "Tech Stack"
description: "A detailed overview of the technologies powering the Unloyd template."
category: "Getting Started"
order: 2
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Tech Stack"
  description: "A detailed overview of the technologies powering the Unloyd template."
  noIndex: false
lastUpdated: 2026-08-10T19:35:00Z
---

Unloyd is built with a modern, production‑ready stack. Here’s a closer look at each technology and why it was chosen.

## Astro 7.2

[Astro](https://astro.build) is the core framework powering Unloyd.

- **Islands Architecture** — Only ship JavaScript where needed
- **Static by Default** — Build fast, static sites
- **Content Collections** — Type-safe content management
- **Great DX** — Hot reload, familiar syntax

Astro makes Unloyd fast, flexible, and a joy to develop with.

## TailwindCSS 4

[TailwindCSS](https://tailwindcss.com) provides the styling foundation.

- **Utility-First** — Rapidly build custom designs without leaving HTML
- **Dark Mode** — Built-in dark mode with system preference detection
- **Customizable** — Easily extend or override default styles
- **Responsive** — Mobile-first by default

All styles are defined in `src/styles/global.css` and are fully customizable.

## Sätteri

[Sätteri](https://satteri.bruits.org) is the Markdown parser that powers Unloyd's content system.

- **Custom Directives** — Extend Markdown with callout, steps, tabs, and more
- **Fast** — Built in Rust, parsing is lightning-fast
- **Flexible** — Supports both `.md` and `.mdx` files
- **Plugin System** — Extend functionality with custom plugins

Sätteri is what makes Unloyd's rich content possible.

## Pagefind

[Pagefind](https://pagefind.app) provides static search for Unloyd.

- **No External API** — Search runs entirely in the browser
- **Fast** — Indexes content during build
- **Accurate** — Full-text search with ranking
- **Zero Configuration** — Works out of the box

Search is automatically included in the header and documentation sidebar.

## Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) is the recommended hosting platform for Unloyd.

- **Free Tier** — Generous free plan for static sites
- **Global CDN** — Fast loading anywhere in the world
- **Git Integration** — Auto-deploy on push
- **SSL Included** — Automatic HTTPS

Unloyd works with any static host like Vercel, Netlify, or your own server.

## Why This Stack?

| Choice | Reason |
|--------|--------|
| **Astro** | Islands architecture means fast sites with minimal JavaScript |
| **TailwindCSS** | Speeds up development without sacrificing design quality |
| **Sätteri** | Enables rich Markdown with custom directives |
| **Pagefind** | Search without external services or complexity |

Happy building! 🚀