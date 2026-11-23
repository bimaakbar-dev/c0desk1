import { useEffect, useRef, useState } from "react";
import { AvatarEngine, type AvatarState } from "../lib/avatarEngine";
import type { AgentId, AgentStatus, GazeTarget } from "../lib/studioBus";

interface Props {
  agentId: AgentId;
  accent: string;
  status: AgentStatus;
  gaze: GazeTarget;
  bubble: string | null;
}

const initial: AvatarState = {
  squash: 0,
  eyeOffsetX: 0,
  eyeOffsetY: 0,
  eyeScale: 1,
  lidClosed: 0,
};

export default function GrokBotAvatar({ agentId, accent, status, gaze, bubble }: Props) {
  const [s, setS] = useState<AvatarState>(initial);
  const engineRef = useRef<AvatarEngine | null>(null);

  useEffect(() => {
    const engine = new AvatarEngine(agentId, setS);
    engineRef.current = engine;
    engine.setStatus(status);
    engine.setGaze(gaze);
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setStatus(status);
  }, [status]);

  useEffect(() => {
    engineRef.current?.setGaze(gaze);
  }, [gaze]);

  const bodyTransform = `scaleY(${1 - s.squash}) scaleX(${1 + s.squash * 0.5})`;
  const eyeTransform = `translate(${s.eyeOffsetX}px, ${s.eyeOffsetY}px) scale(${s.eyeScale})`;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-25 transition-opacity duration-700"
        style={{ backgroundColor: accent }}
      />

      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id={`body-${agentId}`} cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="100%" stopColor="#c8c8cc" />
            </radialGradient>
          </defs>

          <g
            style={{
              transform: bodyTransform,
              transformOrigin: "50px 60px",
              transformBox: "view-box",
            }}
          >
            <path
              d="M50,10 C75,10 90,30 90,55 C90,80 75,95 50,95 C25,95 10,80 10,55 C10,30 25,10 50,10 Z"
              fill={`url(#body-${agentId})`}
              stroke={accent}
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
          </g>

          <g
            style={{
              transform: eyeTransform,
              transformOrigin: "50px 50px",
              transformBox: "view-box",
            }}
          >
            <rect x="30" y="42" width="12" height="16" rx="6" fill="#0a0a0a" />
            <rect x="58" y="42" width="12" height="16" rx="6" fill="#0a0a0a" />
            <rect x="30" y="42" width="12" height={16 * s.lidClosed} rx="6" fill="#e8e8ec" />
            <rect x="58" y="42" width="12" height={16 * s.lidClosed} rx="6" fill="#e8e8ec" />
          </g>
        </svg>

        {bubble && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20">
            <div
              key={bubble}
              className="animate-bubble-in relative bg-foreground text-background text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl max-w-[200px] text-center leading-snug"
            >
              {bubble}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}