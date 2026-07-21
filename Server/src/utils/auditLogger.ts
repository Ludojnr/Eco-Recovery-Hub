import { AuditLog } from "../models/AuditLog";

export async function createAuditLog(
  action: string,
  adminName: string,
  affectedUser?: string,
  affectedOrg?: string,
  ipAddress = "N/A",
  deviceInfo = "N/A"
): Promise<void> {
  const now = new Date();
  await AuditLog.create({
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    adminName,
    action,
    affectedUser,
    affectedOrg,
    ipAddress,
    deviceInfo,
  });
}
