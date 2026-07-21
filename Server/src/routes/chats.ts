import { Router, Response } from "express";
import { ChatConversation } from "../models/ChatConversation";
import { User } from "../models/User";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /api/chats — Admin: all conversations; User: own conversation
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.role === "Admin") {
    const chats = await ChatConversation.find({}).sort({ lastMessageAt: -1 });
    res.json(chats);
  } else {
    const chat = await ChatConversation.findOne({ userId: req.user!.id });
    res.json(chat ? [chat] : []);
  }
});

// GET /api/chats/:userId — get a specific conversation (admin or own)
router.get("/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.role !== "Admin" && req.user!.id !== req.params.userId) {
    res.status(403).json({ message: "Forbidden" }); return;
  }
  const chat = await ChatConversation.findOne({ userId: req.params.userId });
  if (!chat) { res.status(404).json({ message: "Chat not found" }); return; }
  res.json(chat);
});

// POST /api/chats/:userId/messages — send a message
router.post("/:userId/messages", async (req: AuthRequest, res: Response): Promise<void> => {
  const { text, fileUrl, fileName, isImage } = req.body;
  const isSenderAdmin = req.user!.role === "Admin";
  const targetUserId = req.params.userId;

  // Auth check: a user can only send to their own chat; admin can send to any
  if (!isSenderAdmin && req.user!.id !== targetUserId) {
    res.status(403).json({ message: "Forbidden" }); return;
  }

  const newMessage = {
    senderId: req.user!.id,
    senderName: "", // filled below
    text,
    timestamp: new Date(),
    fileUrl,
    fileName,
    isImage,
  };

  // Get sender's name
  const sender = await User.findById(req.user!.id);
  newMessage.senderName = sender?.fullName || "Unknown";

  let chat = await ChatConversation.findOne({ userId: targetUserId });

  if (!chat) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) { res.status(404).json({ message: "Target user not found" }); return; }
    chat = new ChatConversation({
      userId: targetUserId,
      userName: targetUser.fullName,
      userEmail: targetUser.email,
      status: "active",
      unreadCount: 0,
      adminUnreadCount: 0,
      lastMessageAt: new Date(),
      messages: [],
    });
  }

  chat.messages.push(newMessage as never);
  chat.lastMessageAt = new Date();
  chat.status = "active";

  if (isSenderAdmin) {
    chat.unreadCount += 1;
    chat.adminUnreadCount = 0;
  } else {
    chat.adminUnreadCount += 1;
    chat.unreadCount = 0;
  }

  await chat.save();
  res.status(201).json(chat);
});

// PATCH /api/chats/:userId/resolve — Admin: mark resolved
router.patch("/:userId/resolve", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const chat = await ChatConversation.findOneAndUpdate(
    { userId: req.params.userId },
    { status: "resolved" },
    { new: true }
  );
  if (!chat) { res.status(404).json({ message: "Chat not found" }); return; }
  res.json(chat);
});

// PATCH /api/chats/:userId/clear-unread — clear unread count
router.patch("/:userId/clear-unread", async (req: AuthRequest, res: Response): Promise<void> => {
  const isAdmin = req.user!.role === "Admin";
  const update = isAdmin ? { adminUnreadCount: 0 } : { unreadCount: 0 };
  const chat = await ChatConversation.findOneAndUpdate(
    { userId: req.params.userId },
    update,
    { new: true }
  );
  res.json(chat);
});

export default router;
