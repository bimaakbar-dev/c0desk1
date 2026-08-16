---
title: "Introducing Stardux: A Modern Documentation and Blog Theme for Astro"
description: "Meet Stardux, an open-source Astro theme designed for building modern documentation sites and blogs."
pubDate: 2026-08-16
category: "Announcement"
cover:
  src: ../../../assets/images/og-image.webp
  alt: Stradocs Announcement
tags:
  - stardux
  - astro
  - open-source
  - documentation
draft: false
author:
  name: "Stardux Team"
  role: "Developer"
  url: "https://github.com/bimaakbar-dev"
  email: "hello@stardux.web.id"
seo:
  title: "Introducing Stardux"
  description: "Meet Stardux, an open-source Astro theme for building modern documentation sites and blogs."
  ogImage: ../../../assets/images/og-image.webp
  noIndex: false
---

Building a documentation site should not require starting from scratch.

Stardux is an open-source Astro theme designed to give developers a solid foundation for building documentation sites, blogs, and content-focused websites.

It combines a structured documentation system with a flexible blog, while keeping the project easy to understand, customize, and extend.

## Why Stardux?

Many documentation projects eventually need more than documentation.

A project may need a blog for announcements, a changelog for updates, a contact page, search, SEO, and other supporting pages. Building all of these pieces separately can quickly turn a simple documentation project into a collection of unrelated systems.

Stardux brings these pieces together in a single Astro project.

The goal is not to provide every possible feature. Instead, Stardux focuses on providing the essential foundations while leaving enough room for you to shape the site around your own project.

## Built with Astro

Astro is at the core of Stardux.

Its static-first architecture makes it well suited for documentation and content-heavy websites. Pages can be generated as static HTML while interactive features are added only where they are needed.

This allows Stardux to remain lightweight without sacrificing the flexibility needed for modern websites.

Stardux also uses Astro Content Collections to organize and validate documentation, blog posts, and other content.

## Documentation First

Documentation is one of the main reasons Stardux exists.

The theme provides a complete documentation experience with features such as:

- Organized sidebar navigation
- Table of contents
- Heading anchors
- Responsive layouts
- Full-text search
- Markdown and MDX support
- Custom content directives

The goal is to make writing and navigating documentation feel natural on both desktop and mobile devices.

## More Than Markdown

Standard Markdown is excellent for writing, but documentation often needs richer components.

Stardux extends the content experience with custom directives such as:

- Callouts
- Steps
- Tabs
- File trees
- Accordions
- Cards
- Quotes

These components allow you to create structured documentation while keeping the source content readable.

For example, an installation guide can use Steps, different package managers can be presented with Tabs, and important information can be highlighted with Callouts.

## A Blog Alongside Your Documentation

Documentation and blog content serve different purposes, but they often belong to the same website.

Stardux includes a built-in blog system for announcements, development updates, tutorials, and project-related articles.

The blog includes:

- Pagination
- Categories
- Tags
- Author information
- Publication dates
- Reading time
- RSS feeds
- SEO metadata

This makes it possible to keep your documentation and project updates together without introducing a separate blogging platform.

## Built for the Web

Stardux also includes the foundations needed for a production-ready content site.

SEO features include:

- Open Graph metadata
- Twitter Cards
- JSON-LD structured data
- Sitemap generation
- Robots.txt
- Search engine verification

The theme also includes a built-in light and dark theme system, responsive layouts, and a contact form integration.

## Easy to Customize

Stardux is designed to be customized rather than treated as a black box.

Most site-level configuration is centralized in `src/config/`, while reusable components live inside `src/components/`.

Content is separated from the application code through Astro Content Collections.

This structure makes it easier to change your site's identity, navigation, SEO settings, page content, and other configuration without modifying every component individually.

## What's Next?

Stardux is being developed as a foundation for developers who want a modern content site without having to build the entire system themselves.

The project will continue to evolve with improvements to its documentation experience, components, styling, and developer workflow.

If you are just getting started, begin with the [Quick Start](/docs/quick-start/) guide.

You can also explore the [Project Structure](/docs/project-structure/) and [Configuration](/docs/configuration/) guides to learn how Stardux is organized and customized.

Stardux is open source, and feedback, ideas, and contributions are always welcome.

Welcome to Stardux.
