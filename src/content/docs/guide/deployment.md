---
slug: "deployment"
title: "Deployment"
description: "Deploy your Unloyd site to production — Cloudflare Pages, Vercel, Netlify, and more."
category: "Guide"
order: 4
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Deployment — Unloyd Guide"
  description: "Deploy your Unloyd site to production — Cloudflare Pages, Vercel, Netlify, and more."
  noIndex: false
---

Unloyd is a static site, which means it can be deployed to virtually any hosting platform. This guide covers the most popular options.

---

## Build Your Site

Before deploying, build your site:

```bash
npm run build
```

This generates the `dist/` folder with all static files ready for deployment.

## Cloudflare Pages

[Cloudflare](https://pages.cloudflare.com/) Pages is the recommended hosting platform for Unloyd. It offers a generous free tier and fast global CDN.

### Deployment Steps
:::steps
1. Push your code to a GitHub or GitLab repository.
2. Connect to **Cloudflare Pages**:
    - Go to [Cloudflare Dashboard](https://pages.cloudflare.com/)
    - Select **Pages** → **Create a project** → **Connect to Git**
3. Configure build settings:
    | Setting | Value |
    | ---- | ---- |
    | Build command | `npm run build` |
    | Build output directory | `dist` |
    | Environment variables | Add your `.env` variables |
4. **Deploy** — Cloudflare will automatically build and deploy your site.
5. **Set custom domain** (optional) — Go to **Pages** → your project → **Custom domains**.
:::

## Vercel
[Vercel](https://vercel.com/) is another excellent option for deploying Astro sites.

### Deployment Steps
:::steps
1. **Push your code** to a GitHub, GitLab, or Bitbucket repository.

2. Connect to **Vercel**:
    - Go to [Vercel Dashboard](https://vercel.com/)
    - Click **Add New** → **Project**
    - Import your repository

3. **Configure build settings** (Vercel auto-detects Astro):
    | Setting | Value |
    | ---- | ---- |
    | Framework Preset | Astro |
    | Build command | `npm run build` |
    | Output directory | `dist` |
    | Environment variables | Add your `.env` variables |

4. **Deploy** — Vercel will build and deploy your site.

5. **Set custom domain** (optional) — Go to **Settings** → **Domains**.
:::

## Netlify
[Netlify](https://www.netlify.com/) is a popular platform for static sites with a simple workflow.

### Deployment Steps
:::steps
1. **Push your code** to a Git repository.

2. Connect to **Netlify**:
    - Go to [Netlify Dashboard](https://www.netlify.com/)
    - Click **Add new site** → **Import an existing project**
3. Configure build settings:
    | Setting | Value |
    | ---- | ---- |
    | Build command | `npm run build` |
    | Publish directory | `dist` |
    | Environment variables | Add your `.env` variables |

4. **Deploy** — Netlify will build and deploy your site.

5. **Set custom domain** (optional) — Go to **Site settings** → **Domain management**.
:::

## Manual Deployment (Any Static Host)
You can upload the` dist/` folder to any static hosting service.

:::steps
1. Build your site:

    ```bash
    npm run build
    ```
    
2. Upload the `dist/` folder to your hosting provider using:
    - FTP / SFTP
    - File manager (cPanel, etc.)
    - CLI tools (AWS CLI, etc.)
:::

### Supported Hosting Services
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any shared hosting with static file support
- GitHub Pages (see below)

## GitHub Pages
You can deploy Unloyd to [GitHub Pages](https://pages.github.com/) using GitHub Actions.

:::steps
1. Create `.github/workflows/deploy.yml`:
    ```yaml
    name: Deploy to GitHub Pages

    on:
        push:
            branches: [main]
        workflow_dispatch:

    permissions:
        contents: read
        pages: write
        id-token: write

    jobs:
        build:
            runs-on: ubuntu-latest
            steps:
            - name: Checkout
                uses: actions/checkout@v4
            - name: Install and Build
                uses: withastro/action@v3
            - name: Upload artifact
                uses: actions/upload-pages-artifact@v3
                with:
                path: dist

    deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
        steps:
        - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```
2. **Set base path** (if deploying to a subdirectory):
    ```js
    // astro.config.mjs
    export default defineConfig({
        site: "https://your-username.github.io",
        base: "/your-repo-name/",
    // ...
    });
    ```
3. **Enable Pages** in repository settings → Pages → Source → GitHub Actions.
:::

## Environment Variables in Production
Make sure to set your environment variables on your hosting platform:

| Platform | Where to Set |
| ---- | ---- |
| Cloudflare Pages | Settings → Environment variables |
| Vercel | Project Settings → Environment Variables |
| Netlify | Site Settings → Environment variables |

> [!IMPORTANT]
> All `PUBLIC_*` variables must be set in the hosting platform's environment.

## Post-Deployment Checklist
After deploying, verify:

[X] Homepage loads correctly
[X] Documentation pages are accessible
[X] Blog posts render properly
[X] Search works (Pagefind runs during build)
[X] Dark mode toggle works
[X] Contact form works (if configured)
[X] RSS feed is accessible
[X] Sitemap is accessible
[X] Custom domain (if set) works

## Troubleshooting
:::accordion[Build Fails]
- Check Node.js version (v22+ required)
- Run `npm install` locally to verify dependencies
- Check for syntax errors in your code
:::

:::accordion[Assets Not Loading]
- Verify `site` and `base` settings in `astro.config.mjs`
- Check asset paths in Markdown files
:::

:::accordion[Search Not Working]
- Pagefind runs automatically during build
- Check `dist/` folder for `pagefind` files
- Verify search component is included in layout
:::

:::accordion[Form Not Working]
- Verify `PUBLIC_FORM_ENDPOINT` environment variable
- Check that Formspree is configured properly
:::

## Next Steps

:::card[Components]{href="/docs/components/" icon='learn'}
Explore all custom directives
:::

:::card[Customization]{href="/docs/customization/" icon='learn'}
Advanced customization techniques
:::
