import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb, getState, putState } from "./db.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Allow the separately-hosted frontend to call this API.
// Set CORS_ORIGIN to your frontend URL in production (comma-separated for multiple).
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: false,
  }),
);

// The app state document can be large; allow a generous JSON body limit.
app.use(express.json({ limit: "10mb" }));

// Resolve a workspace id from the request. The frontend generates one and
// sends it via the x-workspace-id header so each browser keeps its own data.
function workspaceIdFrom(req) {
  const id = req.header("x-workspace-id") || req.query.workspace;
  if (!id || typeof id !== "string" || id.length > 200) return null;
  return id;
}

app.get("/", (_req, res) => {
  res.json({ name: "Eco Recovery Hub API", status: "ok" });
});

app.get("/api/health", async (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Load the full app-state document for a workspace.
app.get("/api/state", async (req, res) => {
  const workspaceId = workspaceIdFrom(req);
  if (!workspaceId) {
    return res.status(400).json({ error: "Missing x-workspace-id header." });
  }
  try {
    const result = await getState(workspaceId);
    if (!result) return res.status(200).json({ data: null });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[api] GET /api/state failed:", err.message);
    return res.status(500).json({ error: "Failed to load state." });
  }
});

// Persist the full app-state document for a workspace.
app.put("/api/state", async (req, res) => {
  const workspaceId = workspaceIdFrom(req);
  if (!workspaceId) {
    return res.status(400).json({ error: "Missing x-workspace-id header." });
  }
  const data = req.body?.data;
  if (data === undefined || data === null || typeof data !== "object") {
    return res.status(400).json({ error: "Request body must be { data: <object> }." });
  }
  try {
    const result = await putState(workspaceId, data);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[api] PUT /api/state failed:", err.message);
    return res.status(500).json({ error: "Failed to save state." });
  }
});

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error("[server] Database init failed:", err.message);
    // Still start the server so health checks and clear errors are visible.
  }
  app.listen(PORT, () => {
    console.log(`[server] Eco Recovery Hub API listening on port ${PORT}`);
  });
}

start();
