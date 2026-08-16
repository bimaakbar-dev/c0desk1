---
slug: "figure"
title: "Figure"
description: "Image with an optional caption."
category: "Components"
order: 10
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T11:21:00Z
seo:
  title: "Figure"
  description: "Image with an optional caption."
  noIndex: false
---

Figure wraps an image in a `<figure>` element with an optional caption. Without a caption, the image renders as a plain `<img>`.

## Syntax

::::tabs
:::tab[Markdown]
```md
![Alt text](https://placehold.co/600x400){This is a caption}
```
:::
:::tab[MDX]
```mdx
<Figure src="https://placehold.co/600x400" alt="Alt text">
  This is a caption
</Figure>
```
:::
::::

:::card[Preview]
![Alt text](../../../assets/images/og-image.webp){This is a caption}
:::

## Notes

- Caption is plain text only — emphasis and links are not supported
- Caption is optional — without it, the image renders as a plain `<img>`
- Must be written as a block-level element, not inline