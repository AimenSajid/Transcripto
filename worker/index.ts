import { Hono } from "hono";
import { requireAuth } from "./middleware/requireAuth";
import auth from "./routes/auth";
import transcribe from "./routes/transcribe";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/auth", auth);
app.use("/api/transcribe/*", requireAuth);
app.route("/api/transcribe", transcribe);

export default app;
