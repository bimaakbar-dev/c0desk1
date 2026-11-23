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

  return (
    <div
      className={`flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border px-2.5 py-1.5 text-xs ${
        isEnabled
          ? "border-emerald-500/25 bg-emerald-500/5"
          : "border-amber-500/25 bg-amber-500/5"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`${label}. ${description}`}
      title={description}
    >
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
      {snapshot ? (
        <span className="whitespace-nowrap text-[10px] text-muted-foreground">
          {snapshot.daily.generated}/{snapshot.daily.limit} hari ini
        </span>
      ) : (
        <span className="max-w-48 truncate text-[10px] text-muted-foreground">
          Kuota belum terbaca
        </span>
      )}
    </div>
  );
}
