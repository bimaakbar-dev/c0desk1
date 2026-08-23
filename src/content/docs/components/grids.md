---
slug: "grids"
title: "Grids"
description: "Responsive 2-column layout wrapper for components."
category: "Components"
order: 13
draft: false
author:
  name: "Stradcos Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T03:00:00Z
seo:
  title: "Grids"
  description: "Responsive 2-column layout wrapper for components."
  noIndex: false
---

Grid wraps components into a responsive 2-column layout. Collapses to 1 column on mobile.

## Syntax

```md
::::grid
:::card[Title]{icon="info"}
Card content 1
:::

:::card[Title]{icon="info"}
Card content 2
:::
::::
```

:::card[Preview]

::::grid
:::card[Title]{icon="info"}
Card content 1
:::

:::card[Title]{icon="info"}
Card content 2
:::
::::
:::

## Notes

- Grid has no attributes — always 2 columns with a `1rem` gap
- Intended for wrapping block components like Card and Callout
- On mobile: 1 column, `0.75rem` gap
