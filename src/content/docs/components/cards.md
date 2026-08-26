---
slug: "cards"
title: "Cards"
description: "Info box with optional icon, title, and link."
category: "Components"
order: 11
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-09T03:00:00Z
seo:
  title: "Cards"
  description: "Info box with optional icon, title, and link."
  noIndex: false
---

Card renders an info box with an optional icon, title, and content. Adding `href` turns the entire card into a clickable link.

## Usage

::::tabs
:::tab[Markdown]

```markdown
:::card[Title]
Card with title and content.
:::

:::card[Title]{icon="star"}
Card with icon and title.
:::

:::card[Title]{href="/docs/"}
Clickable card link.
:::

:::card{icon="star"}
Card with icon, no title.
:::

:::card
Minimal card, content only.
:::
```

:::
:::tab[MDX]

```mdx
<Card title="Title"> Card with title and content. </Card>

<Card title="Title" icon="star"> Card with icon and title. </Card>

<Card title="Title" href="/docs/"> Clickable card link. </Card>

<Card icon="star"> Card with icon, no title. </Card>

<Card> Minimal card, content only. </Card>
```

:::
::::

::::card[Preview]
:::card[Title]
Card with title and content.
:::

:::card[Title]{icon="star"}
Card with icon and title.
:::

:::card[Title]{href="/docs/components/"}
Clickable card link.
:::

:::card{icon="star"}
Card with icon, no title.
:::

:::card
Minimal card, content only.
:::
::::

## Attributes

:::card[Props]
::::accordion[`icon`]
:::dl
::dt[Required]
No

::dt[Type]
string
:::
Icon name 
::::

::::accordion[`href`]
:::dl
::dt[Required]
No

::dt[Type]
string
:::
Makes the entire card a clickable link
::::

::::accordion[`class`]
:::dl
::dt[Required]
No

::dt[Type]
string
:::
Additional CSS classes
::::
:::

> [!NOTE]
> Card is a block component — must be written on its own line