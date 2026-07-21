import mongoose, { Document, Schema } from "mongoose";

export interface ICommunityComment {
  _id?: mongoose.Types.ObjectId;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  text: string;
  timestamp: Date;
}

export interface ICommunityPost extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  userRole: "User" | "Admin";
  userBadges?: string[];
  timestamp: Date;
  sector?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: string[];
  helpful: string[];
  niceWork: string[];
  comments: ICommunityComment[];
  reported: boolean;
  reportsCount: number;
  visibility: "Public" | "Friends" | "Institution Only" | "Private";
}

const CommentSchema = new Schema<ICommunityComment>(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    userRole: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    userRole: { type: String, enum: ["User", "Admin"], required: true },
    userBadges: { type: [String], default: [] },
    timestamp: { type: Date, default: Date.now },
    sector: { type: String },
    text: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    likes: { type: [String], default: [] },
    helpful: { type: [String], default: [] },
    niceWork: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
    reported: { type: Boolean, default: false },
    reportsCount: { type: Number, default: 0 },
    visibility: {
      type: String,
      enum: ["Public", "Friends", "Institution Only", "Private"],
      default: "Public",
    },
  },
  { timestamps: true }
);

export const CommunityPost = mongoose.model<ICommunityPost>("CommunityPost", CommunityPostSchema);
