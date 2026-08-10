---
title: "Quick Start"
description: "Get Unloyd up and running on your local machine in minutes."
category: "Guide"
order: 1
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Quick Start"
  description: "Get Unloyd up and running on your local machine in minutes."
  noIndex: false
---

This guide will help you set up Unloyd locally so you can start customizing it right away.

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v22 or higher ([download](https://nodejs.org))
- **npm**, **pnpm**, or **yarn**
- A code editor (VS Code is recommended)
- Git

## Installation

:::steps
1.  ### Fork the Repository

    Start by forking the repository :button[GitHub]{url="https://github.com" icon="github"} to your own GitHub account.

2.  ### Clone Your Fork
    ```bash
    git clone https://github.com/your-username/unloyd.git
    cd unloyd
    ```

3.  ### Install Dependencies

    ::::tabs
    :::tab[npm]
    ```bash
    npm install
    ```
    :::

    :::tab[pnpm]
    ```bash
    pnpm install
    ```
    :::
    ::::

4.  ### Set Up Environment Variables

    ```bash
    cp .env.example .env
    ```

    Open `.env` and fill in your own values:

    ```env
    PUBLIC_SITE_URL=http://localhost:4321
    PUBLIC_SITE_NAME=My Site
    PUBLIC_SITE_DESCRIPTION=My site description.
    PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
    ```

    > [!IMPORTANT]
    > Never commit your `.env` file to version control. It is already ignored by `.gitignore`.

5.  ### Start the Development Server
    ::::tabs
    :::tab[npm]
    ```bash
    npm run dev
    ```
    :::

    :::tab[pnpm]
    ```bash
    pnpm dev
    ```
    :::
    ::::

    Open `http://localhost:4321` in your browser to see the site.
:::

## Available Scripts

| Command | Description |
| ---- | ---- |
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` |	Builds the static site into the `dist/` folder |
| `npm run preview` | Previews the built site locally |

## Your First Edit

Try editing the home page by opening `src/pages/index.astro`. The changes will appear instantly in your browser.

You can also start adding your own content by creating new Markdown files in `src/content/docs/`.

## Folder Structure

:::filetree
- src/
    - content/
        - blog/          # Blog posts
        - docs/          # Documentation
        - legal/         # Legal pages
    - components/        # Astro components
    - config/            # Site configuration
    - layouts/           # Page layouts
    - lib/               # Utilities & Sätteri plugins
    - pages/             # Static pages
    - styles/            # Global styles
:::

## Next Steps

:::card[Project Structure]{href="/docs/project-structure/" icon='learn'}
Understand the folder layout in depth
:::

:::card[Configuration]{href="/docs/configuration/" icon='learn'}
Customize site settings
:::

:::card[Deployment]{href="/docs/deployment/" icon='learn'}
Deploy to production
:::