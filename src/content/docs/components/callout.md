---
slug: "callout"
title: "Callout"
description: "Highlight important information with colored callout blocks."
category: "Components"
order: 2
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-09T03:20:00Z
seo:
  title: "Callout"
  description: "Highlight important information with colored callout blocks."
  noIndex: false
---

Callout blocks highlight important information with a colored accent and icon. They work in both `.md` and `.mdx` files — the syntax is identical in both.

## Usage

```md
> [!NOTE]
> General information.

> [!TIP]
> A helpful suggestion.

> [!IMPORTANT]
> Something critical to know.

> [!WARNING]
> Proceed with caution.

> [!CAUTION]
> A stronger warning.

> [!DANGER]
> This may cause irreversible effects.
```

:::card[Preview]
> [!NOTE]
> General information.

> [!TIP]
> A helpful suggestion.

> [!IMPORTANT]
> Something critical to know.

> [!WARNING]
> Proceed with caution.

> [!CAUTION]
> A stronger warning.

> [!DANGER]
> This may cause irreversible effects.
:::

## Variants

:::::card[Props]
::::accordion[`[!Type]`]
:::dl
::dt[Type]
`NOTE` | `TIP` | `IMPORTANT` | `WARNING` | `CAUTION` | `DANGER`
::dt[Required]
*True*
:::

Type must be uppercase.
::::
:::::

> [!NOTE]
> Must be written as a block-level element, not inline
