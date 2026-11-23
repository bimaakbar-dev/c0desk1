import { getApiKey, getModel, type AgentConfig } from "./agentConfigStore";
import { pushLog } from "./logStore";

export interface CallOptions {
  system?: string;
  user: string;
  schema?: Record<string, any>;
  schemaName?: string;
  signal?: AbortSignal;
  retries?: number;
  image?: { base64: string; mimeType: string };
}

export interface CallResult<T = unknown> {
  text: string;
  json?: T;
  latencyMs: number;
  model: string;
}

class ProviderError extends Error {
  status?: number;
  retryAfter?: number;
  constructor(msg: string, status?: number, retryAfter?: number) {
    super(msg);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

function sanitizeForGemini(schema: any): any {
  if (Array.isArray(schema)) return schema.map(sanitizeForGemini);
  if (schema && typeof schema === "object") {
    const { additionalProperties, $schema, ...rest } = schema;
    const out: any = {};
    for (const [k, v] of Object.entries(rest)) out[k] = sanitizeForGemini(v);
    return out;
  }
  return schema;
}

async function readError(res: Response): Promise<ProviderError> {
  let msg = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    msg = body?.error?.message || body?.message || msg;
  } catch {}
  const retryAfter = Number(res.headers.get("retry-after")) || undefined;
  return new ProviderError(msg, res.status, retryAfter);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  signal?: AbortSignal,
  onRetry?: (attempt: number, waitMs: number, err: unknown) => void
): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) throw new Error("Dibatalkan.");
    try {
      return await fn();
    } catch (err: any) {
      last = err;
      const status = err?.status as number | undefined;
      if (signal?.aborted) throw new Error("Dibatalkan.");
      if (attempt === maxRetries || (status && !RETRYABLE.has(status))) throw err;
      const waitMs = err?.retryAfter
        ? Math.min(err.retryAfter * 1000, 15000)
        : Math.min(8000, 600 * 2 ** attempt);
      onRetry?.(attempt + 1, waitMs, err);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw last;
}

async function callGemini<T>(cfg: AgentConfig, opts: CallOptions): Promise<CallResult<T>> {
  const t0 = performance.now();
  const apiKey = getApiKey(cfg);
  const model = getModel(cfg);
  const url = `${cfg.baseUrl.replace(/\/$/, "")}/models/${model}:generateContent?key=${apiKey}`;

  const parts: any[] = [];
  if (opts.image) {
    parts.push({ inlineData: { mimeType: opts.image.mimeType, data: opts.image.base64 } });
  }
  parts.push({ text: opts.user });

  const generationConfig: any = {
    temperature: cfg.temperature,
    topP: cfg.topP,
    maxOutputTokens: cfg.maxOutputTokens,
  };
  if (opts.schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = sanitizeForGemini(opts.schema);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
      generationConfig,
    }),
  });

  if (!res.ok) throw await readError(res);
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p.text ?? "")
    .filter(Boolean)
    .join("");

  if (!text) throw new Error("Gemini mengembalikan respons kosong (kemungkinan diblokir safety filter).");

  let json: T | undefined;
  if (opts.schema) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      throw new Error("Respons Gemini bukan JSON valid.");
    }
  }

  return { text, json, latencyMs: Math.round(performance.now() - t0), model };
}

async function callGroqProxy<T>(cfg: AgentConfig, opts: CallOptions): Promise<CallResult<T>> {
  const t0 = performance.now();
  if (opts.image) throw new Error("Input gambar belum didukung untuk model Groq ini.");

  const res = await fetch("/api/agent-llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      model: getModel(cfg),
      system: opts.system,
      user: opts.user,
      temperature: cfg.temperature,
      topP: cfg.topP,
      maxOutputTokens: cfg.maxOutputTokens,
      schema: opts.schema,
      schemaName: opts.schemaName,
    }),
  });

  if (!res.ok) throw await readError(res);
  const data = await res.json();
  const text = typeof data.text === "string" ? data.text : "";
  if (!text) throw new Error("Groq mengembalikan respons kosong.");

  let json: T | undefined;
  if (opts.schema) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      throw new Error("Respons Groq bukan JSON valid.");
    }
  }

  return {
    text,
    json,
    latencyMs: Math.round(performance.now() - t0),
    model: typeof data.model === "string" ? data.model : getModel(cfg),
  };
}

async function callOpenAICompatible<T>(cfg: AgentConfig, opts: CallOptions): Promise<CallResult<T>> {
  const t0 = performance.now();
  const apiKey = getApiKey(cfg);
  const model = getModel(cfg);
  const url = `${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`;

  const userContent: any = opts.image
    ? [
        { type: "text", text: opts.user },
        { type: "image_url", image_url: { url: `data:${opts.image.mimeType};base64,${opts.image.base64}` } },
      ]
    : opts.user;

  const body: any = {
    model,
    messages: [
      ...(opts.system ? [{ role: "system", content: opts.system }] : []),
      { role: "user", content: userContent },
    ],
    temperature: cfg.temperature,
    top_p: cfg.topP,
    max_tokens: cfg.maxOutputTokens,
  };
  if (opts.schema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: opts.schemaName ?? "result",
        strict: true,
        schema: opts.schema,
      },
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: opts.signal,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw await readError(res);
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Provider mengembalikan respons kosong.");

  let json: T | undefined;
  if (opts.schema) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      throw new Error("Respons bukan JSON valid.");
    }
  }

  return { text, json, latencyMs: Math.round(performance.now() - t0), model };
}

export async function callLLM<T = unknown>(
  cfg: AgentConfig,
  opts: CallOptions
): Promise<CallResult<T>> {
  const retries = opts.retries ?? cfg.maxRetries;
  return withRetry(
    () =>
      cfg.provider === "gemini"
        ? callGemini<T>(cfg, opts)
        : cfg.provider === "groq"
          ? callGroqProxy<T>(cfg, opts)
          : callOpenAICompatible<T>(cfg, opts),
    retries,
    opts.signal,
    (attempt, waitMs, err) => {
      pushLog({
        level: "warn",
        text: `Retry ${attempt} dalam ${waitMs}ms — ${(err as any)?.message ?? "error"}`,
      });
    }
  );
}

export async function testConnection(
  cfg: AgentConfig
): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  if (!getApiKey(cfg)) {
    return { ok: false, latencyMs: 0, message: "API key untuk provider ini masih kosong." };
  }
  if (!cfg.baseUrl) {
    return { ok: false, latencyMs: 0, message: "Base URL masih kosong." };
  }
  const t0 = performance.now();
  try {
    const res = await callLLM(cfg, { user: "Balas hanya dengan kata: OK", retries: 0 });
    const ok = /\bok\b/i.test(res.text);
    return {
      ok,
      latencyMs: Math.round(performance.now() - t0),
      message: ok ? `Terhubung · ${res.model}` : `Respons tidak valid: ${res.text.slice(0, 60)}`,
    };
  } catch (e: any) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - t0),
      message: e?.message ?? "Gagal terhubung.",
    };
  }
}

export async function listAvailableModels(
  apiKey: string
): Promise<{ name: string; methods: string[] }[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.models ?? []).map((m: any) => ({
    name: (m.name ?? "").replace(/^models\//, ""),
    methods: m.supportedGenerationMethods ?? [],
  }));
}
