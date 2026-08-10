// src/config/schema.ts
import { SITE, ORG, IMAGE } from "./site";

export const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: [SITE.name, "c0desk1"],
  url: SITE.url,
  description: SITE.description,
  inLanguage: SITE.lang || "id-ID",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

export const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORG.name,
  url: ORG.url,
  logo: {
    "@type": "ImageObject",
    url: ORG.logo,
    width: IMAGE.logo.width,
    height: IMAGE.logo.height,
  },
  sameAs: ORG.sameAs,
  contactPoint: {
    "@type": "ContactPoint",
    email: SITE.email,
    contactType: "customer support",
    availableLanguage: ["Indonesian", "English"],
  },
} as const;

export function schemaBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } as const;
}

export function schemaWebPage(opts: {
  title: string;
  description: string;
  url: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "PrivacyPolicy" | "TermsOfService";
  dateModified?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    caption?: string;
  };
}) {
  const LogoUrl = SITE.logo.startsWith("http")
    ? SITE.logo
    : `${SITE.url.replace(/\/$/, "")}${SITE.logo}`;

  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    inLanguage: SITE.lang,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
    },
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.image
      ? {
          image: {
            "@type": "ImageObject",
            url: opts.image.url,
            ...(opts.image.width ? { width: opts.image.width } : {}),
            ...(opts.image.height ? { height: opts.image.height } : {}),
            ...(opts.image.caption ? { caption: opts.image.caption } : {}),
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: LogoUrl,
        width: IMAGE.logo.width,
        height: IMAGE.logo.height,
      },
    },
  } as const;
}

export function schemaArticle(opts: {
  title: string;
  description: string;
  url: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    caption?: string;
  };
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
}) {
  const LogoUrl = SITE.logo.startsWith("http")
    ? SITE.logo
    : `${SITE.url.replace(/\/$/, "")}${SITE.logo}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    inLanguage: SITE.lang,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
    },
    ...(opts.image
      ? {
          image: {
            "@type": "ImageObject",
            url: opts.image.url,
            ...(opts.image.width ? { width: opts.image.width } : {}),
            ...(opts.image.height ? { height: opts.image.height } : {}),
            ...(opts.image.caption ? { caption: opts.image.caption } : {}),
          },
        }
      : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.authorName
      ? {
          author: {
            "@type": "Person",
            name: opts.authorName,
            url: opts.authorUrl || SITE.url,
          },
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
            logo: {
              "@type": "ImageObject",
              url: LogoUrl,
              width: IMAGE.logo.width,
              height: IMAGE.logo.height,
            },
          },
        }
      : {}),
  } as const;
}

export function schemaSoftwareApplication(opts: {
  name: string;
  description: string;
  url: string;
  image: string | string[];
  operatingSystem?: string;
  applicationCategory?: string;
  price?: string;
  priceCurrency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    operatingSystem: opts.operatingSystem || "All",
    applicationCategory: opts.applicationCategory || "WebApplication",
    offers: {
      "@type": "Offer",
      price: opts.price || "0",
      priceCurrency: opts.priceCurrency || "USD",
    },
  } as const;
}

export function schemaFAQ(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } as const;
}