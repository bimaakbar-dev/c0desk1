// src/config/pages/contact.ts
import { SITE } from "@/consts";

export const CONTACT_PAGE = {
  title: "Contact",
  description:
    "Have a question, suggestion, or just want to say hello? Fill out the form below and we'll get back to you within 24 hours.",

  hero: {
    title: "Get in Touch",
    description:
      "We'd love to hear from you! Whether you have a question about the template, a feature request, or just want to say hi, feel free to reach out.",
  },

  contact: {
    email: SITE.email,
    social: [
      {
        name: "GitHub",
        url: "https://github.com",
        icon: "github",
      },
      {
        name: "Twitter",
        url: "https://twitter.com",
        icon: "twitter",
      },
    ],
  },
} as const;
