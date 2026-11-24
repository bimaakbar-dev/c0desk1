export type AgentId = "hera" | "ares" | "hades";
export type GazeTarget = AgentId | "user" | "center";
export type AgentStatus =
  | "idle"
  | "researching"
  | "thinking"
  | "working"
  | "checking"
  | "receiving"
  | "success"
  | "error"
  | "done";

export interface AgentPatch {
  status?: AgentStatus;
  gaze?: GazeTarget;
  bubble?: string | null;
}

export interface Attachment {
  kind: "zip" | "csv" | "images";
  filename: string;
  blob: Blob;
  count?: number;
  label?: string;
}


export interface UserMessage {
  from: AgentId;
  text: string;
  attachments?: Attachment[];

}

export type StudioEvent =
  | { type: "agent"; id: AgentId; patch: AgentPatch }
  | { type: "user-message"; message: UserMessage }
  | { type: "handoff"; from: AgentId; to: AgentId; payload: unknown }
  | { type: "log"; level: "info" | "warn" | "error"; agent?: AgentId; text: string };

class StudioBus {
  private listeners = new Set<(e: StudioEvent) => void>();
  subscribe(fn: (e: StudioEvent) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  emit(e: StudioEvent) {
    this.listeners.forEach((fn) => fn(e));
  }
}

export const bus = new StudioBus();

export const AGENT_META: Record<AgentId, { name: string; role: string; accent: string }> = {
  hera: { name: "Hera", role: "Research", accent: "#a78bfa" },
  ares: { name: "Ares", role: "Pembuat prompt", accent: "#fb923c" },
  hades: { name: "Hades", role: "QC & Delivery", accent: "#22d3ee" },
};

export const AGENT_IDS: AgentId[] = ["hera", "ares", "hades"];
