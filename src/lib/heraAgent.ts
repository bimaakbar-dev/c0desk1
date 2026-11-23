import { bus } from "./studioBus";
import { getAgentConfig } from "./agentConfigStore";
import { callLLM } from "./providers";
import { pushLog } from "./logStore";

export interface HeraInsight {
  niche: string;
  trendSummary: string;
  competitors: { name: string; angle: string; gap: string }[];
  keywordClusters: { theme: string; keywords: string[] }[];
  contentAngles: string[];
  avoid: string[];
}

export interface PromptPlan {
  prompt: string;
  negativePrompt: string;
  aspectRatio: "1:1" | "4:5" | "16:9" | "9:16";
}

export interface HeraOutput {
  insight: HeraInsight;
  plans: PromptPlan[];
  topic: string;
  generatedAt: number;
}

const INSIGHT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    niche: { type: "string" },
    trendSummary: { type: "string" },
    competitors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          angle: { type: "string" },
          gap: { type: "string" },
        },
        required: ["name", "angle", "gap"],
      },
    },
    keywordClusters: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          theme: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
        },
        required: ["theme", "keywords"],
      },
    },
    contentAngles: { type: "array", items: { type: "string" } },
    avoid: { type: "array", items: { type: "string" } },
  },
  required: ["niche", "trendSummary", "competitors", "keywordClusters", "contentAngles", "avoid"],
};

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    assets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          prompt: { type: "string" },
          negativePrompt: { type: "string" },
          aspectRatio: { type: "string", enum: ["1:1", "4:5", "16:9", "9:16"] },
        },
        required: ["prompt", "negativePrompt", "aspectRatio"],
      },
    },
  },
  required: ["assets"],
};

const DEFAULT_INSIGHT_SYSTEM = `You are a senior microstock market researcher for Adobe Stock.
Analyze the given topic with a commercial buyer's mindset.
Rules:
- trendSummary MUST be in Bahasa Indonesia (2-3 sentences).
- keywords inside keywordClusters MUST be English buyer search terms, lowercase, no duplicates.
- competitors are conceptual (angles/styles already saturated), not specific brands.
- "avoid" lists clichés and overused concepts.
Return only valid JSON matching the schema.`;

const DEFAULT_PLAN_SYSTEM = `You are an expert Adobe Stock prompt engineer.
Given a niche insight, produce commercially viable image prompts ONLY.

Prompt rules:
- English, 40-80 words, descriptive and photographic/illustrative.
- No brand names, no legible text in image, no watermarks, no logos.
- Include subject, environment, lighting, lens/composition, mood.
- Vary styles across assets (photo, illustration, 3D, flat design).

negativePrompt: English comma-separated (text, watermark, logo, distorted hands, extra fingers, blurry, low quality, duplicate subject).

aspectRatio: choose one of 1:1, 4:5, 16:9, 9:16 based on subject.

Return only valid JSON matching the schema.`;

function setBubble(status: any, bubble: string, gaze: any = "center") {
  bus.emit({ type: "agent", id: "hera", patch: { status, bubble, gaze } });
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("Dibatalkan."));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new Error("Dibatalkan."));
      },
      { once: true }
    );
  });

function normalizePlan(p: PromptPlan): PromptPlan {
  const ratios = ["1:1", "4:5", "16:9", "9:16"] as const;
  return {
    prompt: p.prompt.trim(),
    negativePrompt: p.negativePrompt.trim(),
    aspectRatio: ratios.includes(p.aspectRatio) ? p.aspectRatio : "4:5",
  };
}

export async function runHera(topic: string, signal?: AbortSignal): Promise<HeraOutput> {
  const cfg = getAgentConfig("hera");
  if (!cfg.enabled) throw new Error("Hera dinonaktifkan di konfigurasi.");
  if (!cfg.apiKeys) throw new Error("API key Hera belum diisi. Klik panel Hera → isi API key.");

  setBubble("researching", "Memindai tren & kompetitor...", "center");
  pushLog({ level: "info", agent: "hera", text: `Mulai riset: "${topic}"` });

  const insightRes = await callLLM<HeraInsight>(cfg, {
    system: cfg.systemPrompt || DEFAULT_INSIGHT_SYSTEM,
    user: `Topik microstock: "${topic}"\n\nLakukan riset pasar untuk Adobe Stock. Identifikasi 4-6 sudut kompetitor yang sudah jenuh, 4-6 klaster keyword (8-12 keyword per klaster), 5-7 sudut konten yang belum tergarap, dan daftar klise yang harus dihindari.`,
    schema: INSIGHT_SCHEMA,
    schemaName: "hera_insight",
    signal,
  });

  if (!insightRes.json) throw new Error("Hera gagal menyusun insight (JSON tidak valid).");
  const insight = insightRes.json;

  await sleep(cfg.throttleMs, signal);

  const n = Math.max(1, Math.min(10, cfg.assetsPerRun || 3));
  setBubble("thinking", `Menyusun ${n} prompt...`, "center");

  const planRes = await callLLM<{ assets: PromptPlan[] }>(cfg, {
    system: cfg.systemPrompt || DEFAULT_PLAN_SYSTEM,
    user: `Niche insight (JSON):\n${JSON.stringify(insight)}\n\nBuat tepat ${n} prompt gambar microstock berdasarkan insight di atas.`,
    schema: PLAN_SCHEMA,
    schemaName: "hera_plan",
    signal,
  });

  if (!planRes.json?.assets?.length) throw new Error("Hera gagal menyusun prompt plan.");
  const plans = planRes.json.assets.slice(0, n).map(normalizePlan);

  pushLog({
    level: "info",
    agent: "hera",
    text: `Riset selesai: ${plans.length} prompt siap.`,
  });

  return { insight, plans, topic, generatedAt: Date.now() };
}