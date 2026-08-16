---
slug: 'tech-stack'
title: "Tech Stack"
description: "Technologies powering the Stardux themes."
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
  description: "Technologies powering the Stardux themes."
  noIndex: false
lastUpdated: 2026-08-10T19:35:00Z
---

Stardux is built with a modern, production-ready stack.

| Technology | Purpose |
| --- | --- |
| [Astro 7.2](https://astro.build) | Core framework |
| [TailwindCSS 4](https://tailwindcss.com) | Styling |
| [Pagefind](https://pagefind.app) | Static search |
| [Cloudflare Pages](https://pages.cloudflare.com) | Hosting *(recommended)* |


## Astro 7.2

The core framework. Uses an islands architecture — JavaScript is only shipped where needed, keeping the site fast and static by default. Content Collections provide type-safe content management.

Astro ships with [Sätteri](https://satteri.bruits.org) as the default Markdown parser, enabling custom directives like callout, steps, tabs, and filetree out of the box.

## TailwindCSS 4

Utility-first CSS with built-in dark mode and mobile-first responsive design. All styles live in `src/styles/global.css` and are fully customizable.

## Pagefind

Static search that runs entirely in the browser. No external API or configuration needed — the index is generated automatically during build.

## Cloudflare Pages

The recommended hosting platform. Offers a generous free tier, global CDN, automatic HTTPS, and Git-based deployments. Unloyd works with any static host including Vercel, Netlify, or your own server.