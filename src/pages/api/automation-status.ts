import { getAutomationStatus } from "../../lib/automationStatus";

export const prerender = false;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(): Promise<Response> {
  const status = await getAutomationStatus();
  if (!status) {
    return jsonResponse({ error: "Status otomasi Supabase tidak tersedia." }, 503);
  }
  return jsonResponse(status);
}
