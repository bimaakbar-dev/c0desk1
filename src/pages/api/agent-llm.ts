import { createHash } from "node:crypto";
import { env } from "node:process";
import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export const prerender = false;

const MAX_BODY_BYTES = 64_000;
const MAX_USER_LENGTH = 48_000;
const MAX_SYSTEM_LENGTH = 8_000;
const MAX_SCHEMA_BYTES = 20_000;
const MAX_OUTPUT_TOKENS = 8_192;
const ALLOWED_MODELS = new Set(["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);

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

function jsonResponse(payload: unknown, status = 200, retryAfter?: number): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return new Response(JSON.stringify(payload), { status, headers });
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip")?.split(",", 1)[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
    "unknown"
  );
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return jsonResponse({ error: "Permintaan lintas origin tidak diizinkan." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "Format permintaan harus JSON." }, 415);
  }

  const apiKey = env.GROQ_API_KEY?.trim();
  const supabase = getSupabaseAdmin();
  if (!apiKey || !supabase) {
    return jsonResponse({ error: "Proxy Groq belum dikonfigurasi di server." }, 503);
  }

  const rawBody = await readBoundedBody(request);
  if (!rawBody) return jsonResponse({ error: "Isi permintaan tidak valid atau terlalu besar." }, 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Isi permintaan bukan JSON yang valid." }, 400);
  }
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Permintaan model tidak valid." }, 400);
  }

  const body = payload as Record<string, unknown>;
  const model = typeof body.model === "string" ? body.model : "";
  const user = typeof body.user === "string" ? body.user : "";
  const system = typeof body.system === "string" ? body.system : "";
  const temperature = Number(body.temperature);
  const topP = Number(body.topP);
  const maxOutputTokens = Number(body.maxOutputTokens);
  const schema = body.schema;
  const schemaName = typeof body.schemaName === "string" ? body.schemaName : "result";

  if (!ALLOWED_MODELS.has(model)) {
    return jsonResponse({ error: "Model Groq tidak ada dalam daftar yang diizinkan." }, 400);
  }
  if (!user.trim() || user.length > MAX_USER_LENGTH || system.length > MAX_SYSTEM_LENGTH) {
    return jsonResponse({ error: "Pesan model kosong atau terlalu panjang." }, 400);
  }
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    return jsonResponse({ error: "Temperature tidak valid." }, 400);
  }
  if (!Number.isFinite(topP) || topP < 0 || topP > 1) {
    return jsonResponse({ error: "Top P tidak valid." }, 400);
  }
  if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 256 || maxOutputTokens > 65_536) {
    return jsonResponse({ error: "Batas token output tidak valid." }, 400);
  }
  if (schema !== undefined) {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      return jsonResponse({ error: "Skema respons tidak valid." }, 400);
    }
    if (new TextEncoder().encode(JSON.stringify(schema)).byteLength > MAX_SCHEMA_BYTES) {
      return jsonResponse({ error: "Skema respons terlalu besar." }, 413);
    }
  }

  const usageDate = new Date().toISOString().slice(0, 10);
  const ipHash = createHash("sha256").update(getClientIp(request)).digest("hex");
  const { data: rateData, error: rateError } = await supabase.rpc("reserve_ares_llm_request", {
    p_usage_date: usageDate,
    p_ip_hash: ipHash,
  });
  const reservation = Array.isArray(rateData) ? rateData[0] : rateData;
  if (rateError || !reservation) {
    return jsonResponse({ error: "Pembatas permintaan model sedang tidak tersedia." }, 503);
  }
  if (!reservation.allowed) {
    const retryAfter = Number(reservation.retry_after_seconds) || undefined;
    if (reservation.reason === "ip_rate_limit") {
      return jsonResponse({ error: "Batas 20 permintaan per jam tercapai. Coba lagi nanti." }, 429, retryAfter);
    }
    if (reservation.reason === "daily_request_limit") {
      return jsonResponse({ error: "Batas global 300 permintaan model hari ini tercapai." }, 429);
    }
    return jsonResponse({ error: "Permintaan model ditolak." }, 400);
  }

  const messages = [
    ...(system ? [{ role: "system", content: system }] : []),
    { role: "user", content: user },
  ];
  const requestBody: Record<string, unknown> = {
    model,
    messages,
    temperature,
    top_p: topP,
    max_tokens: Math.min(maxOutputTokens, MAX_OUTPUT_TOKENS),
  };

  if (schema !== undefined) {
    requestBody.response_format = {
      type: "json_schema",
      json_schema: {
        name: /^[a-zA-Z0-9_-]{1,64}$/.test(schemaName) ? schemaName : "result",
        strict: true,
        schema,
      },
    };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(75_000)]),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.error?.message || "Groq gagal memproses permintaan.";
      return jsonResponse({ error: String(message).slice(0, 240) }, response.status);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return jsonResponse({ error: "Groq mengembalikan respons kosong." }, 502);
    }

    return jsonResponse({ text, model });
  } catch {
    return jsonResponse({ error: "Koneksi ke Groq gagal atau melewati batas waktu." }, 502);
  }
}
