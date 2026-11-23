import { bus, type AgentId, type AgentStatus, type GazeTarget } from "./studioBus";

interface Step {
  agent: AgentId;
  patch: { status: AgentStatus; gaze: GazeTarget; bubble: string | null };
  duration: number;
}

class StudioOrchestrator {
  private runId = 0;

  async run(userInput: string) {
    this.runId++;
    const id = this.runId;
    const alive = () => id === this.runId;

    // Reset semua agent ke idle sebelum pipeline baru
    const agents: AgentId[] = ["hera", "ares", "hades"];
    for (const a of agents) {
      bus.emit({
        type: "agent",
        id: a,
        patch: { status: "idle", gaze: "center", bubble: null },
      });
    }

    await this.wait(150);
    if (!alive()) return;

    const steps: Step[] = [
      // Hera — riset
      {
        agent: "hera",
        patch: { status: "researching", gaze: "center", bubble: "Menganalisis topik..." },
        duration: 2400,
      },
      {
        agent: "hera",
        patch: { status: "success", gaze: "ares", bubble: "Riset siap → Ares" },
        duration: 1600,
      },
      {
        agent: "hera",
        patch: { status: "idle", gaze: "center", bubble: null },
        duration: 200,
      },

      // Ares — editing
      {
        agent: "ares",
        patch: { status: "receiving", gaze: "hera", bubble: "Data diterima dari Hera" },
        duration: 1200,
      },
      {
        agent: "ares",
        patch: { status: "working", gaze: "center", bubble: "Editing & compositing..." },
        duration: 2600,
      },
      {
        agent: "ares",
        patch: { status: "success", gaze: "hades", bubble: "Render selesai → Hades" },
        duration: 1600,
      },
      {
        agent: "ares",
        patch: { status: "idle", gaze: "center", bubble: null },
        duration: 200,
      },

      // Hades — QC
      {
        agent: "hades",
        patch: { status: "receiving", gaze: "ares", bubble: "Aset diterima, QC..." },
        duration: 1200,
      },
      {
        agent: "hades",
        patch: { status: "checking", gaze: "center", bubble: "Memeriksa audio, warna, format..." },
        duration: 2200,
      },
      {
        agent: "hades",
        patch: { status: "success", gaze: "user", bubble: "Lolos QC ✓" },
        duration: 1500,
      },
    ];

    for (const step of steps) {
      if (!alive()) return;
      bus.emit({ type: "agent", id: step.agent, patch: step.patch });
      await this.wait(step.duration);
    }

    if (!alive()) return;

    bus.emit({
      type: "user-message",
      message: {
        from: "hades",
        text: `Paket final untuk "${userInput}" siap direview. Semua tahap (riset, edit, finishing) selesai tanpa kendala.`,
      },
    });

    await this.wait(1000);
    if (!alive()) return;

    bus.emit({
      type: "agent",
      id: "hades",
      patch: { status: "idle", gaze: "center", bubble: null },
    });
  }

  cancel() {
    this.runId++;
  }

  private wait(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }
}

export const orchestrator = new StudioOrchestrator();