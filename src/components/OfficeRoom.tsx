import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import type { AutomationStatusSnapshot } from "../lib/automationStatus";
import { AGENT_IDS, AGENT_META, bus, type AgentId, type AgentStatus } from "../lib/studioBus";
import { pipelineStore } from "../lib/pipelineStore";
import { logStore } from "../lib/logStore";
import AgentPanel from "./AgentPanel";
import AutomationStatus from "./AutomationStatus";

interface Props {
  snapshot: AutomationStatusSnapshot | null;
}

const statusLabel: Record<AgentStatus, string> = {
  idle: "Menunggu tugas Telegram",
  researching: "Riset berlangsung",
  thinking: "Menyusun analisis",
  working: "Sedang bekerja",
  checking: "Meninjau aset",
  receiving: "Menerima instruksi",
  success: "Tugas selesai",
  error: "Butuh perhatian",
  done: "Siap ditinjau",
};

export default function OfficeRoom({ snapshot }: Props) {
  const pipeline = useStore(pipelineStore);
  const logs = useStore(logStore);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatus>>({ hera: "idle", ares: "idle", hades: "idle" });

  useEffect(() => bus.subscribe((event) => {
    if (event.type === "agent" && event.patch.status) {
      setAgentStatuses((current) => ({ ...current, [event.id]: event.patch.status! }));
    }
  }), []);

  const activeCount = Object.values(agentStatuses).filter((status) => !["idle", "success", "done", "error"].includes(status)).length;
  const currentStage = pipeline.stage?.toLowerCase() ?? "";
  const stages = ["Riset", "Prompt", "Review"];
  const stageIndex = pipeline.running
    ? Math.max(0, stages.findIndex((stage) => currentStage.includes(stage.toLowerCase())))
    : -1;

  return (
    <main className="office-app office-game" id="office">
      <header className="office-header">
        <a href="#office" className="office-brand" aria-label="c0desk1 Virtual Office">
          <span className="brand-mark"><i/><i/><i/><i/></span>
          <span><strong>c0desk1</strong><small>VIRTUAL OFFICE</small></span>
        </a>
        <div className="office-toolbar">
          <span className="office-date"><span aria-hidden="true">⌂</span><i/>RUANG KERJA VIRTUAL</span>
          <AutomationStatus snapshot={snapshot}/>
        </div>
      </header>

      <section className="office-main">
        <div className="office-world-header">
          <div>
            <p className="section-eyebrow">RUANG KERJA TIM</p>
            <h1>Kantor c0desk1</h1>
            <p className="office-subtitle">Pantau aktivitas agent saat mereka bekerja dari misi yang dikirim lewat Telegram.</p>
          </div>
          <div className="office-headcount" aria-label={`${AGENT_IDS.length} agent, ${activeCount} aktif`}>
            <span className="headcount-avatars">{AGENT_IDS.map((id) => <i key={id} title={AGENT_META[id].name}>{AGENT_META[id].name[0]}</i>)}</span>
            <span><strong>{activeCount} aktif · {AGENT_IDS.length} agent</strong><small>STATUS LANGSUNG</small></span>
          </div>
        </div>

        <section className="office-room" aria-label="Peta kantor virtual">
          <div className="office-wall">
            <div className="office-shelf"><i/><i/><i/></div>
            <div className="office-window"><i/><i/><i/><i/></div>
            <div className="office-noteboard"><span>TEAM BOARD</span><i/><i/><i/></div>
          </div>
          <div className="office-floor">
            <div className="office-floor-label"><span>FLOOR 01 · STUDIO</span><span>{pipeline.running ? `MISI: ${pipeline.topic || "SEDANG BERJALAN"}` : "MENUNGGU TRIGGER TELEGRAM"}</span></div>
            <div className="office-workstations">
              {AGENT_IDS.map((id) => <AgentPanel key={id} agentId={id} monitorOnly />)}
            </div>
            <div className="office-lounge" aria-hidden="true"><span/><span/></div>
            <div className="office-plant" aria-hidden="true"><i/><i/><i/><i/><i/><span/></div>
            <div className="office-visitor"><span className="visitor-avatar">B</span><span><strong>Anda</strong><small>Memantau kantor</small></span></div>
          </div>
          <div className="office-room-footer"><span>c0desk1 · VIRTUAL OFFICE</span><span>{pipeline.running ? "MISSION IN PROGRESS" : "ALL QUIET"}</span></div>
        </section>

        <section className="office-monitor" aria-label="Ringkasan pemantauan">
          <article className="monitor-card telegram-card">
            <span className="monitor-icon" aria-hidden="true">TG</span>
            <div><p className="section-eyebrow">MISSION TRIGGER</p><h2>Telegram adalah pintu masuk</h2><p>Misi dimulai dari pesan Telegram. Halaman ini hanya menampilkan status—bukan tempat menjalankan atau mengirim perintah.</p></div>
            <span className="telegram-indicator"><i/>{snapshot?.automation.enabled ? "TERHUBUNG" : "MENUNGGU"}</span>
          </article>
          <article className="monitor-card mission-monitor">
            <p className="section-eyebrow">MISI SAAT INI</p>
            <h2>{pipeline.running ? pipeline.topic || "Misi tanpa judul" : "Belum ada misi aktif"}</h2>
            <p>{pipeline.running ? pipeline.phase || pipeline.stage || "Agent sedang bekerja." : "Kirim misi melalui Telegram untuk melihat tim mulai beraktivitas di kantor."}</p>
            <div className="monitor-stages" aria-label="Tahapan pekerjaan">{stages.map((stage, index) => <span key={stage} className={pipeline.running && index === stageIndex ? "is-current" : pipeline.running && index < stageIndex ? "is-done" : ""}><i>{pipeline.running && index < stageIndex ? "✓" : index + 1}</i>{stage}</span>)}</div>
          </article>
          <article className="monitor-card activity-monitor">
            <div className="monitor-title"><div><p className="section-eyebrow">ACTIVITY FEED</p><h2>Aktivitas kantor</h2></div><span className="feed-live"><i/>LIVE</span></div>
            {logs.length ? <ol className="activity-list">{[...logs].reverse().slice(0, 4).map((log) => <li key={log.id}><span className={`activity-dot ${log.level}`}/><div><p>{log.text}</p><small>{log.agent ? `${AGENT_META[log.agent].name} · ` : "Studio · "}{new Date(log.ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</small></div></li>)}</ol> : <p className="monitor-empty">Belum ada aktivitas. Pembaruan akan muncul saat trigger Telegram memulai pekerjaan.</p>}
          </article>
        </section>
        <footer className="office-footer"><span>c0desk1 virtual office</span><span>Web untuk memantau · Telegram untuk memulai misi</span></footer>
      </section>
    </main>
  );
}
