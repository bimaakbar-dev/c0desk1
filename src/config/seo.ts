// src/config/seo.ts
import { 
  SITE, 
  IMAGE 
} from "./site";

const env = import.meta.env;

export const SEO = {
  titleDefault: SITE.name,
  titleTemplate: `%s | ${SITE.name}`,
  titleMaxLength: 60,
  description: SITE.description,
  descriptionMaxLength: 160,
  canonical: SITE.url,
  ogImage: SITE.ogImage,
  ogImageWidth: IMAGE.og.width,
  ogImageHeight: IMAGE.og.height,
  ogImageAlt: SITE.name,
  twitterCard: "summary_large_image" as const,
  twitterSite: "@adogen_tool",
  twitterCreator: "@adogen_tool",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxVideoPreview: -1,
      maxImagePreview: "large" as const,
      maxSnippet: -1,
    },
  },
  verification: {
    google: env.PUBLIC_VERIFICATION_GOOGLE || "",
    bing: env.PUBLIC_VERIFICATION_BING || "",
    yandex: env.PUBLIC_VERIFICATION_YANDEX || "",
  },
  ads: {
    google: env.PUBLIC_ADS_GOOGLE || "",
    yandex: env.PUBLIC_ADS_YANDEX || "",
    monetag: env.PUBLIC_ADS_MONETAG || "",
  },
  analytics: {
    google: env.PUBLIC_ANALYTICS_GOOGLE || "",
    yandex: env.PUBLIC_ANALYTICS_YANDEX || "",
  },
} as const;

export const OG = {
  type: "website" as const,
  siteName: SITE.name,
  locale: SITE.locale,
  image: SEO.ogImage,
  imageWidth: SEO.ogImageWidth,
  imageHeight: SEO.ogImageHeight,
  imageAlt: SEO.ogImageAlt,
} as const;

export const TWITTER = {
  card: SEO.twitterCard,
  site: SEO.twitterSite,
  creator: SEO.twitterCreator,
} as const;

export function buildMeta(opts: {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  nofollow?: boolean;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  keywords?: string[];
}) {
  const title = opts.title
    ? SEO.titleTemplate.replace("%s", opts.title).slice(0, SEO.titleMaxLength + 20)
    : SEO.titleDefault;
  const description = (opts.description ?? SEO.description).slice(0, SEO.descriptionMaxLength);
  const canonical = opts.canonical ?? SEO.canonical;
  const ogImage = opts.ogImage ?? SEO.ogImage;
  const ogImageAlt = opts.ogImageAlt ?? SEO.ogImageAlt;
  const ogType = opts.ogType ?? OG.type;
  const noindex = opts.noindex ?? !SEO.robots.index;
  const nofollow = opts.nofollow ?? !SEO.robots.follow;

  const robotsContent = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
    "max-snippet:-1",
    "max-image-preview:large",
    "max-video-preview:-1",
  ].join(", ");

  return {
    title,
    description,
    canonical,
    robots: robotsContent,
    keywords: opts.keywords?.join(", ") ?? "",
    og: {
      title,
      description,
      url: canonical,
      type: ogType,
      siteName: OG.siteName,
      locale: OG.locale,
      image: ogImage,
      imageWidth: OG.imageWidth,
      imageHeight: OG.imageHeight,
      imageAlt: ogImageAlt,
      ...(opts.datePublished ? { publishedTime: opts.datePublished } : {}),
      ...(opts.dateModified ? { modifiedTime: opts.dateModified } : {}),
      ...(opts.authorName ? { author: opts.authorName } : {}),
    },
    twitter: {
      card: TWITTER.card,
      site: TWITTER.site,
      creator: TWITTER.creator,
      title,
      description,
      image: ogImage,
      imageAlt: ogImageAlt,
    },
  } as const;
}