// src/pages/sitemap.xml.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { 
  SITE, 
  ROUTES 
} from '@/consts';

import { 
  getSlug, 
  canonicalUrl 
} from '@/lib/utils';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const blog = await getCollection('blog', ({ data }) => !data.draft && !data.seo?.noIndex);
  const docs = await getCollection('docs', ({ data }) => !data.draft && !data.seo?.noIndex);
  const legal = await getCollection('legal', ({ data }) => !data.draft && !data.seo?.noIndex);

  const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] = [];

  // ===== Static Routes =====
  const staticRoutes = [
    { path: ROUTES.home, priority: 1.0, changefreq: 'daily' },
    { path: ROUTES.docs, priority: 0.9, changefreq: 'weekly' },
    { path: ROUTES.blog, priority: 0.8, changefreq: 'weekly' },
    { path: ROUTES.archive, priority: 0.5, changefreq: 'monthly' },
  ];

  if (ROUTES.about) {
    staticRoutes.push({ path: ROUTES.about, priority: 0.7, changefreq: 'monthly' });
  }

  staticRoutes.forEach(({ path, priority, changefreq }) => {
    const loc = canonicalUrl(path);
    urls.push({ loc, priority, changefreq });
  });

  // ===== Blog Posts =====
  blog.forEach((post) => {
    const slug = getSlug(post);
    const date = post.data.lastUpdated || post.data.pubDate;
    urls.push({
      loc: canonicalUrl(`${ROUTES.blog}/${slug}`),
      lastmod: date ? new Date(date).toISOString() : undefined,
      changefreq: 'weekly',
      priority: 0.6,
    });
  });

  // ===== Docs Detail =====
  docs.forEach((doc) => {
    const slug = getSlug(doc);
    const date = doc.data.lastUpdated || doc.data.pubDate;
    urls.push({
      loc: canonicalUrl(`${ROUTES.docs}/${slug}`),
      lastmod: date ? new Date(date).toISOString() : undefined,
      changefreq: 'weekly',
      priority: 0.7,
    });
  });

  // ===== Legal Pages =====
  legal.forEach((item) => {
    const slug = getSlug(item);
    const date = item.data.lastUpdated || item.data.pubDate;
    urls.push({
      loc: canonicalUrl(slug),
      lastmod: date ? new Date(date).toISOString() : undefined,
      changefreq: 'yearly',
      priority: 0.2,
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${
      url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''
    }${
      url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''
    }${
      url.priority ? `\n    <priority>${url.priority}</priority>` : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};