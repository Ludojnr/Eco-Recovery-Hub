import mongoose, { Document, Schema } from "mongoose";

export type KycStatus = "Not Started" | "Pending" | "Verified" | "Rejected";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  institution: string;
  location: string;
  department?: string;
  address?: string;
  avatar?: string;
  preferredPickupAddresses: string[];
  kycStatus: KycStatus;
  kycMessage?: string;
  points: number;
  requestCount: number;
  uploadCount: number;
  role: "User" | "Admin";
  memberSince: Date;
  accountStatus: "Active" | "Suspended";
  accountType: "Individual" | "Institutional";
  orgName?: string;
  orgType?: string;
  orgLocation?: string;
  orgLogo?: string;
  contactPerson?: string;
  orgEmail?: string;
  orgPhone?: string;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    institution: { type: String, default: "" },
    location: { type: String, default: "" },
    department: { type: String },
    address: { type: String },
    avatar: { type: String },
    preferredPickupAddresses: { type: [String], default: [] },
    kycStatus: {
      type: String,
      enum: ["Not Started", "Pending", "Verified", "Rejected"],
      default: "Not Started",
    },
    kycMessage: { type: String },
    points: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
    uploadCount: { type: Number, default: 0 },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    memberSince: { type: Date, default: Date.now },
    accountStatus: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    accountType: { type: String, enum: ["Individual", "Institutional"], default: "Individual" },
    orgName: { type: String },
    orgType: { type: String },
    orgLocation: { type: String },
    orgLogo: { type: String },
    contactPerson: { type: String },
    orgEmail: { type: String },
    orgPhone: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
