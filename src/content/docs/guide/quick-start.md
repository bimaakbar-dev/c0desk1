---
slug: "quick-start"
title: "Quick Start"
description: "Get Stardux up and running on your local machine in minutes."
category: "Guide"
order: 1
draft: false
author:
  name: "Stardux Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@unloyd.web.id"
seo:
  title: "Quick Start"
  description: "Get Stardux up and running on your local machine in minutes."
  noIndex: false
---

This guide will help you set up Stardux on your local machine and start customizing it.

## Prerequisites

Before getting started, make sure you have the following installed:

- **Node.js** v22 or later
- **npm** or **pnpm**
- **Git**
- A code editor, such as Visual Studio Code

## Installation

:::steps
1. ### Fork the Repository

   Fork the Stardux repository to your own GitHub account.

   This allows you to create and manage your own version of the project.

   :button[GitHub]{url="https://github.com" icon="github"}

2. ### Clone Your Fork

   Clone your fork to your local machine:

   ```bash
   git clone https://github.com/your-username/stardux.git
   cd unloyd
   ```

   Replace `your-username` with your GitHub username if necessary.

3. ### Install Dependencies

   Install the project dependencies using your preferred package manager.

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

4. ### Set Up Environment Variables

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and configure the values you need.

   ```env
   # Site
   PUBLIC_SITE_URL=http://localhost:4321

   # Contact Form
   PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
   ```

   > [!TIP]
   > Your `.env` file should not be committed to version control. It is already included in `.gitignore`.

   See [Configuration](/docs/configuration#environment-variables) for a complete list of supported environment variables.

5. ### Start the Development Server

   Start the local development server:

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

   Once the server is running, open:

   ```text
   http://localhost:4321
   ```
:::

## Available Scripts

Stardux includes several npm scripts for development and production.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production site into the `dist/` directory |
| `npm run preview` | Preview the production build locally |

If you use pnpm, replace `npm run` with `pnpm`.

For example:

```bash
pnpm build
```

## Next Steps

Your local Stardux installation is now ready.

Continue with [Project Structure](/docs/project-structure/) to understand how the project is organized, or go directly to [Configuration](/docs/configuration/) to start customizing your site.