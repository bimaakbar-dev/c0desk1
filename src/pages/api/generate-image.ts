import { createHash } from "node:crypto";
import { env } from "node:process";
import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export const prerender = false;

const MAX_BODY_BYTES = 12_000;
const MAX_PROMPT_LENGTH = 2_048;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const ESTIMATED_NEURONS_PER_IMAGE = 60;
const DAILY_NEURON_BUDGET = 9_500;
const DAILY_IMAGE_REQUEST_LIMIT = 250;

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
  if (aspectRatio !== "1:1") {
    return jsonError("Flux Schnell di Cloudflare hanya menghasilkan gambar 1:1.", 400);
  }

  const fullPrompt = negativePrompt
    ? `${prompt}\n\nAvoid: ${negativePrompt}`
    : prompt;
  if (fullPrompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(`Prompt gabungan harus maksimal ${MAX_PROMPT_LENGTH} karakter.`, 400);
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = env.CLOUDFLARE_API_TOKEN?.trim();
  const supabase = getSupabaseAdmin();
  if (!accountId || !apiToken || !supabase) {
    return jsonError("Workers AI atau pencatatan kuota belum dikonfigurasi di server.", 503);
  }

  const ip =
    request.headers.get("x-real-ip")?.split(",", 1)[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
    "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const usageDate = new Date().toISOString().slice(0, 10);

  const { data: reserveData, error: reserveError } = await supabase.rpc(
    "reserve_ares_image_generation",
    {
      p_usage_date: usageDate,
      p_ip_hash: ipHash,
      p_estimated_neurons: ESTIMATED_NEURONS_PER_IMAGE,
    }
  );
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData;
  if (reserveError || !reservation) {
    return jsonError("Pencatatan kuota gambar sedang tidak tersedia.", 503);
  }
  if (!reservation.allowed) {
    if (reservation.reason === "ip_rate_limit") {
      return jsonError(
        "Batas 12 gambar per jam untuk jaringan ini tercapai.",
        429,
        Number(reservation.retry_after_seconds) || undefined
      );
    }
    if (reservation.reason === "image_limit" || reservation.reason === "neuron_budget") {
      return jsonError(
        "Batas harian Ares tercapai. Kuota reset pukul 00.00 UTC.",
        429
      );
    }
    return jsonError("Reservasi kuota gambar ditolak.", 400);
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${IMAGE_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: fullPrompt, steps: 4 }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(110_000)]),
      }
    );

    if (!response.ok) {
      return jsonError(
        response.status === 429
          ? "Cloudflare membatasi permintaan sementara. Kuota harian Ares tetap tercatat dengan aman."
          : "Workers AI gagal menghasilkan gambar. Kuota harian Ares tetap tercatat dengan aman.",
        response.status === 429 ? 429 : 502,
        Number(response.headers.get("retry-after")) || undefined
      );
    }

    const data = await response.json().catch(() => null);
    const encodedImage = data?.result?.image;
    if (
      typeof encodedImage !== "string" ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(encodedImage) ||
      encodedImage.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3)
    ) {
      return jsonError("Workers AI mengembalikan gambar yang tidak valid atau terlalu besar.", 502);
    }

    const imageBytes = Buffer.from(encodedImage, "base64");
    if (imageBytes.byteLength === 0 || imageBytes.byteLength > MAX_IMAGE_BYTES) {
      return jsonError("Ukuran gambar dari Workers AI tidak didukung.", 502);
    }

    const { error: accountingError } = await supabase.rpc("record_ares_image_generation", {
      p_usage_date: usageDate,
      p_image_bytes: imageBytes.byteLength,
    });
    const remainingByRequests = DAILY_IMAGE_REQUEST_LIMIT - Number(reservation.reserved_requests);
    const remainingByNeurons = Math.floor(
      (DAILY_NEURON_BUDGET - Number(reservation.estimated_neurons)) /
        ESTIMATED_NEURONS_PER_IMAGE
    );

    return new Response(imageBytes, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Image-Model": IMAGE_MODEL,
        "X-Image-Aspect-Ratio": "1:1",
        "X-Image-Estimated-Neurons": String(ESTIMATED_NEURONS_PER_IMAGE),
        "X-Image-Quota-Remaining": String(Math.max(0, Math.min(remainingByRequests, remainingByNeurons))),
        "X-Usage-Recorded": accountingError ? "reservation-only" : "complete",
      },
    });
  } catch {
    return jsonError("Ares gagal menghubungi Workers AI. Reservasi kuota tetap tercatat.", 502);
  }
}
