import mongoose, { Document, Schema } from "mongoose";

export interface IScannedMaterial extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  item: string;
  sector: string;
  category: string;
  confidence: number;
  points: number;
  co2: number;
  description: string;
  handling: string;
  status: "Pending Approval" | "Approved" | "Rejected";
  date: string;
  imageUrl?: string;
}

const ScannedMaterialSchema = new Schema<IScannedMaterial>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    item: { type: String, required: true },
    sector: { type: String, required: true },
    category: { type: String, required: true },
    confidence: { type: Number, required: true },
    points: { type: Number, required: true },
    co2: { type: Number, required: true },
    description: { type: String, required: true },
    handling: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
    date: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const ScannedMaterial = mongoose.model<IScannedMaterial>("ScannedMaterial", ScannedMaterialSchema);
