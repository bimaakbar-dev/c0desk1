---
slug: "steps"
title: "Steps"
description: "Step-by-step guide component with automatic numbering."
category: "Components"
order: 3
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-09T02:35:00Z
seo:
  title: "Steps"
  description: "Step-by-step guide component with automatic numbering."
  noIndex: false
---

Steps renders an ordered list as a styled step-by-step guide with automatic numbering. Works in both `.md` and `.mdx` files.

---

## Syntax

Wrap an ordered list with `:::steps`. Each list item becomes a step.

```md
:::steps
1. Plain text title

   Step content here.

2. ## Heading title

   Step content here.

3. `Code title`
   - Item one
   - Item two

4. No title, just content.
:::
```

> [!NOTE]
> Add a blank line after a plain text title to prevent it from being parsed as a heading.

## Title Variants

| Variant | Example | Result |
| --- | --- | --- |
| Plain text | `1. Step title` | Regular text title |
| Heading | `2. ## Step title` | Larger heading title |
| Inline code | `3. \`Step title\`` | Code-styled title |
| No title | `4.` | Content only, no title |

## Preview

:::steps
1. Plain text title

   Step content here.

2. ## Heading title

   Step content here.

3. `Code title`
   - Item one
   - Item two

4. No title, just content.
:::

## Notes

- Numbering is automatic — always start from `1.`
- Step content can include paragraphs, lists, code blocks, and other components
- Use 2 or 4 spaces to indent content inside a step
- Must be written as a block-level element, not inline