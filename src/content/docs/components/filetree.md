---
slug: "filetree"
title: "Filetree"
description: "Display folder and file structures with icons, highlights, and comments."
category: "Components"
order: 5
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-09T02:40:00Z
seo:
  title: "Filetree"
  description: "Display folder and file structures with icons, highlights, and comments."
  noIndex: false
---

Filetree renders a folder and file structure with automatic icons, collapsible folders, highlights, and comments.

---

## Syntax

```md
:::filetree
- src/
  - components/
    - Header.astro
    - Footer.astro
  - pages/
    - index.astro
    - blog/
      - [...slug].astro
- package.json
- **README.md** # highlighted file
- ...
:::
```

## Preview

:::filetree
- src/
  - components/
    - Header.astro
    - Footer.astro
  - pages/
    - index.astro
    - blog/
      - [...slug].astro
- package.json
- **README.md** # highlighted file
- ...
:::

## Features

| Syntax | Description |
| --- | --- |
| `folder/` | Trailing slash marks a folder |
| `file.ext` | Any extension marks a file |
| `**name**` | Bold highlights the item with accent color |
| `# comment` or `// comment` | Inline comment shown in muted color |
| `...` | Placeholder for hidden content |

## Notes

- Folders with children render as collapsible `<details>` elements
- Icons are applied automatically based on file extension
- Indentation (2 or 4 spaces) determines hierarchy
- Must be written as a block-level element, not inline