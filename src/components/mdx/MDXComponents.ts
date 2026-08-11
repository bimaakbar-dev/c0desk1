// src/components/layout/MDXComponents.ts
import User from "./User.astro";
import Blockquote from "./Blockquote.astro";
import Changelog from "./Changelog.astro";
import Code from "./Code.astro";
import Kbd from "./KBD.astro";
import Video from "./Video.astro";
import LinkCard from "./LinkCard.astro";
import CardGrid from "./CardGrid.astro";

export const components = {
  User,
  ChangelogContainer: Changelog,
  ChangelogItem: Changelog,
  Code,
  Kbd,
  Video,
  Blockquote,
  LinkCard,
  CardGrid,
};

export type MDXComponents = typeof components;
