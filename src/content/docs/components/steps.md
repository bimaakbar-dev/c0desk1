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

## Usage

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

::::card[Preview]
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
::::

> [!NOTE]
> Add a blank line after a plain text title to prevent it from being parsed as a heading.

> [!TIP]
> Numbering is automatic — always start from `1.`