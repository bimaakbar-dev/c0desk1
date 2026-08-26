---
slug: "quote"
title: "Quote"
description: "Styled quote block with optional user attribution."
category: "Components"
order: 15
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T03:00:00Z
seo:
  title: "Quote"
  description: "Styled quote block with optional user attribution."
  noIndex: false
---

Quote renders a `<figure>` with a `<blockquote>` and an optional `<figcaption>` for user attribution.

## Usage

::::tabs
:::tab[Markdown]

```markdown
:::quote
Unloyd made my docs look great.

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev"}
:::
```

:::
:::tab[MDX]

```mdx
<Quote>
  Unloyd made my docs look great.
  <User avatar="https://avatars.githubusercontent.com/u/81931118?v=4" url="https://github.com/bimaakbar-dev">
    Bima Akbar
  </User>
</Quote>
```

:::
::::

::::card[Preview]

:::quote
Unloyd made my docs look great.

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" url="https://github.com/bimaakbar-dev"}
:::
::::

> [!NOTE]
> Without `:user` / `<User>`, only `<blockquote>` is rendered
