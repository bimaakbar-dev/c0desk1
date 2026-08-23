// src/config/pages/about.ts
import { ROUTES } from "@/consts";

export const ABOUT_PAGE = {
  title: "About Us",
  description: "Learn more about this project and the team behind it.",

  hero: {
    title: "A Modern Documentation Template",
    description:
      "This is a customizable documentation template built with Astro, TailwindCSS, and Sätteri. It's designed to help you create beautiful documentation quickly.",
    primaryAction: {
      label: "Get Started",
      href: ROUTES.docs,
    },
    secondaryAction: {
      label: "View on GitHub",
      href: "https://github.com/bimaakbar-dev/stradocs",
    },
  },

  features: [
    {
      icon: "sparkle",
      title: "Modern Stack",
      description:
        "Built with Astro, TailwindCSS, and Sätteri for a fast, modern, and customizable documentation experience.",
    },
    {
      icon: "users",
      title: "Community Driven",
      description:
        "Open source and community-focused. Contributions and feedback are always welcome.",
    },
    {
      icon: "rocket",
      title: "Ready to Deploy",
      description:
        "Deploy to Cloudflare Pages, Vercel, Netlify, or any static hosting provider with ease.",
    },
  ],

  team: {
    title: "The Team",
    description:
      "This project is maintained by a small team of passionate developers and designers.",
    members: [
      {
        name: "Your Name",
        role: "Founder & Lead Developer",
        avatar:
          "https://ui-avatars.com/api/?name=Your+Name&background=0a0a0a&color=ffffff&size=88&bold=true",
        social: "https://github.com/your-username",
      },
      {
        name: "Contributor 1",
        role: "Designer",
        avatar:
          "https://ui-avatars.com/api/?name=Contributor+1&background=0a0a0a&color=ffffff&size=88&bold=true",
        social: "https://github.com",
      },
      {
        name: "Contributor 2",
        role: "Developer",
        avatar:
          "https://ui-avatars.com/api/?name=Contributor+2&background=0a0a0a&color=ffffff&size=88&bold=true",
        social: "https://github.com",
      },
    ],
  },

  cta: {
    title: "Ready to Get Started?",
    primaryAction: {
      label: "View Documentation",
      href: ROUTES.docs,
    },
    secondaryAction: {
      label: "Contact Us",
      href: ROUTES.contact,
    },
  },
} as const;
