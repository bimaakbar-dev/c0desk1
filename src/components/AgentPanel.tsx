import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import GrokBotAvatar from "./GrokBotAvatar";
import SettingsModal from "./SettingsModal";
import {
  bus,
  AGENT_META,
  type AgentId,
  type AgentStatus,
  type GazeTarget,
} from "../lib/studioBus";
import { configsStore, getApiKey, getModel } from "../lib/agentConfigStore";

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Siaga",
  researching: "Riset",
  thinking: "Berpikir",
  working: "Bekerja",
  checking: "QC",
  receiving: "Menerima",
  success: "Berhasil",
  error: "Error",
  done: "Selesai",
};

const ACTIVITY: Record<AgentStatus, string> = {
  idle: "Menunggu instruksi",
  researching: "Mengumpulkan data",
  thinking: "Memproses...",
  working: "Mengeksekusi tugas",
  checking: "Quality check",
  receiving: "Menerima handoff",
  success: "Menyelesaikan tahap",
  error: "Menangani kendala",
  done: "Selesai",
};

export default function AgentPanel({ agentId }: { agentId: AgentId }) {
  const meta = AGENT_META[agentId];
  const configs = useStore(configsStore);
  const cfg = configs[agentId];
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [gaze, setGaze] = useState<GazeTarget>("center");
  const [bubble, setBubble] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    return bus.subscribe((e) => {
      if (e.type === "agent" && e.id === agentId) {
        if (e.patch.status !== undefined) setStatus(e.patch.status);
        if (e.patch.gaze !== undefined) setGaze(e.patch.gaze);
        if (e.patch.bubble !== undefined) setBubble(e.patch.bubble);
      }
    });
  }, [agentId]);

  const isActive = status !== "idle" && status !== "done";
  const disabled = !cfg?.enabled;
  const hasKey = cfg ? !!getApiKey(cfg) : false;
  const modelDisplay = cfg ? getModel(cfg) : "belum diset";

  return (
    <>
      <div
        onClick={() => setShowSettings(true)}
        className={`group relative bg-card border border-border rounded-xl p-4 flex flex-col h-full min-h-[280px] cursor-pointer transition-all hover:border-white/25 ${
          disabled ? "opacity-55" : ""
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setShowSettings(true);
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-semibold truncate">{meta.name}</h3>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
              style={{
                color: meta.accent,
                borderColor: `${meta.accent}40`,
                backgroundColor: `${meta.accent}10`,
              }}
            >
              {meta.role}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {disabled && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                Off
              </span>
            )}
            {!hasKey && !disabled && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Setup
              </span>
            )}
            <span className="relative flex h-2 w-2">
              {isActive && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                  style={{ backgroundColor: meta.accent }}
                />
              )}
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: meta.accent }}
              />
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-2 pt-6">
          <GrokBotAvatar
            agentId={agentId}
            accent={meta.accent}
            status={status}
            gaze={gaze}
            bubble={bubble}
          />
        </div>

        <div className="pt-3 mt-auto border-t border-border/60">
          <p className="text-[11px] text-muted-foreground truncate">
            <span className="text-foreground/50">Sekarang:</span> {ACTIVITY[status]}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            {cfg?.provider ?? "—"} · {modelDisplay}
          </p>
        </div>
      </div>

      {showSettings && <SettingsModal agentId={agentId} onClose={() => setShowSettings(false)} />}
    </>
  );
}