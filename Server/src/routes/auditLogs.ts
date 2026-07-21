import { Router, Response } from "express";
import { AuditLog } from "../models/AuditLog";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/audit-logs — Admin only
router.get("/", async (_req: AuthRequest, res: Response): Promise<void> => {
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(500);
  res.json(logs);
});

export default router;
