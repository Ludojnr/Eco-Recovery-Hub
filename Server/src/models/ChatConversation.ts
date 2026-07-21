import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage {
  _id?: mongoose.Types.ObjectId;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  isImage?: boolean;
  isQuickReply?: boolean;
}

export interface IChatConversation extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  status: "active" | "resolved";
  unreadCount: number;
  adminUnreadCount: number;
  lastMessageAt: Date;
  messages: IChatMessage[];
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    fileUrl: { type: String },
    fileName: { type: String },
    isImage: { type: Boolean },
    isQuickReply: { type: Boolean },
  },
  { _id: true }
);

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    unreadCount: { type: Number, default: 0 },
    adminUnreadCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const ChatConversation = mongoose.model<IChatConversation>("ChatConversation", ChatConversationSchema);
