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
lastUpdated: 2026-08-26T02:40:00Z
seo:
  title: "Badge"
  description: "Small inline label with color variants and optional icon."
  noIndex: false
---

Badge renders a small inline label with optional color variant and icon.

## Usage

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

## Attributes

:::::card[Props]
::::accordion[`variant`]
:::dl
Type
`default` | `new` | `warning` | `success` | `info` | `danger` | `outline` | `ghost`
Default
`default`
Required
*Optional*
:::

Badge color variant theme.
::::

::::accordion[`icon`]
:::dl
::dt[Type:]
`string`

::dt[Required:]
*Optional*
:::

Icon displayed on the left side of the badge label.
::::

::::accordion[`class`]
:::dl
::dt[Type:]
`string`

::dt[Required:]
*Optional*
:::

Additional CSS classes for custom styling.
::::
:::::


> [!NOTE]
> Badge is an inline component — it can be placed seamlessly inside paragraphs or headers.

> [!TIP]
> The icon automatically appears on the left side of the badge label.