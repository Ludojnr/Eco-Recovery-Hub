import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional().default(""),
  institution: z.string().optional().default(""),
  location: z.string().optional().default(""),
  accountType: z.enum(["Individual", "Institutional"]).default("Individual"),
  orgName: z.string().optional(),
  orgType: z.string().optional(),
  orgLocation: z.string().optional(),
  contactPerson: z.string().optional(),
  orgEmail: z.string().email().optional(),
  orgPhone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(user: { _id: unknown; role: string; email: string }): string {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      res.status(400).json({ message: "An account with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const isAdminEmail = data.email.toLowerCase().startsWith("admin") || data.email.toLowerCase().endsWith("@ecorecovery.org");
    const user = await User.create({
      ...data,
      password: hashedPassword,
      role: isAdminEmail ? "Admin" : "User",
      kycStatus: isAdminEmail ? "Verified" : "Not Started",
      points: 0,
      requestCount: 0,
      uploadCount: 0,
      preferredPickupAddresses: [],
      accountStatus: "Active",
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    throw err;
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (user.accountStatus === "Suspended") {
      res.status(403).json({ message: "Your account has been suspended. Please contact support." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    throw err;
  }
});

// GET /api/auth/me — get current user from token
router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
});

// PATCH /api/auth/me — update own profile
router.patch("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const allowed = [
    "fullName", "phone", "institution", "location", "department", "address",
    "avatar", "preferredPickupAddresses", "accountType", "orgName", "orgType",
    "orgLocation", "orgLogo", "contactPerson", "orgEmail", "orgPhone",
  ];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user?.id, patch, { new: true });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
});

// POST /api/auth/kyc — submit KYC
router.post("/kyc", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { kycStatus: "Pending", kycMessage: "KYC documents submitted and awaiting review." },
    { new: true }
  );
  res.json(sanitizeUser(user!));
});

// PATCH /api/auth/password — change password
router.patch("/password", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ message: "Invalid password data" });
    return;
  }
  const user = await User.findById(req.user?.id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) { res.status(401).json({ message: "Current password is incorrect" }); return; }
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: "Password updated successfully" });
});

export function sanitizeUser(user: InstanceType<typeof User>) {
  const obj = user.toObject() as unknown as Record<string, unknown>;
  delete obj.password;
  return obj;
}

export default router;
