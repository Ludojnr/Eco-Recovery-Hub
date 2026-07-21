import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  date: string;
  time: string;
  adminName: string;
  action: string;
  affectedUser?: string;
  affectedOrg?: string;
  ipAddress: string;
  deviceInfo: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    affectedUser: { type: String },
    affectedOrg: { type: String },
    ipAddress: { type: String, default: "N/A" },
    deviceInfo: { type: String, default: "N/A" },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
