import { Hono } from "hono";
import { getClientIp } from "../lib/clientIp";
import { getQuotaStatus, getQuotaStatusForIp } from "../services/quota";
import type { DbUser } from "../types";

const quota = new Hono<{ Bindings: Env; Variables: { user?: DbUser } }>();

quota.get("/", async (c) => {
  const user = c.get("user");
  const status = user
    ? await getQuotaStatus(c.env.DB, user.id)
    : await getQuotaStatusForIp(c.env.DB, getClientIp(c));
  return c.json(status);
});

export default quota;
