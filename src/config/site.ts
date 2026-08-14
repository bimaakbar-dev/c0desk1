// src/config/site.ts
import Logo from "../assets/images/logo.webp";
import Thumbnails from "../assets/images/cover.svg";
import Avatar from "../assets/images/author.jpg";
import Og from "../assets/images/og-image.svg";

const env = import.meta.env;

export const SITE = {
  name: "Unloyd",
  tagline: "A modern documentation template",
  description: "A clean, modern, and customizable documentation template built with Astro",
  url: env.PUBLIC_SITE_URL || "https://galevior.pages.dev",
  email: "hello@unloyd.web.id",

  locale: "id-ID",
  lang: "id",
  dir: "ltr",
  charset: "utf-8",
  themeColor: "#0a0a0a",
  bgColor: "#000000",
  foundingYear: 2026,
  logo: Logo.src,
  ogImage: Og.src,
  readingTimeLabel: "min read",
} as const;

export const ORG = {
  name: SITE.name,
  url: SITE.url,
  logo: SITE.logo,
  sameAs: [] as string[],
} as const;

export const ROUTES = {
  home: "/",
  docs: "/docs",
  blog: "/blog",
  archive: "/blog/archive",
  about: "/about",
  contact: "/contact",
  cookie: "/cookie-policy",
  privacy: "/privacy-policy",
  terms: "/terms-of-service",
  "404": "/404",
  sitemap: "/sitemap.xml",
  manifest: "/manifest.json",
  robots: "/robots.txt",
  feedAtom: "/feed.atom",
  feedJson: "/feed.json",
  rss: "/rss.xml",
} as const;

export const IMAGE = {
  og: {
    width: 1200,
    height: 630,
    placeholder: Og.src,
  },
  thumbnail: {
    width: 600,
    height: 400,
    quality: 80,
    placeholder: Thumbnails.src,
  },
  avatar: {
    width: 96,
    height: 96,
    quality: 80,
    placeholder: Avatar.src,
  },
  logo: {
    width: 512,
    height: 512,
  },
} as const;

export const PAGINATION = {
  postsPerPage: 9,
  postsPerFeed: 20,
  postsPerSitemap: 1000,
} as const;