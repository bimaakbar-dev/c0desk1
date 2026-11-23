import { getAgentConfig, getApiKey, getModel } from "./agentConfigStore";
import { callLLM } from "./providers";
import { bus, AGENT_IDS, AGENT_META, type AgentId } from "./studioBus";
import { agentStateStore, type StudioState } from "./agentStateStore";
import { checkQuota } from "./dailyQuotaStore";
import { getHistory, appendTurn } from "./chatHistoryStore";

const PERSONAS: Record<AgentId, string> = {
  hera: `Kamu adalah Hera, peneliti pasar microstock di c0desk1 Studio.
Karakter: analitis, teliti, bicara padat data dan ringkas.
Tugasmu: riset tren microstock, analisis sudut kompetitor, dan menyusun prompt gambar untuk Ares.
Jawab dalam Bahasa Indonesia.`,
  ares: `Kamu adalah Ares, generator gambar di c0desk1 Studio.
Karakter: pragmatis, cepat, fokus hasil dan teknis model gambar.
Tugasmu: menerima prompt plan dari Hera dan menghasilkan aset gambar.
Jawab dalam Bahasa Indonesia.`,
  hades: `Kamu adalah Hades, spesialis metadata & quality control di c0desk1 Studio.
Karakter: perfeksionis, detail, fokus kualitas visual dan ekspor CSV + ZIP.
Tugasmu: QC kualitas aset dan menyusun metadata English.
Jawab dalam Bahasa Indonesia.`,
};

export interface ChatContext {
  enabled: boolean;
  provider: string;
  model: string;
  hasApiKey: boolean;
  quotaUsed: number;
  quotaLimit: number;
  lastTopic?: string | null;
  lastInsightSummary?: string;
  lastPlansCount?: number;
  totalGenerated?: number;
  lastGeneratedAt?: number | null;
  totalQC?: number;
  lastIssueCount?: number;
  lastRunAt?: number | null;
}

export function buildContext(agentId: AgentId, state: StudioState): ChatContext {
  const cfg = getAgentConfig(agentId);
  const quota = checkQuota();
  const baseCtx: ChatContext = {
    enabled: cfg.enabled,
    provider: cfg.provider,
    model: getModel(cfg),
    hasApiKey: Boolean(getApiKey(cfg)),
    quotaUsed: quota.used,
    quotaLimit: quota.limit,
  };

  if (agentId === "hera") {
    return {
      ...baseCtx,
      lastTopic: state.hera.lastTopic,
      lastInsightSummary: state.hera.lastInsight?.trendSummary,
      lastPlansCount: state.hera.lastPlans?.length,
      lastRunAt: state.hera.lastRunAt,
    };
  }
  if (agentId === "ares") {
    return {
      ...baseCtx,
      totalGenerated: state.ares.totalGenerated,
      lastGeneratedAt: state.ares.lastRunAt,
      lastRunAt: state.ares.lastRunAt,
    };
  }
  return {
    ...baseCtx,
    totalQC: state.hades.totalQC,
    lastIssueCount: state.hades.lastIssueCount,
    lastRunAt: state.hades.lastRunAt,
  };
}

function formatFallbackStatusReply(agentId: AgentId, ctx: ChatContext): string {
  const name = AGENT_META[agentId].name;
  if (!ctx.enabled) {
    return `${name} sedang dinonaktifkan (${ctx.provider} · ${ctx.model}).`;
  }
  const keyState = ctx.hasApiKey ? "API key siap" : "API key belum diisi";
  if (agentId === "hera") {
    const topicInfo = ctx.lastTopic
      ? `topik terakhir "${ctx.lastTopic}" (${ctx.lastPlansCount ?? 0} prompt)`
      : "belum ada riset dijalankan";
    return `${name} (${ctx.model}, ${keyState}): ${topicInfo}.`;
  }
  if (agentId === "ares") {
    return `${name} (${ctx.model}, ${keyState}): ${ctx.totalGenerated ?? 0} gambar dihasilkan, kuota ${ctx.quotaUsed}/${ctx.quotaLimit}.`;
  }
  return `${name} (${ctx.model}, ${keyState}): ${ctx.totalQC ?? 0} aset di-QC (${ctx.lastIssueCount ?? 0} catatan isu).`;
}

function shortBubble(text: string, max = 56): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : oneLine.slice(0, max).trimEnd() + "...";
}

export async function chatWithAgent(
  agentId: AgentId,
  userMessage: string,
  signal?: AbortSignal
): Promise<string> {
  const state = agentStateStore.get();
  const ctx = buildContext(agentId, state);
  const cfg = getAgentConfig(agentId);
  const name = AGENT_META[agentId].name;

  if (!cfg.enabled) {
    return formatFallbackStatusReply(agentId, ctx);
  }

  if (!getApiKey(cfg)) {
    const reply = formatFallbackStatusReply(agentId, ctx);
    bus.emit({
      type: "agent",
      id: agentId,
      patch: { status: "idle", gaze: "user", bubble: "API key belum diset" },
    });
    setTimeout(() => {
      bus.emit({
        type: "agent",
        id: agentId,
        patch: { status: "idle", gaze: "center", bubble: null },
      });
    }, 3500);
    return reply;
  }

  const history = getHistory(agentId);
  const ctxText = Object.entries(ctx)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const historyText =
    history.length > 0
      ? `\n\nRiwayat percakapan sebelumnya:\n${history
          .map((t) => `${t.role === "user" ? "User" : name}: ${t.content}`)
          .join("\n")}`
      : "";

  const system = cfg.systemPrompt || PERSONAS[agentId];

  bus.emit({
    type: "agent",
    id: agentId,
    patch: { status: "thinking", gaze: "user", bubble: "Mengecek kondisi..." },
  });

  try {
    const res = await callLLM(cfg, {
      system,
      user: `Data kondisi real-time kamu:\n${ctxText}${historyText}\n\nPesan baru: "${userMessage}"\n\nJawab singkat, jujur sesuai data real di atas, maksimal 140 kata.`,
      signal,
      retries: 0,
    });

    const reply = res.text.trim();

    bus.emit({
      type: "agent",
      id: agentId,
      patch: { status: "success", gaze: "user", bubble: shortBubble(reply) },
    });

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
    const fallback = `${name}: gagal menghubungi ${ctx.model} (${err?.message ?? "error"}).`;
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
    throw new Error(fallback);
  }
}

export type ParsedInput =
  | { kind: "chat"; targets: AgentId[]; text: string }
  | { kind: "ignored"; text: string };

export function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();

  const allMatch = trimmed.match(/^@all(?:\s+([\s\S]*))?$/i);
  if (allMatch) {
    const body = (allMatch[1] || "").trim() || "Bagaimana kondisi kalian saat ini?";
    return { kind: "chat", targets: [...AGENT_IDS], text: body };
  }

  const singleMatch = trimmed.match(/^@(hera|ares|hades)(?:\s+([\s\S]*))?$/i);
  if (singleMatch) {
    const target = singleMatch[1].toLowerCase() as AgentId;
    const body = (singleMatch[2] || "").trim() || "Bagaimana kondisimu saat ini?";
    return { kind: "chat", targets: [target], text: body };
  }

  return { kind: "ignored", text: trimmed };
}