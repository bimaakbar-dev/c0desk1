import { env } from "node:process";

export const prerender = false;

const MAX_BODY_BYTES = 24_000;
const MAX_MESSAGES = 5;
const MAX_MESSAGE_LENGTH = 4_096;
const RATE_WINDOW_MS = 60 * 60 * 1_000;
const MIN_INTERVAL_MS = 15 * 1_000;
const MAX_REQUESTS_PER_HOUR = 10;
const recentRequests = new Map<string, number[]>();

function jsonResponse(payload: unknown, status = 200, retryAfter?: number): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return new Response(JSON.stringify(payload), { status, headers });
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

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip")?.split(",", 1)[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
    "unknown"
  );
}

function reserveSend(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const recent = (recentRequests.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  const last = recent[recent.length - 1];
  if (last && now - last < MIN_INTERVAL_MS) {
    recentRequests.set(ip, recent);
    return { allowed: false, retryAfter: Math.ceil((MIN_INTERVAL_MS - (now - last)) / 1_000) };
  }
  if (recent.length >= MAX_REQUESTS_PER_HOUR) {
    recentRequests.set(ip, recent);
    return { allowed: false, retryAfter: Math.ceil((RATE_WINDOW_MS - (now - recent[0])) / 1_000) };
  }

  recent.push(now);
  recentRequests.set(ip, recent);
  if (recentRequests.size > 5_000) {
    for (const [key, times] of recentRequests) {
      if (times.length === 0 || now - times[times.length - 1] >= RATE_WINDOW_MS) {
        recentRequests.delete(key);
      }
    }
  }
  return { allowed: true };
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return jsonResponse({ error: "Permintaan lintas origin tidak diizinkan." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "Format permintaan harus JSON." }, 415);
  }

  const rawBody = await readBoundedBody(request);
  if (!rawBody) return jsonResponse({ error: "Isi permintaan tidak valid atau terlalu besar." }, 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Isi permintaan bukan JSON yang valid." }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ error: "Daftar pesan tidak valid." }, 400);
  }

  const messages = (payload as Record<string, unknown>).messages;
  if (
    !Array.isArray(messages) ||
    messages.length < 1 ||
    messages.length > MAX_MESSAGES ||
    messages.some((message) => typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE_LENGTH)
  ) {
    return jsonResponse({ error: "Pesan harus berisi 1–5 teks dengan panjang maksimal 4096 karakter." }, 400);
  }

  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return jsonResponse({ error: "Telegram belum dikonfigurasi. Isi TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID." }, 503);
  }

  const reservation = reserveSend(getClientIp(request));
  if (!reservation.allowed) {
    return jsonResponse({ error: "Batas kirim Telegram tercapai. Coba lagi nanti." }, 429, reservation.retryAfter);
  }

  for (const text of messages as string[]) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        return jsonResponse({ error: "Telegram gagal menerima prompt. Periksa token dan chat ID." }, 502);
      }
    } catch {
      return jsonResponse({ error: "Koneksi ke Telegram gagal atau melewati batas waktu." }, 502);
    }
  }

  return jsonResponse({ sent: messages.length });
}
