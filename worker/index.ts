import { Hono } from "hono";
import transcribe from "./routes/transcribe";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/transcribe", transcribe);

export default app;
