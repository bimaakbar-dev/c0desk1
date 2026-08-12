// src/config/pages/blog.ts
import { SITE } from "../site";

export const BLOG_PAGE = {
  title: "Blog",
  description: "Latest articles, tutorials and updates.",
  featuredLabel: "Featured",
  noPosts: {
    title: "No posts yet",
    description: "Check back soon for new articles.",
  },
  readMore: "Read more",
  readingTime: "min read",
  locale: SITE.locale,
} as const;