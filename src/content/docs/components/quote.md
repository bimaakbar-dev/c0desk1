---
slug: "quote"
title: "Quote"
description: "Styled quote block with optional user attribution."
category: "Components"
order: 15
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T03:00:00Z
seo:
  title: "Quote"
  description: "Styled quote block with optional user attribution."
  noIndex: false
---

Quote renders a `<figure>` with a `<blockquote>` and an optional `<figcaption>` for user attribution.

## Syntax

::::tabs
:::tab[Markdown]
```md
:::quote
Unloyd made my docs look great.

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev"}
:::
```
:::
:::tab[MDX]
```mdx
<Quote>
  Unloyd made my docs look great.
  <User avatar="https://avatars.githubusercontent.com/u/81931118?v=4" url="https://github.com/bimaakbar-dev">Bima Akbar</User>
</Quote>
```
:::
::::

::::card[Preview]

:::quote
Unloyd made my docs look great.

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" url="https://github.com/bimaakbar-dev"}
:::
::::

## Notes

- Text content renders inside `<blockquote>`
- `:user` renders inside `<figcaption>` — attribution is optional
- Without `:user`, only `<blockquote>` is rendered
- Must be written as a block-level element, not inline