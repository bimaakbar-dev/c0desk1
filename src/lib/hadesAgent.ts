import { getAgentConfig, getApiKey } from "./agentConfigStore";
import { callLLM } from "./providers";
import { pushLog } from "./logStore";
import type { AresAsset } from "./aresAgent";
import { bus } from "./studioBus";
import JSZip from "jszip";

export interface HadesMetadata {
  title: string;
  keywords: string[];
  category: number;
  quality_ok: boolean;
  quality_issues: string[];
}

export interface HadesAsset extends AresAsset {
  metadata: HadesMetadata;
}

export interface HadesResult {
  assets: HadesAsset[];
  metadataCsvBlob: Blob;
  imagesZipBlob: Blob;
  needsUpscale: string[];
}

const METADATA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    category: { type: "integer" },
    quality_ok: { type: "boolean" },
    quality_issues: { type: "array", items: { type: "string" } },
  },
  required: ["title", "keywords", "category", "quality_ok", "quality_issues"],
};

const DEFAULT_METADATA_SYSTEM = `You are an Adobe Stock metadata specialist with vision.
Analyze the provided image and generate buyer-focused metadata IN ENGLISH.
Target buyer is GLOBAL — always English, never Indonesian.

Metadata rules:
- title: English, max 70 characters, no commas, descriptive of what is VISIBLE.
- keywords: 15-25 English keywords, most important first, lowercase, no duplicates.
- category: integer 1-21 using Adobe Stock taxonomy:
  1 Animals, 2 Architecture, 3 Business, 4 Drinks, 5 Food, 6 Graphic Resources,
  7 Holidays, 8 Industrial, 9 Landscapes, 10 Lifestyle, 11 People, 12 Plants,
  13 Culture, 14 Technology, 15 Transport, 16 Travel, 17 Vintage, 18 Wildlife,
  19 Nature, 20 Abstract, 21 Objects.

Quality check rules (quality_ok = false if any issue):
- Legible text/watermark/logo visible
- Distorted human anatomy (hands, faces, extra fingers)
- Blurry, low quality, obvious AI artifacts
- Duplicate subject or empty composition
List each issue in quality_issues (short English phrase).

Return only valid JSON matching the schema.`;

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function normalize(m: HadesMetadata, index: number): HadesMetadata {
  const category = Math.min(21, Math.max(1, Math.round(m.category || 1)));
  const title = (m.title || `Microstock asset ${index + 1}`)
    .replace(/[",]/g, "")
    .slice(0, 70)
    .trim();
  const keywords = Array.from(
    new Set((m.keywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean))
  ).slice(0, 25);
  return {
    title,
    keywords,
    category,
    quality_ok: !!m.quality_ok,
    quality_issues: Array.isArray(m.quality_issues) ? m.quality_issues : [],
  };
}

export async function runHades(assets: AresAsset[], signal?: AbortSignal): Promise<HadesResult> {
  const cfg = getAgentConfig("hades");
  if (!cfg.enabled) throw new Error("Hades dinonaktifkan.");
  if (cfg.provider === "groq") {
    throw new Error("Hades memerlukan model vision. Pilih Gemini atau provider kompatibel yang mendukung gambar.");
  }
  if (!getApiKey(cfg)) throw new Error("API key Hades (vision) belum diisi.");

  const enriched: HadesAsset[] = [];
  const needsUpscale: string[] = [];
  const n = assets.length;

  for (let i = 0; i < n; i++) {
    if (signal?.aborted) throw new Error("Dibatalkan.");
    const asset = assets[i];

    bus.emit({
      type: "agent",
      id: "hades",
      patch: { status: "checking", gaze: "center", bubble: `Analisis ${i + 1}/${n}...` },
    });

    const base64 = await blobToBase64(asset.blob);
    const mime = asset.blob.type || "image/jpeg";

    let metadata: HadesMetadata | null = null;
    try {
      const res = await callLLM<HadesMetadata>(cfg, {
        system: cfg.systemPrompt || DEFAULT_METADATA_SYSTEM,
        user: `Original prompt: "${asset.prompt}"\n\nAnalyze the IMAGE itself. Generate metadata in English and perform quality check.`,
        schema: METADATA_SCHEMA,
        schemaName: "hades_metadata",
        signal,
        image: { base64, mimeType: mime },
      });
      metadata = res.json ?? null;
    } catch (e: any) {
      pushLog({
        level: "warn",
        agent: "hades",
        text: `Metadata gagal aset ${i + 1}: ${e.message}`,
      });
      continue;
    }

    if (!metadata) continue;
    const norm = normalize(metadata, i);

    if (asset.megapixels < 4) {
      needsUpscale.push(asset.filename);
      norm.quality_issues.push(`Resolusi ${asset.megapixels.toFixed(1)} MP < 4 MP`);
    }
    if (norm.keywords.length < 10) {
      norm.quality_issues.push(`Keywords kurang (${norm.keywords.length})`);
    }
    norm.quality_ok = norm.quality_ok && norm.quality_issues.length === 0;

    pushLog({
      level: norm.quality_issues.length === 0 ? "info" : "warn",
      agent: "hades",
      text:
        norm.quality_issues.length === 0
          ? `✓ ${asset.filename} lolos QC`
          : `${asset.filename}: ${norm.quality_issues.join("; ")}`,
    });

    enriched.push({ ...asset, metadata: norm });
  }

  if (enriched.length === 0) throw new Error("Hades tidak menghasilkan aset dengan metadata.");

  const metadataCsvBlob = buildCsv(enriched);
  const imagesZipBlob = await buildImagesZip(enriched);

  pushLog({
    level: "info",
    agent: "hades",
    text: `CSV + ZIP siap: ${enriched.length} aset.`,
  });

  return { assets: enriched, metadataCsvBlob, imagesZipBlob, needsUpscale };
}

function buildCsv(assets: HadesAsset[]): Blob {
  const header = "Filename,Title,Keywords,Category,Releases\n";
  const rows = assets
    .map((a) => {
      const kws = a.metadata.keywords.join(", ");
      const safeTitle = a.metadata.title.replace(/,/g, "");
      return `${a.filename},"${safeTitle}","${kws}",${a.metadata.category},`;
    })
    .join("\n");
  return new Blob([header + rows], { type: "text/csv;charset=utf-8" });
}

async function buildImagesZip(assets: HadesAsset[]): Promise<Blob> {
  const zip = new JSZip();
  for (const a of assets) zip.file(a.filename, a.blob);

  const readme = [
    `c0desk1 Studio — Microstock Images`,
    `QC date: ${new Date().toISOString()}`,
    ``,
    `Jumlah: ${assets.length} gambar`,
    ``,
    `Langkah sebelum upload Adobe Stock:`,
    `1. Upscale manual ke >= 4 MP jika perlu (https://bigger.pics, gratis)`,
    `2. Upload gambar + metadata.csv bersama ke Adobe Stock Contributor`,
    ``,
    `Status QC per aset:`,
    ...assets.map((a) => {
      const issues = a.metadata.quality_issues;
      return `- ${a.filename}: ${issues.length === 0 ? "OK" : `WARN: ${issues.join("; ")}`}`;
    }),
  ].join("\n");
  zip.file("README.txt", readme);

  return zip.generateAsync({ type: "blob" });
}
