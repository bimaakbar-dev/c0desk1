---
slug: "markdown-elements"
title: "Markdown Elements"
description: "Visual reference for all standard Markdown elements in Stardux."
category: "Writing"
order: 2
draft: false
author:
  name: "Stardux Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Markdown Elements"
  description: "Visual reference for all standard Markdown elements in Stardux."
  noIndex: false
---

> [!NOTE]
> Visual reference for how standard Markdown elements render in Unloyd. For custom directives, see [Components](/docs/components/).

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Emphasis

**Bold**

*Italic*

***Bold Italic***

~~Strikethrough~~

`Inline code`

## Lists

- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

1. First step
2. Second step
   1. Sub-step
   2. Another sub-step
3. Third step

- [x] Completed task
- [ ] Incomplete task

## Blockquote

> This is a blockquote.

## Table

| Feature | Status | Version |
| --- | --- | --- |
| Astro 7 | ✅ | 7.2.0 |
| TailwindCSS 4 | ✅ | 4.0.0 |

## Code

```js
const greeting = 'Hello, world!';
console.log(greeting);
```

```js
const greeting = 'Hello, world!'; // [!code --]
console.log(greeting); // [!code ++]
```

## Links & Images

[Internal link](/docs/)

[External link](https://github.com/bimaakbar-dev)



![OG Image](../../../assets/images/og-image.webp)


## Footnotes

Here is a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Keyboard Input

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open search.