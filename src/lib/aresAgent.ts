import { bus } from "./studioBus";
import { getAgentConfig, getApiKey, getModel, type AgentConfig } from "./agentConfigStore";
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

const FALLBACK_CANDIDATES = ["gemini-3.8-flash", "gemini-3.6-flash"];

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
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

async function generateImageWithModel(
  baseUrl: string,
  apiKey: string,
  model: string,
  plan: PromptPlan,
  maxRetries: number,
  signal?: AbortSignal
): Promise<Blob> {
  const url = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const fullPrompt = plan.negativePrompt
    ? `${plan.prompt}\n\nAvoid: ${plan.negativePrompt}`
    : plan.prompt;

  let lastErr: Error = new Error(`Model ${model} gagal.`);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) throw new Error("Dibatalkan.");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
          ...(plan.aspectRatio ? { imageConfig: { aspectRatio: plan.aspectRatio } } : {}),
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const inline = parts.find((p: any) => p.inlineData?.data);

      if (!inline?.inlineData?.data) {
        const textPart = parts.find((p: any) => typeof p.text === "string")?.text?.trim();
        const reason =
          data.candidates?.[0]?.finishReason ||
          textPart ||
          "Tidak ada inlineData gambar di respons model";
        throw new Error(`${model}: ${reason}`);
      }

      const mimeType = inline.inlineData.mimeType || "image/png";
      const base64 = String(inline.inlineData.data).replace(/\s+/g, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return new Blob([bytes], { type: mimeType });
    }

    let detail = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || detail;
    } catch {}

    lastErr = new Error(`${model}: ${detail}`);
    const transient = res.status === 429 || res.status === 503 || /high demand/i.test(detail);

    if (!transient || attempt === maxRetries) {
      throw lastErr;
    }

    const backoffMs = Math.min(8000, 1200 * 2 ** attempt);
    pushLog({
      level: "warn",
      agent: "ares",
      text: `${model} sedang padat, retry ${attempt + 1}/${maxRetries} (${backoffMs}ms)...`,
    });
    await sleep(backoffMs, signal);
  }

  throw lastErr;
}

async function generateImage(
  cfg: AgentConfig,
  plan: PromptPlan,
  signal?: AbortSignal
): Promise<Blob> {
  const apiKey = getApiKey(cfg);
  const primaryModel = getModel(cfg);
  const baseUrl = (cfg.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(
    /\/$/,
    ""
  );
  const retries = Math.max(0, cfg.maxRetries ?? 2);
  const candidates = Array.from(new Set([primaryModel, ...FALLBACK_CANDIDATES]));

  let lastErr: any = null;
  for (let idx = 0; idx < candidates.length; idx++) {
    const candidate = candidates[idx];
    try {
      if (idx > 0) {
        bus.emit({
          type: "agent",
          id: "ares",
          patch: { status: "working", gaze: "center", bubble: `Coba ${candidate}...` },
        });
      }
      return await generateImageWithModel(baseUrl, apiKey, candidate, plan, retries, signal);
    } catch (err: any) {
      lastErr = err;
      if (signal?.aborted || /Dibatalkan/i.test(err?.message ?? "")) throw err;
    }
  }

  throw lastErr ?? new Error("Semua model gambar gagal merespons.");
}

export async function runAres(plans: PromptPlan[], signal?: AbortSignal): Promise<AresAsset[]> {
  const cfg = getAgentConfig("ares");
  if (!cfg.enabled) throw new Error("Ares dinonaktifkan di konfigurasi.");
  if (!getApiKey(cfg)) {
    throw new Error("API key Ares belum diisi. Klik panel Ares untuk mengisi API key.");
  }
  if (cfg.provider !== "gemini") {
    throw new Error(
      `Provider Ares saat ini "${cfg.provider}". Ganti ke Gemini untuk generate gambar.`
    );
  }

  const assets: AresAsset[] = [];
  const errors: string[] = [];
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

    try {
      const blob = await generateImage(cfg, plan, signal);
      incrementQuota(1);

      const dims = await getImageDimensions(blob);
      const megapixels = (dims.width * dims.height) / 1_000_000;
      const ext = blob.type.includes("jpeg") || blob.type.includes("jpg") ? "jpg" : "png";

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
    } catch (e: any) {
      const msg = e?.message ?? "Gagal generate gambar";
      errors.push(msg);
      pushLog({ level: "warn", agent: "ares", text: `Aset ${i + 1} gagal: ${msg}` });
    }

    if (i < n - 1) {
      await sleep(cfg.throttleMs, signal);
    }
  }

  if (assets.length === 0) {
    const detail = errors[0] ? ` (${errors[0]})` : "";
    throw new Error(`Ares tidak menghasilkan aset apa pun${detail}.`);
  }

  if (assets.length < n) {
    pushLog({
      level: "warn",
      agent: "ares",
      text: `${assets.length}/${n} gambar berhasil (kuota harian ${DAILY_LIMIT}).`,
    });
  } else {
    pushLog({ level: "info", agent: "ares", text: `${assets.length} gambar selesai.` });
  }

  return assets;
}