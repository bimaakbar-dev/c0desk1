import { createHash } from "node:crypto";
import { env } from "node:process";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { generateImage } from "ai";

export const prerender = false;

const MAX_BODY_BYTES = 12_000;
const MAX_PROMPT_LENGTH = 4_000;
const ASPECT_RATIOS = new Set(["1:1", "4:5", "16:9", "9:16"]);
// Keep empty until a $0 image model is verified; never fall back to a paid Gateway model.
const VERIFIED_ZERO_COST_IMAGE_MODELS = new Set<string>();

let rateLimiter: Ratelimit | undefined;

function getRateLimiter(): Ratelimit | null {
  const url = env.KV_REST_API_URL;
  const token = env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  rateLimiter ??= new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(8, "1 h"),
    prefix: "c0desk1:ares-image",
  });
  return rateLimiter;
}

async function readBoundedBody(request: Request): Promise<string | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES || !request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function jsonError(message: string, status: number, retryAfter?: number): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return new Response(JSON.stringify({ error: message }), { status, headers });
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return jsonError("Permintaan lintas origin tidak diizinkan.", 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonError("Format permintaan harus JSON.", 415);
  }

  const rawBody = await readBoundedBody(request);
  if (!rawBody) return jsonError("Isi permintaan tidak valid atau terlalu besar.", 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonError("Isi permintaan bukan JSON yang valid.", 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonError("Prompt gambar wajib diisi.", 400);
  }

  const body = payload as Record<string, unknown>;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const negativePrompt =
    typeof body.negativePrompt === "string" ? body.negativePrompt.trim() : "";
  const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio : "";

  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(`Prompt harus berisi 1–${MAX_PROMPT_LENGTH} karakter.`, 400);
  }
  if (negativePrompt.length > 1_000) {
    return jsonError("Negative prompt terlalu panjang.", 400);
  }
  if (!ASPECT_RATIOS.has(aspectRatio)) {
    return jsonError("Rasio gambar tidak didukung.", 400);
  }

  const model = env.ARES_IMAGE_MODEL?.trim() || "";
  if (!model || !VERIFIED_ZERO_COST_IMAGE_MODELS.has(model)) {
    return jsonError("Generasi gambar dijeda sampai model berbiaya $0 terverifikasi.", 503);
  }

  const limiter = getRateLimiter();
  if (!limiter) return jsonError("Pembatas penggunaan belum dikonfigurasi.", 503);

  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
    "unknown";
  const identifier = createHash("sha256").update(ip).digest("hex");

  let limit: Awaited<ReturnType<Ratelimit["limit"]>>;
  try {
    limit = await limiter.limit(identifier);
  } catch {
    return jsonError("Layanan pembatasan sedang tidak tersedia. Coba lagi nanti.", 503);
  }
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1_000));
    return jsonError("Batas generasi sementara tercapai. Coba lagi nanti.", 429, retryAfter);
  }

  const fullPrompt = negativePrompt
    ? `${prompt}\n\nAvoid: ${negativePrompt}`
    : prompt;

  try {
    const { image } = await generateImage({
      model,
      prompt: fullPrompt,
      aspectRatio,
      maxRetries: 0,
      abortSignal: AbortSignal.any([request.signal, AbortSignal.timeout(110_000)]),
    });
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(image.mediaType) ||
      image.uint8Array.byteLength > 20 * 1024 * 1024
    ) {
      return jsonError("Model mengembalikan file gambar yang tidak didukung.", 502);
    }

    return new Response(image.uint8Array, {
      status: 200,
      headers: {
        "Content-Type": image.mediaType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Image-Model": model,
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch {
    return jsonError("Ares gagal menghasilkan gambar. Periksa model Gateway lalu coba lagi.", 502);
  }
}
