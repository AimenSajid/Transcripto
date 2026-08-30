import { useEffect, useRef, useState } from "react";
import { signInWithGoogle } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { renderGoogleSignInButton } from "../lib/googleIdentity";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

const GSI_POLL_INTERVAL_MS = 150;
const GSI_POLL_ATTEMPTS = 20;

function isGoogleIdentityReady(): boolean {
  const win = window as unknown as { google?: { accounts?: { id?: unknown } } };
  return !!win.google?.accounts?.id;
}

export function GoogleSignIn({ width = 348 }: { width?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setUser } = useAuth();
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !GOOGLE_CLIENT_ID) return;

    let lastWidth = 0;

    // Google's rendered button is a fixed-width iframe that CSS can't
    // resize, so we measure the actual available space ourselves and
    // re-render whenever it changes (e.g. the mobile sidebar drawer
    // opening/closing, or a window resize).
    function draw() {
      if (!container) return;
      const available = Math.floor(container.getBoundingClientRect().width);
      const buttonWidth = Math.max(Math.min(width, available || width), 1);
      if (buttonWidth === lastWidth) return;
      lastWidth = buttonWidth;
      try {
        renderGoogleSignInButton(
          container,
          GOOGLE_CLIENT_ID!,
          (credential) => {
            void signInWithGoogle(credential).then(setUser);
          },
          String(buttonWidth),
        );
      } catch {
        setUnavailable(true);
      }
    }

    const observer = new ResizeObserver(draw);

    // index.html loads the GSI script with async/defer, so it isn't
    // guaranteed to be ready when this effect first runs — polling here
    // avoids the "Google Identity Services script has not loaded" crash
    // that used to blank the whole page on a slow load.
    let attempts = 0;
    const poll = setInterval(() => {
      attempts += 1;
      if (isGoogleIdentityReady()) {
        clearInterval(poll);
        observer.observe(container);
      } else if (attempts >= GSI_POLL_ATTEMPTS) {
        clearInterval(poll);
        setUnavailable(true);
      }
    }, GSI_POLL_INTERVAL_MS);

    return () => {
      clearInterval(poll);
      observer.disconnect();
    };
  }, [setUser, width]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-xs text-red-400">
        Missing VITE_GOOGLE_CLIENT_ID — set it in .env.local
      </p>
    );
  }

  if (unavailable) {
    return (
      <p className="text-xs text-red-400">
        Google sign-in isn't available right now — refresh the page to try
        again.
      </p>
    );
  }

  return <div ref={containerRef} style={{ maxWidth: "100%", overflow: "hidden" }} />;
}
