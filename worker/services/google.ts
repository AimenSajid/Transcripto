import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

const jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

export interface GoogleIdentity {
  sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
): Promise<GoogleIdentity> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId,
  });

  if (typeof payload.sub !== "string") {
    throw new Error("Google ID token missing sub claim");
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}
