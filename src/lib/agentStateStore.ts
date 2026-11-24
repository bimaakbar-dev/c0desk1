import { atom } from "nanostores";
import type { HeraInsight, PromptPlan } from "./heraAgent";

export interface StudioState {
  hera: {
    lastTopic: string | null;
    lastInsight: HeraInsight | null;
    lastPlans: PromptPlan[] | null;
    lastRunAt: number | null;
  };
  ares: {
    totalPrompts: number;
    lastRunAt: number | null;
  };
  hades: {
    totalQC: number;
    lastIssueCount: number;
    lastRunAt: number | null;
  };
}

export const agentStateStore = atom<StudioState>({
  hera: { lastTopic: null, lastInsight: null, lastPlans: null, lastRunAt: null },
  ares: { totalPrompts: 0, lastRunAt: null },
  hades: { totalQC: 0, lastIssueCount: 0, lastRunAt: null },
});

export function recordHera(topic: string, insight: HeraInsight, plans: PromptPlan[]) {
  const s = agentStateStore.get();
  agentStateStore.set({
    ...s,
    hera: { lastTopic: topic, lastInsight: insight, lastPlans: plans, lastRunAt: Date.now() },
  });
}

export function recordAres(count: number) {
  const s = agentStateStore.get();
  agentStateStore.set({
    ...s,
    ares: { totalPrompts: s.ares.totalPrompts + count, lastRunAt: Date.now() },
  });
}

export function recordHades(count: number, issues: number) {
  const s = agentStateStore.get();
  agentStateStore.set({
    ...s,
    hades: { totalQC: s.hades.totalQC + count, lastIssueCount: issues, lastRunAt: Date.now() },
  });
}
