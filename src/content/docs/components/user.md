---
slug: "user"
title: "User"
description: "Display a user profile with avatar, name, and role."
category: "Components"
order: 7
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-26T02:19:00Z
seo:
  title: "User"
  description: "Display a user profile with avatar, name, and role."
  noIndex: false
---

User renders an inline profile with an avatar, name, optional role, and optional link.

## Usage
User is an inline component — it can be placed inside a paragraph.

::::tabs
:::tab[Markdown]

```md
:user[Bima Akbar]

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" url="https://github.com/bimaakbar-dev"}
```

:::

:::tab[MDX]

```mdx
<User>Bima Akbar</User>

<User avatar="https://avatars.githubusercontent.com/u/81931118?v=4">
  Bima Akbar
</User>

<User
  avatar="https://avatars.githubusercontent.com/u/81931118?v=4"
  role="Developer"
>
  Bima Akbar
</User>

<User
  avatar="https://avatars.githubusercontent.com/u/81931118?v=4"
  url="https://github.com/bimaakbar-dev"
>
  Bima Akbar
</User>
```

:::
::::

:::card[Preview]
:user[Bima Akbar]

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" url="https://github.com/bimaakbar-dev"}
:::

## Attributes

::::card[Props]
:::accordion
`avatar`

**Required:** *optional*

Avatar image URL — renders as a rounded image
:::

:::accordion
`role`

**Required:** *optional*

Role label displayed after the name with a `·` separator
:::

:::accordion
`url`

**Required:** *optional*

Wraps the user in a link
:::
::::

> [!NOTE]
> A placeholder avatar is shown if `avatar` is not provided