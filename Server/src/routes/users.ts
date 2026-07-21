import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { createAuditLog } from "../utils/auditLogger";
import { sanitizeUser } from "./auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users — Admin: list all users
router.get("/", requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/leaderboard — Public leaderboard (top users by points)
router.get("/leaderboard", async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find({ role: "User" }, { password: 0, email: 0 })
    .sort({ points: -1 })
    .limit(50);
  res.json(users);
});

// GET /api/users/:id
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id, { password: 0 });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json(user);
});

// PATCH /api/users/:id — Admin: update any user
router.patch("/:id", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { password, ...patch } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true, select: "-password" });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json(user);
});

// DELETE /api/users/:id — Admin: delete user
router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  await createAuditLog("Deleted user account", req.user!.email, user.fullName, user.orgName);
  res.json({ message: "User deleted" });
});

// POST /api/users/:id/suspend — Admin
router.post("/:id/suspend", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: "Suspended" }, { new: true, select: "-password" });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  await createAuditLog("Suspended user account", req.user!.email, user.fullName, user.orgName);
  res.json(user);
});

// POST /api/users/:id/reactivate — Admin
router.post("/:id/reactivate", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: "Active" }, { new: true, select: "-password" });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  await createAuditLog("Reactivated user account", req.user!.email, user.fullName, user.orgName);
  res.json(user);
});

// POST /api/users/:id/approve-kyc — Admin
router.post("/:id/approve-kyc", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { kycStatus: "Verified", kycMessage: "Verified successfully!" },
    { new: true, select: "-password" }
  );
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  await Notification.create({
    userId: user._id,
    type: "system",
    title: "Profile Verified",
    body: "Your KYC document submission has been approved and verified.",
    time: "Just now",
    unread: true,
  });
  await createAuditLog("Approved KYC Verification", req.user!.email, user.fullName, user.orgName);
  res.json(user);
});

// POST /api/users/:id/reject-kyc — Admin
router.post("/:id/reject-kyc", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { feedback } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { kycStatus: "Rejected", kycMessage: feedback },
    { new: true, select: "-password" }
  );
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  await Notification.create({
    userId: user._id,
    type: "system",
    title: "KYC Submission Rejected",
    body: `Rejection details: ${feedback}`,
    time: "Just now",
    unread: true,
  });
  await createAuditLog("Rejected KYC Verification", req.user!.email, user.fullName, user.orgName);
  res.json(user);
});

// POST /api/users/:id/adjust-points — Admin
router.post("/:id/adjust-points", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { pointsChange, reason } = req.body;
  if (typeof pointsChange !== "number") { res.status(400).json({ message: "pointsChange must be a number" }); return; }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  user.points = Math.max(0, user.points + pointsChange);
  await user.save();
  await Notification.create({
    userId: user._id,
    type: "reward",
    title: pointsChange >= 0 ? `Points Added: +${pointsChange}` : `Points Deducted: ${pointsChange}`,
    body: `Reason: ${reason}`,
    time: "Just now",
    unread: true,
  });
  await createAuditLog(`Adjusted points by ${pointsChange} (${reason})`, req.user!.email, user.fullName, user.orgName);
  res.json(sanitizeUser(user));
});

// POST /api/users/broadcast — Admin: send notification to all/institutions
router.post("/broadcast", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, body, recipientType } = req.body;
  const filter = recipientType === "institutions"
    ? { accountType: "Institutional", role: "User" }
    : { role: "User" };
  const targets = await User.find(filter, { _id: 1 });
  const notifications = targets.map((u) => ({
    userId: u._id,
    type: "system" as const,
    title,
    body,
    time: "Just now",
    unread: true,
  }));
  await Notification.insertMany(notifications);
  await createAuditLog(`Broadcasted Announcement: ${title} (${recipientType})`, req.user!.email);
  res.json({ message: `Broadcast sent to ${targets.length} users` });
});

export default router;
