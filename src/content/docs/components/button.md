---
slug: "button"
title: "Button"
description: "Inline button with icon and style variants."
category: "Components"
order: 9
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T02:45:00Z
seo:
  title: "Button"
  description: "Inline button with icon and style variants."
  noIndex: false
---

Button renders an inline link styled as a button, with optional icon and variant.

## Usage

::::tabs
:::tab[Markdown]

```markdown
:button[Download]{url="/" icon="download"}

:button[GitHub]{url="https://github.com" icon="github"}
```
:::

:::tab[MDX]
```mdx
<Button url="/" icon="download">
  Download
</Button>

<Button url="https://github.com" icon="github">
  GitHub
</Button>
```
:::
::::

:::card[Preview]
:button[Download]{url="/" icon="download"}

:button[GitHub]{url="https://github.com" icon="github"}
:::

## Attributes

:::card[Props]
::::accordion[`url`]
:::dl
::dt[Required]
Yes

::dt[Type]
string
:::

Link destination
::::

::::accordion[`icon`]
:::dl
::dt[Required]
Optional

::dt[Type]
string
:::

Icon name (e.g. `download`, `github`, `external`, `arrow`, `star`)
::::

::::accordion[`class`]
:::dl
::dt[Required]
Optional

::dt[Type]
string
:::
Additional CSS
::::
:::

> [!NOTE]
> Internal URLs `/`, `#` open in the same tab

> [!TIP]
> Icon appears on the left side of the label