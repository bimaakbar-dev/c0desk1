---
slug: "user"
title: "User"
description: "Display a user profile with avatar, name, and role."
category: "Components"
order: 7
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-15T20:49:00Z
seo:
  title: "User"
  description: "Display a user profile with avatar, name, and role."
  noIndex: false
---

User renders an inline profile with an avatar, name, optional role, and optional link.

---

## Syntax

::::tabs
:::tab[Markdown]
```md
:user[Bima Akbar]

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev"}
```
:::

:::tab[MDX]
```mdx
<User>Bima Akbar</User>

<User avatar="https://avatars.githubusercontent.com/u/81931118?v=4">Bima Akbar</User>

<User avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer">Bima Akbar</User>

<User avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev">Bima Akbar</User>
```
:::
::::

## Preview
:user[Bima Akbar]

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer"}

:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev"}

## Attributes

| Attribute | Required | Description |
| --- | --- | --- |
| `avatar` | **No** | Avatar image URL — renders as a rounded image |
| `role` | **No** | Role label displayed after the name with a `·` separator |
| `url` | **No** | Wraps the user in a link |
| `class` | **No** | Additional CSS classes |

## Notes

- User is an inline component — it can be placed inside a paragraph
- A placeholder avatar is shown if `avatar` is not provided
- External links automatically include `rel="noopener noreferrer nofollow"`