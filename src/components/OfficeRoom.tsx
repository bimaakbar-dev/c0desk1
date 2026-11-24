import { useEffect, useState, type CSSProperties } from "react";
import { useStore } from "@nanostores/react";
import type { AutomationStatusSnapshot } from "../lib/automationStatus";
import { AGENT_IDS, AGENT_META, bus, type AgentId, type AgentStatus } from "../lib/studioBus";
import { pipelineStore } from "../lib/pipelineStore";
import { logStore } from "../lib/logStore";
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

const agentPositions: Record<AgentId, string> = {
  hera: "map-agent-hera",
  ares: "map-agent-ares",
  hades: "map-agent-hades",
};

export default function OfficeRoom({ snapshot }: Props) {
  const pipeline = useStore(pipelineStore);
  const logs = useStore(logStore);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatus>>({ hera: "idle", ares: "idle", hades: "idle" });
  const [agentBubbles, setAgentBubbles] = useState<Record<AgentId, string | null>>({ hera: null, ares: null, hades: null });

  useEffect(() => bus.subscribe((event) => {
    if (event.type === "agent") {
      if (event.patch.status) setAgentStatuses((current) => ({ ...current, [event.id]: event.patch.status! }));
      if (event.patch.bubble !== undefined) setAgentBubbles((current) => ({ ...current, [event.id]: event.patch.bubble || null }));
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
            <p className="office-subtitle">Agent bergerak dan bekerja di kantor saat misi Telegram berjalan.</p>
          </div>
          <div className="office-headcount" aria-label={`${AGENT_IDS.length} agent, ${activeCount} aktif`}>
            <span className="headcount-avatars">{AGENT_IDS.map((id) => <i key={id} title={AGENT_META[id].name}>{AGENT_META[id].name[0]}</i>)}</span>
            <span><strong>{activeCount} aktif · {AGENT_IDS.length} agent</strong><small>STATUS LANGSUNG</small></span>
          </div>
        </div>

        <section className="office-room map-room" aria-label="Peta kantor virtual">
          <div className="map-topbar"><span><i/> FLOOR 01 <b>/</b> STUDIO</span><span>{pipeline.running ? `MISI: ${pipeline.topic || "SEDANG BERJALAN"}` : "SIAP · MENUNGGU TELEGRAM"}</span></div>
          <div className="office-floor map-floor">
            <div className="map-wall map-wall-top" aria-hidden="true"><span className="map-window"/><span className="map-board">TEAM<br/>BOARD</span></div>
            <div className="map-room-divider map-divider-one" aria-hidden="true"/>
            <div className="map-furniture map-desk desk-one" aria-hidden="true"><span/><i/></div>
            <div className="map-furniture map-desk desk-two" aria-hidden="true"><span/><i/></div>
            <div className="map-furniture map-desk desk-three" aria-hidden="true"><span/><i/></div>
            <div className="map-meeting-table" aria-hidden="true"><i/><i/><i/><i/></div>
            <div className="map-plant plant-one" aria-hidden="true"/>
            <div className="map-plant plant-two" aria-hidden="true"/>
            {AGENT_IDS.map((id) => {
              const status = agentStatuses[id];
              const active = !["idle", "success", "done", "error"].includes(status);
              return (
                <div
                  key={id}
                  className={`map-agent ${agentPositions[id]} ${active ? "is-working" : "is-idle"} ${status === "error" ? "has-error" : ""}`}
                  style={{ "--agent-accent": AGENT_META[id].accent } as CSSProperties}
                  aria-label={`${AGENT_META[id].name}: ${statusLabel[status]}`}
                >
                  {agentBubbles[id] && <span className="map-agent-bubble">{agentBubbles[id]}</span>}
                  <span className="map-agent-sprite" aria-hidden="true"><i className="sprite-visor"/><i className="sprite-pack"/><i className="sprite-leg leg-left"/><i className="sprite-leg leg-right"/></span>
                  <span className="map-agent-name">{AGENT_META[id].name}</span>
                  <span className="map-agent-status">{statusLabel[status]}</span>
                </div>
              );
            })}
            <div className="map-you"><span>B</span><small>ANDA</small></div>
            <div className="map-status-chip"><i className={pipeline.running ? "is-live" : ""}/>{pipeline.running ? pipeline.phase || pipeline.stage || "MISI BERJALAN" : "KIRIM MISI VIA TELEGRAM"}</div>
          </div>
          <div className="office-room-footer"><span>c0desk1 · VIRTUAL OFFICE</span><span>{pipeline.running ? "MISSION IN PROGRESS" : "ALL QUIET"}</span></div>
        </section>

        <section className="office-monitor map-monitor" aria-label="Ringkasan aktivitas">
          <article className="monitor-card mission-monitor">
            <p className="section-eyebrow">MISI SAAT INI</p>
            <h2>{pipeline.running ? pipeline.topic || "Misi tanpa judul" : "Belum ada misi aktif"}</h2>
            <p>{pipeline.running ? pipeline.phase || pipeline.stage || "Agent sedang bekerja." : "Telegram adalah pintu masuk. Halaman ini menampilkan aktivitas agent, bukan tempat mengirim perintah."}</p>
            <div className="monitor-stages" aria-label="Tahapan pekerjaan">{stages.map((stage, index) => <span key={stage} className={pipeline.running && index === stageIndex ? "is-current" : pipeline.running && index < stageIndex ? "is-done" : ""}><i>{pipeline.running && index < stageIndex ? "✓" : index + 1}</i>{stage}</span>)}</div>
          </article>
          <article className="monitor-card activity-monitor">
            <div className="monitor-title"><div><p className="section-eyebrow">ACTIVITY FEED</p><h2>Aktivitas kantor</h2></div><span className="feed-live"><i/>LIVE</span></div>
            {logs.length ? <ol className="activity-list">{[...logs].reverse().slice(0, 3).map((log) => <li key={log.id}><span className={`activity-dot ${log.level}`}/><div><p>{log.text}</p><small>{log.agent ? `${AGENT_META[log.agent].name} · ` : "Studio · "}{new Date(log.ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</small></div></li>)}</ol> : <p className="monitor-empty">Aktivitas terbaru akan muncul saat misi Telegram dimulai.</p>}
          </article>
        </section>
        <footer className="office-footer"><span>c0desk1 virtual office</span><span>Web untuk memantau · Telegram untuk memulai misi</span></footer>
      </section>
    </main>
  );
}
