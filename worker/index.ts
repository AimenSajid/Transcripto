import { Hono } from "hono";
import { optionalAuth } from "./middleware/optionalAuth";
import { requireAuth } from "./middleware/requireAuth";
import auth from "./routes/auth";
import quota from "./routes/quota";
import summaries from "./routes/summaries";
import transcribe from "./routes/transcribe";
import transcripts from "./routes/transcripts";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/auth", auth);
app.use("/api/transcribe/*", optionalAuth);
app.route("/api/transcribe", transcribe);
app.use("/api/transcripts/*", requireAuth);
app.route("/api/transcripts", transcripts);
app.route("/api/transcripts", summaries);
app.use("/api/quota", optionalAuth);
app.route("/api/quota", quota);

export default app;
