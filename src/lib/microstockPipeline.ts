import { bus } from "./studioBus";
import { pipelineStore } from "./pipelineStore";
import { pushLog } from "./logStore";
import { runHera } from "./heraAgent";
import { runAres } from "./aresAgent";
import { runHades } from "./hadesAgent";
import { recordHera, recordAres, recordHades } from "./agentStateStore";
import { checkQuota } from "./dailyQuotaStore";

class MicrostockPipeline {
  private controller: AbortController | null = null;

  async start(topic: string) {
    if (pipelineStore.get().running) return;

    const q = checkQuota();
    if (!q.ok) {
      bus.emit({
        type: "user-message",
        message: {
          from: "ares",
          text: `Kuota harian habis: ${q.used}/${q.limit} gambar sudah terpakai hari ini. Reset kuota dari floating bar atau coba lagi besok.`,
        },
      });
      return;
    }

    this.controller = new AbortController();
    pipelineStore.set({ running: true, topic, phase: "hera" });

    for (const id of ["hera", "ares", "hades"] as const) {
      bus.emit({ type: "agent", id, patch: { status: "idle", gaze: "center", bubble: null } });
    }

    try {
      // --- Hera ---
      const heraOut = await runHera(topic, this.controller.signal);
      recordHera(heraOut.topic, heraOut.insight, heraOut.plans);
      bus.emit({
        type: "agent",
        id: "hera",
        patch: { status: "success", gaze: "ares", bubble: `${heraOut.plans.length} prompt → Ares` },
      });
      await sleep(1200);

      // --- Ares ---
      pipelineStore.set({ running: true, topic, phase: "ares" });
      bus.emit({
        type: "agent",
        id: "ares",
        patch: { status: "receiving", gaze: "hera", bubble: "Menerima prompt dari Hera" },
      });
      await sleep(1000);

      const aresOut = await runAres(heraOut.plans, this.controller.signal);
      recordAres(aresOut.length);
      bus.emit({
        type: "agent",
        id: "ares",
        patch: { status: "success", gaze: "hades", bubble: `${aresOut.length} gambar → Hades` },
      });
      await sleep(1200);

      // --- Hades ---
      pipelineStore.set({ running: true, topic, phase: "hades" });
      bus.emit({
        type: "agent",
        id: "hades",
        patch: { status: "receiving", gaze: "ares", bubble: "Menerima gambar + prompt" },
      });
      await sleep(1000);

      const hadesOut = await runHades(aresOut, this.controller.signal);
      const totalIssues = hadesOut.assets.reduce(
        (s, a) => s + a.metadata.quality_issues.length,
        0
      );
      recordHades(hadesOut.assets.length, totalIssues);

      bus.emit({
        type: "agent",
        id: "hades",
        patch: { status: "success", gaze: "user", bubble: "CSV + ZIP siap" },
      });

      const upscaleNote =
        hadesOut.needsUpscale.length > 0
          ? `\n\n${hadesOut.needsUpscale.length} aset <4 MP — upscale manual sebelum upload ke Adobe Stock (mis. https://bigger.pics).`
          : "\n\nSemua aset >= 4 MP, siap upload.";

      bus.emit({
        type: "user-message",
        message: {
          from: "hades",
          text: `Paket lengkap: ${hadesOut.assets.length} aset. Metadata English, siap untuk buyer global.${upscaleNote}`,
          attachments: [
            {
              kind: "csv",
              filename: `c0desk1_metadata_${Date.now()}.csv`,
              blob: hadesOut.metadataCsvBlob,
              count: hadesOut.assets.length,
              label: "metadata.csv",
            },
            {
              kind: "images",
              filename: `c0desk1_images_${Date.now()}.zip`,
              blob: hadesOut.imagesZipBlob,
              count: hadesOut.assets.length,
              label: "images.zip",
            },
          ],
        },
      });

      pushLog({
        level: "info",
        agent: "hades",
        text: `Pipeline selesai: ${hadesOut.assets.length} aset.`,
      });
    } catch (err: any) {
      const aborted = this.controller?.signal.aborted;
      const msg = aborted
        ? "Pipeline dihentikan."
        : `Pipeline gagal: ${err?.message ?? "unknown"}`;
      pushLog({ level: aborted ? "warn" : "error", text: msg });
      bus.emit({ type: "user-message", message: { from: "hades", text: msg } });
    } finally {
      pipelineStore.set({ running: false, topic: null, phase: null });
      this.controller = null;
      for (const id of ["hera", "ares", "hades"] as const) {
        bus.emit({ type: "agent", id, patch: { status: "idle", gaze: "center", bubble: null } });
      }
    }
  }

  stop() {
    this.controller?.abort();
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const microstockPipeline = new MicrostockPipeline();