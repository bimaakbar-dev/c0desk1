import { atom } from "nanostores";
import type { AgentId } from "./studioBus";

export interface LogEntry {
  id: number;
  ts: number;
  level: "info" | "warn" | "error";
  agent?: AgentId;
  text: string;
}

export const logStore = atom<LogEntry[]>([]);

export function pushLog(e: Omit<LogEntry, "id" | "ts">) {
  logStore.set(
    [...logStore.get(), { id: Date.now() + Math.random(), ts: Date.now(), ...e }].slice(-200)
  );
}

export function clearLog() {
  logStore.set([]);
}