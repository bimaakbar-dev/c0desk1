// src/pages/llms.txt.ts
import type { APIRoute } from 'astro';
import { SITE, ROUTES } from '@/consts';

export const GET: APIRoute = async () => {
  const baseUrl = SITE.url.replace(/\/$/, '');

  const pages = [
    { name: 'Home', path: ROUTES.home },
    { name: 'Documentation', path: ROUTES.docs },
    { name: 'Blog', path: ROUTES.blog },
    { name: 'Blog Archive', path: ROUTES.archive },
    { name: 'About', path: ROUTES.about },
    { name: 'Contact', path: ROUTES.contact },
    { name: 'RSS Feed', path: ROUTES.rss },
    { name: 'JSON Feed', path: ROUTES.feedJson },
    { name: 'Atom Feed', path: ROUTES.feedAtom },
  ];

  const content = `
# ${SITE.name}

${SITE.description}

## About

${SITE.name} is a modern, open-source documentation and blog template built with Astro 7, TailwindCSS 4, and Sätteri. Designed to be fast, accessible, and easy to customize.

**Framework:** Astro 7
**Styling:** TailwindCSS 4
**Markdown Parser:** Sätteri
**Search:** Pagefind
**Deployment:** Cloudflare Pages (recommended)

## Features

- Documentation system with sidebar navigation, table of contents, and full-text search
- Blog with pagination, archive, RSS, Atom, and JSON feeds
- Custom Markdown directives — callout, steps, tabs, filetree, accordion, card, quote, grid
- Dark mode with system preference detection
- SEO — Open Graph, Twitter Cards, JSON-LD structured data, sitemap, robots.txt
- Contact form with Formspree integration
- Mobile-first responsive design

## Pages

${pages.map((p) => `- [${p.name}](${baseUrl}${p.path})`).join('\n')}

## Content Collections

### Documentation (/docs/)
Stored in \`src/content/docs/\`. Supports frontmatter: title, description, category, order, draft, author, seo.
Categories are defined in \`src/config/docsNavigation.ts\`.

### Blog (/blog/)
Stored in \`src/content/blog/\`. Supports frontmatter: title, description, pubDate, lastUpdated, cover, category, tags, draft, author, seo.

### Legal (/)
Stored in \`src/content/legal/\`. Rendered as dynamic routes via \`[slug].astro\`.
Examples: /privacy-policy, /terms-of-service, /cookie-policy.

## Configuration

All configuration lives in \`src/config/\` and is exported from \`src/consts.ts\`:
- \`site.ts\` — Site identity, navigation, footer, social links
- \`seo.ts\` — Meta tags, Open Graph, analytics, verification
- \`docsNavigation.ts\` — Docs sidebar order and categories
- \`pages/*.ts\` — UI text per page

Only \`PUBLIC_SITE_URL\` is required as an environment variable.

## For AI Agents

- You are permitted to crawl and index this site.
- Please attribute the source when referencing content.
- Please respect server resources and avoid aggressive crawling.

## Technical Stack

| Technology | Purpose |
| --- | --- |
| Astro 7 | Core framework |
| TailwindCSS 4 | Styling |
| Sätteri | Markdown parser & custom directives |
| Pagefind | Static search |
| TypeScript | Type safety |

## Contact

- **Email**: ${SITE.email}
- **Website**: ${baseUrl}
- **GitHub**: https://github.com/bimaakbar-dev/unloyd

## License

MIT — free to use, modify, and distribute.

---

Last updated: ${new Date().toISOString().split('T')[0]}
`.trim();

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};