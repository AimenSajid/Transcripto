import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleSignIn } from "../components/GoogleSignIn";
import { Card } from "../components/ui/Card";
import { Wordmark } from "../components/ui/Wordmark";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.status === "signed-in") navigate("/", { replace: true });
  }, [auth.status, navigate]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-body)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 28,
      }}
    >
      <Wordmark size={22} />

      <Card padding="36px" style={{ width: 420, maxWidth: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1
              style={{
                font: "var(--fw-extrabold) 26px/1.2 var(--font-display)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                margin: 0,
              }}
            >
              Log in to Transcripto
            </h1>
            <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>
              Your transcripts get saved, summarised, and exportable. Guest
              transcription keeps working either way.
            </p>
          </div>

          <GoogleSignIn />

          <p
            style={{
              font: "var(--fw-regular) var(--text-xs)/1.5 var(--font-body)",
              color: "var(--text-subtle)",
              margin: 0,
            }}
          >
            Audio is deleted from our servers after transcription. Saved
            transcripts stay in your account until you delete them.
          </p>
        </div>
      </Card>

      <Link
        to="/"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          font: "var(--type-label)",
          color: "var(--text-muted)",
          textDecoration: "none",
        }}
      >
        Continue without an account
      </Link>
    </main>
  );
}
