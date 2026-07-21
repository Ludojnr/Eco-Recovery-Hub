import mongoose, { Document, Schema } from "mongoose";

export interface IPickupRequest extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  item: string;
  quantity: number;
  preferredDate: string;
  preferredCenter: string;
  address: string;
  notes?: string;
  status: "Pending Review" | "Pickup Scheduled" | "Completed" | "Cancelled";
  points: number;
  date: string;
}

const PickupRequestSchema = new Schema<IPickupRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    preferredDate: { type: String, required: true },
    preferredCenter: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["Pending Review", "Pickup Scheduled", "Completed", "Cancelled"],
      default: "Pending Review",
    },
    points: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const PickupRequest = mongoose.model<IPickupRequest>("PickupRequest", PickupRequestSchema);
