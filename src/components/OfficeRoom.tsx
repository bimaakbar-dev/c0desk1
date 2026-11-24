import { useState } from "react";
import type { AutomationStatusSnapshot } from "../lib/automationStatus";
import AgentPanel from "./AgentPanel";
import AutomationStatus from "./AutomationStatus";
import Chatbox from "./Chatbox";
import FloatingBar from "./FloatingBar";

interface Props {
  snapshot: AutomationStatusSnapshot | null;
}

export default function OfficeRoom({ snapshot }: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className="office-app office-game min-h-screen flex flex-col text-foreground">
      <header className="office-header">
        <a href="/" className="office-brand" aria-label="c0desk1 Studio beranda">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>
            <strong>c0desk1</strong>
            <small>OFFICE SIMULATION</small>
          </span>
        </a>
        <div className="office-toolbar">
          <span className="office-date"><span aria-hidden="true">◷</span> CREATIVE FLOOR <i /> SHIFT 01</span>
          <AutomationStatus snapshot={snapshot} />
        </div>
      </header>

      <section className="office-main" aria-labelledby="office-title">
        <div className="office-world-header">
          <div>
            <p className="section-eyebrow">OFFICE LIFE · IDLE STUDIO</p>
            <h1 id="office-title">Your creative office</h1>
            <p className="office-subtitle">Ares prepares the prompts. You create the images, then Hades takes over.</p>
          </div>
          <div className="office-headcount" aria-label="Three AI teammates">
            <span className="headcount-avatars" aria-hidden="true"><i>H</i><i>A</i><i>D</i></span>
            <span><strong>03</strong><small>TEAMMATES</small></span>
          </div>
        </div>

        <div className="office-room" aria-label="Office floor with three AI teammates at their desks">
          <div className="office-wall" aria-hidden="true">
            <div className="office-window"><i /><i /><i /><i /></div>
            <div className="office-noteboard"><span>TEAM NOTES</span><i /><i /><i /></div>
            <div className="office-shelf"><i /><i /><i /></div>
          </div>
          <div className="office-floor">
            <div className="office-floor-label"><span>CREATIVE FLOOR</span><span>03 AGENTS · IDLE WORK IN PROGRESS</span></div>
            <div className="office-workstations">
              <AgentPanel agentId="hera" />
              <AgentPanel agentId="ares" />
              <AgentPanel agentId="hades" />
            </div>
            <div className="office-lounge" aria-hidden="true"><span /><span /></div>
            <div className="office-plant" aria-hidden="true"><i /><i /><i /><i /><i /><span /></div>
            <div className="office-visitor">
              <span className="visitor-avatar">B</span>
              <span><strong>Your desk</strong><small>Team lead</small></span>
            </div>
          </div>
          <div className="office-room-footer"><span>OFFICE LIFE · CREATIVE FLOOR</span><span>SHIFT 01</span></div>
        </div>
      </section>

      <button
        type="button"
        className="chat-launcher"
        onClick={() => setChatOpen((open) => !open)}
        aria-expanded={chatOpen}
        aria-controls="office-chat-panel"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {chatOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />}
        </svg>
        <span>{chatOpen ? "Close chat" : "Talk to the team"}</span>
        {!chatOpen && <i className="chat-launcher-dot" aria-hidden="true" />}
      </button>

      <aside
        id="office-chat-panel"
        className={`office-chat-drawer ${chatOpen ? "is-open" : ""}`}
        aria-label="Chat with your AI team"
        aria-hidden={!chatOpen}
        inert={!chatOpen}
      >
        <div className="office-chat-heading">
          <div><span className="section-eyebrow">TEAM MESSENGER</span><h2>Talk to your team</h2></div>
          <span className="chat-heading-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" /></svg>
          </span>
        </div>
        <div className="office-chat-content"><Chatbox /></div>
        <p className="chat-note">Try <code>@hera</code>, <code>@ares</code>, or <code>@hades</code> to direct a message.</p>
      </aside>

      <FloatingBar client:only="react" />
    </main>
  );
}
