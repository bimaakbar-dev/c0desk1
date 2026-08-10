// src/config/site.ts
import Logo from "../assets/images/logo.webp";
import Thumbnails from "../assets/images/cover.svg";
import Avatar from "../assets/images/author.jpg";
import Og from "../assets/images/og-image.svg";

const env = import.meta.env;

type NavItem = {
  label: string;
  href: string;
  isExternal?: boolean;
  icon?: string;
  children?: NavItem[];
};

type FooterNav = {
  title?: string;
  items: NavItem[];
};

type Socials = {
  href: string;
  label?: string;
  icon?: string;
  isExternal?: boolean;
};

export const SITE = {
  name: env.PUBLIC_SITE_NAME || "Unloyd",
  tagline: env.PUBLIC_SITE_TAGLINE || "A modern documentation template",
  description: env.PUBLIC_SITE_DESCRIPTION || "A clean, modern, and customizable documentation template built with Astro, TailwindCSS and Sätteri.",
  url: env.PUBLIC_SITE_URL || "https://c0desk1.my.id",
  email: env.PUBLIC_SITE_EMAIL || "hello@unloyd.web.id",

  locale: "id-ID",
  lang: "id",
  dir: "ltr",
  charset: "utf-8",
  themeColor: "#0a0a0a",
  bgColor: "#000000",
  foundingYear: 2026,
  logo: Logo.src,
  ogImage: Og.src,
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
  sitemap: "/sitemap.xml",
  manifest: "/manifest.json",
  robots: "/robots.txt",
  feedAtom: "/feed.atom",
  feedJson: "/feed.json",
  rss: "/rss.xml",
} as const;

export const NAV = {
  navBar: [
    { label: "Documentation", href: ROUTES.docs, icon: "learn" },
    { label: "Blog", href: ROUTES.blog, icon: "blog" },
    { label: "Archive", href: ROUTES.archive, icon: "ai-agent" },
  ] as NavItem[],
  mobileNavBar: [
    { label: "Documentation", href: ROUTES.docs, icon: "learn" },
    { label: "Blog", href: ROUTES.blog, icon: "blog" },
    { label: "Archive", href: ROUTES.archive, icon: "ai-agent" },
  ] as NavItem[],
  footerBar: [
    {
      title: "Learn",
      items: [
        { label: "Docs", href: ROUTES.docs },
      ],
    },
    {
      title: "Explore",
      items: [
        { label: "Blog", href: ROUTES.blog },
        { label: "Archive", href: ROUTES.archive }
      ],
    },
    {
      title: "Connect",
      items: [
        { label: "About", href: ROUTES.about },
        { label: "Contact", href: ROUTES.contact },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Cookie Policy", href: ROUTES.cookie },
        { label: "Privacy Policy", href: ROUTES.privacy },
        { label: "Terms of Service", href: ROUTES.terms },
      ],
    },
    {
      title: "Community",
      items: [
        { label: "GitHub", href: "https://github.com", isExternal: true },
      ],
    },
  ] as FooterNav[],
  Social: [
    { label: "Twitter", href: "https://twitter.com/your-username", icon: "twitter" },
  ] as Socials[],
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