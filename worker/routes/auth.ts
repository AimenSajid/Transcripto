import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { googleAuthRequestSchema } from "../../shared/schemas";
import type { User } from "../../shared/types";
import { getUserById, upsertUserByGoogleSub } from "../db/queries";
import { getClientIp } from "../lib/clientIp";
import { SESSION_COOKIE_NAME } from "../middleware/requireAuth";
import { verifyGoogleIdToken } from "../services/google";
import { transferGuestUsageToUser } from "../services/quota";
import { signSessionToken, verifySessionToken } from "../services/session";
import type { DbUser } from "../types";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function toClientUser(user: DbUser): User {
  return { id: user.id, email: user.email, name: user.name, picture: user.picture };
}

const auth = new Hono<{ Bindings: Env }>();

auth.post("/google", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = googleAuthRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid request body", code: "invalid_body" }, 400);
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(parsed.data.credential, c.env.GOOGLE_CLIENT_ID);
  } catch {
    return c.json({ error: "Invalid Google credential", code: "invalid_credential" }, 401);
  }

  const user = await upsertUserByGoogleSub(c.env.DB, identity);
  await transferGuestUsageToUser(c.env.DB, user.id, getClientIp(c));
  const token = await signSessionToken({ userId: user.id }, c.env.JWT_SECRET);

  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return c.json({ user: toClientUser(user) });
});

auth.get("/me", async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json({ user: null });

  try {
    const { userId } = await verifySessionToken(token, c.env.JWT_SECRET);
    const user = await getUserById(c.env.DB, userId);
    return c.json({ user: user ? toClientUser(user) : null });
  } catch {
    return c.json({ user: null });
  }
});

auth.post("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
  return c.body(null, 204);
});

export default auth;
