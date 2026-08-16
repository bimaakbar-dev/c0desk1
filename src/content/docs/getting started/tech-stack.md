---
slug: "tech-stack"
title: "Tech Stack"
description: "An overview of the technologies powering Stardux."
category: "Getting Started"
order: 2
draft: false
author:
  name: "Stardux Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stardux.web.id"
seo:
  title: "Tech Stack"
  description: "An overview of the technologies powering Stardux."
  noIndex: false
lastUpdated: 2026-08-10T19:35:00Z
---

Stardux is built with a modern, lightweight technology stack focused on performance, flexibility, and a simple development experience.

## Overview

| Technology | Purpose |
| --- | --- |
| [Astro 7.2](https://astro.build) | Core framework and static site generation |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling and responsive design |
| [Pagefind](https://pagefind.app) | Static full-text search |
| [Cloudflare Pages](https://pages.cloudflare.com) | Deployment and hosting |

## Astro

[Astro](https://astro.build) is the core framework behind Stardux.

It uses an islands architecture, which means JavaScript is only sent to the browser when a component actually needs it. This helps keep the site lightweight while allowing interactive components where necessary.

Astro is also static by default, making it well suited for documentation sites and blogs.

Stardux uses Astro Content Collections to manage and validate Markdown and MDX content.

## Markdown and MDX

Stardux uses Astro's content system for writing documentation, blog posts, and other content.

Custom directives extend standard Markdown with additional content components, including:

- Callouts
- Steps
- Tabs
- File trees
- Accordions
- Cards
- Quotes
- And more

These features make it possible to create richer documentation without manually building the same UI for every page.

## Tailwind CSS

[Tailwind CSS](https://tailwindcss.com) is used for the site's utility-based styling and responsive layout.

Stardux combines Tailwind with its own CSS files to provide reusable styles, theme variables, and content-specific styling.

The main styles are located in:

```text
src/styles/
```

The primary entry point is:

```text
src/styles/global.css
```

Additional content styles, such as typography, tables, callouts, tabs, and other Markdown components, are located in:

```text
src/styles/prose/
```

## Pagefind

[Pagefind](https://pagefind.app) provides full-text search for the site.

The search index is generated during the build process and served as part of the static site. Search runs without requiring a separate search server or external search API.

This makes it particularly useful for documentation sites that want fast search while keeping the project simple to deploy.

## Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) is the recommended platform for deploying Stardux.

It provides features such as:

- Global CDN
- Automatic HTTPS
- Git-based deployments
- Preview deployments

However, Stardux is a static site and is not tied to a specific hosting provider.

You can also deploy it to other static hosting platforms such as Vercel, Netlify, GitHub Pages, or your own server.

## Why This Stack?

The technologies used by Stardux are selected to keep the project simple while still providing the features needed for a modern documentation site or blog.

- **Astro** handles static site generation and content management.
- **Tailwind CSS** provides flexible styling and responsive layouts.
- **Pagefind** adds fast, static full-text search.
- **Cloudflare Pages** provides a simple deployment workflow and global delivery.

Together, they provide a lightweight foundation that you can customize and extend as your project grows.