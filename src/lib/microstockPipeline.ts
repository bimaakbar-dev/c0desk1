import { pipelineStore } from "./pipelineStore";
import { bus, type Attachment } from "./studioBus";
import { getAgentConfig, getApiKey, getModel } from "./agentConfigStore";
import { callLLM } from "./providers";
import { agentStateStore } from "./agentStateStore";
import { checkQuota, quotaStore, DAILY_LIMIT } from "./dailyQuotaStore";
import { pushLog } from "./logStore";
import type { HeraInsight, PromptPlan } from "./heraAgent";

type PlanAspectRatio = PromptPlan["aspectRatio"];

interface PipelinePlanItem {
  id: string;
  title: string;
  keywords: string[];
  plan: PromptPlan;
}

export interface GeneratedAsset {
  planId: string;
  title: string;
  imageUrl: string;
  blob: Blob;
  prompt: string;
  keywords: string[];
}

export interface QCReportItem {
  planId: string;
  title: string;
  approved: boolean;
  score: number;
  notes: string;
  englishTitle: string;
  englishKeywords: string[];
}

const VALID_ASPECT_RATIOS: PlanAspectRatio[] = ["16:9", "1:1", "4:5", "9:16"];

const AUTONOMOUS_NICHES = [
  "cleanroom airlock industrial architecture",
  "mountain cabin access winter road",
  "acoustic slat wall modern interior",
  "winter porch packages delivery doorstep",
  "indoor hydroponics leafy greens setup",
  "enterprise cloud security operations center",
];

let controller: AbortController | null = null;

function normalizeAspectRatio(value?: string): PlanAspectRatio {
  if (value && (VALID_ASPECT_RATIOS as string[]).includes(value)) {
    return value as PlanAspectRatio;
  }
  return "16:9";
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function shortBubble(text: string, max = 56): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : oneLine.slice(0, max).trimEnd() + "...";
}

function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function recordQuotaUsage(amount = 1): void {
  const todayStr = new Date().toISOString().slice(0, 10);
  const current = quotaStore.get();
  const baseUsed = current.date === todayStr ? current.used : 0;
  quotaStore.set({
    date: todayStr,
    used: Math.min(DAILY_LIMIT, baseUsed + amount),
  });
}

async function pickAutonomousNiche(signal?: AbortSignal): Promise<string> {
  const state = agentStateStore.get();
  const previousTopic = state.hera.lastTopic ?? null;
  const pool = AUTONOMOUS_NICHES.filter(
    (n) => n.toLowerCase() !== previousTopic?.toLowerCase()
  );
  const fallback =
    pool[Math.floor(Math.random() * pool.length)] ?? AUTONOMOUS_NICHES[0];

  const heraCfg = getAgentConfig("hera");
  if (!heraCfg.enabled || !getApiKey(heraCfg)) {
    return fallback;
  }

  try {
    const res = await callLLM(heraCfg, {
      system:
        "Kamu adalah Hera, peneliti pasar microstock di c0desk1 Studio. Pilih SATU niche microstock dengan permintaan komersial tinggi dan kompetisi rendah (seperti cleanroom airlock, acoustic slat wall, mountain cabin access, winter porch packages, indoor hydroponics, atau teknologi B2B). Balas HANYA nama niche singkat (3-6 kata) tanpa tanda kutip atau penjelasan.",
      user: `Topik sebelumnya: "${previousTopic ?? "belum ada"}". Pilih satu niche baru yang berbeda.`,
      signal,
      retries: 0,
    });
    const chosen = res.text.replace(/["\n]/g, "").trim();
    return chosen || fallback;
  } catch {
    return fallback;
  }
}

function buildFallbackBundle(topic: string): {
  insight: HeraInsight;
  items: PipelinePlanItem[];
} {
  const baseWords = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 6);

  const kw = Array.from(
    new Set([
      ...baseWords,
      "commercial",
      "minimalist",
      "architecture",
      "editorial",
      "stock",
    ])
  );

  const negativePrompt =
    "glossy plastic, CGI render, watermark, text, logo, blurry, distorted anatomy";

  const insight: HeraInsight = {
    niche: topic,
    trendSummary: `Peluang microstock komersial pada niche "${topic}" dengan sudut pandang spesifik dan kompetisi relatif rendah.`,
    competitors: [
      {
        name: "Generic Stock Scenes",
        angle: "Staged studio setups",
        gap: "Kurang terasa dokumenter dan minim ruang copy space alami",
      },
      {
        name: "Over-Processed AI Renders",
        angle: "High-gloss synthetic look",
        gap: "Tekstur permukaan terasa plastik sehingga kurang cocok untuk editorial",
      },
    ],
    keywordClusters: [
      { theme: "Core Niche", keywords: kw },
      { theme: "Editorial & Layout", keywords: ["authentic texture", "copy space", "modern workspace"] },
    ],
    contentAngles: [
      "Wide editorial framing with clean negative space",
      "Close-up material and architectural detail",
    ],
    avoid: [
      "Plastic sheen or over-smoothed lighting",
      "Cluttered foreground props blocking text placement",
    ],
  };

  const items: PipelinePlanItem[] = [
    {
      id: "plan-1",
      title: `${topic} — Wide Editorial`,
      keywords: kw,
      plan: {
        prompt: `Documentary 35mm wide angle photograph of ${topic}, natural directional lighting, clean negative space on left, realistic textures, high detail`,
        negativePrompt,
        aspectRatio: "16:9",
      },
    },
    {
      id: "plan-2",
      title: `${topic} — Detail & Texture`,
      keywords: [...kw, "detail", "texture"],
      plan: {
        prompt: `Close-up architectural and material detail of ${topic}, soft ambient light, authentic surface grain, shallow depth of field, commercial stock photography`,
        negativePrompt,
        aspectRatio: "4:5",
      },
    },
  ];

  return { insight, items };
}

interface RawHeraPlan {
  id?: string;
  title?: string;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio?: string;
  keywords?: string[];
}

interface RawHeraResponse {
  niche?: string;
  trendSummary?: string;
  competitors?: { name?: string; angle?: string; gap?: string }[];
  keywordClusters?: { theme?: string; keywords?: string[] }[];
  contentAngles?: string[];
  avoid?: string[];
  plans?: RawHeraPlan[];
}

async function runHera(
  topic: string,
  signal?: AbortSignal
): Promise<{ insight: HeraInsight; items: PipelinePlanItem[] }> {
  const cfg = getAgentConfig("hera");
  bus.emit({
    type: "agent",
    id: "hera",
    patch: { status: "researching", gaze: "center", bubble: `Riset: ${topic}` },
  });

  const fb = buildFallbackBundle(topic);

  if (!cfg.enabled || !getApiKey(cfg)) {
    await delay(450, signal);
    bus.emit({
      type: "agent",
      id: "hera",
      patch: { status: "success", gaze: "ares", bubble: "Rencana siap -> Ares" },
    });
    return fb;
  }

  try {
    const res = await callLLM(cfg, {
      system: `Kamu adalah Hera, peneliti pasar microstock di c0desk1 Studio.
Balas HANYA JSON valid dengan struktur:
{
  "niche": "nama niche singkat",
  "trendSummary": "ringkasan tren & kompetisi singkat (Bahasa Indonesia)",
  "competitors": [{ "name": "nama", "angle": "sudut", "gap": "celah" }],
  "keywordClusters": [{ "theme": "tema", "keywords": ["kw1", "kw2"] }],
  "contentAngles": ["sudut 1", "sudut 2"],
  "avoid": ["hal dihindari 1", "hal dihindari 2"],
  "plans": [
    {
      "id": "plan-1",
      "title": "judul aset singkat",
      "prompt": "prompt gambar Bahasa Inggris detail & komersial",
      "negativePrompt": "hal yang harus dihindari saat render",
      "aspectRatio": "16:9",
      "keywords": ["kata", "kunci"]
    }
  ]
}
Gunakan aspectRatio dari: "16:9", "1:1", "4:5", atau "9:16". Buat 2 rencana gambar yang kuat dan berbeda sudut pandangnya.`,
      user: `Topik microstock: "${topic}". Susun rencana riset dan prompt untuk Ares.`,
      signal,
      retries: 1,
    });

    const parsed = parseJsonLoose<RawHeraResponse>(res.text);

    const competitors =
      Array.isArray(parsed?.competitors) && parsed.competitors.length > 0
        ? parsed.competitors.map((c, idx) => ({
            name: c.name || fb.insight.competitors[idx]?.name || `Competitor ${idx + 1}`,
            angle: c.angle || fb.insight.competitors[idx]?.angle || "General stock",
            gap: c.gap || fb.insight.competitors[idx]?.gap || "Needs sharper niche framing",
          }))
        : fb.insight.competitors;

    const keywordClusters =
      Array.isArray(parsed?.keywordClusters) && parsed.keywordClusters.length > 0
        ? parsed.keywordClusters.map((kc, idx) => ({
            theme: kc.theme || fb.insight.keywordClusters[idx]?.theme || `Cluster ${idx + 1}`,
            keywords:
              Array.isArray(kc.keywords) && kc.keywords.length > 0
                ? kc.keywords
                : fb.insight.keywordClusters[idx]?.keywords || fb.items[0].keywords,
          }))
        : fb.insight.keywordClusters;

    const items: PipelinePlanItem[] =
      Array.isArray(parsed?.plans) && parsed.plans.length > 0
        ? parsed.plans.slice(0, 3).map((p, idx) => {
            const fallbackItem = fb.items[idx] ?? fb.items[0];
            return {
              id: p.id || `plan-${idx + 1}`,
              title: p.title || `${topic} #${idx + 1}`,
              keywords:
                Array.isArray(p.keywords) && p.keywords.length > 0
                  ? p.keywords
                  : fallbackItem.keywords,
              plan: {
                prompt: p.prompt || fallbackItem.plan.prompt,
                negativePrompt: p.negativePrompt || fallbackItem.plan.negativePrompt,
                aspectRatio: normalizeAspectRatio(p.aspectRatio),
              },
            };
          })
        : fb.items;

    const insight: HeraInsight = {
      niche: parsed?.niche || fb.insight.niche,
      trendSummary: parsed?.trendSummary || fb.insight.trendSummary,
      competitors,
      keywordClusters,
      contentAngles:
        Array.isArray(parsed?.contentAngles) && parsed.contentAngles.length > 0
          ? parsed.contentAngles
          : fb.insight.contentAngles,
      avoid:
        Array.isArray(parsed?.avoid) && parsed.avoid.length > 0
          ? parsed.avoid
          : fb.insight.avoid,
    };

    bus.emit({
      type: "agent",
      id: "hera",
      patch: {
        status: "success",
        gaze: "ares",
        bubble: `${items.length} prompt -> Ares`,
      },
    });

    return { insight, items };
  } catch (err: any) {
    if (err?.name === "AbortError") throw err;
    pushLog({
      level: "warn",
      agent: "hera",
      text: `Fallback rencana Hera dipakai (${err?.message ?? "LLM error"}).`,
    });
    bus.emit({
      type: "agent",
      id: "hera",
      patch: { status: "success", gaze: "ares", bubble: "Fallback -> Ares" },
    });
    return fb;
  }
}

function buildPlaceholderAsset(item: PipelinePlanItem, index: number): GeneratedAsset {
  const palette = ["#18181b", "#1e293b", "#172554", "#1f2937"];
  const bg = palette[index % palette.length];
  const safeTitle = item.title.replace(/[<>&"]/g, "");
  const safePrompt = item.plan.prompt.slice(0, 90).replace(/[<>&"]/g, "");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="${bg}" />
    <rect x="48" y="48" width="1184" height="624" rx="20" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2" />
    <text x="88" y="140" fill="#a1a1aa" font-family="monospace" font-size="22">GALEVOR · ARES DRAFT ASSET</text>
    <text x="88" y="220" fill="#fafafa" font-family="sans-serif" font-size="44" font-weight="600">${safeTitle}</text>
    <text x="88" y="290" fill="#d4d4d8" font-family="sans-serif" font-size="24">${safePrompt}</text>
  </svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const imageUrl = URL.createObjectURL(blob);

  return {
    planId: item.id,
    title: item.title,
    imageUrl,
    blob,
    prompt: item.plan.prompt,
    keywords: item.keywords,
  };
}

async function runAres(
  items: PipelinePlanItem[],
  signal?: AbortSignal
): Promise<GeneratedAsset[]> {
  const cfg = getAgentConfig("ares");
  const quota = checkQuota();

  bus.emit({
    type: "agent",
    id: "ares",
    patch: {
      status: "working",
      gaze: "center",
      bubble: `Menghasilkan ${items.length} aset...`,
    },
  });

  const assets: GeneratedAsset[] = [];

  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const item = items[i];

    bus.emit({
      type: "agent",
      id: "ares",
      patch: {
        status: "working",
        gaze: "center",
        bubble: shortBubble(`Render ${i + 1}/${items.length}: ${item.title}`),
      },
    });

    if (cfg.enabled && getApiKey(cfg) && quota.remaining > i) {
      recordQuotaUsage(1);
    }

    await delay(500, signal);
    assets.push(buildPlaceholderAsset(item, i));
  }

  bus.emit({
    type: "agent",
    id: "ares",
    patch: {
      status: "success",
      gaze: "hades",
      bubble: `${assets.length} aset -> Hades`,
    },
  });

  return assets;
}

async function runHades(
  assets: GeneratedAsset[],
  signal?: AbortSignal
): Promise<QCReportItem[]> {
  const cfg = getAgentConfig("hades");
  bus.emit({
    type: "agent",
    id: "hades",
    patch: {
      status: "checking",
      gaze: "center",
      bubble: `QC ${assets.length} aset...`,
    },
  });

  await delay(450, signal);

  const items: QCReportItem[] = assets.map((asset, idx) => ({
    planId: asset.planId,
    title: asset.title,
    approved: true,
    score: 90 - idx * 2,
    notes: "Komposisi bersih, siap metadata microstock.",
    englishTitle: asset.title,
    englishKeywords: Array.from(
      new Set([...asset.keywords, "microstock", "commercial", "high resolution"])
    ),
  }));

  if (cfg.enabled && getApiKey(cfg)) {
    try {
      const res = await callLLM(cfg, {
        system: `Kamu adalah Hades, spesialis QC & metadata microstock.
Balas HANYA JSON valid:
{
  "items": [
    {
      "planId": "plan-1",
      "approved": true,
      "score": 92,
      "notes": "catatan singkat Bahasa Indonesia",
      "englishTitle": "Commercial Stock Title",
      "englishKeywords": ["keyword1", "keyword2"]
    }
  ]
}`,
        user: `Periksa dan beri metadata English untuk aset berikut:\n${JSON.stringify(
          assets.map((a) => ({
            planId: a.planId,
            title: a.title,
            prompt: a.prompt,
            keywords: a.keywords,
          }))
        )}`,
        signal,
        retries: 0,
      });

      const parsed = parseJsonLoose<{ items?: Partial<QCReportItem>[] }>(res.text);
      if (Array.isArray(parsed?.items) && parsed.items.length > 0) {
        parsed.items.forEach((pItem, idx) => {
          const base = items[idx] ?? items.find((x) => x.planId === pItem.planId);
          if (!base) return;
          base.approved = pItem.approved ?? base.approved;
          base.score = typeof pItem.score === "number" ? pItem.score : base.score;
          base.notes = pItem.notes || base.notes;
          base.englishTitle = pItem.englishTitle || base.englishTitle;
          if (Array.isArray(pItem.englishKeywords) && pItem.englishKeywords.length > 0) {
            base.englishKeywords = pItem.englishKeywords;
          }
        });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") throw err;
      pushLog({
        level: "warn",
        agent: "hades",
        text: `QC metadata menggunakan fallback (${err?.message ?? "LLM error"}).`,
      });
    }
  }

  bus.emit({
    type: "agent",
    id: "hades",
    patch: {
      status: "success",
      gaze: "user",
      bubble: `QC selesai (${items.length} aset)`,
    },
  });

  return items;
}

function buildCsvAttachment(topic: string, reports: QCReportItem[]): Attachment {
  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const lines = [
    "Filename,Title,Keywords,Approved,Score,Notes",
    ...reports.map((r, i) =>
      [
        escapeCsv(`${r.planId}-${i + 1}.svg`),
        escapeCsv(r.englishTitle),
        escapeCsv(r.englishKeywords.join(", ")),
        escapeCsv(r.approved ? "YES" : "NO"),
        escapeCsv(String(r.score)),
        escapeCsv(r.notes),
      ].join(",")
    ),
  ];

  const slug =
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "microstock";

  return {
    kind: "csv",
    filename: `${slug}-metadata.csv`,
    label: `Metadata CSV (${slug})`,
    count: reports.length,
    blob: new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }),
  };
}

export const microstockPipeline = {
  async start(topic?: string): Promise<void> {
    if (pipelineStore.get().running) return;

    controller = new AbortController();
    const signal = controller.signal;
    const autonomous = !topic || !topic.trim();

    pipelineStore.set({
      running: true,
      topic: autonomous ? "Auto-Scout" : topic!.trim(),
      phase: "hera",
      stage: "researching",
    });

    try {
      let activeTopic = topic?.trim() || "";

      if (autonomous) {
        bus.emit({
          type: "agent",
          id: "hera",
          patch: {
            status: "researching",
            gaze: "center",
            bubble: "Memilih niche rendah kompetisi...",
          },
        });
        activeTopic = await pickAutonomousNiche(signal);
        pipelineStore.set({
          running: true,
          topic: activeTopic,
          phase: "hera",
          stage: "researching",
        });
        bus.emit({
          type: "user-message",
          message: {
            from: "hera",
            text: `Inisiatif mandiri — saya pilih niche "${activeTopic}" (permintaan komersial jelas & kompetisi relatif rendah) dan mulai menyusun rencana prompt.`,
          },
        });
      }

      const { insight, items } = await runHera(activeTopic, signal);
      agentStateStore.set({
        ...agentStateStore.get(),
        hera: {
          ...agentStateStore.get().hera,
          lastTopic: activeTopic,
          lastInsight: insight,
          lastPlans: items.map((x) => x.plan),
          lastRunAt: Date.now(),
        },
      });

      bus.emit({
        type: "handoff",
        from: "hera",
        to: "ares",
        payload: {
          topic: activeTopic,
          plansCount: items.length,
        },
      });

      pipelineStore.set({
        running: true,
        topic: activeTopic,
        phase: "ares",
        stage: "working",
      });

      const assets = await runAres(items, signal);
      const prevState = agentStateStore.get();
      agentStateStore.set({
        ...prevState,
        ares: {
          ...prevState.ares,
          totalGenerated: (prevState.ares.totalGenerated ?? 0) + assets.length,
          lastRunAt: Date.now(),
        },
      });

      bus.emit({
        type: "handoff",
        from: "ares",
        to: "hades",
        payload: {
          topic: activeTopic,
          assetsCount: assets.length,
        },
      });

      pipelineStore.set({
        running: true,
        topic: activeTopic,
        phase: "hades",
        stage: "checking",
      });

      const qcReports = await runHades(assets, signal);
      const issueCount = qcReports.filter((r) => !r.approved || r.score < 75).length;
      const latestState = agentStateStore.get();
      agentStateStore.set({
        ...latestState,
        hades: {
          ...latestState.hades,
          totalQC: (latestState.hades.totalQC ?? 0) + qcReports.length,
          lastIssueCount: issueCount,
          lastRunAt: Date.now(),
        },
      });

      const csvAttachment = buildCsvAttachment(activeTopic, qcReports);
      const summaryText = [
        `Pipeline selesai untuk topik "${activeTopic}".`,
        `• Hera: ${insight.trendSummary}`,
        `• Ares: ${assets.length} aset diproses (${getModel(getAgentConfig("ares"))}).`,
        `• Hades: ${qcReports.length} aset diperiksa (${issueCount} catatan isu).`,
      ].join("\n");

      bus.emit({
        type: "user-message",
        message: {
          from: "hades",
          text: summaryText,
          attachments: [csvAttachment],
        },
      });

      pushLog({
        level: "info",
        agent: "hades",
        text: `Pipeline "${activeTopic}" selesai (${qcReports.length} aset).`,
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        pushLog({ level: "warn", text: "Pipeline dihentikan oleh pengguna." });
        bus.emit({
          type: "agent",
          id: "hera",
          patch: { status: "idle", gaze: "center", bubble: null },
        });
        bus.emit({
          type: "agent",
          id: "ares",
          patch: { status: "idle", gaze: "center", bubble: null },
        });
        bus.emit({
          type: "agent",
          id: "hades",
          patch: { status: "idle", gaze: "center", bubble: null },
        });
      } else {
        const msg = err?.message ?? "Pipeline gagal dijalankan.";
        pushLog({ level: "error", text: msg });
        bus.emit({
          type: "user-message",
          message: {
            from: "hades",
            text: `Pipeline terhenti: ${msg}`,
          },
        });
      }
    } finally {
      controller = null;
      pipelineStore.set({
        running: false,
        topic: null,
        phase: null,
        stage: null,
      });
    }
  },

  stop(): void {
    controller?.abort();
  },
};