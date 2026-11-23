import { atom } from "nanostores";
import type { AgentId } from "./studioBus";

export type Provider = "gemini" | "groq" | "openai-compatible";

export interface AgentConfig {
  enabled: boolean;
  provider: Provider;
  apiKeys: Record<Provider, string>;
  models: Record<Provider, string>;
  baseUrl: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  throttleMs: number;
  maxRetries: number;
  systemPrompt: string;
  assetsPerRun: number;
}

export const PROVIDER_DEFAULTS: Record<Provider, { baseUrl: string; model: string }> = {
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-3.8-flash",
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "openai/gpt-oss-120b",
  },
  "openai-compatible": { baseUrl: "", model: "" },
};

export const MODEL_PRESETS: Record<Provider, string[]> = {
  gemini: [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-3.8-live",
  ],
  groq: ["openai/gpt-oss-120b", "openai/gpt-oss-20b"],
  "openai-compatible": [],
};

const emptyApiKeys = (): Record<Provider, string> => ({
  gemini: "",
  groq: "",
  "openai-compatible": "",
});

const base = (agent: AgentId): AgentConfig => ({
  enabled: true,
  provider: "gemini",
  apiKeys: emptyApiKeys(),
  models: {
    gemini: "gemini-3.8-flash",
    groq: "openai/gpt-oss-120b",
    "openai-compatible": "",
  },
  baseUrl: PROVIDER_DEFAULTS.gemini.baseUrl,
  temperature: agent === "hera" ? 0.7 : 0.4,
  topP: 0.95,
  maxOutputTokens: 8192,
  throttleMs: 600,
  maxRetries: 3,
  systemPrompt: "",
  assetsPerRun: 3,
});

const DEFAULT_CONFIG: Record<AgentId, AgentConfig> = {
  hera: base("hera"),
  ares: base("ares"),
  hades: base("hades"),
};

const STORAGE_KEY = "c0desk1:configs:v2";

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

function migrateAgent(agentId: AgentId, raw: any): AgentConfig {
  const baseCfg = base(agentId);
  if (!raw || typeof raw !== "object") return baseCfg;

  const cfg: AgentConfig = {
    ...baseCfg,
    ...raw,
    apiKeys: { ...baseCfg.apiKeys },
    models: { ...baseCfg.models },
  };

  if (typeof raw.apiKey === "string" && raw.apiKey) {
    const p = (raw.provider ?? "gemini") as Provider;
    cfg.apiKeys[p] = raw.apiKey;
  }
  delete (cfg as any).apiKey;

  if (typeof raw.model === "string" && raw.model && !raw.models) {
    const p = (raw.provider ?? "gemini") as Provider;
    cfg.models[p] = raw.model;
  }
  delete (cfg as any).model;

  if (raw.apiKeys && typeof raw.apiKeys === "object") {
    for (const p of ["gemini", "groq", "openai-compatible"] as Provider[]) {
      if (typeof raw.apiKeys[p] === "string") cfg.apiKeys[p] = raw.apiKeys[p];
    }
  }

  if (raw.models && typeof raw.models === "object") {
    for (const p of ["gemini", "groq", "openai-compatible"] as Provider[]) {
      if (typeof raw.models[p] === "string") cfg.models[p] = raw.models[p];
    }
  }

  cfg.apiKeys.groq = "";
  if (!MODEL_PRESETS.groq.includes(cfg.models.groq)) {
    cfg.models.groq = PROVIDER_DEFAULTS.groq.model;
  }
  return cfg;
}

function load(): Record<AgentId, AgentConfig> {
  if (!canUseStorage()) return { ...DEFAULT_CONFIG };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      hera: migrateAgent("hera", parsed.hera),
      ares: migrateAgent("ares", parsed.ares),
      hades: migrateAgent("hades", parsed.hades),
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export const configsStore = atom<Record<AgentId, AgentConfig>>(load());

if (canUseStorage()) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configsStore.get()));
  } catch (e) {
    console.warn("[c0desk1] gagal memperbarui konfigurasi tersimpan", e);
  }

  configsStore.listen((v) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch (e) {
      console.warn("[c0desk1] gagal simpan config", e);
    }
  });
}

export function updateAgentConfig(agentId: AgentId, patch: Partial<AgentConfig>) {
  const cur = configsStore.get();
  const merged = { ...cur[agentId], ...patch };
  merged.apiKeys = { ...cur[agentId].apiKeys, ...(patch.apiKeys ?? {}) };
  merged.models = { ...cur[agentId].models, ...(patch.models ?? {}) };
  configsStore.set({ ...cur, [agentId]: merged });
}

export function getAgentConfig(agentId: AgentId): AgentConfig {
  return configsStore.get()[agentId];
}

export function getApiKey(cfg: AgentConfig): string {
  if (cfg.provider === "groq") return "server-managed";
  return cfg.apiKeys?.[cfg.provider] || "";
}

export function getModel(cfg: AgentConfig): string {
  return cfg.models?.[cfg.provider] || PROVIDER_DEFAULTS[cfg.provider].model;
}

export function resetAgentConfig(agentId: AgentId) {
  const cur = configsStore.get();
  configsStore.set({ ...cur, [agentId]: base(agentId) });
}

export function resetAllConfigs() {
  configsStore.set({
    hera: base("hera"),
    ares: base("ares"),
    hades: base("hades"),
  });
  if (canUseStorage()) window.localStorage.removeItem(STORAGE_KEY);
}
