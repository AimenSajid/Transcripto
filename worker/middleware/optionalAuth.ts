import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { getUserById } from "../db/queries";
import { verifySessionToken } from "../services/session";
import type { DbUser } from "../types";
import { SESSION_COOKIE_NAME } from "./requireAuth";

/**
 * Attaches the signed-in user to context when a valid session cookie is
 * present, but never blocks the request when one isn't — for routes that
 * work for both anonymous and signed-in callers (e.g. transcription, which
 * falls back to IP-based quota when there's no user).
 */
export const optionalAuth: MiddlewareHandler<{
  Bindings: Env;
  Variables: { user?: DbUser };
}> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    try {
      const { userId } = await verifySessionToken(token, c.env.JWT_SECRET);
      const user = await getUserById(c.env.DB, userId);
      if (user) c.set("user", user);
    } catch {
      // Invalid or expired session: proceed as anonymous rather than failing.
    }
  }

  await next();
};
