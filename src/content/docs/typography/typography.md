---
slug: "typography"
title: "Typography"
description: "Font system and utility classes used throughout Unloyd."
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
  description: "Font system and utility classes used throughout Unloyd."
  noIndex: false
---

Unloyd uses **Geist** for UI text and **Geist Mono** for code — both loaded via Astro's `Font` component with `preload` enabled.

All utility classes are defined in `src/styles/utils.css`.

---

## Display

| Class | Size | Weight | Letter Spacing |
| --- | --- | --- | --- |
| `text-display-96` | 96px | 800 | -0.05em |
| `text-display-80` | 80px | 800 | -0.045em |
| `text-display-72` | 72px | 800 | -0.04em |
| `text-display-64` | 64px | 800 | -0.04em |

## Heading

| Class | Size | Line Height | Letter Spacing |
| --- | --- | --- | --- |
| `text-heading-56` | 56px | 1.07 | -0.035em |
| `text-heading-48` | 48px | 1.1 | -0.03em |
| `text-heading-40` | 40px | 1.1 | -0.025em |
| `text-heading-32` | 32px | 1.15 | -0.02em |
| `text-heading-24` | 24px | 1.25 | -0.015em |
| `text-heading-20` | 20px | 1.3 | -0.01em |
| `text-heading-18` | 18px | 1.35 | -0.01em |
| `text-heading-16` | 16px | 1.4 | -0.008em |
| `text-heading-14` | 14px | 1.4 | -0.005em |

## Body

| Class | Size | Line Height |
| --- | --- | --- |
| `text-body-20` | 20px | 1.65 |
| `text-body-18` | 18px | 1.65 |
| `text-body-16` | 16px | 1.7 |
| `text-body-14` | 14px | 1.65 |
| `text-body-13` | 13px | 1.6 |

## Label

| Class | Size | Weight |
| --- | --- | --- |
| `text-label-16` | 16px | 500 |
| `text-label-14` | 14px | 500 |
| `text-label-13` | 13px | 500 |
| `text-label-12` | 12px | 500 |
| `text-label-11` | 11px | 500 |

## Caption

| Class | Size | Weight |
| --- | --- | --- |
| `text-caption-16` | 16px | 400 |
| `text-caption-14` | 14px | 400 |
| `text-caption-13` | 13px | 400 |
| `text-caption-12` | 12px | 400 |
| `text-caption-11` | 11px | 400 |

## Overline

| Class | Size | Weight | Letter Spacing |
| --- | --- | --- | --- |
| `text-overline-13` | 13px | 600 | 0.12em |
| `text-overline-12` | 12px | 600 | 0.12em |
| `text-overline-11` | 11px | 600 | 0.14em |
| `text-overline-10` | 10px | 600 | 0.16em |

## Code & Mono

| Class | Size | Family |
| --- | --- | --- |
| `text-code-16` | 15px | `--font-mono` |
| `text-code-14` | 13px | `--font-mono` |
| `text-code-12` | 11px | `--font-mono` |
| `text-mono-label-13` | 12px | `--font-mono` |
| `text-mono-label-12` | 11px | `--font-mono` |

## Button

| Class | Size | Weight |
| --- | --- | --- |
| `text-button-16` | 16px | 600 |
| `text-button-14` | 14px | 600 |
| `text-button-13` | 13px | 600 |

## Numeric

| Class | Size | Weight | Features |
| --- | --- | --- | --- |
| `text-numeric-16` | 16px | 500 | `tabular-nums` |
| `text-numeric-14` | 14px | 500 | `tabular-nums` |

## Utilities

| Class | Description |
| --- | --- |
| `text-balance` | `text-wrap: balance` — for headings |
| `text-pretty` | `text-wrap: pretty` — for paragraphs |