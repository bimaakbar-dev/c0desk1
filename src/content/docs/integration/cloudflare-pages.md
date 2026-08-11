---
slug: 'cloudflare-pages'
title: "Cloudflare Pages"
description: "Deploy and host Unloyd on Cloudflare Pages — fast, global, and free."
category: "Integration"
order: 4
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Cloudflare Pages"
  description: "Deploy and host Unloyd on Cloudflare Pages — fast, global, and free."
  noIndex: false
---

**Cloudflare Pages** is the recommended hosting platform for Unloyd. It offers a generous free tier, global CDN, and seamless Git integration.

This guide walks you through deploying Unloyd to Cloudflare Pages.

---

## Why Cloudflare Pages?

| Feature | Benefit |
|---------|---------|
| **Global CDN** | Your site is served from 300+ locations worldwide |
| **Free Tier** | Unlimited sites, unlimited requests |
| **Git Integration** | Auto-deploy on every push |
| **SSL Included** | Automatic HTTPS certificates |
| **Preview Deployments** | Test changes before going live |
| **Custom Domains** | Use your own domain with one click |

---

## Prerequisites

- A [Cloudflare](https://cloudflare.com) account
- Your Unloyd code pushed to a Git repository (GitHub or GitLab)

---

:::steps
1.	### Push to Git

	Make sure your code is in a Git repository:

	```bash
	git init
	git add .
	git commit -m "Initial commit"
	git remote add origin https://github.com/your-username/unloyd.git
	git push -u origin main
	```
2.	### Connect to Cloudflare Pages

	- Go to the Cloudflare Dashboard
	- Select Pages from the left sidebar
	- Click Create a project → Connect to Git
	- Authorize Cloudflare to access your repository
	- Select your Unloyd repository

3.	### Configure Build Settings

	Set the following build settings:

	| Setting | Value |
	| ---- | ---- |
	| Build command | `npm run build` |
	| Build output directory | `dist` |
	| Node.js version | `22` (or latest LTS) |

	#### Environment Variables

	Add these environment variables in the Cloudflare dashboard:

	| Variable | Value |
	| ---- | ---- |
	| `PUBLIC_SITE_URL` | Your production URL |
	| `PUBLIC_SITE_NAME` | Your site name |
	| `PUBLIC_SITE_DESCRIPTION` | Your site description |
	| `PUBLIC_FORM_ENDPOINT` | Formspree endpoint (if using) |
	| `PUBLIC_ANALYTICS_GOOGLE` | Google Analytics ID (if using) |
	| `PUBLIC_ANALYTICS_YANDEX` | Yandex Metrica ID (if using) |
	
4.	### Deploy
	Click Save and Deploy. Cloudflare will:

	- Clone your repository
	- Install dependencies
	- Build your site
	- Deploy it to the global CDN

	The first deployment may take a few minutes. Subsequent deployments are faster.
	
5.	### Set Up a Custom Domain

	- In your Pages project, go to Custom domains
	- Click Set up a custom domain
	- Enter your domain (e.g., unloyd.web.id)
	- Follow the DNS instructions

	Cloudflare will automatically provision an SSL certificate for your domain.
:::

## Preview Deployments

Every pull request creates a preview deployment. This is useful for testing changes before merging.

| Deployment Type | URL Format |
| ---- | ---- |
| Production | `your-site.pages.dev` (or custom domain) |
| Preview | `branch-name.your-site.pages.dev` |

## Managing Environment Variables

Environment variables can be managed in the Cloudflare dashboard:

1. Go to your **Pages project**
2. Click **Settings** → **Environment variables**
3. Add, edit, or remove variables

## Production vs Preview

You can set different variables for production and preview environments:

- Production: Use real analytics IDs
- Preview: Use test values or leave empty

## Build Cache

Cloudflare Pages caches dependencies between builds. To clear the cache:

1. Go to your **Pages project**
2. Click **Settings** → **Builds & deployments**
3. Click **Clear build cache**

## Troubleshooting

:::accordion[Build Fails]
- Check the build logs for error messages
- Verify Node.js version is set to 22
- Make sure all dependencies are in package.json
:::

:::accordion[Assets Not Loading]
- Check that `PUBLIC_SITE_URL` is set correctly
- Verify that site and base in `astro.config.mjs` are correct
:::

:::accordion[Environment Variables Not Working]
- Variables must be prefixed with `PUBLIC_` to be available in the browser
- Variables set in the dashboard override `.env` file values
:::

## Next Steps

:::card[Custom Domain]{href="/docs/custom-domain" icon='learn'}
Set up a custom domain for your site
:::