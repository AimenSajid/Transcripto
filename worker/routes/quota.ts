import { Hono } from "hono";
import { getQuotaStatus } from "../services/quota";
import type { DbUser } from "../types";

const quota = new Hono<{ Bindings: Env; Variables: { user: DbUser } }>();

quota.get("/", async (c) => {
  const user = c.get("user");
  const status = await getQuotaStatus(c.env.DB, user.id);
  return c.json(status);
});

export default quota;
