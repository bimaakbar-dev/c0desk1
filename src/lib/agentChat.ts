import { getAgentConfig, getApiKey, getModel } from "./agentConfigStore";
import { callLLM } from "./providers";
import { bus, AGENT_IDS, AGENT_META, type AgentId } from "./studioBus";
import { agentStateStore, type StudioState } from "./agentStateStore";
import { checkQuota } from "./dailyQuotaStore";
import { getHistory, appendTurn } from "./chatHistoryStore";

const PERSONAS: Record<AgentId, string> = {
  hera: `Kamu Hera, rekan kerja AI dan peneliti pasar microstock di c0desk1 Studio. Berpikir mandiri, analitis, dan proaktif; bantu pengguna memahami tren, peluang, kompetitor, dan ide prompt. Jawab alami dalam Bahasa Indonesia.`,
  ares: `Kamu Ares, rekan kerja AI untuk generasi gambar di c0desk1 Studio. Berpikir praktis dan proaktif tentang konsep visual, prompt, dan proses pembuatan aset. Jawab alami dalam Bahasa Indonesia.`,
  hades: `Kamu Hades, rekan kerja AI untuk QC dan metadata microstock di c0desk1 Studio. Teliti, kritis, dan fokus pada kualitas serta paket hasil yang siap digunakan. Jawab alami dalam Bahasa Indonesia.`,
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

  const system = `${cfg.systemPrompt || PERSONAS[agentId]}\n\nPanduan percakapan:\n- Tanggapi maksud dan konteks percakapan secara langsung; jangan otomatis membacakan status konfigurasi atau kuota kecuali pengguna menanyakannya.\n- Berikan analisis dan saran terbaikmu secara proaktif, tetapi jangan mengaku memakai web, sumber langsung, atau menjalankan aksi yang sebenarnya tidak tersedia.\n- Simpan penalaran internal; sampaikan kesimpulan dan alasan ringkas, bukan langkah berpikir tersembunyi.\n- Jika pengguna meminta pekerjaan yang bisa dijalankan aplikasi, jelaskan atau mulai alur kerja yang tersedia, bukan sekadar berkata siap.`;

  bus.emit({
    type: "agent",
    id: agentId,
    patch: { status: "thinking", gaze: "user", bubble: "Mengecek kondisi..." },
  });

  try {
    const res = await callLLM(cfg, {
      system,
      user: `Konteks operasional (gunakan hanya bila relevan; jangan dibacakan kecuali ditanya):\n${ctxText}${historyText}\n\nPesan baru dari pengguna: "${userMessage}"\n\nTanggapi maksud pengguna secara alami dan jujur. Berikan analisis secukupnya, tanyakan klarifikasi bila memang diperlukan, dan jangan mengklaim melakukan riset web atau aksi di luar kemampuan yang tersedia.`,
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
  | { kind: "pipeline"; topic?: string }
  | { kind: "ignored"; text: string };

function parseHeraWorkRequest(text: string): { matched: boolean; topic?: string } {
  const body = text.replace(/^hera\b[,:]?\s*/i, "").trim();
  const startWork = body.match(
    /^(?:(?:tolong|ayo|silakan)\s+)*(?:mulai bekerja|mulai kerja|mulai pipeline|jalankan pipeline|eksekusi pipeline|mulai riset|kerjakan riset)\s*(.*)$/i
  );
  if (startWork) {
    const topic = startWork[1]
      .replace(/^(?:dengan topik|tentang|untuk)\s+/i, "")
      .replace(/^['\"]|['\"]$/g, "")
      .trim();
    return { matched: true, topic: topic || undefined };
  }

  const research = body.match(
    /^(?:(?:tolong|ayo|silakan)\s+)*(?:riset|teliti|analisis(?:kan)?(?:\s+pasar)?)\s+(?:(?:tentang|untuk|soal|topik)\s+)?(.+)$/i
  );
  if (research) {
    const topic = research[1].replace(/^['\"]|['\"]$/g, "").trim();
    return { matched: true, topic: topic || undefined };
  }

  return { matched: false };
}

export function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();

  const allMatch = trimmed.match(/^@all(?:\s+([\s\S]*))?$/i);
  if (allMatch) {
    const body = (allMatch[1] || "").trim() || "Apa yang bisa kalian bantu?";
    return { kind: "chat", targets: [...AGENT_IDS], text: body };
  }

  const singleMatch = trimmed.match(/^@(hera|ares|hades)(?:\s+([\s\S]*))?$/i);
  if (singleMatch) {
    const target = singleMatch[1].toLowerCase() as AgentId;
    const body = (singleMatch[2] || "").trim();
    if (target === "hera") {
      const workRequest = parseHeraWorkRequest(body);
      if (workRequest.matched) return { kind: "pipeline", topic: workRequest.topic };
    }
    return {
      kind: "chat",
      targets: [target],
      text: body || "Hai, apa yang bisa kamu bantu?",
    };
  }

  return { kind: "ignored", text: trimmed };
}
