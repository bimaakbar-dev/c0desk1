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
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Quick Start"
  description: "Get Stardux up and running on your local machine in minutes."
  noIndex: false
---

This guide will help you set up Stardux locally so you can start customizing it right away.

## Prerequisites

- **Node.js** v22 or higher — [Download](https://nodejs.org)
- **npm** or **pnpm**
- Git
- A code editor (VS Code recommended)

## Installation

:::steps
1. ### Fork the Repository

   Fork the repository :button[GitHub]{url="https://github.com" icon="github"} to your own GitHub account.

2. ### Clone Your Fork
   ```bash
   git clone https://github.com/your-username/unloyd.git
   cd unloyd
   ```

3. ### Install Dependencies

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

   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in your values:

   ```env
   PUBLIC_SITE_URL=http://localhost:4321
   PUBLIC_SITE_NAME=My Site
   PUBLIC_SITE_DESCRIPTION=My site description.
   PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
   ```

   > [!TIP]
   > Never commit your `.env` file to version control. It is already ignored by `.gitignore`.

5. ### Start the Development Server

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

   Open `http://localhost:4321` in your browser.
:::

## Available Scripts

| Command | Description |
| --- | --- |
| `dev` | Start the development server |
| `build` | Build the static site into `dist/` |
| `preview` | Preview the built site locally |