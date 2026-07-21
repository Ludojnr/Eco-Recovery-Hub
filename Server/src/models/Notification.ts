import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "pickup" | "reward" | "system" | "message";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["pickup", "reward", "system", "message"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    time: { type: String, default: "Just now" },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
