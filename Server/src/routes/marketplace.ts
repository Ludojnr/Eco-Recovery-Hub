import { Router, Response } from "express";
import { MarketplaceListing } from "../models/MarketplaceListing";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();
router.use(authenticate);

// GET /api/marketplace
router.get("/", async (_req: AuthRequest, res: Response): Promise<void> => {
  const listings = await MarketplaceListing.find({}).sort({ createdAt: -1 });
  res.json(listings);
});

// POST /api/marketplace — create a listing
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const { title, description, price, points, sector, quantity, imageUrl } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const listing = await MarketplaceListing.create({
    title, description, price, points, sector, quantity,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    sellerId: user._id,
    sellerName: user.fullName,
    sellerAvatar: user.avatar,
    sellerRole: user.role,
    dateListed: today,
    status: "Available",
  });

  await createAuditLog(`Listed marketplace material: ${title}`, user.fullName);
  res.status(201).json(listing);
});

// POST /api/marketplace/:id/buy — purchase (redeem eco points)
router.post("/:id/buy", async (req: AuthRequest, res: Response): Promise<void> => {
  const buyer = await User.findById(req.user!.id);
  if (!buyer) { res.status(404).json({ message: "User not found" }); return; }

  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing || listing.status === "Sold") {
    res.status(400).json({ message: "Item not available" }); return;
  }

  if (buyer.points < listing.points) {
    res.status(400).json({
      message: `Insufficient eco points. You need ${listing.points} pts but have ${buyer.points} pts.`
    }); return;
  }

  // Deduct from buyer
  await User.findByIdAndUpdate(buyer._id, { $inc: { points: -listing.points } });
  // Credit seller
  await User.findByIdAndUpdate(listing.sellerId, { $inc: { points: listing.points } });
  // Mark as sold
  listing.status = "Sold";
  await listing.save();

  await createAuditLog(`Claimed marketplace item: ${listing.title}`, buyer.fullName);
  res.json(listing);
});

// DELETE /api/marketplace/:id — seller or admin can delete
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) { res.status(404).json({ message: "Listing not found" }); return; }

  const isOwner = listing.sellerId.toString() === req.user!.id;
  const isAdmin = req.user!.role === "Admin";
  if (!isOwner && !isAdmin) { res.status(403).json({ message: "Forbidden" }); return; }

  await listing.deleteOne();
  res.json({ message: "Listing deleted" });
});

export default router;
