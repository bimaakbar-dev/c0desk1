---
slug: 'overview'
title: 'Getting Started'
description: 'Learn how to set up and use this documentation template.'
lastUpdated: 2026-08-10T18:25:00Z
order: 1
category: "Getting Started"
draft: false
author:
  name: "Your Name"
  role: "Developer"
  url: "https://github.com/your-username"
  email: "hello@example.com"
seo:
  title: "Getting Started"
  description: "Learn how to set up and use this documentation template."
  noIndex: false
---

Welcome to the documentation template! This guide will help you get started with setting up and customizing your documentation site.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/bimaakbar-dev/unloyd.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

:::filetree
- public/
  - favicons/           # Favicons
- src/
  - assets/
    - fonts/
      - fontGeist.woff2 # Custom fonts (if any)
    - images/
      - logo.svg        # Site logo — replace with your own branding
      - og-image.svg    # Default Open Graph image for social sharing (1200×630)
      - cover.svg       # Placeholder cover image for articles (1200×630)
      - author.jpg      # Placeholder avatar for authors (96×96)
    - icons/            # Icon pack (if any)
  - content/
    - blog/          # Blog articles
    - docs/          # Documentation (you are here)
    - legal/         # Legal pages
  - components/      # Astro components
  - config/          # Configuration files
  - layouts/         # Page layouts
  - lib/             # Utilities and plugins
  - pages/           # Static pages
  - styles/          # Global styles
  - consts.ts        # Central export for all configuration (site, seo, schema, etc.) 
  - content.config.ts # Content collection schema and loader configuration
- astro.config.mjs # Astro framework configuration (build, integrations, markdown, etc.)
- package-lock.json # Lockfile for exact dependency versions (auto-generated)
- package.json # Project metadata, scripts, and dependencies
- tsconfig.json # TypeScript configuration for the project
:::

## Next Steps

- Explore the **Components** section to see all available custom directives.
- Check out the **Blog** for example articles.
- Customize the configuration in `src/config/`.

Happy building! 🚀
