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
  - README
  - LICENSE
  - Makefile
  - Dockerfile
  - docker-compose.yml
  - .env
  - .gitignore
  - .gitattributes
  - .dockerignore
  - .editorconfig
  - .npmrc
  - .yarnrc
  - .pnpmrc
  - .nvmrc
  - .prettierrc
  - .eslintrc
  - src/
    - main.js
    - main.mjs
    - main.cjs
    - App.jsx
    - App.tsx
    - index.ts
    - main.jl
    - main.zig
    - main.sol
    - main.vb
    - main.f
    - main.for
    - main.asm
    - main.s
    - main.lisp
    - main.cl
    - main.cob
    - main.cbl
    - components/
      - Header.vue
      - Button.svelte
      - Footer.astro
      - Sidebar.html
      - content.htm
      - template.ejs
      - layout.hbs
      - layout.handlebars
      - view.pug
      - view.jade
      - email.mustache
      - doc.mdx
    - lib/
      - helper.py
      - helper.pyc
      - notebook.ipynb
      - service.java
      - service.class
      - router.go
      - parser.rs
      - controller.rb
      - handler.php
      - logic.lua
      - stats.r
      - app.swift
      - screen.kt
      - module.ex
      - utils.exs
      - core.clj
  - backend/
    - main.c
    - main.cpp
    - main.h
    - main.hpp
    - Program.cs
    - Startup.fs
    - app.dart
    - server.groovy
    - build.gradle
    - main.pl
    - main.pm
  - configs/
    - settings.yaml
    - settings.yml
    - config.toml
    - data.xml
    - manifest.json
    - meta.json5
    - app.properties
    - defaults.ini
    - user.cfg
    - terraform.tf
    - variables.tfvars
    - nginx.conf
    - .plist
    - .desktop
    - my.service
    - .tfstate
  - database/
    - schema.sql
    - data.sqlite
    - dump.db
    - export.parquet
    - table.avro
    - data.duckdb
    - cache.rdb
    - old.mdb
    - backup.dmp
    - output.tsv
    - data.feather
    - data.arrow
  - public/
    - images/
      - photo.png
      - photo.jpg
      - photo.jpeg
      - animation.gif
      - image.webp
      - image.avif
      - favicon.ico
      - icon.icns
      - logo.svg
      - design.psd
      - vector.ai
      - prototype.fig
      - ui.sketch
      - model.blend
      - part.stl
      - scene.obj
      - character.fbx
      - apple.heic
      - old.bmp
    - videos/
      - demo.mp4
      - intro.webm
      - raw.mov
      - movie.mkv
      - old.avi
      - flash.flv
    - audio/
      - song.mp3
      - voice.wav
      - music.flac
      - sound.ogg
      - track.m4a
      - voice.aac
    - fonts/
      - custom.ttf
      - custom.otf
      - custom.woff
      - custom.woff2
      - icon.eot
  - certificates/
    - cert.pem
    - server.crt
    - client.cer
    - private.key
    - public.pub
    - signature.asc
  - binaries/
    - app.o
    - lib.so
    - lib.dylib
    - module.dll
    - setup.exe
    - module.wasm
  - archives/
    - source.zip
    - archive.7z
    - backup.tar
    - compressed.gz
    - package.bz2
    - disk.img.xz
    - app-release.apk
    - app.aab
    - debian.deb
    - package.rpm
    - data.rar
    - disk.iso
    - installer.dmg
    - library.jar
    - webapp.war
    - enterprise.ear
  - docs/
    - manual.pdf
    - guide.md
    - info.markdown
    - notes.rst
    - debug.log
    - readme.txt
    - letter.rtf
    - report.docx
    - sheet.xlsx
    - data.xls
    - paper.tex
    - refs.bib
    - user.adoc
    - book.asciidoc
    - agenda.org
    - meeting.ics
    - messages.pot
    - id.po
    - id.mo
  - patches/
    - fix.patch
    - changes.diff
  - scripts/
    - deploy.sh
    - setup.bash
    - alias.zsh
    - install.ps1
    - run.bat
    - server.awk
    - text.sed
  - misc/
    - random.xyz
    - unknown.abc
    - file_without_extension
    - .hidden-config
    - .DS_Store
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