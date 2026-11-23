import { atom } from "nanostores";

export const DAILY_LIMIT = 300;

export interface QuotaState {
  date: string;
  used: number;
}

const STORAGE_KEY = "c0desk1:quota";

const today = () => new Date().toISOString().slice(0, 10);

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

function load(): QuotaState {
  if (!canUseStorage()) return { date: today(), used: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today(), used: 0 };
    const parsed = JSON.parse(raw) as QuotaState;
    if (parsed.date !== today()) return { date: today(), used: 0 };
    return parsed;
  } catch {
    return { date: today(), used: 0 };
  }
}

export const quotaStore = atom<QuotaState>(load());

if (canUseStorage()) {
  quotaStore.listen((v) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch {}
  });
}

export function checkQuota(): {
  ok: boolean;
  used: number;
  limit: number;
  remaining: number;
} {
  let s = quotaStore.get();
  if (s.date !== today()) {
    s = { date: today(), used: 0 };
    quotaStore.set(s);
  }
  return {
    ok: s.used < DAILY_LIMIT,
    used: s.used,
    limit: DAILY_LIMIT,
    remaining: DAILY_LIMIT - s.used,
  };
}

export function incrementQuota(n = 1) {
  const s = quotaStore.get();
  if (s.date !== today()) {
    quotaStore.set({ date: today(), used: n });
  } else {
    quotaStore.set({ ...s, used: s.used + n });
  }
}

export function resetQuotaToday() {
  quotaStore.set({ date: today(), used: 0 });
}