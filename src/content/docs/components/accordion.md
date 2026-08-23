---
slug: "accordion"
title: "Accordion"
description: "Collapsible content block for FAQs and technical details."
category: "Components"
order: 6
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T02:40:00Z
seo:
  title: "Accordion"
  description: "Collapsible content block for FAQs and technical details."
  noIndex: false
---

Accordion renders a collapsible `<details>` element with a styled summary. Works in both `.md` and `.mdx` files.

## Syntax

```md
:::accordion[Title]
Content goes here.

Can include paragraphs, lists, code blocks, and other components.
:::
```

::::card[Preview]
:::accordion[Title]
Content goes here.

Can include paragraphs, lists, code blocks, and other components.
:::
::::

## Notes

- Accordion is open by default
- The title renders as the `<summary>` element
- Content can be anything — paragraphs, lists, code blocks, images, or other components
- Must be written as a block-level element, not inline
