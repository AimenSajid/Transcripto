import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { getUserById } from "../db/queries";
import { verifySessionToken } from "../services/session";
import type { DbUser } from "../types";

export const SESSION_COOKIE_NAME = "session";

export const requireAuth: MiddlewareHandler<{
  Bindings: Env;
  Variables: { user: DbUser };
}> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    return c.json({ error: "Not authenticated", code: "unauthenticated" }, 401);
  }

  try {
    const { userId } = await verifySessionToken(token, c.env.JWT_SECRET);
    const user = await getUserById(c.env.DB, userId);
    if (!user) {
      return c.json({ error: "Not authenticated", code: "unauthenticated" }, 401);
    }
    c.set("user", user);
  } catch {
    return c.json({ error: "Not authenticated", code: "unauthenticated" }, 401);
  }

  await next();
};
