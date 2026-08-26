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

::::tabs
:::tab[Markdown]
```markdown
:icon[star]{size="sm"}

:icon[star]{size="md"}

:icon[star]{size="lg"}

Click :icon[arrow-right] to continue.
```
:::

:::tab[MDX]
```mdx
<Icon name='start' size='sm' />

<Icon name='start' size='md' />

<Icon name='start' size='lg' />

Click <Icon name='arrow-right' /> to continue.
```
:::
::::

:::card[Preview]
:icon[star]{size="sm"}

:icon[star]

:icon[star]{size="lg"}

Click :icon[arrow-right] to continue.
:::

## Attributes

:::card[Props]
::::accordion[`name`]
:::dl
::dt[Required]
Yes

::dt[Type]
string
:::
Icon name
::::

::::accordion[`size`]
:::dl
::dt[Required]
No

::dt[Type]
string

::dt[Value]
`sm` | `md` | `lg`
:::
Icon size — `sm`, `md`, or `lg` (default: `md`)
::::
:::

> [!NOTE]
> Icons use SVG mask, consistent with Button, Badge, Card, and Filetree
