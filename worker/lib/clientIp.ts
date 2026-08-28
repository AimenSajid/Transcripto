import type { Context } from "hono";

/** Cloudflare sets this on every request that reaches a Worker; the fallback only matters for local dev. */
export function getClientIp(c: Context): string {
  return c.req.header("CF-Connecting-IP") ?? "unknown";
}
