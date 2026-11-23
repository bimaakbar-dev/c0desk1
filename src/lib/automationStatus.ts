import { getSupabaseAdmin } from "./supabaseAdmin";

export interface AutomationStatusSnapshot {
  automation: {
    enabled: boolean;
    pauseReason: string;
    lastRunAt: string | null;
  };
  daily: {
    date: string;
    generated: number;
    requestsStarted: number;
    limit: number;
    remaining: number;
    estimatedNeurons: number;
    neuronLimit: number;
    storageBytes: number;
    egressBytes: number;
  };
}

export async function getAutomationStatus(): Promise<AutomationStatusSnapshot | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const usageDate = new Date().toISOString().slice(0, 10);
  const [controlResult, usageResult] = await Promise.all([
    supabase
      .from("ares_automation_control")
      .select("automation_enabled, max_images_per_day, pause_reason, last_run_at")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("ares_daily_usage")
      .select("generated_count, image_request_count, estimated_neurons, storage_bytes, egress_bytes")
      .eq("usage_date", usageDate)
      .maybeSingle(),

  ]);

  if (controlResult.error || usageResult.error || !controlResult.data) return null;

  const generated = usageResult.data?.generated_count ?? 0;
  const requestsStarted = usageResult.data?.image_request_count ?? 0;
  const estimatedNeurons = Number(usageResult.data?.estimated_neurons ?? 0);
  const limit = Math.min(250, controlResult.data.max_images_per_day);
  const neuronLimit = 9_500;
  const remaining = Math.max(
    0,
    Math.min(limit - requestsStarted, Math.floor((neuronLimit - estimatedNeurons) / 60))
  );

  return {
    automation: {
      enabled: controlResult.data.automation_enabled,
      pauseReason: controlResult.data.pause_reason,
      lastRunAt: controlResult.data.last_run_at,
    },
    daily: {
      date: usageDate,
      generated,
      requestsStarted,
      limit,
      remaining,
      estimatedNeurons,
      neuronLimit,
      storageBytes: usageResult.data?.storage_bytes ?? 0,
      egressBytes: usageResult.data?.egress_bytes ?? 0,
    },
  };
}
