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

  const [pickerOpen, setPickerOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [settingsFor, setSettingsFor] = useState<AgentId | null>(null);
  const [testingAll, setTestingAll] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const used = quota.date === todayStr ? quota.used : 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);

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
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        {logOpen && (
          <div className="absolute bottom-14 right-0 w-80 max-h-64 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Activity
              </span>
              <button
                onClick={clearLog}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Bersihkan
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-[11px] text-muted-foreground px-2 py-3">Belum ada aktivitas.</p>
            ) : (
              <ul className="space-y-0.5">
                {[...logs].reverse().map((l) => (
                  <li
                    key={l.id}
                    className="text-[10px] px-2 py-1 rounded hover:bg-muted font-mono flex gap-1.5"
                  >
                    <span
                      className={
                        l.level === "error"
                          ? "text-red-400"
                          : l.level === "warn"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
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
                    <span className="text-foreground/80 break-words">{l.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {pickerOpen && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 bg-card border border-border rounded-xl shadow-2xl p-1.5">
            <p className="text-[10px] text-muted-foreground px-2 py-1 uppercase tracking-wide">
              Konfigurasi agent
            </p>
            {AGENT_IDS.map((id) => {
              const cfg = configs[id];
              const hasKey = !!getApiKey(cfg);
              return (
                <button
                  key={id}
                  onClick={() => {
                    setSettingsFor(id);
                    setPickerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-muted text-left"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: AGENT_META[id].accent }}
                    />
                    <span className="text-xs">{AGENT_META[id].name}</span>
                    <span className="text-[10px] text-muted-foreground">{AGENT_META[id].role}</span>
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
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
            <div className="border-t border-border mt-1 pt-1 space-y-0.5">
              <button
                onClick={handleResetQuota}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted text-[11px]"
              >
                Reset kuota hari ini{" "}
                <span className="text-muted-foreground">
                  ({used}/{DAILY_LIMIT})
                </span>
              </button>
              <button
                onClick={resetStudio}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-500/10 text-[11px] text-red-400"
              >
                Reset semua konfigurasi
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 bg-card/95 backdrop-blur-xl border border-border rounded-full px-2 py-1.5 shadow-2xl">
          <span className="hidden md:flex items-center gap-1.5 px-2 text-[10px] text-muted-foreground border-r border-border mr-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                remaining > DAILY_LIMIT * 0.2
                  ? "bg-emerald-500"
                  : remaining > 0
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
            <span className="font-mono">
              {used}/{DAILY_LIMIT}
            </span>
          </span>

          <BarButton
            label="Agent config"
            onClick={() => setPickerOpen((s) => !s)}
            active={pickerOpen}
          >
            <path d="M15.536 15.536a5 5 0 1 0 -7.072 -7.072a5 5 0 0 0 7.072 7.072" />
            <path d="M15.536 15.535l5.464 -5.535" />
            <path d="M3 14l5.464 -5.535" />
            <path d="M12 12h.01" />
          </BarButton>

          <div className="w-px h-5 bg-border mx-0.5" />

          {pipeline.running ? (
            <button
              onClick={() => microstockPipeline.stop()}
              className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-medium hover:bg-red-500/25"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Stop
            </button>
          ) : (
            <BarButton label="Pipeline siap — kirim topik dari chat" onClick={() => {}}>
              <path d="M7 4v16l13 -8l-13 -8" />
            </BarButton>
          )}

          <BarButton label="Test semua koneksi" onClick={testAll} active={testingAll}>
            <path d="M15 6.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
            <path d="M4 17.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
            <path d="M8.5 15.5l7 -7" />
          </BarButton>

          <BarButton
            label="Activity log"
            onClick={() => setLogOpen((s) => !s)}
            active={logOpen}
            badge={logs.filter((l) => l.level === "error").length}
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
          </BarButton>

          <div className="w-px h-5 bg-border mx-0.5" />

          <BarButton label="Fullscreen" onClick={toggleFullscreen}>
            <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
            <path d="M4 16v2a2 2 0 0 0 2 2h2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
            <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
          </BarButton>
        </div>
      </div>

      {settingsFor && (
        <SettingsModal agentId={settingsFor} onClose={() => setSettingsFor(null)} />
      )}
    </>
  );
}

function BarButton({
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
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-white/10 text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
      {!!badge && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center">
          {badge > 9 ? "9" : badge}
        </span>
      )}
    </button>
  );
}