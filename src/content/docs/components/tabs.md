---
slug: "tabs"
title: "Tabs"
description: "Display content in selectable tabs."
category: "Components"
order: 4
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T11:35:00Z
seo:
  title: "Tabs"
  description: "Display content in selectable tabs."
  noIndex: false
---

Tabs groups content into selectable panels. Works in both `.md` and `.mdx` files.

## Usage
Wrap with `::::tabs` (4 colons), and use `:::tab[label]` (3 colons) for each tab:

~~~markdown
::::tabs
:::tab[npm]
```bash
npm install astro
```
:::

:::tab[pnpm]
```bash
pnpm add astro
```
:::

:::tab[yarn]
```bash
yarn add astro
```
:::
::::
~~~

:::::card[Preview]
::::tabs
:::tab[npm]
~~~bash
npm install astro
~~~
:::

:::tab[pnpm]
~~~bash
pnpm add astro
~~~
:::

:::tab[yarn]
~~~bash
yarn add astro
~~~
:::
::::
:::::

> [!TIP] 
> The first tab is active by default

> [!NOTE]
> Tab labels go inside `[]` after `tab`
