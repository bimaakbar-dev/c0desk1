// src/pages/llms-full.txt.ts
import type { APIRoute } from 'astro';
import { SITE, ROUTES } from '@/consts';
import { getCollection, render } from 'astro:content';

export const GET: APIRoute = async () => {
  const baseUrl = SITE.url.replace(/\/$/, '');

  const docs = await getCollection('docs', ({ data }) => !data.draft);
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  const legal = await getCollection('legal', ({ data }) => !data.draft);

  const sortedDocs = docs.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  const sortedBlog = blog.sort((a, b) =>
    new Date(b.data.pubDate ?? 0).getTime() - new Date(a.data.pubDate ?? 0).getTime()
  );
  const sortedLegal = legal.sort((a, b) =>
    new Date(b.data.lastUpdated ?? 0).getTime() - new Date(a.data.lastUpdated ?? 0).getTime()
  );

  const renderContent = async (collection: typeof docs) => {
    const rendered = await Promise.all(
      collection.map(async (entry) => {
        const { remarkPluginFrontmatter } = await render(entry);
        const slug = entry.data.slug ?? entry.id;
        const url = `${baseUrl}/${entry.collection}/${slug}/`;

        return `## ${entry.data.title}

URL: ${url}
Description: ${entry.data.description}
${entry.data.category ? `Category: ${entry.data.category}` : ''}
${entry.data.lastUpdated ? `Last Updated: ${new Date(entry.data.lastUpdated).toISOString().split('T')[0]}` : ''}

${remarkPluginFrontmatter?.excerpt || entry.data.description}

---`;
      })
    );
    return rendered.join('\n\n');
  };

  const docsContent = await renderContent(sortedDocs);
  const blogContent = await renderContent(sortedBlog);
  const legalContent = await renderContent(sortedLegal);

  const content = `# ${SITE.name} — Full Content

${SITE.description}

Source: ${baseUrl}
Generated: ${new Date().toISOString().split('T')[0]}

This file contains the full content index of ${SITE.name} for AI agents and language models.

---

# Documentation

${docsContent}

---

# Blog

${blogContent}

---

# Legal

${legalContent}

---

## Site Information

- **Framework:** Astro 7
- **Markdown Parser:** Sätteri
- **Search:** Pagefind
- **License:** MIT

## Links

- Home: ${baseUrl}${ROUTES.home}
- Documentation: ${baseUrl}${ROUTES.docs}
- Blog: ${baseUrl}${ROUTES.blog}
- Sitemap: ${baseUrl}${ROUTES.sitemap}
- RSS: ${baseUrl}${ROUTES.rss}
`.trim();

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};