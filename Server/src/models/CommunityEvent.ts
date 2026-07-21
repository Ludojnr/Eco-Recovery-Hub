import mongoose, { Document, Schema } from "mongoose";

export interface ICommunityEvent extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  host: string;
  hostLogo?: string;
  volunteers: string[];
  maxVolunteers?: number;
  imageUrl?: string;
}

const CommunityEventSchema = new Schema<ICommunityEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    host: { type: String, required: true },
    hostLogo: { type: String },
    volunteers: { type: [String], default: [] },
    maxVolunteers: { type: Number, default: 100 },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const CommunityEvent = mongoose.model<ICommunityEvent>("CommunityEvent", CommunityEventSchema);
