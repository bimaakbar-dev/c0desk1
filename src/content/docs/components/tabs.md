---
slug: "tabs"
title: "Tabs"
description: "Display content in selectable tabs."
category: "Components"
order: 4
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-09T11:35:00Z
seo:
  title: "Tabs"
  description: "Display content in selectable tabs."
  noIndex: false
---

Tabs groups content into selectable panels. Works in both `.md` and `.mdx` files.

---

## Syntax

Wrap with `::::tabs` (4 colons), and use `:::tab[label]` (3 colons) for each tab:

```md
::::tabs
:::tab[npm]
npm install astro
:::
:::tab[pnpm]
pnpm add astro
:::
:::tab[yarn]
yarn add astro
:::
::::
```

## Preview

::::tabs
:::tab[npm]
npm install astro
:::
:::tab[pnpm]
pnpm add astro
:::
:::tab[yarn]
yarn add astro
:::
::::

## Notes

- The first tab is active by default
- Tab labels go inside `[]` after `tab`
- Tab content can include text, code blocks, lists, and other components
- Must be written as a block-level element, not inline