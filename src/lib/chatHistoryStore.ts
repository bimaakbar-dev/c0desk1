import { atom } from "nanostores";
import type { AgentId } from "./studioBus";

export interface ChatTurn {
  role: "user" | "agent";
  content: string;
  ts: number;
}

const STORAGE_KEY = "c0desk1:chat-history";
const MAX_TURNS = 20;

function canUseStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined" &&
      typeof window.localStorage.setItem === "function"
    );
  } catch {
    return false;
  }
}

function load(): Record<AgentId, ChatTurn[]> {
  const empty: Record<AgentId, ChatTurn[]> = { hera: [], ares: [], hades: [] };
  if (!canUseStorage()) return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      hera: Array.isArray(parsed.hera) ? parsed.hera : [],
      ares: Array.isArray(parsed.ares) ? parsed.ares : [],
      hades: Array.isArray(parsed.hades) ? parsed.hades : [],
    };
  } catch {
    return empty;
  }
}

export const chatHistoryStore = atom<Record<AgentId, ChatTurn[]>>(load());

if (canUseStorage()) {
  chatHistoryStore.listen((v) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch {}
  });
}

export function appendTurn(agent: AgentId, turn: ChatTurn) {
  const cur = chatHistoryStore.get();
  const updated = [...cur[agent], turn].slice(-MAX_TURNS);
  chatHistoryStore.set({ ...cur, [agent]: updated });
}

export function getHistory(agent: AgentId): ChatTurn[] {
  return chatHistoryStore.get()[agent];
}

export function clearHistory(agent?: AgentId) {
  if (agent) {
    const cur = chatHistoryStore.get();
    chatHistoryStore.set({ ...cur, [agent]: [] });
  } else {
    chatHistoryStore.set({ hera: [], ares: [], hades: [] });
  }
}