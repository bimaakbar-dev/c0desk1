---
slug: "video"
title: "Video"
description: "Embed video from YouTube, Vimeo, or a local file."
category: "Components"
order: 11
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
lastUpdated: 2026-08-09T11:15:00Z
seo:
  title: "Video"
  description: "Embed video from YouTube, Vimeo, or a local file."
  noIndex: false
---

Video embeds a YouTube, Vimeo, or local video file. Platform is detected automatically from the URL.

---

## Syntax

```md
::video[https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ]
```

## Preview

::video[https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ]

## Supported Platforms

| Platform | Format |
| --- | --- |
| YouTube | `youtube.com/watch?v=ID` or `youtu.be/ID` |
| YouTube Shorts | `youtube.com/shorts/ID` — embedded as 9:16 |
| Vimeo | `vimeo.com/123456789` |
| Local file | `/videos/file.mp4` — renders as native `<video>` |

## Attributes

| Attribute | Description |
| --- | --- |
| `width` | Video width (default: `100%`) |
| `height` | Video height (default: `400`) |
| `title` | Accessibility label (default: `"Video embed"`) |

## Notes

- Renders with a 16:9 aspect ratio by default
- Local files use a native `<video>` element
- `title` is used by screen readers