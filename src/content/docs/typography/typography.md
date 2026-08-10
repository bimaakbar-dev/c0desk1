---
slug: "typography"
title: "Typography"
description: "Font system, heading scale, body text, and utility classes used throughout Unloyd."
category: "Typography"
order: 1
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Typography"
  description: "Font system, heading scale, body text, and utility classes used throughout Unloyd."
  noIndex: false
---

Unloyd uses a consistent typographic system built on **Geist** and **Geist Mono** — a clean, modern, and highly readable font family designed by Vercel.

This page documents the font system, heading scales, body text styles, and utility classes available throughout the template.

---

## Fonts

### Primary Font: Geist

[Geist](https://vercel.com/font) is a sans-serif typeface designed for legibility and modern interfaces. It is used for all UI text, headings, and body content.

- **CSS Variable:** `--font-Geist`
- **Weights:** 100–800 (variable font)
- **Usage:** Applied globally to `html` and all text elements by default

### Monospace Font: Geist Mono

[Geist Mono](https://vercel.com/font) is the monospaced companion to Geist, optimized for code and technical content.

- **CSS Variable:** `--font-GeistMono`
- **Weights:** 100–800 (variable font)
- **Usage:** Applied to `code`, `kbd`, `samp`, and `pre` elements

---

## Display Scale

Large, attention-grabbing display text for hero sections and landing pages.

| Class | Font Size | Line Height | Weight | Letter Spacing |
|-------|-----------|-------------|--------|----------------|
| `text-display-96` | 96px | 1 | 800 | -0.05em |
| `text-display-80` | 80px | 1 | 800 | -0.045em |
| `text-display-72` | 72px | 1.02 | 800 | -0.04em |
| `text-display-64` | 64px | 1.05 | 800 | -0.04em |

---

## Heading Scale

Headings use a responsive scale for clear content hierarchy.

| Class | Font Size | Line Height | Letter Spacing |
|-------|-----------|-------------|----------------|
| `text-heading-56` | 56px | 1.07 | -0.035em |
| `text-heading-48` | 48px | 1.1 | -0.03em |
| `text-heading-40` | 40px | 1.1 | -0.025em |
| `text-heading-32` | 32px | 1.15 | -0.02em |
| `text-heading-24` | 24px | 1.25 | -0.015em |
| `text-heading-20` | 20px | 1.3 | -0.01em |
| `text-heading-18` | 18px | 1.35 | -0.01em |
| `text-heading-16` | 16px | 1.4 | -0.008em |
| `text-heading-14` | 14px | 1.4 | -0.005em |

---

## Body Text

Body text is designed for comfortable reading across all devices.

| Class | Font Size | Line Height | Weight | Letter Spacing |
|-------|-----------|-------------|--------|----------------|
| `text-body-20` | 20px | 1.65 | 400 | -0.01em |
| `text-body-18` | 18px | 1.65 | 400 | -0.005em |
| `text-body-16` | 16px | 1.7 | 400 | 0 |
| `text-body-14` | 14px | 1.65 | 400 | 0 |
| `text-body-13` | 13px | 1.6 | 400 | 0 |

---

## Label

Smaller text used for metadata, UI labels, and navigation.

| Class | Font Size | Line Height | Weight | Letter Spacing |
|-------|-----------|-------------|--------|----------------|
| `text-label-16` | 16px | 1.5 | 500 | 0 |
| `text-label-14` | 14px | 1.45 | 500 | 0 |
| `text-label-13` | 13px | 1.4 | 500 | 0 (tabular-nums) |
| `text-label-12` | 12px | 1.4 | 500 | 0.005em |
| `text-label-11` | 11px | 1.35 | 500 | 0.01em |

---

## Caption

Small, descriptive text for captions, footnotes, and supporting information.

| Class | Font Size | Line Height | Weight | Letter Spacing |
|-------|-----------|-------------|--------|----------------|
| `text-caption-16` | 16px | 1.6 | 400 | 0 |
| `text-caption-14` | 14px | 1.45 | 400 | 0 |
| `text-caption-13` | 13px | 1.45 | 400 | 0 |
| `text-caption-12` | 12px | 1.4 | 400 | 0 |
| `text-caption-11` | 11px | 1.35 | 400 | 0 |

---

## Overline

Uppercase text for section labels, small headings, and decorative elements.

| Class | Font Size | Line Height | Weight | Letter Spacing |
|-------|-----------|-------------|--------|----------------|
| `text-overline-13` | 13px | 1 | 600 | 0.12em |
| `text-overline-12` | 12px | 1 | 600 | 0.12em |
| `text-overline-11` | 11px | 1 | 600 | 0.14em |
| `text-overline-10` | 10px | 1 | 600 | 0.16em |

---

## Code & Mono

For code blocks, inline code, and monospaced text.

| Class | Font Size | Line Height | Weight | Family |
|-------|-----------|-------------|--------|--------|
| `text-code-16` | 15px | 1.6 | 400 | `--font-mono` |
| `text-code-14` | 13px | 1.55 | 400 | `--font-mono` |
| `text-code-12` | 11px | 1.5 | 400 | `--font-mono` |

### Monospace Labels

| Class | Font Size | Line Height | Weight | Features |
|-------|-----------|-------------|--------|----------|
| `text-mono-label-13` | 12px | 1.4 | 500 | `tabular-nums` |
| `text-mono-label-12` | 11px | 1.35 | 500 | `tabular-nums` |

---

## Button Text

Specialized utility for button labels.

| Class | Font Size | Line Height | Weight | Letter Spacing |
|-------|-----------|-------------|--------|----------------|
| `text-button-16` | 16px | 1 | 600 | -0.01em |
| `text-button-14` | 14px | 1 | 600 | -0.005em |
| `text-button-13` | 13px | 1 | 600 | 0 |

---

## Numeric & Tabular

For numbers and data tables where alignment matters.

| Class | Font Size | Line Height | Weight | Features |
|-------|-----------|-------------|--------|----------|
| `text-numeric-16` | 16px | 1.5 | 500 | `tabular-nums` |
| `text-numeric-14` | 14px | 1.45 | 500 | `tabular-nums` |

---

## Utility Classes

### `text-balance`

Applies `text-wrap: balance` for more visually balanced headings and short paragraphs.

```html
<h1 class="text-balance">This heading is balanced across lines</h1>
```

### `text-pretty`

Applies` text-wrap: pretty` for more readable paragraph breaks.

```html
<p class="text-pretty">This paragraph wraps with better readability.</p>
```

## Font Loading

Fonts are loaded using Astro's built-in `Font` component in `Head.astro`:

```astro
<Font cssVariable="--font-Geist" preload />
<Font cssVariable="--font-GeistMono" preload />
```

This ensures fonts are preloaded and available immediately on page load.

## Best Practices
| Do | Don't |
| ---- | ---- |
| Use heading classes for structure and hierarchy |	Use headings for visual styling only |
| Keep headings concise and descriptive | Write long, multi-line headings |
| Use `text-balance` on short headings | Apply `text-balance` on long paragraphs |
| Use `text-pretty` on paragraphs | Override line-height unnecessarily |
| Use `text-numeric` for tabular data | Use proportional fonts for numbers in tables |

## Examples
### Page Header
```html
<h1 class="text-heading-48 font-semibold text-(--fg-strong) text-balance">
  Documentation Template
</h1>
<p class="text-body-18 text-(--fg-muted) max-w-2xl text-pretty">
  A modern, open-source documentation and blog template built with Astro, TailwindCSS, and Sätteri.
</p>
```

:::card[Preview]
<h1 class="text-heading-48 font-semibold text-(--fg-strong) text-balance">
  Documentation Template
</h1>
<p class="text-body-18 text-(--fg-muted) max-w-2xl text-pretty">
  A modern, open-source documentation and blog template built with Astro, TailwindCSS, and Sätteri.
</p>
:::

### Section Title + Description
```html
<h2 class="text-heading-32 font-medium text-(--fg-strong) mb-4">
  What's Inside
</h2>
<p class="text-body-16 text-(--fg-muted) max-w-xl">
  A complete overview of the features and components included in this template.
</p>
```
:::card[Preview]
<h2 class="text-heading-32 font-medium text-(--fg-strong) mb-4">
  What's Inside
</h2>
<p class="text-body-16 text-(--fg-muted) max-w-xl">
  A complete overview of the features and components included in this template.
</p>
:::

### Code Block Label
```html
<span class="text-label-13 text-(--fg-muted)">JavaScript</span>
<pre class="text-code-14">...</pre>
```

:::card[Preview]
<span class="text-label-13 text-(--fg-muted)">JavaScript</span>
<pre class="text-code-14">...</pre>
:::

### Numeric Data
```html
<span class="text-numeric-16 text-(--fg-strong)">1,284</span>
<span class="text-label-14 text-(--fg-muted)">total users</span>
```

:::card[Preview]
<span class="text-numeric-16 text-(--fg-strong)">1,284</span>
<span class="text-label-14 text-(--fg-muted)">total users</span>
:::