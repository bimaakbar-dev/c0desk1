import { getAgentConfig, getApiKey } from "./agentConfigStore";
import { callLLM } from "./providers";
import { bus, AGENT_META, type AgentId } from "./studioBus";
import type { StudioState } from "./agentStateStore";
import { getHistory, appendTurn } from "./chatHistoryStore";

const PERSONAS: Record<AgentId, string> = {
  hera: `Kamu adalah Hera, peneliti pasar microstock di c0desk1 Studio.
Karakter: analitis, teliti, bicara padat data dan ringkas.
Atasanmu adalah Komandan (user). Bicaralah dengan hormat dan profesional.
Tugasmu: riset tren Adobe Stock, analisis kompetitor, susun prompt gambar untuk Ares.
Jawab dalam Bahasa Indonesia (kecuali istilah teknis seperti nama model atau keyword English).`,
  ares: `Kamu adalah Ares, generator gambar di c0desk1 Studio.
Karakter: pragmatis, cepat, fokus hasil dan efisiensi.
Atasanmu adalah Komandan (user).
Tugasmu: menerima prompt plan dari Hera, generate gambar via Gemini Image, serahkan ke Hades.
Jawab dalam Bahasa Indonesia.`,
  hades: `Kamu adalah Hades, spesialis metadata & quality control di c0desk1 Studio.
Karakter: perfeksionis, detail, tidak kompromi soal kualitas.
Atasanmu adalah Komandan (user).
Tugasmu: analisis gambar via vision, buat title/keywords/category DALAM BAHASA INGGRIS (target buyer global), QC kualitas visual, kemas output ke CSV + ZIP.
Catatan penting: metadata yang kamu hasilkan wajib English; tapi saat ngobrol dengan Komandan, jawab dalam Bahasa Indonesia.`,
};

export interface ChatContext {
  lastTopic?: string | null;
  lastInsightSummary?: string;
  lastPlansCount?: number;
  totalGenerated?: number;
  totalQC?: number;
  lastIssueCount?: number;
}

export function buildContext(agentId: AgentId, state: StudioState): ChatContext {
  if (agentId === "hera") {
    return {
      lastTopic: state.hera.lastTopic,
      lastInsightSummary: state.hera.lastInsight?.trendSummary,
      lastPlansCount: state.hera.lastPlans?.length,
    };
  }
  if (agentId === "ares") {
    return { totalGenerated: state.ares.totalGenerated };
  }
  return {
    totalQC: state.hades.totalQC,
    lastIssueCount: state.hades.lastIssueCount,
  };
}

function shortBubble(text: string, max = 60): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : oneLine.slice(0, max).trimEnd() + "...";
}

export async function chatWithAgent(
  agentId: AgentId,
  userMessage: string,
  ctx: ChatContext,
  signal?: AbortSignal
): Promise<string> {
  const cfg = getAgentConfig(agentId);
  if (!cfg.enabled) throw new Error(`${AGENT_META[agentId].name} sedang nonaktif.`);
  if (!getApiKey(cfg)) throw new Error(`API key ${AGENT_META[agentId].name} belum diisi.`);

  const history = getHistory(agentId);

  const ctxText =
    Object.entries(ctx)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n") || "(belum ada aktivitas)";

  const historyText =
    history.length > 0
      ? `\n\nRiwayat percakapan sebelumnya:\n${history
          .map(
            (t) =>
              `${t.role === "user" ? "Komandan" : AGENT_META[agentId].name}: ${t.content}`
          )
          .join("\n")}`
      : "";

  const system = cfg.systemPrompt || PERSONAS[agentId];

  // ---- Animasi: mulai berpikir ----
  bus.emit({
    type: "agent",
    id: agentId,
    patch: { status: "thinking", gaze: "user", bubble: "Membaca pesan..." },
  });

  try {
    const res = await callLLM(cfg, {
      system,
      user: `Konteks kerjamu:\n${ctxText}${historyText}\n\nPesan baru dari Komandan: "${userMessage}"\n\nBalas sebagai ${AGENT_META[agentId].name}, maksimal 200 kata.`,
      signal,
      retries: 0,
    });

    const reply = res.text.trim();

    // ---- Animasi: selesai, bubble tampil sebentar ----
    bus.emit({
      type: "agent",
      id: agentId,
      patch: { status: "success", gaze: "user", bubble: shortBubble(reply) },
    });

    // Bersihkan bubble setelah 4 detik
    setTimeout(() => {
      bus.emit({
        type: "agent",
        id: agentId,
        patch: { status: "idle", gaze: "center", bubble: null },
      });
    }, 4000);

    appendTurn(agentId, { role: "user", content: userMessage, ts: Date.now() });
    appendTurn(agentId, { role: "agent", content: reply, ts: Date.now() });

    return reply;
  } catch (err: any) {
    bus.emit({
      type: "agent",
      id: agentId,
      patch: { status: "error", gaze: "center", bubble: "Gagal merespons" },
    });
    setTimeout(() => {
      bus.emit({
        type: "agent",
        id: agentId,
        patch: { status: "idle", gaze: "center", bubble: null },
      });
    }, 3000);
    throw err;
  }
}

export type ParsedInput =
  | { kind: "chat"; agent: AgentId; text: string }
  | { kind: "pipeline"; text: string };

export function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();
  const m = trimmed.match(/^@(hera|ares|hades)\s+([\s\S]+)$/i);
  if (m) {
    return { kind: "chat", agent: m[1].toLowerCase() as AgentId, text: m[2] };
  }
  return { kind: "pipeline", text: trimmed };
}