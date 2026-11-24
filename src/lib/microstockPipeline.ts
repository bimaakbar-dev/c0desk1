import { pipelineStore } from "./pipelineStore";
import { bus, type Attachment } from "./studioBus";
import { getAgentConfig, getApiKey } from "./agentConfigStore";
import JSZip from "jszip";
import { callLLM } from "./providers";
import { agentStateStore } from "./agentStateStore";
import { pushLog } from "./logStore";
import { runAres, type AresPrompt } from "./aresAgent";
import type { HeraInsight, PromptPlan } from "./heraAgent";

type PlanAspectRatio = PromptPlan["aspectRatio"];

interface PipelinePlanItem {
  id: string;
  title: string;
  keywords: string[];
  plan: PromptPlan;
}


const VALID_ASPECT_RATIOS: PlanAspectRatio[] = ["16:9", "1:1", "4:5", "9:16"];

const AUTONOMOUS_NICHES = [
  "cleanroom airlock industrial architecture",
  "mountain cabin access winter road",
  "acoustic slat wall modern interior",
  "winter porch packages delivery doorstep",
  "indoor hydroponics leafy greens setup",
  "enterprise cloud security operations center",
];

let controller: AbortController | null = null;

function normalizeAspectRatio(value?: string): PlanAspectRatio {
  if (value && (VALID_ASPECT_RATIOS as string[]).includes(value)) {
    return value as PlanAspectRatio;
  }
  return "16:9";
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function shortBubble(text: string, max = 56): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : oneLine.slice(0, max).trimEnd() + "...";
}

function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}


async function pickAutonomousNiche(signal?: AbortSignal): Promise<string> {
  const state = agentStateStore.get();
  const previousTopic = state.hera.lastTopic ?? null;
  const pool = AUTONOMOUS_NICHES.filter(
    (n) => n.toLowerCase() !== previousTopic?.toLowerCase()
  );
  const fallback =
    pool[Math.floor(Math.random() * pool.length)] ?? AUTONOMOUS_NICHES[0];

  const heraCfg = getAgentConfig("hera");
  if (!heraCfg.enabled || !getApiKey(heraCfg)) {
    return fallback;
  }

  try {
    const res = await callLLM(heraCfg, {
      system:
        "Kamu adalah Hera, peneliti pasar microstock di c0desk1 Studio. Pilih SATU niche microstock dengan permintaan komersial tinggi dan kompetisi rendah (seperti cleanroom airlock, acoustic slat wall, mountain cabin access, winter porch packages, indoor hydroponics, atau teknologi B2B). Balas HANYA nama niche singkat (3-6 kata) tanpa tanda kutip atau penjelasan.",
      user: `Topik sebelumnya: "${previousTopic ?? "belum ada"}". Pilih satu niche baru yang berbeda.`,
      signal,
      retries: 0,
    });
    const chosen = res.text.replace(/["\n]/g, "").trim();
    return chosen || fallback;
  } catch {
    return fallback;
  }
}

function buildFallbackBundle(topic: string): {
  insight: HeraInsight;
  items: PipelinePlanItem[];
} {
  const baseWords = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 6);

  const kw = Array.from(
    new Set([
      ...baseWords,
      "commercial",
      "minimalist",
      "architecture",
      "editorial",
      "stock",
    ])
  );

  const negativePrompt =
    "glossy plastic, CGI render, watermark, text, logo, blurry, distorted anatomy";

  const insight: HeraInsight = {
    niche: topic,
    trendSummary: `Peluang microstock komersial pada niche "${topic}" dengan sudut pandang spesifik dan kompetisi relatif rendah.`,
    competitors: [
      {
        name: "Generic Stock Scenes",
        angle: "Staged studio setups",
        gap: "Kurang terasa dokumenter dan minim ruang copy space alami",
      },
      {
        name: "Over-Processed AI Renders",
        angle: "High-gloss synthetic look",
        gap: "Tekstur permukaan terasa plastik sehingga kurang cocok untuk editorial",
      },
    ],
    keywordClusters: [
      { theme: "Core Niche", keywords: kw },
      { theme: "Editorial & Layout", keywords: ["authentic texture", "copy space", "modern workspace"] },
    ],
    contentAngles: [
      "Wide editorial framing with clean negative space",
      "Close-up material and architectural detail",
    ],
    avoid: [
      "Plastic sheen or over-smoothed lighting",
      "Cluttered foreground props blocking text placement",
    ],
  };

  const items: PipelinePlanItem[] = [
    {
      id: "plan-1",
      title: `${topic} — Wide Editorial`,
      keywords: kw,
      plan: {
        prompt: `Documentary 35mm wide angle photograph of ${topic}, natural directional lighting, clean negative space on left, realistic textures, high detail`,
        negativePrompt,
        aspectRatio: "16:9",
      },
    },
    {
      id: "plan-2",
      title: `${topic} — Detail & Texture`,
      keywords: [...kw, "detail", "texture"],
      plan: {
        prompt: `Close-up architectural and material detail of ${topic}, soft ambient light, authentic surface grain, shallow depth of field, commercial stock photography`,
        negativePrompt,
        aspectRatio: "4:5",
      },
    },
  ];

  return { insight, items };
}

interface RawHeraPlan {
  id?: string;
  title?: string;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio?: string;
  keywords?: string[];
}

interface RawHeraResponse {
  niche?: string;
  trendSummary?: string;
  competitors?: { name?: string; angle?: string; gap?: string }[];
  keywordClusters?: { theme?: string; keywords?: string[] }[];
  contentAngles?: string[];
  avoid?: string[];
  plans?: RawHeraPlan[];
}

async function runHera(
  topic: string,
  signal?: AbortSignal
): Promise<{ insight: HeraInsight; items: PipelinePlanItem[] }> {
  const cfg = getAgentConfig("hera");
  bus.emit({
    type: "agent",
    id: "hera",
    patch: { status: "researching", gaze: "center", bubble: `Riset: ${topic}` },
  });

  const fb = buildFallbackBundle(topic);

  if (!cfg.enabled || !getApiKey(cfg)) {
    await delay(450, signal);
    bus.emit({
      type: "agent",
      id: "hera",
      patch: { status: "success", gaze: "ares", bubble: "Rencana siap -> Ares" },
    });
    return fb;
  }

  try {
    const res = await callLLM(cfg, {
      system: `Kamu adalah Hera, peneliti pasar microstock di c0desk1 Studio.
Balas HANYA JSON valid dengan struktur:
{
  "niche": "nama niche singkat",
  "trendSummary": "ringkasan tren & kompetisi singkat (Bahasa Indonesia)",
  "competitors": [{ "name": "nama", "angle": "sudut", "gap": "celah" }],
  "keywordClusters": [{ "theme": "tema", "keywords": ["kw1", "kw2"] }],
  "contentAngles": ["sudut 1", "sudut 2"],
  "avoid": ["hal dihindari 1", "hal dihindari 2"],
  "plans": [
    {
      "id": "plan-1",
      "title": "judul aset singkat",
      "prompt": "prompt gambar Bahasa Inggris detail & komersial",
      "negativePrompt": "hal yang harus dihindari saat render",
      "aspectRatio": "16:9",
      "keywords": ["kata", "kunci"]
    }
  ]
}
Gunakan aspectRatio dari: "16:9", "1:1", "4:5", atau "9:16". Buat 2 rencana gambar yang kuat dan berbeda sudut pandangnya.`,
      user: `Topik microstock: "${topic}". Susun rencana riset dan prompt untuk Ares.`,
      signal,
      retries: 1,
    });

    const parsed = parseJsonLoose<RawHeraResponse>(res.text);

    const competitors =
      Array.isArray(parsed?.competitors) && parsed.competitors.length > 0
        ? parsed.competitors.map((c, idx) => ({
            name: c.name || fb.insight.competitors[idx]?.name || `Competitor ${idx + 1}`,
            angle: c.angle || fb.insight.competitors[idx]?.angle || "General stock",
            gap: c.gap || fb.insight.competitors[idx]?.gap || "Needs sharper niche framing",
          }))
        : fb.insight.competitors;

    const keywordClusters =
      Array.isArray(parsed?.keywordClusters) && parsed.keywordClusters.length > 0
        ? parsed.keywordClusters.map((kc, idx) => ({
            theme: kc.theme || fb.insight.keywordClusters[idx]?.theme || `Cluster ${idx + 1}`,
            keywords:
              Array.isArray(kc.keywords) && kc.keywords.length > 0
                ? kc.keywords
                : fb.insight.keywordClusters[idx]?.keywords || fb.items[0].keywords,
          }))
        : fb.insight.keywordClusters;

    const items: PipelinePlanItem[] =
      Array.isArray(parsed?.plans) && parsed.plans.length > 0
        ? parsed.plans.slice(0, 3).map((p, idx) => {
            const fallbackItem = fb.items[idx] ?? fb.items[0];
            return {
              id: p.id || `plan-${idx + 1}`,
              title: p.title || `${topic} #${idx + 1}`,
              keywords:
                Array.isArray(p.keywords) && p.keywords.length > 0
                  ? p.keywords
                  : fallbackItem.keywords,
              plan: {
                prompt: p.prompt || fallbackItem.plan.prompt,
                negativePrompt: p.negativePrompt || fallbackItem.plan.negativePrompt,
                aspectRatio: normalizeAspectRatio(p.aspectRatio),
              },
            };
          })
        : fb.items;

    const insight: HeraInsight = {
      niche: parsed?.niche || fb.insight.niche,
      trendSummary: parsed?.trendSummary || fb.insight.trendSummary,
      competitors,
      keywordClusters,
      contentAngles:
        Array.isArray(parsed?.contentAngles) && parsed.contentAngles.length > 0
          ? parsed.contentAngles
          : fb.insight.contentAngles,
      avoid:
        Array.isArray(parsed?.avoid) && parsed.avoid.length > 0
          ? parsed.avoid
          : fb.insight.avoid,
    };

    bus.emit({
      type: "agent",
      id: "hera",
      patch: {
        status: "success",
        gaze: "ares",
        bubble: `${items.length} prompt -> Ares`,
      },
    });

    return { insight, items };
  } catch (err: any) {
    if (err?.name === "AbortError") throw err;
    pushLog({
      level: "warn",
      agent: "hera",
      text: `Fallback rencana Hera dipakai (${err?.message ?? "LLM error"}).`,
    });
    bus.emit({
      type: "agent",
      id: "hera",
      patch: { status: "success", gaze: "ares", bubble: "Fallback -> Ares" },
    });
    return fb;
  }
}

function topicSlug(topic: string): string {
  return (
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "microstock"
  );
}

function formatTelegramMessages(topic: string, prompts: AresPrompt[]): string[] {
  return prompts.map((item, index) =>
    [
      `c0desk1 Studio — Ares prompt ${index + 1}/${prompts.length}`,
      `Topik: ${topic}`,
      `Judul: ${item.title}`,
      `Prompt: ${item.plan.prompt}`,
      `Negative prompt: ${item.plan.negativePrompt}`,
      `Aspect ratio: ${item.plan.aspectRatio}`,
      `Keywords: ${item.keywords.slice(0, 20).join(", ").slice(0, 600)}`,
    ].join("\n")
  );
}

async function sendToTelegram(messages: string[], signal?: AbortSignal): Promise<void> {
  const response = await fetch("/api/telegram-send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });
  const result = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(result?.error || `Telegram gagal mengirim prompt (${response.status}).`);
  }
}

async function buildPromptAttachment(
  topic: string,
  insight: HeraInsight,
  prompts: AresPrompt[]
): Promise<Attachment> {
  const zip = new JSZip();
  const slug = topicSlug(topic);
  const promptText = prompts
    .map((item, index) =>
      [
        `PROMPT ${index + 1}: ${item.title}`,
        `Prompt: ${item.plan.prompt}`,
        `Negative prompt: ${item.plan.negativePrompt}`,
        `Aspect ratio: ${item.plan.aspectRatio}`,
        `Keywords: ${item.keywords.join(", ")}`,
      ].join("\n")
    )
    .join("\n\n---\n\n");

  zip.file(`${slug}-prompts.txt`, `Topik: ${topic}\n\n${promptText}\n`);
  zip.file(`${slug}-market-research.json`, JSON.stringify(insight, null, 2));

  return {
    kind: "zip",
    filename: `${slug}-prompt-bundle.zip`,
    label: `Bundle ${prompts.length} prompt + riset`,
    count: prompts.length,
    blob: await zip.generateAsync({ type: "blob" }),
  };
}

export const microstockPipeline = {
  async start(topic?: string): Promise<void> {
    if (pipelineStore.get().running) return;

    const requestedTopic = topic?.trim() || "";
    if (requestedTopic.length > 180) {
      bus.emit({
        type: "user-message",
        message: { from: "hera", text: "Topik maksimal 180 karakter." },
      });
      return;
    }

    controller = new AbortController();
    const signal = controller.signal;
    const autonomous = !requestedTopic;
    pipelineStore.set({
      running: true,
      topic: autonomous ? "Auto-Scout" : requestedTopic,
      phase: "hera",
      stage: "researching",
    });

    try {
      let activeTopic = requestedTopic;
      if (autonomous) {
        bus.emit({
          type: "agent",
          id: "hera",
          patch: {
            status: "researching",
            gaze: "center",
            bubble: "Memilih niche rendah kompetisi...",
          },
        });
        activeTopic = await pickAutonomousNiche(signal);
        pipelineStore.set({ running: true, topic: activeTopic, phase: "hera", stage: "researching" });
        bus.emit({
          type: "user-message",
          message: {
            from: "hera",
            text: `Inisiatif mandiri — saya memilih niche "${activeTopic}" dan mulai menyiapkan prompt untuk generator gambar manual.`,
          },
        });
      }

      const { insight, items } = await runHera(activeTopic, signal);
      agentStateStore.set({
        ...agentStateStore.get(),
        hera: {
          ...agentStateStore.get().hera,
          lastTopic: activeTopic,
          lastInsight: insight,
          lastPlans: items.map((item) => item.plan),
          lastRunAt: Date.now(),
        },
      });

      bus.emit({
        type: "handoff",
        from: "hera",
        to: "ares",
        payload: { topic: activeTopic, plansCount: items.length },
      });
      pipelineStore.set({ running: true, topic: activeTopic, phase: "ares", stage: "writing-prompts" });

      const prompts = await runAres(items, insight, signal);
      const previousState = agentStateStore.get();
      agentStateStore.set({
        ...previousState,
        hera: { ...previousState.hera, lastPlans: prompts.map((item) => item.plan) },
        ares: {
          ...previousState.ares,
          totalPrompts: previousState.ares.totalPrompts + prompts.length,
          lastRunAt: Date.now(),
        },
      });

      pipelineStore.set({ running: true, topic: activeTopic, phase: "ares", stage: "sending-telegram" });
      const attachment = await buildPromptAttachment(activeTopic, insight, prompts);
      let deliveryMessage: string;
      try {
        await sendToTelegram(formatTelegramMessages(activeTopic, prompts), signal);
        deliveryMessage = `Telegram menerima ${prompts.length} prompt untuk generator gambar manual.`;
        pushLog({ level: "info", agent: "ares", text: `Mengirim ${prompts.length} prompt ke Telegram.` });
      } catch (deliveryError) {
        if (signal.aborted) throw deliveryError;
        const reason = deliveryError instanceof Error ? deliveryError.message : "koneksi gagal";
        deliveryMessage = `Prompt belum terkirim ke Telegram: ${reason}. Unduh bundle di bawah; gambar tidak dibuat oleh aplikasi.`;
        pushLog({ level: "warn", agent: "ares", text: reason });
      }

      bus.emit({
        type: "user-message",
        message: {
          from: "ares",
          text: [
            `Rencana untuk "${activeTopic}" siap.`,
            `Hera: ${insight.trendSummary}`,
            `Ares: ${prompts.length} prompt disempurnakan.`,
            deliveryMessage,
            "Langkah berikutnya: buat gambar secara manual, lalu unggah ke @hades untuk QC dan metadata.",
          ].join("\n\n"),
          attachments: [attachment],
        },
      });

      bus.emit({
        type: "agent",
        id: "ares",
        patch: { status: "success", gaze: "user", bubble: "Prompt dikirim; menunggu gambar manual" },
      });
      setTimeout(() => {
        bus.emit({ type: "agent", id: "ares", patch: { status: "idle", gaze: "center", bubble: null } });
      }, 5_000);
      pushLog({ level: "info", agent: "ares", text: `Pipeline prompt "${activeTopic}" selesai.` });
    } catch (error) {
      if (signal.aborted) {
        pushLog({ level: "warn", text: "Pipeline dihentikan oleh pengguna." });
        for (const id of ["hera", "ares", "hades"] as const) {
          bus.emit({ type: "agent", id, patch: { status: "idle", gaze: "center", bubble: null } });
        }
      } else {
        const message = error instanceof Error ? error.message : "Pipeline gagal dijalankan.";
        const from = pipelineStore.get().phase === "ares" ? "ares" : "hera";
        pushLog({ level: "error", agent: from, text: message });
        bus.emit({
          type: "agent",
          id: from,
          patch: { status: "error", gaze: "center", bubble: "Pipeline gagal" },
        });
        bus.emit({ type: "user-message", message: { from, text: `Pipeline terhenti: ${message}` } });
      }
    } finally {
      controller = null;
      pipelineStore.set({ running: false, topic: null, phase: null, stage: null });
    }
  },

  stop(): void {
    controller?.abort();
  },
};

