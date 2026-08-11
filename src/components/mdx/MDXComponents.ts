// src/components/layout/MDXComponents.ts
import User from "./User.astro";
import Quote from "./Quote.astro";
import Changelog from "./Changelog.astro";
import Code from "./Code.astro";
import Kbd from "./KBD.astro";
import Video from "./Video.astro";
import LinkCard from "./LinkCard.astro";
import CardGrid from "./CardGrid.astro";

export const components = {
  User,
  Quote,
  ChangelogContainer: Changelog,
  ChangelogItem: Changelog,
  Code,
  Kbd,
  Video,
  LinkCard,
  CardGrid,
};

export type MDXComponents = typeof components;
