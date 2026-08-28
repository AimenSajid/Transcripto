import type { AuthResponse, MeResponse, User } from "../../shared/types";

export async function signInWithGoogle(credential: string): Promise<User> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(`Google sign-in failed: ${res.status}`);
  const data = (await res.json()) as AuthResponse;
  return data.user;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error(`Failed to fetch current user: ${res.status}`);
  const data = (await res.json()) as MeResponse;
  return data.user;
}

export async function signOut(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Sign-out failed: ${res.status}`);
  }
}
