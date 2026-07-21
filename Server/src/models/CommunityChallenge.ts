import mongoose, { Document, Schema } from "mongoose";

export interface ICommunityChallenge extends Document {
  title: string;
  description: string;
  points: number;
  co2: number;
  daysRemaining: number;
  targetQuantity: number;
  progress: number;
  completed: boolean;
  sector: string;
}

const CommunityChallengeSchema = new Schema<ICommunityChallenge>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    co2: { type: Number, required: true },
    daysRemaining: { type: Number, required: true },
    targetQuantity: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    sector: { type: String, required: true },
  },
  { timestamps: true }
);

export const CommunityChallenge = mongoose.model<ICommunityChallenge>(
  "CommunityChallenge",
  CommunityChallengeSchema
);
