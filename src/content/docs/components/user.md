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

The `User` component renders an inline profile badge consisting of an avatar, user name, optional role designation, and an optional hyperlink. It is built specifically to integrate seamlessly inside regular paragraphs, article bylines, or contributor lists.

## Usage

The `User` component can be used in various configurations depending on your requirements. Below are step-by-step examples demonstrating each feature.

### Default State
By default, if no attributes are provided, the component renders the name text along with an automated fallback placeholder avatar.

::::tabs
:::tab[Markdown]
```md
Published by :user[Bima Akbar]
```
:::

:::tab[MDX]
```mdx
Published by <User>Bima Akbar</User>
```
:::
::::

:::card[Preview]
Published by :user[Bima Akbar]
:::

### Custom Image Avatar
You can pass a direct image URL via the `avatar` attribute to display a custom circular profile picture.

::::tabs
:::tab[Markdown]
```md
:user[Bima Akbar]{avatar="[https://avatars.githubusercontent.com/u/81931118?v=4](https://avatars.githubusercontent.com/u/81931118?v=4)"}
```
:::

:::tab[MDX]
```mdx
<User avatar="[https://avatars.githubusercontent.com/u/81931118?v=4](https://avatars.githubusercontent.com/u/81931118?v=4)">
  Bima Akbar
</User>
```
:::
::::

:::card[Preview]
:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4"}
:::

### Add Role Description
Use the `role` attribute to append a job title or subtitle next to the name, automatically separated by a middle dot (`·`) symbol.

::::tabs
:::tab[Markdown]
```md
:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer"}
```
:::

:::tab[MDX]
```mdx
<User avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer">
  Bima Akbar
</User>
```
:::
::::

:::card[Preview]
:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer"}
:::

### Clickable Profile Link
​Add the `url` attribute to wrap the entire component inside a hyperlink anchor, allowing readers to click through to a profile, GitHub repository, or social media link.

​:::::tabs
::::tab[Markdown]
```md
:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev"}
```
::::

::::tab[MDX]
```mdx
<User avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev">
  Bima Akbar
</User>
```
::::
:::::

:::card[Preview]
:user[Bima Akbar]{avatar="https://avatars.githubusercontent.com/u/81931118?v=4" role="Developer" url="https://github.com/bimaakbar-dev"}
:::

## Attributes

:::::card[Props]
::::accordion[`avatar`]
:::dl
::dt[Type]
`string`

::dt[Required]
*Optional*

::dt[Default]
Automatic placeholder
:::

Direct image source URL for the avatar thumbnail. Renders as a circular image. If omitted, a clean default placeholder avatar will be assigned automatically.
::::

::::accordion[`role`]
:::dl
::dt[Type]
`string`

::dt[Required]
*Optional*
:::

Job title or role description. When provided, it appears immediately after the name separated cleanly by a middle dot `•`.
::::

::::accordion[`url`]
:::dl
::dt[Type]
`string`

::dt[Required]
*Optional*
:::

Hyperlink destination. When specified, wraps the user profile badge inside an anchor tag `<a>`, turning it into a fully interactive link.
::::
:::::

> [!NOTE]
> The User component is strictly inline — it adapts naturally to surrounding text line-heights without disrupting paragraph spacing.