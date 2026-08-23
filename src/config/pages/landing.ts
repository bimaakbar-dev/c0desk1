// src/config/pages/landing.ts

export const HOME_PAGE = {
  title: "Home",
} as const;

export const features = [
  {
    icon: "zap",
    title: "Lightning Fast",
    desc: "Built with Astro for near-instant page loads.",
  },
  {
    icon: "shield",
    title: "Accessible",
    desc: "Follows WCAG accessibility standards out of the box.",
  },
  {
    icon: "layout",
    title: "Ready to Use",
    desc: "Complete with navigation, search, and dark mode.",
  },
  {
    icon: "github",
    title: "Open Source",
    desc: "Fully customizable and free to use.",
  },
] as const;
