import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStore } from "@nanostores/react";
import { bus, AGENT_META, AGENT_IDS, type Attachment } from "../lib/studioBus";
import { microstockPipeline } from "../lib/microstockPipeline";
import { pipelineStore } from "../lib/pipelineStore";
import { chatWithAgent, parseInput } from "../lib/agentChat";
import { runHades } from "../lib/hadesAgent";
import type { AresAsset } from "../lib/aresAgent";
import { recordHades } from "../lib/agentStateStore";
import { pushLog } from "../lib/logStore";

interface DisplayMsg {
  id: number;
  text: string;
  sender: "user" | "agent";
  agentName?: string;
  agentAccent?: string;
  attachments?: Attachment[];
}

const MAX_HADES_IMAGES = 4;
const MAX_HADES_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_HADES_TOTAL_BYTES = 16 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function toHadesAsset(file: File, prompt: string): Promise<AresAsset> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();

  return {
    filename: file.name,
    blob: file,
    prompt,
    negativePrompt: "",
    aspectRatio: width === height ? "1:1" : width > height ? "16:9" : "9:16",
    width,
    height,
    megapixels: (width * height) / 1_000_000,
  };
}

export default function Chatbox() {
  const [messages, setMessages] = useState<DisplayMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatting, setChatting] = useState(false);
  const [hadesImages, setHadesImages] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pipeline = useStore(pipelineStore);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatting]);

  useEffect(() => {
    return bus.subscribe((e) => {
      if (e.type === "user-message") {
        const meta = AGENT_META[e.message.from];
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: e.message.text,
            sender: "agent",
            agentName: meta.name,
            agentAccent: meta.accent,
            attachments: e.message.attachments,
          },
        ]);
      }
    });
  }, []);

  const addHadesImages = (fileList: FileList | null) => {
    const incoming = Array.from(fileList ?? []);
    if (incoming.length === 0) return;

    const next = [...hadesImages, ...incoming];
    const totalBytes = next.reduce((sum, file) => sum + file.size, 0);
    if (next.length > MAX_HADES_IMAGES) {
      setUploadError(`Maksimal ${MAX_HADES_IMAGES} gambar per pemeriksaan.`);
    } else if (incoming.some((file) => !SUPPORTED_IMAGE_TYPES.has(file.type))) {
      setUploadError("Gunakan file JPG, PNG, atau WebP.");
    } else if (incoming.some((file) => file.size > MAX_HADES_IMAGE_BYTES)) {
      setUploadError("Ukuran setiap gambar maksimal 5 MB.");
    } else if (totalBytes > MAX_HADES_TOTAL_BYTES) {
      setUploadError("Total ukuran gambar maksimal 16 MB.");
    } else {
      setHadesImages(next);
      setUploadError(null);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const raw = input.trim() || (hadesImages.length ? "@hades cek gambar ini" : "");
    if (!raw || chatting) return;

    const pipelineMatch = raw.match(/^\/pipeline(?:\s+([\s\S]*))?$/i);
    if (pipelineMatch) {
      if (pipeline.running) return;
      const topic = (pipelineMatch[1] || "").trim();
      setMessages((prev) => [...prev, { id: Date.now(), text: raw, sender: "user" }]);
      setInput("");
      void microstockPipeline.start(topic || undefined);
      return;
    }

    const parsed = parseInput(raw);

    if (parsed.kind === "pipeline") {
      if (pipeline.running) return;
      setMessages((prev) => [...prev, { id: Date.now(), text: raw, sender: "user" }]);
      setInput("");
      void microstockPipeline.start(parsed.topic);
      return;
    }

    if (parsed.kind === "ignored") {
      setMessages((prev) => [...prev, { id: Date.now(), text: raw, sender: "user" }]);
      setInput("");
      return;
    }

    if (
      parsed.kind === "chat" &&
      parsed.targets.length === 1 &&
      parsed.targets[0] === "hades" &&
      hadesImages.length > 0
    ) {
      const images = [...hadesImages];
      const userText = `${raw}\n\nLampiran: ${images.map((file) => file.name).join(", ")}`;
      setMessages((prev) => [...prev, { id: Date.now(), text: userText, sender: "user" }]);
      setInput("");
      setChatting(true);

      try {
        const assets = await Promise.all(images.map((file) => toHadesAsset(file, parsed.text)));
        const result = await runHades(assets);
        const flagged = result.assets.filter(
          (asset) => !asset.metadata.quality_ok || asset.metadata.quality_issues.length > 0
        );
        recordHades(result.assets.length, flagged.length);

        const resultText = [
          `Hades memeriksa ${result.assets.length} gambar.`,
          `Perlu ditinjau: ${flagged.length}; siap menurut QC: ${result.assets.length - flagged.length}.`,
          ...result.assets.map((asset) => {
            const status = asset.metadata.quality_issues.length
              ? `Perlu ditinjau — ${asset.metadata.quality_issues.join("; ")}`
              : "Lolos QC";
            return `• ${asset.filename}: ${status}`;
          }),
          result.needsUpscale.length
            ? `Perlu upscale manual: ${result.needsUpscale.join(", ")}.`
            : "",
          "Metadata CSV dan arsip gambar tersedia untuk diunduh.",
        ]
          .filter(Boolean)
          .join("\n");

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: resultText,
            sender: "agent",
            agentName: AGENT_META.hades.name,
            agentAccent: AGENT_META.hades.accent,
            attachments: [
              {
                kind: "csv",
                filename: "hades-metadata.csv",
                label: "Metadata CSV",
                count: result.assets.length,
                blob: result.metadataCsvBlob,
              },
              {
                kind: "zip",
                filename: "hades-images.zip",
                label: "Gambar + laporan QC",
                count: result.assets.length,
                blob: result.imagesZipBlob,
              },
            ],
          },
        ]);
        setHadesImages([]);
        setUploadError(null);
      } catch (err: any) {
        const errText = err?.message ?? "Hades gagal memeriksa gambar.";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: errText,
            sender: "agent",
            agentName: AGENT_META.hades.name,
            agentAccent: AGENT_META.hades.accent,
          },
        ]);
        pushLog({ level: "error", agent: "hades", text: errText });
      } finally {
        setChatting(false);
      }
      return;
    }

    if (parsed.kind === "chat") {
      setMessages((prev) => [...prev, { id: Date.now(), text: raw, sender: "user" }]);
      setInput("");
      setChatting(true);

      try {
        for (const agentId of parsed.targets) {
          const meta = AGENT_META[agentId];
          try {
            const reply = await chatWithAgent(agentId, parsed.text);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                text: reply,
                sender: "agent",
                agentName: meta.name,
                agentAccent: meta.accent,
              },
            ]);
          } catch (err: any) {
            const errText = err?.message ?? `Gagal merespons dari ${meta.name}`;
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                text: errText,
                sender: "agent",
                agentName: meta.name,
                agentAccent: meta.accent,
              },
            ]);
            pushLog({ level: "error", agent: agentId, text: errText });
          }
        }
      } finally {
        setChatting(false);
      }
    }
  };

  const download = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const insertMention = (tag: string) => {
    setInput((prev) => (prev.startsWith("@") ? prev : `@${tag} `));
  };

  const insertPipelinePrefix = () => {
    setInput((prev) => {
      if (/^\/pipeline\b/i.test(prev)) return prev;
      const trimmed = prev.trimStart();
      return trimmed ? `/pipeline ${trimmed}` : "/pipeline ";
    });
  };

  const busy = pipeline.running || chatting;

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 mb-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-2">
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Chat dengan <code className="px-1.5 py-0.5 rounded bg-muted text-foreground/90">@hera</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-foreground/90">@ares</code>, atau <code className="px-1.5 py-0.5 rounded bg-muted text-foreground/90">@hades</code>. Gunakan <code className="px-1.5 py-0.5 rounded bg-muted text-foreground/90">/pipeline &lt;topik&gt;</code> untuk riset dan prompt Ares yang dikirim ke Telegram. Setelah membuat gambar secara manual, lampirkan di sini lalu kirim <code className="px-1.5 py-0.5 rounded bg-muted text-foreground/90">@hades cek gambar ini</code> untuk QC dan metadata.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  m.sender === "user"
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground border border-border"
                }`}
                style={
                  m.agentAccent
                    ? { color: m.agentAccent, borderColor: `${m.agentAccent}45` }
                    : undefined
                }
              >
                {m.sender === "user" ? "Anda" : m.agentName?.[0] ?? "A"}
              </div>
              <div
                className={`flex flex-col gap-1 max-w-[85%] ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {m.sender === "agent" && m.agentName && (
                  <span className="text-[11px] text-muted-foreground px-1">{m.agentName}</span>
                )}
                <div
                  className={`px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>

                {m.attachments && m.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {m.attachments.map((att) => (
                      <button
                        key={att.filename}
                        onClick={() => download(att.filename, att.blob)}
                        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-xs hover:border-white/25 transition-colors cursor-pointer"
                      >
                        <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase">
                          {att.kind}
                        </span>
                        <span className="font-medium">{att.label ?? att.filename}</span>
                        {att.count !== undefined && (
                          <span className="text-[11px] text-muted-foreground">
                            · {att.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {chatting && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs">
              ...
            </div>
            <div className="px-3.5 py-2.5 text-sm rounded-2xl bg-muted text-muted-foreground rounded-bl-md">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "240ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-2 px-0.5 flex-wrap">
        {AGENT_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => insertMention(id)}
            className="text-xs px-2 py-0.5 rounded-md border border-border hover:border-white/25 hover:bg-muted transition-colors cursor-pointer"
            style={{ color: AGENT_META[id].accent }}
          >
            @{id}
          </button>
        ))}
        <button
          type="button"
          onClick={() => insertMention("all")}
          className="text-xs px-2 py-0.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-white/25 hover:bg-muted transition-colors cursor-pointer"
        >
          @all
        </button>
        <button
          type="button"
          onClick={insertPipelinePrefix}
          className="text-xs font-mono px-2 py-0.5 rounded-md border border-border text-foreground/80 hover:text-foreground hover:border-white/25 hover:bg-muted transition-colors cursor-pointer"
        >
          /pipeline
        </button>
        <span className="text-xs text-muted-foreground ml-auto">
          {busy ? (chatting ? "menunggu respons..." : "pipeline berjalan") : "siap"}
        </span>
      </div>

      {hadesImages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2" aria-label="Gambar untuk pemeriksaan Hades">
          {hadesImages.map((file, index) => (
            <button
              key={`${file.name}-${index}`}
              type="button"
              onClick={() => setHadesImages((current) => current.filter((_, i) => i !== index))}
              aria-label={`Hapus ${file.name}`}
              className="rounded-md border border-cyan-500/25 bg-cyan-500/5 px-2 py-1 text-[11px] text-cyan-200 hover:bg-cyan-500/10"
            >
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB ×
            </button>
          ))}
        </div>
      )}
      {uploadError && (
        <p role="alert" className="mb-2 text-xs text-red-400">
          {uploadError}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 bg-muted border border-border rounded-xl p-1.5 focus-within:border-white/25"
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          aria-label="Pilih gambar untuk Hades"
          className="sr-only"
          onChange={(event) => addHadesImages(event.currentTarget.files)}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={busy || hadesImages.length >= MAX_HADES_IMAGES}
          aria-label="Tambahkan gambar untuk Hades"
          title="Tambahkan gambar untuk QC Hades"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.65l-9.2 9.2a2 2 0 0 1-2.82-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            busy
              ? "Tunggu..."
              : hadesImages.length
                ? "@hades cek gambar ini..."
                : "Chat dengan @hera, atau minta @hera mulai bekerja..."
          }
          disabled={busy}
          className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Kirim"
          className="shrink-0 w-9 h-9 flex items-center justify-center bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-30 cursor-pointer"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12.5V3.5M3.5 8L8 3.5 12.5 8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
