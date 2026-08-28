---
slug: "using-components"
title: "Custom Components"
description: "Overview of all custom components available in Stardux."
category: "Components"
order: 1
draft: false
author:
  name: "Bima Akbar"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T02:27:00Z
seo:
  title: "Custom Components"
  description: "Overview of all custom components available in Stardux."
  noIndex: false
---

Custom directives let you write simple Markdown syntax that renders into rich HTML elements — no imports, no JSX, no client-side JavaScript.

There are two directive types:

- **Block** — `:::` or `::` on their own line
- **Inline** — `:` inside a paragraph

## Block Components

:::grid

::::card[Callout]{href="/components/callout/}
Highlight important information
::::

::::card[Steps]{href="/components/steps/}
Step-by-step guide
::::

::::card[Tabs]{href="/components/tabs/}
Tabbed content
::::

::::card[File Tree]{href="/components/filetree/}
Folder and file structure
::::

::::card[Accordion]{href="/components/accordion/}
Collapsible content
::::

::::card[Video]{href="/components/video/}
Video embed
::::

::::card[Card]{href="/components/card/}
Info box with icon and link
::::

::::card[Grid]{href="/components/grid/}
Responsive grid
::::

::::card[Quote]{href="/components/quote/}
Custom Blockquote
::::

:::

## Inline Components

| Component                          | Syntax         | Description              |
| ---------------------------------- | -------------- | ------------------------ |
| [User](/docs/components/user/)     | `:user[...]`   | User profile with avatar |
| [Badge](/docs/components/badge/)   | `:badge[...]`  | Small colored label      |
| [Button](/docs/components/button/) | `:button[...]` | Button with icon         |
| [Icon](/docs/components/icon/)     | `:icon[...]`   | SVG icon                 |

## Media

| Component                          | Syntax                 | Description        |
| ---------------------------------- | ---------------------- | ------------------ |
| [Figure](/docs/components/figure/) | `![alt](url){caption}` | Image with caption |