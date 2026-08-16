---
slug: "using-components"
title: "Custom Components"
description: "Overview of all custom components available in Stardux."
category: "Components"
order: 1
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
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

| Component | Syntax | Description |
| --- | --- | --- |
| [Callout](/docs/components/callout/) | `> [!NOTE]` | Highlight important information |
| [Steps](/docs/components/steps/) | `:::steps` | Step-by-step guide |
| [Tabs](/docs/components/tabs/) | `::::tabs` | Tabbed content |
| [Filetree](/docs/components/filetree/) | `:::filetree` | Folder and file structure |
| [Accordion](/docs/components/accordion/) | `:::accordion` | Collapsible content |
| [Video](/docs/components/video/) | `::video[...]` | Video embed |
| [Card](/docs/components/card/) | `:::card` | Info box with icon and link |
| [Grid](/docs/components/grid/) | `:::grid` | Responsive grid |
| [Quote](/docs/components/quote/) | `:::quote` | Custom Blockquote with `:user` |

## Inline Components

| Component | Syntax | Description |
| --- | --- | --- |
| [User](/docs/components/user/) | `:user[...]` | User profile with avatar |
| [Badge](/docs/components/badge/) | `:badge[...]` | Small colored label |
| [Button](/docs/components/button/) | `:button[...]` | Button with icon |
| [Icon](/docs/components/icon/) | `:icon[...]` | SVG icon |

## Media

| Component | Syntax | Description |
| --- | --- | --- |
| [Figure](/docs/components/figure/) | `![alt](url){caption}` | Image with caption |