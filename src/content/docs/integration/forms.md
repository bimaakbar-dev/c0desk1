---
slug: "forms"
title: "Forms"
description: "Set up the contact form with Formspree integration."
category: "Integration"
order: 2
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Forms"
  description: "Set up the contact form with Formspree integration."
  noIndex: false
---

Unloyd includes a contact form powered by [Formspree](https://formspree.io) — a free service that forwards submissions to your email. No backend required.

---

## Setup

:::steps
1. ### Create a Formspree Account
   - Go to [Formspree](https://formspree.io) and create a free account
   - Create a new form and copy the endpoint URL
   
   Your endpoint will look like: `https://formspree.io/f/xxxxxxxx`

2. ### Add to Environment Variables
   ```env
   PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
   ```

3. ### Customize Form Text
   Edit labels, placeholders, and messages in `src/config/pages/form.ts`:

   ```ts
   export const FORM_CONFIG = {
     labels: { name: "Name", email: "Email", subject: "Subject", message: "Message" },
     placeholders: { name: "John Doe", email: "john@example.com", ... },
     success: { title: "Message Sent", description: "We'll get back to you within 24 hours." },
     error: { title: "Something went wrong", description: "Please check your connection and try again." },
     button: { text: "Send Message", loading: "Sending..." },
   } as const;
   ```

4. ### Deploy
   The form is ready once the environment variable is set and the site is deployed.
:::

---

## Formspree Free Plan

| Feature | Limit |
| --- | --- |
| Submissions | 50 per month |
| Forms | 1 |
| Email notifications | ✓ |
| Spam protection | ✓ |

Upgrade to a paid plan if you need higher limits.

---

## Privacy Considerations

Form submissions may contain personal data. Make sure your site has:

- A **Privacy Policy** page
- Clear notice to users about how their data is used

---
---
slug: 'pagefind'
title: "Pagefind"
description: "Static search engine integration with Unloyd. Zero external dependencies, fast, and privacy-friendly."
category: "Integration"
order: 3
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Pagefind"
  description: "Static search engine integration with Unloyd. Zero external dependencies, fast, and privacy-friendly."
  noIndex: false
---

**Pagefind** is a fully static search library that runs entirely in your browser. It requires no external API, no server, and no third-party service.

Unloyd includes Pagefind out of the box. The search bar in the header automatically indexes your content during build.

---

## How It Works

1. During `npm run build`, Pagefind crawls your site
2. It generates a search index in the `dist/` folder
3. When a user types in the search bar, the index is loaded locally
4. Search results appear instantly — no network requests required

This approach is:
- **Fast** — Search happens locally
- **Privacy-friendly** — No data sent to third parties
- **Self-contained** — Works even without internet after the initial load

---

## Configuration

Pagefind is pre-configured in Unloyd. The build command already runs Pagefind after the Astro build:

```json
{
  "scripts": {
    "build": "astro build && npx pagefind --site dist"
  }
}
```

## Additional Options

You can customize Pagefind behavior by adding arguments to the build command:

```bash
npx pagefind --site dist --glob \"**/*.html\" --force-language id
```

## Option Description
| Option | Description |
| ---- | ---- |
| `--site` | Directory containing your built site |
| `--glob` | File pattern to search |
| `--force-language` | Language for stemming (e.g., id, en) |
| `--exclude-selectors` | CSS selectors to exclude from indexing |

## How Content Is Indexed
Pagefind indexes content based on:

| Attribute | Purpose |
| ---- | ---- |
| `data-pagefind-body` | Primary content to search |
| `data-pagefind-title` | Page title |
| `data-pagefind-weight` | Search weight (higher = more relevant) |
| `data-pagefind-meta` | Metadata for filtering |
| `data-pagefind-filter` | Filter tags |

### Example

In the documentation layout:

```astro
<article data-pagefind-body>
  <h1 data-pagefind-title>{entry.data.title}</h1>
  <div data-pagefind-weight="2" class="hidden" />
  <div class="prose">
    <Content />
  </div>
</article>
```

## Search UI

The search UI is built into the header. It includes:

- A search icon that opens the search modal
- A search input field with debounced search
- Search results with titles and excerpts
- Keyboard shortcuts <kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>Cmd</kbd>+<kbd>K</kbd>) to open search

## Customizing the Search
### Weight

Increase the weight of important content to prioritize it in search results:

```astro
<div data-pagefind-weight="2">Featured content here</div>
```

### Meta Data

Add metadata to enable filtering:

```astro
<span data-pagefind-meta="type:docs">Documentation</span>
<span data-pagefind-meta="date:2026-01-01">January 2026</span>
```

### Excluding Content

Exclude specific elements from search:

```astro
<div data-pagefind-ignore>This content will not appear in search results.</div>
```

## Pagefind CLI

After building, you can run Pagefind manually:

```bash
# Install Pagefind globally
npm install -g pagefind

# Run Pagefind
pagefind --site dist

# Start a local server with search
pagefind --serve --site dist
```

## Performance

Pagefind is optimized for speed:

- Index size is typically small
- Search queries are measured in milliseconds
- Cached in the browser for subsequent visits

## Troubleshooting

:::accordion[Search Not Working]

1. Check that Pagefind is running during build
2. Verify the `dist/` folder contains `pagefind/` directory
3. Check the browser console for errors
4. Ensure `data-pagefind-body` is present on content
:::

:::accordion[Wrong Language Stemming]

Specify the correct language:

```bash
npx pagefind --site dist --force-language en
```
:::

:::accordion[Missing Content]

- Check that `data-pagefind-body` is on the main content container
- Verify that the content is in the HTML output
:::

## Next Steps

:::card[Tipography]{href="/docs/tipography/" icon='learn'}
Static search configuration
:::