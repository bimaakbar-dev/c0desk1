---
slug: "icons"
title: "Icons"
description: "Inline SVG icon with size variants."
category: "Components"
order: 12
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-18
seo:
  title: "Icons"
  description: "Inline SVG icon with size variants."
  noIndex: false
---

Icon renders an inline SVG icon. Color follows `currentColor` and can be overridden with CSS.

## Usage

```md
:icon[star]

:icon[star]{size="lg"}

:icon[github]{size="sm"}

Click :icon[arrow-right] to continue.
```

:::card[Preview]
:icon[star]

:icon[star]{size="md"}

:icon[star]{size="lg"}

:icon[github]

:icon[twitter]

:icon[youtube]

Click :icon[arrow-right] to continue.
:::

## Sizes

| Value | Size           |
| ----- | -------------- |
| `sm`  | 12px           |
| `md`  | 16px (default) |
| `lg`  | 20px           |

## Attributes

| Attribute | Required | Description                                     |
| --------- | -------- | ----------------------------------------------- |
| `size`    | No       | Icon size — `sm`, `md`, or `lg` (default: `md`) |
| `class`   | No       | Additional CSS classes                          |

## Notes

- Icon is an inline component — it can be placed inside a paragraph
- Icons use SVG mask, consistent with Button, Badge, Card, and Filetree
