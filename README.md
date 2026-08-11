# Unloyd

A modern, open-source template for building fast, content-rich documentation sites and blogs — built with Astro, TailwindCSS, and Sätteri.

## Features

- **Documentation system** — Sidebar, TOC, and Pagefind search
- **Blog engine** — Pagination, archive, RSS, and author profiles
- **Custom directives** — Callout, Steps, Tabs, Filetree, Accordion, Card, Quote, and more
- **Dark mode** — Built-in theme switcher
- **SEO ready** — Open Graph, Twitter Cards, and structured data
- **Contact form** — Formspree integration

## Tech Stack

- [Astro 7](https://astro.build) — Core framework
- [TailwindCSS 4](https://tailwindcss.com) — Styling
- [Sätteri](https://satteri.bruits.org) — Markdown parser & custom directives
- [Pagefind](https://pagefind.app) — Static search
- [Cloudflare Pages](https://pages.cloudflare.com) — Recommended hosting

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/bimaakbar-dev/unloyd.git
cd unloyd

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open `http://localhost:4321` in your browser.

### Environment Variables

```env
PUBLIC_SITE_URL=https://your-site.com
PUBLIC_SITE_NAME=Your Site Name
PUBLIC_SITE_TAGLINE=Your tagline
PUBLIC_SITE_DESCRIPTION=Your site description
PUBLIC_SITE_EMAIL=your@email.com

# Optional
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-endpoint
PUBLIC_ANALYTICS_GOOGLE=G-XXXXXXXXXX
PUBLIC_ANALYTICS_YANDEX=XXXXXXXXX
```

## Project Structure

```
unloyd/
├── src/
│   ├── assets/         # Images, fonts, icons
│   ├── components/     # Astro components
│   ├── config/         # Site configuration
│   ├── content/        # Markdown content
│   ├── layouts/        # Page layouts
│   ├── lib/            # Utilities & Sätteri plugins
│   ├── pages/          # Static pages & routes
│   └── styles/         # Global styles
├── public/             # Static assets
├── astro.config.mjs
└── .env.example
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Deployment

Unloyd is a static site and can be deployed to any static hosting platform.

**Recommended: Cloudflare Pages**

1. Push your code to GitHub or GitLab
2. Connect to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables

For other platforms (Vercel, Netlify, GitHub Pages), see the [Deployment guide](https://your-site.com/docs/deployment/).

## Documentation

Full documentation is available at [your-site.com/docs](https://your-site.com/docs/).

- [Quick Start](https://your-site.com/docs/quick-start/)
- [Configuration](https://your-site.com/docs/configuration/)
- [Project Structure](https://your-site.com/docs/project-structure/)
- [Components](https://your-site.com/docs/components/)
- [Deployment](https://your-site.com/docs/deployment/)

## License

MIT — see [LICENSE](./LICENSE) for details.