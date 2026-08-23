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

```md
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

```html
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

## Variants

| Variant  | Syntax                        |
| -------- | ----------------------------- |
| Full     | `:::card[Title]{icon="star"}` |
| No icon  | `:::card[Title]`              |
| No title | `:::card{icon="info"}`        |
| Minimal  | `:::card`                     |

## Attributes

| Attribute | Required | Description                            |
| --------- | -------- | -------------------------------------- |
| `icon`    | No       | Icon name                              |
| `href`    | No       | Makes the entire card a clickable link |
| `class`   | No       | Additional CSS classes                 |

## Notes

- Card is a block component — must be written on its own line
- Icon appears above the title
- Content can include paragraphs, lists, code blocks, and other components
