import { bus } from "./studioBus";
import { getAgentConfig, getApiKey, getModel } from "./agentConfigStore";
import { pushLog } from "./logStore";
import { checkQuota, incrementQuota, DAILY_LIMIT } from "./dailyQuotaStore";
import type { PromptPlan } from "./heraAgent";

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

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function generateImage(
  cfg: any,
  plan: PromptPlan,
  signal?: AbortSignal
): Promise<Blob | null> {
  const apiKey = getApiKey(cfg);
  const model = getModel(cfg);
  const url = `${cfg.baseUrl.replace(/\/$/, "")}/models/${model}:generateContent?key=${apiKey}`;

  const fullPrompt = plan.negativePrompt
    ? `${plan.prompt}\n\nAvoid: ${plan.negativePrompt}`
    : plan.prompt;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    pushLog({ level: "warn", agent: "ares", text: `Image API ${res.status}` });
    return null;
  }
  const data = await res.json();
  const inline = data.candidates?.[0]?.content?.parts?.find((p: any) =>
    p.inlineData?.mimeType?.startsWith("image/")
  );
  if (!inline) return null;

  const base64 = inline.inlineData.data;
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: inline.inlineData.mimeType });
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

export async function runAres(plans: PromptPlan[], signal?: AbortSignal): Promise<AresAsset[]> {
  const cfg = getAgentConfig("ares");
  if (!cfg.enabled) throw new Error("Ares dinonaktifkan.");
  if (!getApiKey(cfg)) throw new Error("API key Ares (Gemini Image) belum diisi.");
  if (cfg.provider !== "gemini") {
    throw new Error("Ares hanya mendukung provider Gemini (image generation).");
  }

  const assets: AresAsset[] = [];
  const n = plans.length;

  for (let i = 0; i < n; i++) {
    if (signal?.aborted) throw new Error("Dibatalkan.");

    const q = checkQuota();
    if (!q.ok) {
      pushLog({
        level: "warn",
        agent: "ares",
        text: `Kuota harian habis (${q.used}/${q.limit}).`,
      });
      bus.emit({
        type: "agent",
        id: "ares",
        patch: { status: "error", gaze: "center", bubble: `Kuota habis (${q.limit}/hari)` },
      });
      break;
    }

    const plan = plans[i];

    bus.emit({
      type: "agent",
      id: "ares",
      patch: { status: "working", gaze: "center", bubble: `Generate ${i + 1}/${n}...` },
    });

    let blob: Blob | null = null;
    try {
      blob = await generateImage(cfg, plan, signal);
    } catch (e: any) {
      pushLog({ level: "warn", agent: "ares", text: `Generate gagal: ${e.message}` });
      continue;
    }

    if (!blob) {
      pushLog({ level: "warn", agent: "ares", text: `Aset ${i + 1} kosong, dilewati.` });
      continue;
    }

    incrementQuota(1);

    const dims = await getImageDimensions(blob);
    const megapixels = (dims.width * dims.height) / 1_000_000;
    const ext = blob.type.includes("png") ? "png" : "jpg";

    assets.push({
      filename: `c0desk1_${Date.now()}_${i + 1}.${ext}`,
      blob,
      prompt: plan.prompt,
      negativePrompt: plan.negativePrompt,
      aspectRatio: plan.aspectRatio,
      width: dims.width,
      height: dims.height,
      megapixels,
    });

    await sleep(cfg.throttleMs, signal);
  }

  if (assets.length === 0) throw new Error("Ares tidak menghasilkan aset apa pun.");
  if (assets.length < n) {
    pushLog({
      level: "warn",
      agent: "ares",
      text: `Hanya ${assets.length}/${n} aset berhasil (kuota ${DAILY_LIMIT}/hari).`,
    });
  } else {
    pushLog({ level: "info", agent: "ares", text: `${assets.length} gambar selesai.` });
  }

  return assets;
}