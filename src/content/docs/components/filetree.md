---
slug: "filetree"
title: "File Tree"
description: "Display folder and file structures with icons, highlights, and comments."
category: "Components"
order: 5
draft: false
author:
  name: "Stradocs Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stradocs.web.id"
lastUpdated: 2026-08-09T02:40:00Z
seo:
  title: "File Tree"
  description: "Display folder and file structures with icons, highlights and comments."
  noIndex: false
---

Filetree renders a folder and file structure with automatic icons, collapsible folders, highlights, and comments. Also Works in both `.md` and `.mdx` files.

## Syntax

```md
:::filetree
- src/
  - components/
    - Header.astro
    - Footer.astro
  - pages/
    - index.astro
    - blog/
      - [...slug].astro
- package.json
- **README.md** # highlighted file
- ...
:::
```

::::card[Preview]
:::filetree
- src/
  - components/
    - Header.astro
    - Footer.astro
  - pages/
    - index.astro
    - blog/
      - [...slug].astro
- package.json
- **README.md** # highlighted file
- ...
:::
::::

## Icons for extension

:::filetree
- mega-project/
  - .dockerignore
  - .editorconfig
  - .env
  - .eslintrc
  - .git
  - .gitattributes
  - .gitignore
  - .npmrc
  - .nvmrc
  - .pnpmrc
  - .prettierrc
  - .yarnrc
  - .zshrc
  - CMakeLists.txt
  - Dockerfile
  - Makefile
  - README
  - LICENSE
  - package-lock.json
  - build.gradle
  - src/
    - index.adoc
    - app.ai
    - app.apk
    - data.arrow
    - script.asc
    - main.asm
    - main.astro
    - video.avi
    - config.bash
    - refs.bib
    - model.blend
    - image.bmp
    - main.c
    - main.cpp
    - main.h
    - main.hpp
    - config.cbl
    - cert.cer
    - module.cjs
    - core.cl
    - program.cob
    - script.crt
    - styles.css
    - data.csv
    - Program.cs
    - styles.desktop
    - code.diff
    - module.dll
    - installer.dmg
    - backup.dmp
    - data.duckdb
    - lib.dylib
    - app.ear
    - template.ejs
    - module.ex
    - utils.exs
    - setup.exe
    - main.f
    - scene.fbx
    - data.feather
    - prototype.fig
    - video.flv
    - main.for
    - package.fs
    - main.go
    - script.groovy
    - template.handlebars
    - layout.hbs
    - photo.heic
    - index.htm
    - page.html
    - favicon.ico
    - meeting.ics
    - disk.iso
    - app.jar
    - main.java
    - main.jl
    - photo.jpg
    - photo.jpeg
    - app.js
    - config.json
    - component.jsx
    - private.key
    - main.kt
    - core.lisp
    - debug.log
    - debug.logs
    - main.lua
    - track.m4a
    - README.md
    - README.markdown
    - doc.mdx
    - data.mdb
    - module.mjs
    - video.mkv
    - id.mo
    - video.mp4
    - template.mustache
    - main.obj
    - module.o
    - meeting.org
    - fix.patch
    - manual.pdf
    - cert.pem
    - main.php
    - script.pl
    - config.plist
    - module.pm
    - image.png
    - messages.pot
    - design.psd
    - public.pub
    - view.pug
    - view.jade
    - main.py
    - data.rar
    - main.rb
    - cache.rdb
    - main.rs
    - main.r
    - main.s
    - my.service
    - deploy.sh
    - ui.sketch
    - lib.so
    - contract.sol
    - schema.sql
    - part.stl
    - App.svelte
    - logo.svg
    - main.swift
    - paper.tex
    - state.tfstate
    - config.toml
    - index.ts
    - data.tsv
    - component.tsx
    - custom.ttf
    - notes.txt
    - notes.text
    - main.vb
    - App.vue
    - webapp.war
    - module.wasm
    - custom.woff
    - custom.woff2
    - config.xml
    - config.yaml
    - config.yml
    - main.zig
    - archive.zip
  - backend/
    - Main.java
    - Program.cs
    - app.php
    - server.rb
    - main.lua
    - stats.r
    - app.swift
    - screen.kt
    - module.ex
    - utils.exs
    - core.clj
    - Main.groovy
    - build.gradle
    - app.dart
    - main.cpp
    - main.h
    - main.hpp
  - libs/
    - library.jar
    - module.dll
    - lib.so
    - lib.dylib
    - module.o
    - app.exe
    - app.wasm
:::

## Features

| Syntax | Description |
| --- | --- |
| `folder/` | Trailing slash marks a folder |
| `file.ext` | Any extension marks a file |
| `**name**` | Bold highlights the item with accent color |
| `# comment` or `// comment` | Inline comment shown in muted color |
| `...` | Placeholder for hidden content |

## Notes

- Folders with children render as collapsible `<details>` elements
- Icons are applied automatically based on file extension
- Indentation (2 or 4 spaces) determines hierarchy
- Must be written as a block-level element, not inline