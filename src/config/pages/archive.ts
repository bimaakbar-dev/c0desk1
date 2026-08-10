// src/config/pages/archive.ts

import { SITE } from "../site";

export const ARCHIVE_PAGE = {
  title: "Archive",
  description: "Complete archive of all blog articles by year and month.",

  breadcrumb: {
    home: "Home",
    blog: "Blog",
  },

  heatmap: {
    label: "Activity Log",
    emptyLabel: "No articles yet",
    emptyDescription: "The archive will be filled once the first article is published.",
    legendLow: "Low",
    legendHigh: "High",
    jumpLabel: "Jump to Year",
    postsLabel: (count: number) => count === 1 ? "post" : "posts",
    articlesLabel: (count: number) => `${count} articles published this year.`,
  },

  months: {
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },

  weekdays: {
    short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },

  colors: {
    level0: "bg-(--bg-muted) ring-1 ring-(--border-subtle) ring-inset",
    level1: "bg-(--accent)/30 ring-1 ring-(--accent)/20 ring-inset",
    level2: "bg-(--accent)/70 ring-1 ring-(--accent)/50 ring-inset",
    level3: "bg-(--accent)",
  },

  locale: SITE.locale,
} as const;