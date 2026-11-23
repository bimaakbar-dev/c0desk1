import type { AgentCallSpec, AgentExpression, AgentMode, EyeDirection } from "./callRoomConfig";

interface SpringChannel {
  value: number;
  velocity: number;
}

interface AgentSpringRig {
  lookX: SpringChannel;
  lookY: SpringChannel;
  tiltDeg: SpringChannel;
  bobPx: SpringChannel;
  scaleY: SpringChannel;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const rigs = new Map<string, AgentSpringRig>();

function createSpring(initial = 0): SpringChannel {
  return { value: initial, velocity: 0 };
}

function getRig(id: string): AgentSpringRig {
  let rig = rigs.get(id);
  if (!rig) {
    rig = {
      lookX: createSpring(0),
      lookY: createSpring(0),
      tiltDeg: createSpring(0),
      bobPx: createSpring(0),
      scaleY: createSpring(1),
    };
    rigs.set(id, rig);
  }
  return rig;
}

function stepSpring(
  ch: SpringChannel,
  target: number,
  dt: number,
  stiffness = 140,
  damping = 18
): number {
  const clampedDt = Math.min(Math.max(dt, 0.001), 0.05);
  const force = (target - ch.value) * stiffness - ch.velocity * damping;
  ch.velocity += force * clampedDt;
  ch.value += ch.velocity * clampedDt;
  return ch.value;
}

function directionToCoords(dir: EyeDirection): { x: number; y: number } {
  switch (dir) {
    case "up-right":
      return { x: 14, y: -11 };
    case "up-left":
      return { x: -14, y: -11 };
    case "up":
      return { x: 0, y: -13 };
    case "down-right":
      return { x: 14, y: 11 };
    case "down-left":
      return { x: -14, y: 11 };
    case "down":
      return { x: 0, y: 12 };
    default:
      return { x: 0, y: 0 };
  }
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

export function mountGrokSvgAvatar(container: HTMLElement, spec: AgentCallSpec) {
  container.innerHTML = "";

  const svg = svgEl("svg", {
    viewBox: "0 0 220 176",
    class: "grok-svg-avatar",
    "aria-label": `${spec.name} Grok Bot Avatar`,
  });

  const defs = svgEl("defs", {});
  const auraId = `aura-${spec.id}`;
  const grad = svgEl("radialGradient", { id: auraId, cx: "50%", cy: "52%", r: "50%" });
  grad.append(
    svgEl("stop", { offset: "0%", "stop-color": spec.accentHex, "stop-opacity": "0.24" }),
    svgEl("stop", { offset: "100%", "stop-color": spec.accentHex, "stop-opacity": "0" })
  );
  defs.append(grad);

  const auraCircle = svgEl("circle", { cx: 110, cy: 90, r: 82, fill: `url(#${auraId})` });
  const headGroup = svgEl("g", { transform: "translate(110, 90)" });

  const pulseRing = svgEl("circle", {
    cx: 0,
    cy: 0,
    r: 64,
    fill: "none",
    stroke: spec.accentHex,
    "stroke-width": 1.6,
    "stroke-dasharray": "10 6",
    opacity: "0.25",
  });

  const orbShell = svgEl("circle", {
    cx: 0,
    cy: 0,
    r: 58,
    fill: spec.shellHex,
    stroke: spec.accentHex,
    "stroke-width": 2.4,
  });

  const specularArc = svgEl("path", {
    d: "M -34 -36 A 50 50 0 0 1 18 -46",
    fill: "none",
    stroke: "#ffffff",
    "stroke-width": 2.4,
    "stroke-linecap": "round",
    opacity: "0.18",
  });

  const faceGroup = svgEl("g", {});
  const leftEye = svgEl("rect", {
    x: -24,
    y: -18,
    width: 14,
    height: 22,
    rx: 7,
    fill: spec.eyeHex,
  });
  const rightEye = svgEl("rect", {
    x: 10,
    y: -18,
    width: 14,
    height: 22,
    rx: 7,
    fill: spec.eyeHex,
  });
  const mouthPath = svgEl("path", {
    d: "M -7 18 H 7",
    fill: "none",
    stroke: spec.accentHex,
    "stroke-width": 2.8,
    "stroke-linecap": "round",
  });

  faceGroup.append(leftEye, rightEye, mouthPath);
  headGroup.append(pulseRing, orbShell, specularArc, faceGroup);
  svg.append(defs, auraCircle, headGroup);
  container.appendChild(svg);

  return function update(
    expression: AgentExpression,
    eyeDir: EyeDirection,
    mode: AgentMode,
    timeSec: number,
    dt: number,
    seed: number
  ) {
    const rig = getRig(spec.id);
    const baseLook = directionToCoords(eyeDir);

    let targetLookX = baseLook.x;
    let targetLookY = baseLook.y;
    let targetBob = Math.sin(timeSec * 2.0 + seed) * 2.4;
    let targetTilt = Math.sin(timeSec * 1.4 + seed) * 2.2;
    let targetScaleY = 1;

    if (mode === "working") {
      targetLookX = Math.sin(timeSec * 1.8 + seed) * 13;
      targetLookY = -7 + Math.cos(timeSec * 2.7 + seed) * 5;
      targetBob = Math.sin(timeSec * 3.6 + seed) * 3.4;
      targetTilt = Math.sin(timeSec * 1.8 + seed) * 4.5;
      targetScaleY = 1 + Math.sin(timeSec * 3.6 + seed) * 0.025;
    } else if (expression === "thinking") {
      targetTilt = -5.5 + Math.sin(timeSec * 1.7 + seed) * 1.8;
      targetBob = Math.sin(timeSec * 2.2 + seed) * 2.6;
    } else if (expression === "surprised") {
      targetBob = -5.5 + Math.sin(timeSec * 11.0 + seed) * 1.8;
      targetScaleY = 1.04;
    } else if (expression === "speaking") {
      targetBob = -Math.abs(Math.sin(timeSec * 7.5 + seed)) * 3.8;
      targetScaleY = 1 + Math.sin(timeSec * 7.5 + seed) * 0.03;
    }

    const lx = stepSpring(rig.lookX, targetLookX, dt, 155, 17);
    const ly = stepSpring(rig.lookY, targetLookY, dt, 155, 17);
    const tilt = stepSpring(rig.tiltDeg, targetTilt, dt, 120, 16);
    const bob = stepSpring(rig.bobPx, targetBob, dt, 130, 16);
    const sy = stepSpring(rig.scaleY, targetScaleY, dt, 150, 18);

    const cx = 110 + lx * 0.22;
    const cy = 90 + bob + ly * 0.18;
    headGroup.setAttribute(
      "transform",
      `translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${tilt.toFixed(2)}) scale(1, ${sy.toFixed(3)})`
    );

    pulseRing.setAttribute(
      "opacity",
      mode === "working" ? (0.24 + 0.16 * Math.sin(timeSec * 4 + seed)).toFixed(2) : "0.08"
    );

    const faceX = lx * 0.48;
    const faceY = ly * 0.48;
    faceGroup.setAttribute("transform", `translate(${faceX.toFixed(2)}, ${faceY.toFixed(2)})`);

    const blink = Math.sin(timeSec * 2.5 + seed) > 0.99;
    const slantDeg = mode === "working" || expression === "focused" ? 13 : 8;

    const applyEyeShape = (el: SVGRectElement, centerX: number, sign: number) => {
      el.setAttribute("transform", `translate(${centerX}, -7) rotate(${(sign * slantDeg).toFixed(1)})`);
      if (blink) {
        el.setAttribute("x", "-8");
        el.setAttribute("y", "-1.5");
        el.setAttribute("width", "16");
        el.setAttribute("height", "3");
        el.setAttribute("rx", "1.5");
      } else if (expression === "surprised") {
        el.setAttribute("x", "-8.5");
        el.setAttribute("y", "-13");
        el.setAttribute("width", "17");
        el.setAttribute("height", "26");
        el.setAttribute("rx", "8.5");
      } else if (expression === "focused" || mode === "working") {
        el.setAttribute("x", "-8");
        el.setAttribute("y", "-8");
        el.setAttribute("width", "16");
        el.setAttribute("height", "16");
        el.setAttribute("rx", "7");
      } else {
        el.setAttribute("x", "-7.5");
        el.setAttribute("y", "-11");
        el.setAttribute("width", "15");
        el.setAttribute("height", "22");
        el.setAttribute("rx", "7.5");
      }
    };

    applyEyeShape(leftEye, -17, -1);
    applyEyeShape(rightEye, 17, 1);

    if (expression === "happy") {
      mouthPath.setAttribute("d", "M -8 17 Q 0 24 8 17");
      mouthPath.setAttribute("fill", "none");
    } else if (expression === "surprised") {
      mouthPath.setAttribute("d", "M -5 18 A 5 5 0 1 0 5 18 A 5 5 0 1 0 -5 18");
      mouthPath.setAttribute("fill", spec.accentHex);
    } else if (expression === "thinking") {
      mouthPath.setAttribute("d", "M -8 19 Q 1 15 8 18");
      mouthPath.setAttribute("fill", "none");
    } else if (expression === "speaking") {
      const open = 3 + Math.abs(Math.sin(timeSec * 10 + seed)) * 6;
      mouthPath.setAttribute("d", `M -7 ${(18 - open / 2).toFixed(1)} H 7 V ${(18 + open / 2).toFixed(1)} H -7 Z`);
      mouthPath.setAttribute("fill", spec.accentHex);
    } else {
      mouthPath.setAttribute("d", "M -7 18 H 7");
      mouthPath.setAttribute("fill", "none");
    }
  };
}