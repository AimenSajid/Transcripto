import { SignJWT, jwtVerify } from "jose";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: number;
}

function toSecretKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(toSecretKey(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, toSecretKey(secret));

  if (typeof payload.userId !== "number") {
    throw new Error("Session token missing userId claim");
  }

  return { userId: payload.userId };
}
