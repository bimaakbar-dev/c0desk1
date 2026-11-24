import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  bus,
  AGENT_META,
  type AgentId,
  type AgentStatus,
  type GazeTarget,
} from "../lib/studioBus";
import { configsStore, getModel } from "../lib/agentConfigStore";
import GrokBotAvatar from "./GrokBotAvatar";
import SettingsModal from "./SettingsModal";

interface Props {
  agentId: AgentId;
  onOpenSettings?: (id: AgentId) => void;
  monitorOnly?: boolean;
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Menunggu instruksi",
  researching: "Riset pasar...",
  thinking: "Menyusun rencana...",
  working: "Menghasilkan aset...",
  checking: "QC & metadata...",
  receiving: "Menerima input...",
  success: "Selesai",
  error: "Error",
  done: "Siap",
};

export default function AgentPanel({ agentId, onOpenSettings, monitorOnly = false }: Props) {
  const meta = AGENT_META[agentId];
  const configs = useStore(configsStore);
  const cfg = configs[agentId];
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [gaze, setGaze] = useState<GazeTarget>("center");
  const [bubble, setBubble] = useState<string | null>(null);
  const [localSettingsOpen, setLocalSettingsOpen] = useState(false);

  useEffect(() => bus.subscribe((event) => {
    if (event.type === "agent" && event.id === agentId) {
      if (event.patch.status !== undefined) setStatus(event.patch.status);
      if (event.patch.gaze !== undefined) setGaze(event.patch.gaze);
      if (event.patch.bubble !== undefined) setBubble(event.patch.bubble);
    }
  }), [agentId]);

  const active = status !== "idle" && status !== "done" && status !== "success" && status !== "error";
  const activeModel = getModel(cfg);

  const handleOpen = () => {
    if (monitorOnly) return;
    if (onOpenSettings) onOpenSettings(agentId);
    else setLocalSettingsOpen(true);
  };

  return (
    <>
      <div
        onClick={monitorOnly ? undefined : handleOpen}
        role={monitorOnly ? undefined : "button"}
        tabIndex={monitorOnly ? undefined : 0}
        onKeyDown={monitorOnly ? undefined : (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpen();
          }
        }}
        aria-label={`${meta.name}, ${STATUS_LABEL[status]}`}
        title={monitorOnly ? undefined : `Klik untuk mengatur ${meta.name}`}
        className={`agent-tile ${monitorOnly ? "monitor-only" : ""} group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${monitorOnly ? "" : "cursor-pointer select-none"} sm:min-h-[330px] ${active ? "agent-tile-active" : "border-border hover:border-white/20"} ${!cfg.enabled ? "opacity-45" : ""}`}
      >
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full transition-transform ${active ? "scale-125 animate-pulse" : ""}`} style={{ backgroundColor: cfg.enabled ? meta.accent : "#71717a" }} />
            <span className="truncate text-sm font-semibold tracking-tight">{meta.name}</span>
            <span className="agent-role truncate text-[11px] text-muted-foreground">{meta.role}</span>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-medium uppercase tracking-wide ${active ? "border-white/15 bg-white/10 text-foreground" : "border-white/5 bg-black/15 text-muted-foreground"}`}>
            {cfg.enabled ? STATUS_LABEL[status] : "Nonaktif"}
          </span>
        </div>

        <div className="agent-avatar-stage my-1 flex min-h-[150px] flex-1 items-center justify-center overflow-hidden">
          <GrokBotAvatar agentId={agentId} accent={meta.accent} status={status} gaze={gaze} bubble={bubble} />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-2.5">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground">{STATUS_LABEL[status]}</p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-muted-foreground/75">{cfg.provider} · {activeModel}</p>
          </div>
          {!monitorOnly && <span className="shrink-0 text-[10px] text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true">SETUP ↗</span>}
        </div>
      </div>

      {localSettingsOpen && !monitorOnly && <SettingsModal agentId={agentId} onClose={() => setLocalSettingsOpen(false)} />}
    </>
  );
}
