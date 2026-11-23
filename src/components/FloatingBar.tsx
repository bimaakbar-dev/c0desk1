import { useState, type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { pipelineStore } from "../lib/pipelineStore";
import { logStore, clearLog, pushLog } from "../lib/logStore";
import {
  configsStore,
  resetAllConfigs,
  getApiKey,
} from "../lib/agentConfigStore";
import { AGENT_META, AGENT_IDS, type AgentId } from "../lib/studioBus";
import { microstockPipeline } from "../lib/microstockPipeline";
import { testConnection } from "../lib/providers";
import { quotaStore, resetQuotaToday, DAILY_LIMIT } from "../lib/dailyQuotaStore";
import SettingsModal from "./SettingsModal";

export default function FloatingBar() {
  const pipeline = useStore(pipelineStore);
  const logs = useStore(logStore);
  const configs = useStore(configsStore);
  const quota = useStore(quotaStore);

  const [fabOpen, setFabOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [settingsFor, setSettingsFor] = useState<AgentId | null>(null);
  const [testingAll, setTestingAll] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const used = quota.date === todayStr ? quota.used : 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);
  const errorCount = logs.filter((l) => l.level === "error").length;

  const toggleFab = () => {
    setFabOpen((prev) => {
      const next = !prev;
      if (!next) {
        setPickerOpen(false);
        setLogOpen(false);
      }
      return next;
    });
  };

  const testAll = async () => {
    setTestingAll(true);
    for (const id of AGENT_IDS) {
      const cfg = configs[id];
      if (!cfg.enabled) {
        pushLog({ level: "info", agent: id, text: "Dilewati (nonaktif)." });
        continue;
      }
      if (!getApiKey(cfg)) {
        pushLog({ level: "warn", agent: id, text: "API key belum diisi." });
        continue;
      }
      const res = await testConnection(cfg);
      pushLog({
        level: res.ok ? "info" : "error",
        agent: id,
        text: `${res.message} (${res.latencyMs}ms)`,
      });
    }
    setTestingAll(false);
    setFabOpen(true);
    setPickerOpen(false);
    setLogOpen(true);
  };

  const resetStudio = () => {
    if (!window.confirm("Hapus semua konfigurasi agent dan muat ulang studio?")) return;
    resetAllConfigs();
    window.location.reload();
  };

  const handleResetQuota = () => {
    resetQuotaToday();
    pushLog({ level: "info", text: "Kuota harian direset." });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  return (
    <>
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2.5">
        {fabOpen && logOpen && (
          <div className="w-80 sm:w-96 max-h-72 overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-3">
            <div className="flex items-center justify-between px-1.5 pb-2 mb-1.5 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Activity Log
              </span>
              <button
                type="button"
                onClick={clearLog}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Bersihkan
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1.5 py-4">Belum ada aktivitas.</p>
            ) : (
              <ul className="space-y-1">
                {[...logs].reverse().map((l) => (
                  <li
                    key={l.id}
                    className="text-xs px-2 py-1.5 rounded-lg hover:bg-muted font-mono flex items-start gap-2"
                  >
                    <span
                      className={`mt-1 shrink-0 ${
                        l.level === "error"
                          ? "text-red-400"
                          : l.level === "warn"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      ●
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(l.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className="text-foreground/90 break-words">{l.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {fabOpen && pickerOpen && (
          <div className="w-72 bg-card border border-border rounded-2xl shadow-2xl p-2">
            <p className="text-xs text-muted-foreground px-2.5 py-1.5 uppercase tracking-wide">
              Konfigurasi Agent
            </p>
            {AGENT_IDS.map((id) => {
              const cfg = configs[id];
              const hasKey = !!getApiKey(cfg);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSettingsFor(id);
                    setPickerOpen(false);
                    setFabOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: AGENT_META[id].accent }}
                    />
                    <span className="text-sm font-medium">{AGENT_META[id].name}</span>
                    <span className="text-xs text-muted-foreground">{AGENT_META[id].role}</span>
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      hasKey
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {hasKey ? "OK" : "Setup"}
                  </span>
                </button>
              );
            })}
            <div className="border-t border-border mt-1.5 pt-1.5 space-y-1">
              <button
                type="button"
                onClick={handleResetQuota}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted text-xs transition-colors cursor-pointer"
              >
                Reset kuota hari ini{" "}
                <span className="text-muted-foreground font-mono">
                  ({used}/{DAILY_LIMIT})
                </span>
              </button>
              <button
                type="button"
                onClick={resetStudio}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-red-500/10 text-xs text-red-400 transition-colors cursor-pointer"
              >
                Reset semua konfigurasi
              </button>
            </div>
          </div>
        )}

        {fabOpen && (
          <div className="w-64 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-2 space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
              <span>Kuota Pipeline Lokal</span>
              <span className="flex items-center gap-1.5 font-mono text-foreground/90">
                <span
                  className={`w-2 h-2 rounded-full ${
                    remaining > DAILY_LIMIT * 0.2
                      ? "bg-emerald-500"
                      : remaining > 0
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
                {used}/{DAILY_LIMIT}
              </span>
            </div>

            {pipeline.running && (
              <button
                type="button"
                onClick={() => {
                  microstockPipeline.stop();
                  setFabOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/25 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Stop Pipeline
              </button>
            )}

            <MenuRow
              label="Agent Config"
              active={pickerOpen}
              onClick={() => {
                setPickerOpen((s) => !s);
                setLogOpen(false);
              }}
            >
              <path d="M12 15a3 3 0 1 0 0 -6 3 3 0 0 0 0 6" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1 -2.83 2.83l-.06-.06a1.65 1.65 0 0 0 -1.82 -.33 1.65 1.65 0 0 0 -1 1.51V21a2 2 0 1 1 -4 0v-.09a1.65 1.65 0 0 0 -1 -1.51 1.65 1.65 0 0 0 -1.82 .33l-.06.06a2 2 0 1 1 -2.83 -2.83l.06-.06a1.65 1.65 0 0 0 .33 -1.82 1.65 1.65 0 0 0 -1.51 -1H3a2 2 0 1 1 0 -4h.09a1.65 1.65 0 0 0 1.51 -1 1.65 1.65 0 0 0 -.33 -1.82l-.06-.06a2 2 0 1 1 2.83 -2.83l.06.06a1.65 1.65 0 0 0 1.82 .33h.09a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82 -.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 -.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0 -1.51 1z" />
            </MenuRow>

            <MenuRow
              label={testingAll ? "Testing koneksi..." : "Test semua koneksi"}
              active={testingAll}
              onClick={testAll}
            >
              <path d="M15 6.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
              <path d="M4 17.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
              <path d="M8.5 15.5l7 -7" />
            </MenuRow>

            <MenuRow
              label="Activity Log"
              active={logOpen}
              badge={errorCount}
              onClick={() => {
                setLogOpen((s) => !s);
                setPickerOpen(false);
              }}
            >
              <path d="M4 12h.01" />
              <path d="M4 6h.01" />
              <path d="M4 18h.01" />
              <path d="M8 18h2" />
              <path d="M8 12h2" />
              <path d="M8 6h2" />
              <path d="M14 6h6" />
              <path d="M14 12h6" />
              <path d="M14 18h6" />
            </MenuRow>

            <MenuRow label="Fullscreen" onClick={toggleFullscreen}>
              <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
              <path d="M4 16v2a2 2 0 0 0 2 2h2" />
              <path d="M16 4h2a2 2 0 0 1 2 2v2" />
              <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
            </MenuRow>
          </div>
        )}

        <button
          type="button"
          onClick={toggleFab}
          aria-expanded={fabOpen}
          aria-label={fabOpen ? "Tutup menu studio" : "Buka menu studio"}
          title={fabOpen ? "Tutup menu" : "Menu Studio"}
          className="relative w-12 h-12 rounded-full bg-card/95 backdrop-blur-xl border border-border text-foreground shadow-2xl flex items-center justify-center hover:border-white/25 hover:bg-muted transition-all cursor-pointer"
        >
          {fabOpen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="5.5" r="1.5" />
              <circle cx="12" cy="18.5" r="1.5" />
            </svg>
          )}
          {!fabOpen && errorCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {errorCount > 9 ? "9+" : errorCount}
            </span>
          )}
        </button>
      </div>

      {settingsFor && (
        <SettingsModal agentId={settingsFor} onClose={() => setSettingsFor(null)} />
      )}
    </>
  );
}

function MenuRow({
  label,
  onClick,
  active,
  badge,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
        active
          ? "bg-muted text-foreground font-medium"
          : "text-foreground/85 hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {children}
        </svg>
        <span>{label}</span>
      </span>
      {!!badge && badge > 0 && (
        <span className="min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
