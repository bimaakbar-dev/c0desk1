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

export default function AgentPanel({ agentId, onOpenSettings }: Props) {
  const meta = AGENT_META[agentId];
  const configs = useStore(configsStore);
  const cfg = configs[agentId];

  const [status, setStatus] = useState<AgentStatus>("idle");
  const [gaze, setGaze] = useState<GazeTarget>("center");
  const [bubble, setBubble] = useState<string | null>(null);
  const [localSettingsOpen, setLocalSettingsOpen] = useState(false);

  useEffect(() => {
    return bus.subscribe((e) => {
      if (e.type === "agent" && e.id === agentId) {
        if (e.patch.status !== undefined) setStatus(e.patch.status);
        if (e.patch.gaze !== undefined) setGaze(e.patch.gaze);
        if (e.patch.bubble !== undefined) setBubble(e.patch.bubble);
      }
    });
  }, [agentId]);

  const active =
    status !== "idle" && status !== "done" && status !== "success" && status !== "error";

  const activeModel = getModel(cfg);

  const handleOpen = () => {
    if (onOpenSettings) {
      onOpenSettings(agentId);
    } else {
      setLocalSettingsOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        title={`Klik untuk mengatur ${meta.name}`}
        className={`group relative flex flex-col justify-between bg-card border rounded-2xl p-5 min-h-[320px] transition-all duration-300 cursor-pointer select-none ${
          active
            ? "border-white/25 shadow-[0_0_40px_-15px_rgba(255,255,255,0.12)]"
            : "border-border hover:border-white/20"
        } ${!cfg.enabled ? "opacity-45" : ""}`}
      >
        <div className="flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-transform ${
                active ? "scale-125 animate-pulse" : ""
              }`}
              style={{ backgroundColor: meta.accent }}
            />
            <span className="text-sm font-medium tracking-tight">{meta.name}</span>
            <span className="text-xs text-muted-foreground">{meta.role}</span>
          </div>
          {!cfg.enabled && (
            <span className="text-xs text-muted-foreground uppercase">Off</span>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center my-1 min-h-[190px]">
          <GrokBotAvatar
            agentId={agentId}
            accent={meta.accent}
            status={status}
            gaze={gaze}
            bubble={bubble}
          />
        </div>

        <div className="z-10 pt-2 min-h-[38px] flex flex-col justify-end opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <span className="text-foreground/85 truncate max-w-[175px]">
              {STATUS_LABEL[status]}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground/80 truncate mt-0.5 font-mono">
            {cfg.provider} · {activeModel}
          </div>
        </div>
      </div>

      {localSettingsOpen && (
        <SettingsModal
          agentId={agentId}
          onClose={() => setLocalSettingsOpen(false)}
        />
      )}
    </>
  );
}