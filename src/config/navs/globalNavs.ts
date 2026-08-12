import { 
  ROUTES, 
} from "../site";
import { 
    DOCS_PAGE, 
    BLOG_PAGE,
    ARCHIVE_PAGE,
    CONTACT_PAGE,
    ABOUT_PAGE
} from "../pages";

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

export const NAV = {
  navBar: [
    { label: DOCS_PAGE.title, href: ROUTES.docs, icon: "learn" },
    { label: BLOG_PAGE.title, href: ROUTES.blog, icon: "blog" },
    { label: ARCHIVE_PAGE.title, href: ROUTES.archive, icon: "ai-agent" },
  ] as NavItem[],
  mobileNavBar: [
    { label: DOCS_PAGE.title, href: ROUTES.docs, icon: "learn" },
    { label: BLOG_PAGE.title, href: ROUTES.blog, icon: "blog" },
    { label: ARCHIVE_PAGE.title, href: ROUTES.archive, icon: "ai-agent" },
  ] as NavItem[],
  footerBar: [
    {
      title: "Learn",
      items: [
        { label: DOCS_PAGE.title, href: ROUTES.docs },
      ],
    },
    {
      title: "Explore",
      items: [
        { label: BLOG_PAGE.title, href: ROUTES.blog },
        { label: ARCHIVE_PAGE.title, href: ROUTES.archive }
      ],
    },
    {
      title: "Connect",
      items: [
        { label: ABOUT_PAGE.title, href: ROUTES.about },
        { label: CONTACT_PAGE.title, href: ROUTES.contact },
      ],
    },
    {
      title: "Legal",
      items: [
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