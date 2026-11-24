import { bus } from "./studioBus";
import {
  getAgentConfig,
  getApiKey,
  MODEL_PRESETS,
  PROVIDER_DEFAULTS,
  type AgentConfig,
} from "./agentConfigStore";
import { callLLM } from "./providers";
import { pushLog } from "./logStore";
import type { HeraInsight, PromptPlan } from "./heraAgent";

export interface AresAsset {
  filename: string;
  blob: Blob;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  width: number;
  height: number;
  megapixels: number;
}

export interface AresPromptInput {
  id: string;
  title: string;
  keywords: string[];
  plan: PromptPlan;
}

export type AresPrompt = AresPromptInput;

interface RawAresPrompt {
  id?: string;
  title?: string;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio?: string;
  keywords?: string[];
}

const PROMPT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    prompts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          prompt: { type: "string" },
          negativePrompt: { type: "string" },
          aspectRatio: { type: "string", enum: ["1:1", "4:5", "16:9", "9:16"] },
          keywords: { type: "array", items: { type: "string" } },
        },
        required: ["id", "title", "prompt", "negativePrompt", "aspectRatio", "keywords"],
      },
    },
  },
  required: ["prompts"],
};

const DEFAULT_PROMPT_SYSTEM = `Kamu adalah Ares, prompt engineer microstock di c0desk1 Studio.
Ubah ide awal menjadi prompt gambar yang jelas, orisinal, dan siap dipakai di generator gambar MANUAL. Jangan pernah membuat atau mengklaim membuat gambar.

Aturan:
- Tulis prompt gambar dan negative prompt dalam bahasa Inggris.
- Prompt harus spesifik pada subjek, suasana, pencahayaan, lensa/komposisi, material, dan ruang copy space bila relevan.
- Optimalkan untuk kebutuhan komersial dan pencarian stock; hindari merek, logo, watermark, dan teks yang dapat dibaca.
- Pertahankan satu konsep berbeda untuk setiap id masukan; jangan menambah atau menghapus item.
- Pertahankan keyword yang relevan dan tambahkan buyer-search keywords seperlunya.
- Gunakan rasio 1:1, 4:5, 16:9, atau 9:16.
Kembalikan JSON saja sesuai skema.`;

export function resolveAresConfig(config: AgentConfig): AgentConfig {
  if (getApiKey(config)) return config;
  const groqModel = config.models.groq;
  return {
    ...config,
    provider: "groq",
    baseUrl: PROVIDER_DEFAULTS.groq.baseUrl,
    models: {
      ...config.models,
      groq: MODEL_PRESETS.groq.includes(groqModel)
        ? groqModel
        : PROVIDER_DEFAULTS.groq.model,
    },
  };
}

function normalizePrompt(value: RawAresPrompt | undefined, source: AresPromptInput): AresPrompt {
  const allowedRatios = ["1:1", "4:5", "16:9", "9:16"] as const;
  const ratio = allowedRatios.includes(value?.aspectRatio as (typeof allowedRatios)[number])
    ? (value!.aspectRatio as PromptPlan["aspectRatio"])
    : source.plan.aspectRatio;
  const keywords = Array.isArray(value?.keywords)
    ? value.keywords
        .filter((word): word is string => typeof word === "string")
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 30)
    : source.keywords;

  return {
    ...source,
    title: (typeof value?.title === "string" ? value.title.trim() : source.title).slice(0, 120),
    keywords,
    plan: {
      prompt: (typeof value?.prompt === "string" ? value.prompt.trim() : source.plan.prompt).slice(0, 1_600),
      negativePrompt:
        (typeof value?.negativePrompt === "string" ? value.negativePrompt.trim() : source.plan.negativePrompt).slice(0, 1_000),
      aspectRatio: ratio,
    },
  };
}

export async function runAres(
  inputs: AresPromptInput[],
  insight: HeraInsight,
  signal?: AbortSignal
): Promise<AresPrompt[]> {
  const savedConfig = getAgentConfig("ares");
  if (!savedConfig.enabled) throw new Error("Ares dinonaktifkan di konfigurasi.");

  const config = resolveAresConfig(savedConfig);
  bus.emit({
    type: "agent",
    id: "ares",
    patch: { status: "working", gaze: "center", bubble: `Menyempurnakan ${inputs.length} prompt...` },
  });

  const response = await callLLM<{ prompts: RawAresPrompt[] }>(config, {
    system: config.systemPrompt || DEFAULT_PROMPT_SYSTEM,
    user: `Insight riset Hera:\n${JSON.stringify(insight)}\n\nPrompt awal:\n${JSON.stringify(
      inputs.map(({ id, title, keywords, plan }) => ({ id, title, keywords, ...plan }))
    )}\n\nSempurnakan tepat ${inputs.length} prompt. Jaga id yang sama.`,
    schema: PROMPT_SCHEMA,
    schemaName: "ares_prompt_bundle",
    signal,
  });

  const generated = response.json?.prompts;
  const expectedIds = new Set(inputs.map((input) => input.id));
  if (
    !Array.isArray(generated) ||
    generated.length !== inputs.length ||
    new Set(generated.map((item) => item.id)).size !== inputs.length ||
    generated.some((item) => !item.id || !expectedIds.has(item.id))
  ) {
    throw new Error("Ares tidak mengembalikan prompt unik yang sesuai dengan rencana Hera.");
  }

  const byId = new Map(generated.map((item) => [item.id!, item]));
  const prompts = inputs.map((input) => normalizePrompt(byId.get(input.id), input));

  bus.emit({
    type: "agent",
    id: "ares",
    patch: { status: "success", gaze: "user", bubble: `${prompts.length} prompt siap dikirim` },
  });
  pushLog({ level: "info", agent: "ares", text: `${prompts.length} prompt selesai disusun.` });

  return prompts;
}
