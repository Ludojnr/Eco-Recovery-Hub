import { Router, Response } from "express";
import { PickupRequest } from "../models/PickupRequest";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();
router.use(authenticate);

// GET /api/pickups — user gets own; admin gets all
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const filter = req.user!.role === "Admin" ? {} : { userId: req.user!.id };
  const pickups = await PickupRequest.find(filter).sort({ createdAt: -1 });
  res.json(pickups);
});

// POST /api/pickups — submit a pickup request
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const { item, quantity, preferredDate, preferredCenter, address, notes, points } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const pickup = await PickupRequest.create({
    userId: user._id,
    userName: user.fullName,
    userEmail: user.email,
    item, quantity, preferredDate, preferredCenter, address, notes,
    points: points || 0,
    status: "Pending Review",
    date: today,
  });

  await User.findByIdAndUpdate(user._id, { $inc: { requestCount: 1 } });
  res.status(201).json(pickup);
});

// PATCH /api/pickups/:id/status — Admin: update pickup status
router.patch("/:id/status", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const validStatuses = ["Pending Review", "Pickup Scheduled", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status" }); return;
  }

  const pickup = await PickupRequest.findById(req.params.id);
  if (!pickup) { res.status(404).json({ message: "Pickup request not found" }); return; }

  const wasCompleted = pickup.status === "Completed";
  pickup.status = status;
  await pickup.save();

  let pointsAwarded = 0;
  if (status === "Completed" && !wasCompleted) {
    pointsAwarded = pickup.points;
    await User.findByIdAndUpdate(pickup.userId, { $inc: { points: pointsAwarded } });
  }

  await Notification.create({
    userId: pickup.userId,
    type: "pickup",
    title: `Pickup Request: ${status}`,
    body: status === "Completed"
      ? `Your pickup for "${pickup.item}" was completed. +${pointsAwarded} points awarded!`
      : `Your pickup for "${pickup.item}" status updated to "${status}".`,
    time: "Just now",
    unread: true,
  });

  await createAuditLog(`Updated pickup status to ${status}`, req.user!.email, pickup.userName);
  res.json(pickup);
});

// POST /api/pickups/:id/assign-driver — Admin
router.post("/:id/assign-driver", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { driverName } = req.body;
  const pickup = await PickupRequest.findByIdAndUpdate(
    req.params.id,
    { preferredCenter: driverName, status: "Pickup Scheduled" },
    { new: true }
  );
  if (!pickup) { res.status(404).json({ message: "Pickup not found" }); return; }
  await createAuditLog(`Assigned collector (${driverName}) to pickup`, req.user!.email, pickup.userName);
  res.json(pickup);
});

// DELETE /api/pickups/:id — Admin
router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const pickup = await PickupRequest.findByIdAndDelete(req.params.id);
  if (!pickup) { res.status(404).json({ message: "Pickup not found" }); return; }
  res.json({ message: "Pickup deleted" });
});

export default router;
