import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import type { AutomationStatusSnapshot } from "../lib/automationStatus";
import { AGENT_IDS, AGENT_META, bus, type AgentId, type AgentStatus } from "../lib/studioBus";
import { pipelineStore } from "../lib/pipelineStore";
import { logStore } from "../lib/logStore";
import AgentPanel from "./AgentPanel";
import AutomationStatus from "./AutomationStatus";
import Chatbox from "./Chatbox";
import FloatingBar from "./FloatingBar";

interface Props {
  snapshot: AutomationStatusSnapshot | null;
}

const statusLabel: Record<AgentStatus, string> = {
  idle: "Siap menerima tugas",
  researching: "Riset berlangsung",
  thinking: "Menyusun analisis",
  working: "Sedang bekerja",
  checking: "Meninjau aset",
  receiving: "Menerima handoff",
  success: "Tugas selesai",
  error: "Butuh perhatian",
  done: "Siap ditinjau",
};

const stageLabels = ["Riset peluang", "Rancang prompt", "Buat gambar", "QC & metadata"];

function Icon({ name, size = 18 }: { name: "grid" | "layers" | "users" | "archive" | "arrow" | "spark" | "clock"; size?: number }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    archive: <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

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
  const stageIndex = pipeline.running
    ? Math.max(0, stageLabels.findIndex((stage) => currentStage.includes(stage.split(" ")[0].toLowerCase())))
    : -1;

  return (
    <main className="studio-shell control-room" id="overview">
      <aside className="studio-sidebar" aria-label="Navigasi studio">
        <a href="#overview" className="studio-brand" aria-label="c0desk1 Studio">
          <span className="studio-brand-mark"><i/><i/><i/><i/></span>
          <span><strong>c0desk1</strong><small>MICROSTOCK STUDIO</small></span>
        </a>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="studio-nav">
          <a className="studio-nav-item is-active" href="#overview"><Icon name="grid"/><span>Overview</span></a>
          <a className="studio-nav-item" href="#mission"><Icon name="layers"/><span>Misi</span><span className="nav-count">{pipeline.running ? "01" : "—"}</span></a>
          <a className="studio-nav-item" href="#team"><Icon name="users"/><span>Tim agent</span></a>
          <a className="studio-nav-item" href="#conversation"><Icon name="archive"/><span>Hasil & percakapan</span></a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="sidebar-note-icon"><Icon name="spark" size={16}/></span>
          <p><strong>Human-in-the-loop</strong><br/>Agent menyiapkan pekerjaan. Anda tetap menyetujui hasil sebelum dipakai.</p>
        </div>
        <div className="sidebar-user"><span className="user-avatar">B</span><span><strong>Studio owner</strong><small>Contributor workspace</small></span><span className="user-menu">•••</span></div>
      </aside>

      <section className="studio-main">
        <header className="studio-topbar">
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
          <div className="topbar-right"><span className="today-label"><Icon name="clock" size={15}/>{new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}</span><AutomationStatus snapshot={snapshot}/><button className="topbar-avatar" type="button" aria-label="Profil studio">B</button></div>
        </header>

        <div className="studio-content">
          <section className="welcome-row">
            <div><p className="kicker">RUANG KERJA KONTRIBUTOR</p><h1>Selamat datang kembali.</h1><p className="welcome-copy">Bangun koleksi microstock yang lebih terarah, dari riset pertama sampai metadata siap ditinjau.</p></div>
            <a className="primary-action" href="#conversation"><span>+</span> Mulai misi <Icon name="arrow" size={15}/></a>
          </section>

          <section className="stat-grid" aria-label="Ringkasan studio">
            <article className="stat-card"><span className="stat-icon sage"><Icon name="layers" size={17}/></span><div><span className="stat-label">MISI BERJALAN</span><strong>{pipeline.running ? "01" : "00"}</strong><small>{pipeline.running ? pipeline.topic || "Misi tanpa judul" : "Belum ada misi aktif"}</small></div><span className={`live-dot ${pipeline.running ? "on" : ""}`} /></article>
            <article className="stat-card"><span className="stat-icon lilac"><Icon name="users" size={17}/></span><div><span className="stat-label">AGENT BEKERJA</span><strong>{String(activeCount).padStart(2, "0")} <em>/ 03</em></strong><small>{activeCount ? "Sedang menangani tugas" : "Tim siap menerima brief"}</small></div></article>
            <article className="stat-card"><span className="stat-icon amber"><Icon name="archive" size={17}/></span><div><span className="stat-label">ASET HARI INI</span><strong>{snapshot?.daily.generated ?? "—"}</strong><small>{snapshot ? `${snapshot.daily.remaining} request tersisa hari ini` : "Data kuota belum tersedia"}</small></div></article>
          </section>

          <div className="workspace-grid">
            <div className="workspace-primary">
              <section className="panel mission-panel" id="mission">
                <div className="panel-heading"><div><p className="kicker">MISSION CONTROL</p><h2>{pipeline.running ? "Misi sedang berjalan" : "Ruang misi"}</h2></div><span className={`mission-state ${pipeline.running ? "is-running" : ""}`}><i/>{pipeline.running ? "IN PROGRESS" : "STANDBY"}</span></div>
                {pipeline.running ? <>
                  <div className="mission-summary"><div className="mission-thumbnail"><Icon name="spark" size={23}/></div><div className="mission-copy"><span>MICROSTOCK RESEARCH SPRINT</span><h3>{pipeline.topic || "Eksplorasi ide baru"}</h3><p>{pipeline.phase || pipeline.stage || "Tim sedang memproses brief Anda."}</p></div><span className="mission-priority">ACTIVE</span></div>
                  <div className="stage-track" aria-label={`Tahap ${stageIndex + 1} dari ${stageLabels.length}`}>
                    {stageLabels.map((stage, index) => <div key={stage} className={`stage-item ${index < stageIndex ? "is-done" : index === stageIndex ? "is-current" : ""}`}><span className="stage-marker">{index < stageIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{stage}</span></div>)}
                  </div>
                </> : <div className="mission-empty"><span className="empty-icon"><Icon name="spark" size={20}/></span><div><strong>Belum ada misi aktif</strong><p>Tulis tujuan atau topik di percakapan untuk memulai riset dan menyusun prompt.</p></div><a href="#conversation">Tulis brief <Icon name="arrow" size={14}/></a></div>}
              </section>

              <section className="team-section" id="team">
                <div className="section-heading"><div><p className="kicker">THE CREW</p><h2>Tim agent</h2></div><span className="section-caption">{activeCount ? `${activeCount} sedang bekerja` : "Semua siap menerima tugas"}</span></div>
                <div className="agent-grid">{AGENT_IDS.map((id) => <div className="agent-card-wrap" key={id}><AgentPanel agentId={id}/><div className="agent-card-caption"><span>{AGENT_META[id].role}</span><span>{statusLabel[agentStatuses[id]]}</span></div></div>)}</div>
              </section>
            </div>

            <aside className="workspace-rail">
              <section className="panel workflow-panel"><div className="rail-heading"><div><p className="kicker">ALUR KERJA</p><h2>Dari ide ke aset</h2></div><span className="workflow-count">04</span></div><ol className="workflow-list">{stageLabels.map((stage, index) => <li key={stage} className={pipeline.running && stageIndex === index ? "is-current" : ""}><span className="workflow-number">0{index + 1}</span><div><strong>{stage}</strong><small>{["Hera mencari peluang dan konteks pasar", "Ares menyusun prompt siap pakai", "Anda membuat gambar di generator pilihan", "Hades meninjau gambar dan metadata"][index]}</small></div></li>)}</ol><p className="workflow-footnote">Aset dibuat oleh Anda di generator gambar pilihan. Agent tidak mengunggah ke Adobe Stock.</p></section>
              <section className="panel activity-panel" id="activity"><div className="rail-heading"><div><p className="kicker">LIVE FEED</p><h2>Aktivitas terbaru</h2></div><span className="feed-live"><i/>LIVE</span></div>{logs.length ? <ol className="activity-list">{[...logs].reverse().slice(0, 5).map((log) => <li key={log.id}><span className={`activity-dot ${log.level}`}/><div><p>{log.text}</p><small>{log.agent ? `${AGENT_META[log.agent].name} · ` : "Studio · "}{new Date(log.ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</small></div></li>)}</ol> : <div className="activity-empty"><span><Icon name="clock" size={17}/></span><p>Aktivitas tim akan muncul di sini saat misi berjalan.</p></div>}</section>
            </aside>
          </div>

          <section className="panel conversation-panel" id="conversation"><div className="conversation-header"><div><p className="kicker">STUDIO MESSENGER</p><h2>Percakapan & hasil kerja</h2><p className="conversation-description">Beri instruksi, tinjau respons, dan unduh hasil QC atau metadata.</p></div><span className="conversation-online"><i/>AGENT CHANNELS READY</span></div><div className="studio-chat"><Chatbox/></div></section>
          <footer className="studio-footer"><span>c0desk1 studio</span><span>Riset terbantu AI · Keputusan akhir tetap di tangan Anda</span></footer>
        </div>
      </section>
      <FloatingBar client:only="react" />
    </main>
  );
}
