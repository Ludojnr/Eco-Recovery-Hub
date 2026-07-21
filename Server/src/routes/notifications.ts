import { Router, Response } from "express";
import { Notification } from "../models/Notification";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /api/notifications — get current user's notifications
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// PATCH /api/notifications/clear — mark all as read
router.patch("/clear", async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.updateMany({ userId: req.user!.id }, { unread: false });
  res.json({ message: "Notifications cleared" });
});

// PATCH /api/notifications/:id/read — mark single as read
router.patch("/:id/read", async (req: AuthRequest, res: Response): Promise<void> => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { unread: false },
    { new: true }
  );
  if (!notif) { res.status(404).json({ message: "Notification not found" }); return; }
  res.json(notif);
});

export default router;
