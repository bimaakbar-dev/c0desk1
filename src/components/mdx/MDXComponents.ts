// src/components/layout/MDXComponents.ts
import User from "./User.astro";
import Quote from "./Quote.astro";
import Code from "./Code.astro";
import Kbd from "./KBD.astro";
import Video from "./Video.astro";
import Card from "./Card.astro";
import CardGrid from "./CardGrid.astro";

export const components = {
  User,
  Quote,
  Code,
  Kbd,
  Video,
  Card,
  CardGrid,
};

export type MDXComponents = typeof components;
