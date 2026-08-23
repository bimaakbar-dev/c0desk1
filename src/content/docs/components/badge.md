---
slug: "badge"
title: "Badge"
description: "Small inline label with color variants and optional icon."
category: "Components"
order: 8
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T02:40:00Z
seo:
  title: "Badge"
  description: "Small inline label with color variants and optional icon."
  noIndex: false
---

Badge renders a small inline label with optional color variant and icon.

## Syntax

::::tabs
:::tab[Markdown]

```md
:badge[Stable]

:badge[Beta]{variant="warning"}

:badge[New]{variant="success" icon="star"}

:badge[Deprecated]{variant="danger"}
```

:::
:::tab[MDX]

```mdx
<Badge>Stable</Badge>

<Badge variant="warning">Beta</Badge>

<Badge variant="success" icon="star">
  New
</Badge>

<Badge variant="danger">Deprecated</Badge>
```

:::
::::

:::card[Preview]

:badge[Stable]

:badge[Beta]{variant="warning"}

:badge[New]{variant="success" icon="star"}

:badge[Deprecated]{variant="danger"}
:::

## Variants

| Variant   | Color       |
| --------- | ----------- |
| `default` | Neutral     |
| `new`     | Accent      |
| `warning` | Yellow      |
| `success` | Green       |
| `info`    | Blue        |
| `danger`  | Red         |
| `outline` | Transparent |
| `ghost`   | Transparent |

## Attributes

| Attribute | Required | Description                              |
| --------- | -------- | ---------------------------------------- |
| `variant` | No       | Badge color variant (default: `default`) |
| `icon`    | No       | Icon displayed before the label          |
| `class`   | No       | Additional CSS classes                   |

## Notes

- Badge is an inline component — it can be placed inside a paragraph
- Icon appears on the left side of the label
