import { Router, Response } from "express";
import { ScannedMaterial } from "../models/ScannedMaterial";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();
router.use(authenticate);

// GET /api/scans — user gets own scans; admin gets all
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const filter = req.user!.role === "Admin" ? {} : { userId: req.user!.id };
  const scans = await ScannedMaterial.find(filter).sort({ createdAt: -1 });
  res.json(scans);
});

// POST /api/scans — submit a new scan
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const { item, sector, category, confidence, points, co2, description, handling, imageUrl } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const scan = await ScannedMaterial.create({
    userId: user._id,
    userEmail: user.email,
    userName: user.fullName,
    item, sector, category, confidence, points, co2, description, handling,
    imageUrl,
    status: "Pending Approval",
    date: today,
  });

  await User.findByIdAndUpdate(user._id, { $inc: { uploadCount: 1 } });
  res.status(201).json(scan);
});

// PATCH /api/scans/:id — Admin: edit scan
router.patch("/:id", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const scan = await ScannedMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!scan) { res.status(404).json({ message: "Scan not found" }); return; }
  await createAuditLog("Edited material scan data", req.user!.email, scan.userName);
  res.json(scan);
});

// POST /api/scans/:id/approve — Admin
router.post("/:id/approve", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const scan = await ScannedMaterial.findById(req.params.id);
  if (!scan || scan.status !== "Pending Approval") {
    res.status(400).json({ message: "Scan not found or already processed" }); return;
  }

  scan.status = "Approved";
  await scan.save();

  await User.findByIdAndUpdate(scan.userId, { $inc: { points: scan.points } });
  await Notification.create({
    userId: scan.userId,
    type: "reward",
    title: `+${scan.points} Points Earned`,
    body: `Your scan of "${scan.item}" was approved by the admin.`,
    time: "Just now",
    unread: true,
  });
  await createAuditLog("Approved material scan", req.user!.email, scan.userName);
  res.json(scan);
});

// POST /api/scans/:id/reject — Admin
router.post("/:id/reject", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const scan = await ScannedMaterial.findById(req.params.id);
  if (!scan || scan.status !== "Pending Approval") {
    res.status(400).json({ message: "Scan not found or already processed" }); return;
  }

  scan.status = "Rejected";
  await scan.save();

  await Notification.create({
    userId: scan.userId,
    type: "system",
    title: "Scan Submission Rejected",
    body: `Your material submission "${scan.item}" was rejected because it did not match quality guidelines.`,
    time: "Just now",
    unread: true,
  });
  await createAuditLog("Rejected material scan", req.user!.email, scan.userName);
  res.json(scan);
});

// DELETE /api/scans/:id — Admin
router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const scan = await ScannedMaterial.findByIdAndDelete(req.params.id);
  if (!scan) { res.status(404).json({ message: "Scan not found" }); return; }
  await createAuditLog("Deleted material upload", req.user!.email, scan.userName);
  res.json({ message: "Scan deleted" });
});

export default router;
