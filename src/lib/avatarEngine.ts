import type { AgentId, GazeTarget, AgentStatus } from "./studioBus";

export interface AvatarState {
  squash: number;
  eyeOffsetX: number;
  eyeOffsetY: number;
  eyeScale: number;
  lidClosed: number;
}

const GAZE_MAP: Record<AgentId, Partial<Record<GazeTarget, [number, number]>>> = {
  hera: { ares: [6, 1], hades: [1, 5], user: [7, 6] },
  ares: { hera: [-6, 1], hades: [-6, 5], user: [-1, 6] },
  hades: { hera: [1, -5], ares: [6, -6], user: [7, 1] },
};

interface StatusCfg {
  eyeScale: number;
  squash: number;
  wanderSpeed: number;
  wanderAmpX: number;
  wanderAmpY: number;
  breathSpeed: number;
}

const STATUS_CFG: Record<AgentStatus, StatusCfg> = {
  idle: { eyeScale: 1.0, squash: 0, wanderSpeed: 0.0004, wanderAmpX: 4, wanderAmpY: 2, breathSpeed: 0.0012 },
  researching: { eyeScale: 1.02, squash: 0.02, wanderSpeed: 0.002, wanderAmpX: 8, wanderAmpY: 2, breathSpeed: 0.0012 },
  thinking: { eyeScale: 1.0, squash: 0.03, wanderSpeed: 0.0008, wanderAmpX: 3, wanderAmpY: 5, breathSpeed: 0.0015 },
  working: { eyeScale: 0.92, squash: -0.02, wanderSpeed: 0.0004, wanderAmpX: 2, wanderAmpY: 1, breathSpeed: 0.001 },
  checking: { eyeScale: 0.96, squash: 0, wanderSpeed: 0.0014, wanderAmpX: 6, wanderAmpY: 1, breathSpeed: 0.0012 },
  receiving: { eyeScale: 1.15, squash: 0.03, wanderSpeed: 0, wanderAmpX: 0, wanderAmpY: 0, breathSpeed: 0.0016 },
  success: { eyeScale: 1.06, squash: -0.02, wanderSpeed: 0, wanderAmpX: 0, wanderAmpY: 0, breathSpeed: 0.001 },
  error: { eyeScale: 0.85, squash: 0.02, wanderSpeed: 0, wanderAmpX: 0, wanderAmpY: 0, breathSpeed: 0.002 },
  done: { eyeScale: 1.0, squash: 0, wanderSpeed: 0, wanderAmpX: 0, wanderAmpY: 0, breathSpeed: 0.0012 },
};

function spring(c: number, t: number, v: number, k = 0.2, d = 0.72): [number, number] {
  const force = (t - c) * k;
  v = (v + force) * d;
  c += v;
  return [c, v];
}

export class AvatarEngine {
  private agentId: AgentId;
  private onUpdate: (s: AvatarState) => void;

  private state: AvatarState = { squash: 0, eyeOffsetX: 0, eyeOffsetY: 0, eyeScale: 1, lidClosed: 0 };
  private target: AvatarState = { ...this.state };
  private velocities: Record<string, number> = {};

  private status: AgentStatus = "idle";
  private gaze: GazeTarget = "center";

  private breathPhase = 0;
  private wanderPhase = 0;
  private blinkPhase = -1;
  private blinkTimer = 0;
  private nextBlinkTime = 3000;
  private pendingBlinks = 0;
  private blinkQueueTime = 0;

  private lastTime = 0;
  private frameId: number | null = null;

  constructor(agentId: AgentId, onUpdate: (s: AvatarState) => void) {
    this.agentId = agentId;
    this.onUpdate = onUpdate;
    this.startLoop();
  }

  setStatus(status: AgentStatus) {
    const prev = this.status;
    this.status = status;
    if ((status === "success" || status === "done") && prev !== status) {
      this.pendingBlinks = 1;
      this.blinkPhase = 0;
    }
    this.recomputeTargets();
  }

  setGaze(gaze: GazeTarget) {
    this.gaze = gaze;
    this.recomputeTargets();
  }

  private recomputeTargets() {
    const cfg = STATUS_CFG[this.status];
    const offset =
      this.gaze === "center" ? [0, 0] : GAZE_MAP[this.agentId][this.gaze] ?? [0, 0];
    this.target.eyeScale = cfg.eyeScale;
    this.target.squash = cfg.squash;
    this.target.eyeOffsetX = offset[0];
    this.target.eyeOffsetY = offset[1];
  }

  private startLoop() {
    const loop = (time: number) => {
      const dt = this.lastTime ? Math.min(time - this.lastTime, 48) : 16;
      this.lastTime = time;

      const cfg = STATUS_CFG[this.status];

      this.breathPhase += dt * cfg.breathSpeed;
      const breath = Math.sin(this.breathPhase) * 0.012;

      let wanderX = 0,
        wanderY = 0;
      if (this.gaze === "center" && cfg.wanderAmpX > 0) {
        this.wanderPhase += dt * cfg.wanderSpeed;
        wanderX = Math.sin(this.wanderPhase * 1.3) * cfg.wanderAmpX;
        wanderY = Math.cos(this.wanderPhase * 0.9) * cfg.wanderAmpY;
      }

      if (this.blinkPhase >= 0) {
        this.blinkPhase += dt / 140;
        if (this.blinkPhase >= 1) {
          this.blinkPhase = -1;
          if (this.pendingBlinks > 0) {
            this.pendingBlinks--;
            this.blinkQueueTime = 80;
          }
        }
      } else if (this.blinkQueueTime > 0) {
        this.blinkQueueTime -= dt;
        if (this.blinkQueueTime <= 0) {
          this.blinkQueueTime = 0;
          this.blinkPhase = 0;
        }
      } else {
        this.blinkTimer += dt;
        if (this.blinkTimer >= this.nextBlinkTime) {
          this.blinkPhase = 0;
          this.blinkTimer = 0;
          this.nextBlinkTime = 2500 + Math.random() * 3500;
        }
      }

      const targets = {
        squash: this.target.squash + breath,
        eyeOffsetX: this.target.eyeOffsetX + wanderX,
        eyeOffsetY: this.target.eyeOffsetY + wanderY,
        eyeScale: this.target.eyeScale,
        lidClosed: this.blinkPhase >= 0 ? Math.sin(this.blinkPhase * Math.PI) : 0,
      };

      for (const k of Object.keys(targets) as (keyof AvatarState)[]) {
        const [nv, nvel] = spring(
          this.state[k],
          targets[k],
          this.velocities[k] ?? 0,
          k === "squash" ? 0.1 : 0.2,
          k === "squash" ? 0.8 : 0.72
        );
        this.state[k] = nv;
        this.velocities[k] = nvel;
      }

      this.onUpdate({ ...this.state });
      this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }
}