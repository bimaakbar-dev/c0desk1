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

## Syntax

::::tabs
:::tab[Markdown]

```md
:button[Download]{url="/" icon="download"}

:button[GitHub]{url="https://github.com" icon="github"}

:button[View Demo]{url="/" variant="primary"}

:button[Learn More]{url="/" variant="secondary"}
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

<Button url="/" variant="primary">
  View Demo
</Button>

<Button url="/" variant="secondary">
  Learn More
</Button>
```

:::
::::

:::card[Preview]

:button[Download]{url="/" icon="download"}

:button[GitHub]{url="https://github.com" icon="github"}

:button[View Demo]{url="/" variant="primary"}

:button[Learn More]{url="/" variant="secondary"}
:::

## Variants

| Variant     | Style                   |
| ----------- | ----------------------- |
| `primary`   | Solid (default)         |
| `secondary` | Light outline           |
| `success`   | Green                   |
| `danger`    | Red                     |
| `outline`   | Transparent with border |
| `ghost`     | Transparent, no border  |

## Attributes

| Attribute | Required | Description                                                        |
| --------- | -------- | ------------------------------------------------------------------ |
| `url`     | Yes      | Link destination                                                   |
| `icon`    | No       | Icon name (e.g. `download`, `github`, `external`, `arrow`, `star`) |
| `variant` | No       | Button style (default: `primary`)                                  |
| `block`   | No       | Full-width button                                                  |
| `class`   | No       | Additional CSS classes                                             |

## Notes

- Button is an inline component — it can be placed inside a paragraph
- External URLs (`http`/`https`) open in a new tab automatically
- Internal URLs (`/`, `#`) open in the same tab
- Icon appears on the left side of the label
- `block` makes the button full-width, useful for CTAs
