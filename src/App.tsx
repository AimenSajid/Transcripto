import { useEffect, useState } from "react";

type HealthStatus = "checking" | "ok" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
      <h1 className="text-3xl font-semibold">Transcripto</h1>
      <p className="text-sm text-neutral-400">
        API health:{" "}
        <span
          className={
            status === "ok"
              ? "text-green-400"
              : status === "error"
                ? "text-red-400"
                : "text-neutral-400"
          }
        >
          {status}
        </span>
      </p>
    </main>
  );
}

export default App;
