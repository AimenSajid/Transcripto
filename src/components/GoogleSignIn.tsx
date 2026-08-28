import { useEffect, useRef } from "react";
import { signInWithGoogle } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { renderGoogleSignInButton } from "../lib/googleIdentity";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

export function GoogleSignIn() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setUser } = useAuth();

  useEffect(() => {
    if (!containerRef.current || !GOOGLE_CLIENT_ID) return;

    renderGoogleSignInButton(containerRef.current, GOOGLE_CLIENT_ID, (credential) => {
      void signInWithGoogle(credential).then(setUser);
    });
  }, [setUser]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-xs text-red-400">
        Missing VITE_GOOGLE_CLIENT_ID — set it in .env.local
      </p>
    );
  }

  return <div ref={containerRef} />;
}
