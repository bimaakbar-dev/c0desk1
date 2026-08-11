---
slug: "deployment"
title: "Deployment"
description: "Deploy your Unloyd site to various hosting platforms."
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
  description: "Deploy your Unloyd site to various hosting platforms."
  noIndex: false
---

Unloyd is a static site — you can deploy it to almost any hosting platform. This guide covers the most common options.

---

## Build Your Site

Run this before deploying:

```bash
npm run build
```

The output lives in the `dist/` folder — that's what gets uploaded to your host.

## Hosting Platforms

### Cloudflare Pages *(Recommended)*

:::steps
1. Push your code to GitHub or GitLab.
2. Open [Cloudflare Dashboard](https://pages.cloudflare.com/) → **Pages** → **Create a project** → **Connect to Git**.
3. Set your build settings:
    | Setting | Value |
    | --- | --- |
    | Build command | `npm run build` |
    | Output directory | `dist` |
4. Click **Deploy**.
5. *(Optional)* Add a custom domain under **Pages** → your project → **Custom domains**.
:::

### Vercel

:::steps
1. Push your code to GitHub, GitLab, or Bitbucket.
2. Open [Vercel Dashboard](https://vercel.com/) → **Add New** → **Project** → import your repository.
3. Vercel auto-detects Astro — confirm the output directory is `dist`.
4. Click **Deploy**.
5. *(Optional)* Add a custom domain under **Settings** → **Domains**.
:::

### Netlify

:::steps
1. Push your code to a Git repository.
2. Open [Netlify Dashboard](https://www.netlify.com/) → **Add new site** → **Import an existing project**.
3. Set your build settings:
    | Setting | Value |
    | --- | --- |
    | Build command | `npm run build` |
    | Publish directory | `dist` |
4. Click **Deploy**.
5. *(Optional)* Add a custom domain under **Site settings** → **Domain management**.
:::

### GitHub Pages

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
          - uses: actions/checkout@v4
          - uses: withastro/action@v3
          - uses: actions/upload-pages-artifact@v3
            with:
              path: dist

      deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - id: deployment
            uses: actions/deploy-pages@v4
    ```
2. If deploying to a subdirectory, set `base` in `astro.config.mjs`:
    ```js
    export default defineConfig({
      site: "https://your-username.github.io",
      base: "/your-repo-name/",
    });
    ```
3. Enable Pages in **Settings** → **Pages** → **Source** → **GitHub Actions**.
:::

### Other Hosts

Upload the `dist/` folder to any static host via FTP, SFTP, or a CLI tool. Compatible platforms include AWS S3 + CloudFront, Google Cloud Storage, Azure Static Web Apps, and standard shared hosting.

## Environment Variables

Set your environment variables on the hosting platform — not just in your local `.env` file.

| Platform | Where to set |
| --- | --- |
| Cloudflare Pages | Settings → Environment variables |
| Vercel | Project Settings → Environment Variables |
| Netlify | Site Settings → Environment variables |

> [!IMPORTANT]
> All variables prefixed with `PUBLIC_` must be set on the hosting platform.

## Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] Documentation pages are accessible
- [ ] Search works
- [ ] Dark mode toggle works
- [ ] RSS feed and sitemap are accessible
- [ ] Custom domain is active *(if configured)*
- [ ] Contact form works *(if configured)*


## Troubleshooting

If something goes wrong, refer to the official documentation for your platform:

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

For Astro-specific issues, see the [Astro Docs](https://docs.astro.build/).