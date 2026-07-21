import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import scanRoutes from "./routes/scans";
import pickupRoutes from "./routes/pickups";
import chatRoutes from "./routes/chats";
import notificationRoutes from "./routes/notifications";
import auditLogRoutes from "./routes/auditLogs";
import communityRoutes from "./routes/community";
import marketplaceRoutes from "./routes/marketplace";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// ── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ── MongoDB + Start ─────────────────────────────────────────────────────────
async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌  MONGO_URI is not set. Add it to Server/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅  MongoDB connected");
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
  });
}

start();
