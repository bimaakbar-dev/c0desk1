import { useState } from "react";
import { useStore } from "@nanostores/react";
import {
  configsStore,
  updateAgentConfig,
  resetAgentConfig,
  PROVIDER_DEFAULTS,
  MODEL_PRESETS,
  type AgentConfig,
  type Provider,
} from "../lib/agentConfigStore";
import { AGENT_META, type AgentId } from "../lib/studioBus";
import { listAvailableModels, testConnection } from "../lib/providers";
import { pushLog } from "../lib/logStore";
import { clearHistory } from "../lib/chatHistoryStore";

interface Props {
  agentId: AgentId;
  onClose: () => void;
}

const PROVIDER_LABEL: Record<Provider, string> = {
  gemini: "Gemini",
  groq: "Groq",
  "openai-compatible": "Custom",
};

const PROVIDER_PLACEHOLDER: Record<Provider, string> = {
  gemini: "AIza...",
  groq: "gsk_...",
  "openai-compatible": "API key provider",
};

export default function SettingsModal({ agentId, onClose }: Props) {
  const all = useStore(configsStore);
  const saved = all[agentId];
  const meta = AGENT_META[agentId];

  const [draft, setDraft] = useState<AgentConfig>({
    ...saved,
    apiKeys: { ...saved.apiKeys },
    models: { ...saved.models },
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const patch = (p: Partial<AgentConfig>) => setDraft((d) => ({ ...d, ...p }));

  const currentKey = draft.apiKeys[draft.provider] || "";
  const currentModel = draft.models[draft.provider] || PROVIDER_DEFAULTS[draft.provider].model;

  const setCurrentKey = (key: string) => {
    setDraft((d) => ({
      ...d,
      apiKeys: { ...d.apiKeys, [d.provider]: key },
    }));
  };

  const setCurrentModel = (model: string) => {
    setDraft((d) => ({
      ...d,
      models: { ...d.models, [d.provider]: model },
    }));
  };

  const changeProvider = (provider: Provider) => {
    const def = PROVIDER_DEFAULTS[provider];
    setDraft((d) => ({
      ...d,
      provider,
      baseUrl: def.baseUrl,
    }));
    setTestResult(null);
  };

  const save = () => {
    updateAgentConfig(agentId, draft);
    pushLog({ level: "info", agent: agentId, text: "Konfigurasi disimpan." });
    onClose();
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(draft);
    setTestResult({ ok: res.ok, message: `${res.message} (${res.latencyMs}ms)` });
    pushLog({
      level: res.ok ? "info" : "error",
      agent: agentId,
      text: `Test koneksi: ${res.message}`,
    });
    setTesting(false);
  };

  const reset = () => {
    if (!window.confirm(`Reset konfigurasi ${meta.name} (termasuk semua API key)?`)) return;
    resetAgentConfig(agentId);
    const fresh = configsStore.get()[agentId];
    setDraft({ ...fresh, apiKeys: { ...fresh.apiKeys }, models: { ...fresh.models } });
    setTestResult(null);
  };

  const wipeHistory = () => {
    if (!window.confirm(`Hapus riwayat chat dengan ${meta.name}?`)) return;
    clearHistory(agentId);
    pushLog({ level: "info", agent: agentId, text: "Riwayat chat dibersihkan." });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: meta.accent }}
            />
            <div>
              <h2 className="text-sm font-semibold">Kontrol {meta.name}</h2>
              <p className="text-[10px] text-muted-foreground">Peran: {meta.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Aktifkan agent</p>
              <p className="text-[10px] text-muted-foreground">
                Jika dimatikan, agent tidak dipanggil pipeline.
              </p>
            </div>
            <button
              onClick={() => patch({ enabled: !draft.enabled })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                draft.enabled ? "bg-emerald-500" : "bg-muted"
              }`}
              aria-pressed={draft.enabled}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  draft.enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">Provider</label>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {(["gemini", "groq", "openai-compatible"] as Provider[]).map((p) => {
                const hasKey = !!(draft.apiKeys[p] || "").trim();
                return (
                  <button
                    key={p}
                    onClick={() => changeProvider(p)}
                    className={`relative px-2 py-1.5 text-[11px] rounded-lg border transition-colors ${
                      draft.provider === p
                        ? "border-white/25 bg-white/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-white/15"
                    }`}
                  >
                    {PROVIDER_LABEL[p]}
                    {hasKey && (
                      <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">
              API Key · {PROVIDER_LABEL[draft.provider]}
            </label>
            <div className="relative mt-1">
              <input
                type={showKey ? "text" : "password"}
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                placeholder={PROVIDER_PLACEHOLDER[draft.provider]}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 pr-16 text-sm outline-none focus:border-white/25 font-mono"
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-1"
              >
                {showKey ? "Sembunyi" : "Lihat"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Setiap provider punya key sendiri. Berganti provider tidak menimpa key lain.
            </p>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">Base URL</label>
            <input
              type="text"
              value={draft.baseUrl}
              onChange={(e) => patch({ baseUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-white/25 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">
              Model · {PROVIDER_LABEL[draft.provider]}
            </label>
            <input
              type="text"
              list={`models-${agentId}-${draft.provider}`}
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value)}
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-white/25 font-mono"
            />
            <datalist id={`models-${agentId}-${draft.provider}`}>
              {MODEL_PRESETS[draft.provider].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {MODEL_PRESETS[draft.provider].map((m) => (
                <button
                  key={m}
                  onClick={() => setCurrentModel(m)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:border-white/25 hover:text-foreground font-mono"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">
                Temperature · {draft.temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={draft.temperature}
                onChange={(e) => patch({ temperature: Number(e.target.value) })}
                className="w-full mt-1 accent-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">
                Top P · {draft.topP.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={draft.topP}
                onChange={(e) => patch({ topP: Number(e.target.value) })}
                className="w-full mt-1 accent-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Max output tokens</label>
              <input
                type="number"
                min={256}
                max={65536}
                step={256}
                value={draft.maxOutputTokens}
                onChange={(e) => patch({ maxOutputTokens: Number(e.target.value) })}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Jeda antar request (ms)</label>
              <input
                type="number"
                min={0}
                max={10000}
                step={100}
                value={draft.throttleMs}
                onChange={(e) => patch({ throttleMs: Number(e.target.value) })}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Max retry (429/5xx)</label>
              <input
                type="number"
                min={0}
                max={6}
                value={draft.maxRetries}
                onChange={(e) => patch({ maxRetries: Number(e.target.value) })}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Aset per run (Hera)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={draft.assetsPerRun}
                onChange={(e) => patch({ assetsPerRun: Number(e.target.value) })}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-white/25"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">System prompt override</label>
            <textarea
              value={draft.systemPrompt}
              onChange={(e) => patch({ systemPrompt: e.target.value })}
              rows={4}
              placeholder="Kosongkan untuk memakai prompt bawaan agent."
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-white/25 resize-y font-mono"
            />
          </div>

          {testResult && (
            <div
              className={`text-[11px] px-3 py-2 rounded-lg border ${
                testResult.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {testResult.ok ? "OK " : "GAGAL "}
              {testResult.message}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-5 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={reset}
              className="px-2.5 py-1.5 text-[11px] rounded-lg border border-border hover:bg-muted text-muted-foreground"
            >
              Reset
            </button>
            <button
              onClick={wipeHistory}
              className="px-2.5 py-1.5 text-[11px] rounded-lg border border-border hover:bg-muted text-muted-foreground"
            >
              Hapus riwayat chat
            </button>
            <button
              onClick={runTest}
              disabled={testing}
              className="px-2.5 py-1.5 text-[11px] rounded-lg border border-border hover:bg-muted disabled:opacity-50"
            >
              {testing ? "Menguji..." : "Test koneksi"}
            </button>
            <button
              onClick={async () => {
                const models = await listAvailableModels(currentKey);
                const imageModels = models.filter((m) => m.methods.includes("generateContent"));
                pushLog({
                  level: "info",
                  agent: agentId,
                  text: `Model tersedia: ${imageModels.map((m) => m.name).join(", ").slice(0, 200)}`,
                });
              }}
              className="px-2.5 py-1.5 text-[11px] rounded-lg border border-border hover:bg-muted"
            >
              Cek model
            </button>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[11px] rounded-lg border border-border hover:bg-muted"
            >
              Batal
            </button>
            <button
              onClick={save}
              className="px-3 py-1.5 text-[11px] rounded-lg bg-foreground text-background font-medium hover:opacity-90"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}