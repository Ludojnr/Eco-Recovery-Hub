import { Router, Response } from "express";
import { CommunityPost } from "../models/CommunityPost";
import { CommunityChallenge } from "../models/CommunityChallenge";
import { CommunityEvent } from "../models/CommunityEvent";
import { User } from "../models/User";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();
router.use(authenticate);

/* ─────────────── POSTS ─────────────── */

// GET /api/community/posts
router.get("/posts", async (_req: AuthRequest, res: Response): Promise<void> => {
  const posts = await CommunityPost.find({ visibility: "Public" }).sort({ timestamp: -1 });
  res.json(posts);
});

// POST /api/community/posts
router.post("/posts", async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const { text, sector, mediaUrl, mediaType, visibility = "Public" } = req.body;
  const isInst = user.accountType === "Institutional";
  const badges = isInst
    ? ["🏢 Institutional Partner", "🏆 Sustainability Ambassador"]
    : ["🌱 Green Starter"];

  const post = await CommunityPost.create({
    userId: user._id,
    userName: user.fullName,
    userAvatar: user.avatar,
    userRole: user.role,
    userBadges: badges,
    timestamp: new Date(),
    sector,
    text,
    mediaUrl,
    mediaType,
    visibility,
  });

  // Award 10 points for posting
  await User.findByIdAndUpdate(user._id, { $inc: { points: 10 } });
  await createAuditLog("Created community post", user.fullName);
  res.status(201).json(post);
});

// DELETE /api/community/posts/:id — Admin
router.delete("/posts/:id", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await CommunityPost.findByIdAndDelete(req.params.id);
  if (!post) { res.status(404).json({ message: "Post not found" }); return; }
  await createAuditLog(`Deleted community post ${req.params.id}`, req.user!.email);
  res.json({ message: "Post deleted" });
});

// POST /api/community/posts/:id/like
router.post("/posts/:id/like", async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const post = await CommunityPost.findById(req.params.id);
  if (!post) { res.status(404).json({ message: "Post not found" }); return; }

  const liked = post.likes.includes(userId);
  if (liked) {
    post.likes = post.likes.filter((id) => id !== userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  res.json(post);
});

// POST /api/community/posts/:id/react
router.post("/posts/:id/react", async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { reactionType } = req.body; // "helpful" | "niceWork"
  if (!["helpful", "niceWork"].includes(reactionType)) {
    res.status(400).json({ message: "Invalid reaction type" }); return;
  }
  const post = await CommunityPost.findById(req.params.id);
  if (!post) { res.status(404).json({ message: "Post not found" }); return; }

  const arr = reactionType === "helpful" ? post.helpful : post.niceWork;
  const active = arr.includes(userId);
  const updated = active ? arr.filter((id) => id !== userId) : [...arr, userId];
  (post as unknown as Record<string, unknown>)[reactionType] = updated;
  await post.save();
  res.json(post);
});

// POST /api/community/posts/:id/comment
router.post("/posts/:id/comment", async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const { text } = req.body;
  const post = await CommunityPost.findById(req.params.id);
  if (!post) { res.status(404).json({ message: "Post not found" }); return; }

  const comment = {
    postId: post.id,
    userId: user.id,
    userName: user.fullName,
    userAvatar: user.avatar,
    userRole: user.role,
    text,
    timestamp: new Date(),
  };
  post.comments.push(comment as never);
  await post.save();
  res.json(post);
});

// POST /api/community/posts/:id/report
router.post("/posts/:id/report", async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    { reported: true, $inc: { reportsCount: 1 } },
    { new: true }
  );
  if (!post) { res.status(404).json({ message: "Post not found" }); return; }
  res.json(post);
});

// POST /api/community/posts/:id/resolve-report — Admin
router.post("/posts/:id/resolve-report", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { approve } = req.body; // true = dismiss report, false = delete post
  if (approve) {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { reported: false, reportsCount: 0 },
      { new: true }
    );
    await createAuditLog(`Dismissed community post reports for post ${req.params.id}`, req.user!.email);
    res.json(post);
  } else {
    await CommunityPost.findByIdAndDelete(req.params.id);
    await createAuditLog(`Moderator deleted reported post ${req.params.id}`, req.user!.email);
    res.json({ message: "Post removed" });
  }
});

/* ─────────────── CHALLENGES ─────────────── */

// GET /api/community/challenges
router.get("/challenges", async (_req: AuthRequest, res: Response): Promise<void> => {
  const challenges = await CommunityChallenge.find({}).sort({ createdAt: -1 });
  res.json(challenges);
});

// POST /api/community/challenges — Admin
router.post("/challenges", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, points, co2, targetQuantity, sector, daysRemaining } = req.body;
  const challenge = await CommunityChallenge.create({
    title, description, points, co2, targetQuantity, sector, daysRemaining, progress: 0, completed: false,
  });
  await createAuditLog(`Created challenge: ${title}`, req.user!.email);
  res.status(201).json(challenge);
});

/* ─────────────── EVENTS ─────────────── */

// GET /api/community/events
router.get("/events", async (_req: AuthRequest, res: Response): Promise<void> => {
  const events = await CommunityEvent.find({}).sort({ date: 1 });
  res.json(events);
});

// POST /api/community/events — Admin
router.post("/events", requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, date, time, location, host, imageUrl } = req.body;
  const event = await CommunityEvent.create({
    title, description, date, time, location, host, imageUrl, volunteers: [], maxVolunteers: 100,
  });
  await createAuditLog(`Created event: ${title}`, req.user!.email);
  res.status(201).json(event);
});

// POST /api/community/events/:id/join
router.post("/events/:id/join", async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const event = await CommunityEvent.findById(req.params.id);
  if (!event) { res.status(404).json({ message: "Event not found" }); return; }
  if (!event.volunteers.includes(userId)) {
    event.volunteers.push(userId);
    await event.save();
  }
  res.json(event);
});

// POST /api/community/events/:id/leave
router.post("/events/:id/leave", async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const event = await CommunityEvent.findByIdAndUpdate(
    req.params.id,
    { $pull: { volunteers: userId } },
    { new: true }
  );
  if (!event) { res.status(404).json({ message: "Event not found" }); return; }
  res.json(event);
});

export default router;
