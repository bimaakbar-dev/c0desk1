import type { AutomationStatusSnapshot } from "../lib/automationStatus";

interface Props {
  snapshot: AutomationStatusSnapshot | null;
}

export default function AutomationStatus({ snapshot }: Props) {
  const label = snapshot
    ? snapshot.automation.enabled
      ? "Otomasi aktif"
      : "Otomasi dijeda"
    : "Status otomasi tidak tersedia";
  const description = snapshot?.automation.pauseReason ?? "Kuota tidak dapat dibaca dari Supabase.";
  const isEnabled = snapshot?.automation.enabled === true;
  const quotaSummary = snapshot
    ? `${snapshot.daily.generated} gambar selesai · ${snapshot.daily.requestsStarted}/${snapshot.daily.limit} percobaan · ${snapshot.daily.estimatedNeurons.toLocaleString("id-ID")}/${snapshot.daily.neuronLimit.toLocaleString("id-ID")} Neurons`
    : "Kuota belum terbaca";

  return (
    <div
      className={`flex max-w-full flex-col items-start gap-1 rounded-xl border px-3 py-2 text-xs ${
        isEnabled
          ? "border-emerald-500/25 bg-emerald-500/5"
          : "border-amber-500/25 bg-amber-500/5"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`${label}. ${quotaSummary}. ${description}`}
      title={description}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isEnabled ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
        </span>
        <span className={isEnabled ? "font-medium text-emerald-200" : "font-medium text-amber-200"}>
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground">Flux Schnell · 1:1 · 60 N/gambar</span>
      </div>
      <span className="pl-4 text-[10px] text-muted-foreground">{quotaSummary}</span>
    </div>
  );
}
