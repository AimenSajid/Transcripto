import type { QuotaResponse } from "../../shared/types";

export async function fetchQuota(): Promise<QuotaResponse> {
  const res = await fetch("/api/quota");
  if (!res.ok) throw new Error(`Failed to fetch quota: ${res.status}`);
  return (await res.json()) as QuotaResponse;
}
