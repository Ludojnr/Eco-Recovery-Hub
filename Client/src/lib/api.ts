/**
 * Centralized API client for Eco-Recovery Hub.
 *
 * All requests are sent to the Express backend (VITE_API_URL).
 * JWT token is automatically attached from localStorage.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";
const TOKEN_KEY = "eco-recovery-hub-token";
const USER_KEY = "eco-recovery-hub-user";

// ─── Token helpers ───────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: unknown) => request<T>("POST", path, body);
const patch = <T>(path: string, body?: unknown) => request<T>("PATCH", path, body);
const del = <T>(path: string) => request<T>("DELETE", path);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (data: Record<string, unknown>) =>
    post<{ token: string; user: ApiUser }>("/api/auth/signup", data),

  login: (email: string, password: string) =>
    post<{ token: string; user: ApiUser }>("/api/auth/login", { email, password }),

  me: () => get<ApiUser>("/api/auth/me"),

  updateProfile: (data: Partial<ApiUser>) => patch<ApiUser>("/api/auth/me", data),

  submitKyc: () => post<ApiUser>("/api/auth/kyc"),

  changePassword: (currentPassword: string, newPassword: string) =>
    patch<{ message: string }>("/api/auth/password", { currentPassword, newPassword }),
};

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export const usersApi = {
  list: () => get<ApiUser[]>("/api/users"),
  leaderboard: () => get<ApiUser[]>("/api/users/leaderboard"),
  getById: (id: string) => get<ApiUser>(`/api/users/${id}`),
  update: (id: string, data: Partial<ApiUser>) => patch<ApiUser>(`/api/users/${id}`, data),
  delete: (id: string) => del<{ message: string }>(`/api/users/${id}`),
  suspend: (id: string) => post<ApiUser>(`/api/users/${id}/suspend`),
  reactivate: (id: string) => post<ApiUser>(`/api/users/${id}/reactivate`),
  approveKyc: (id: string) => post<ApiUser>(`/api/users/${id}/approve-kyc`),
  rejectKyc: (id: string, feedback: string) =>
    post<ApiUser>(`/api/users/${id}/reject-kyc`, { feedback }),
  adjustPoints: (id: string, pointsChange: number, reason: string) =>
    post<ApiUser>(`/api/users/${id}/adjust-points`, { pointsChange, reason }),
  broadcast: (title: string, body: string, recipientType: "all" | "institutions") =>
    post<{ message: string }>("/api/users/broadcast", { title, body, recipientType }),
};

// ─── Scans ───────────────────────────────────────────────────────────────────

export const scansApi = {
  list: () => get<ApiScan[]>("/api/scans"),
  create: (data: Partial<ApiScan>) => post<ApiScan>("/api/scans", data),
  update: (id: string, data: Partial<ApiScan>) => patch<ApiScan>(`/api/scans/${id}`, data),
  approve: (id: string) => post<ApiScan>(`/api/scans/${id}/approve`),
  reject: (id: string) => post<ApiScan>(`/api/scans/${id}/reject`),
  delete: (id: string) => del<{ message: string }>(`/api/scans/${id}`),
};

// ─── Pickups ─────────────────────────────────────────────────────────────────

export const pickupsApi = {
  list: () => get<ApiPickup[]>("/api/pickups"),
  create: (data: Partial<ApiPickup>) => post<ApiPickup>("/api/pickups", data),
  updateStatus: (id: string, status: string) =>
    patch<ApiPickup>(`/api/pickups/${id}/status`, { status }),
  assignDriver: (id: string, driverName: string) =>
    post<ApiPickup>(`/api/pickups/${id}/assign-driver`, { driverName }),
  delete: (id: string) => del<{ message: string }>(`/api/pickups/${id}`),
};

// ─── Chats ───────────────────────────────────────────────────────────────────

export const chatsApi = {
  list: () => get<ApiChat[]>("/api/chats"),
  getConversation: (userId: string) => get<ApiChat>(`/api/chats/${userId}`),
  sendMessage: (
    chatUserId: string,
    text: string,
    attachment?: { url: string; name: string; isImage: boolean }
  ) =>
    post<ApiChat>(`/api/chats/${chatUserId}/messages`, {
      text,
      fileUrl: attachment?.url,
      fileName: attachment?.name,
      isImage: attachment?.isImage,
    }),
  resolve: (userId: string) => patch<ApiChat>(`/api/chats/${userId}/resolve`),
  clearUnread: (userId: string) =>
    patch<ApiChat>(`/api/chats/${userId}/clear-unread`),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => get<ApiNotification[]>("/api/notifications"),
  clearAll: () => patch<{ message: string }>("/api/notifications/clear"),
  markRead: (id: string) =>
    patch<ApiNotification>(`/api/notifications/${id}/read`),
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditLogsApi = {
  list: () => get<ApiAuditLog[]>("/api/audit-logs"),
};

// ─── Community ───────────────────────────────────────────────────────────────

export const communityApi = {
  // Posts
  listPosts: () => get<ApiPost[]>("/api/community/posts"),
  createPost: (data: {
    text: string;
    sector?: string;
    mediaUrl?: string;
    mediaType?: string;
    visibility?: string;
  }) => post<ApiPost>("/api/community/posts", data),
  deletePost: (id: string) => del<{ message: string }>(`/api/community/posts/${id}`),
  likePost: (id: string) => post<ApiPost>(`/api/community/posts/${id}/like`),
  reactToPost: (id: string, reactionType: "helpful" | "niceWork") =>
    post<ApiPost>(`/api/community/posts/${id}/react`, { reactionType }),
  addComment: (id: string, text: string) =>
    post<ApiPost>(`/api/community/posts/${id}/comment`, { text }),
  reportPost: (id: string) => post<ApiPost>(`/api/community/posts/${id}/report`),
  resolveReport: (id: string, approve: boolean) =>
    post<ApiPost | { message: string }>(`/api/community/posts/${id}/resolve-report`, { approve }),

  // Challenges
  listChallenges: () => get<ApiChallenge[]>("/api/community/challenges"),
  createChallenge: (data: Partial<ApiChallenge>) =>
    post<ApiChallenge>("/api/community/challenges", data),

  // Events
  listEvents: () => get<ApiEvent[]>("/api/community/events"),
  createEvent: (data: Partial<ApiEvent>) =>
    post<ApiEvent>("/api/community/events", data),
  joinEvent: (id: string) => post<ApiEvent>(`/api/community/events/${id}/join`),
  leaveEvent: (id: string) => post<ApiEvent>(`/api/community/events/${id}/leave`),
};

// ─── Marketplace ─────────────────────────────────────────────────────────────

export const marketplaceApi = {
  list: () => get<ApiListing[]>("/api/marketplace"),
  create: (data: Partial<ApiListing>) => post<ApiListing>("/api/marketplace", data),
  buy: (id: string) => post<ApiListing>(`/api/marketplace/${id}/buy`),
  delete: (id: string) => del<{ message: string }>(`/api/marketplace/${id}`),
};

// ─── API Types (matching backend models) ─────────────────────────────────────

export interface ApiUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  location: string;
  department?: string;
  address?: string;
  avatar?: string;
  preferredPickupAddresses: string[];
  kycStatus: "Not Started" | "Pending" | "Verified" | "Rejected";
  kycMessage?: string;
  points: number;
  requestCount: number;
  uploadCount: number;
  role: "User" | "Admin";
  memberSince: string;
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

export interface ApiScan {
  _id: string;
  userId: string;
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

export interface ApiPickup {
  _id: string;
  userId: string;
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

export interface ApiChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  isImage?: boolean;
}

export interface ApiChat {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "active" | "resolved";
  unreadCount: number;
  adminUnreadCount: number;
  lastMessageAt: string;
  messages: ApiChatMessage[];
}

export interface ApiNotification {
  _id: string;
  userId: string;
  type: "pickup" | "reward" | "system" | "message";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface ApiAuditLog {
  _id: string;
  date: string;
  time: string;
  adminName: string;
  action: string;
  affectedUser?: string;
  affectedOrg?: string;
  ipAddress: string;
  deviceInfo: string;
}

export interface ApiPost {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: "User" | "Admin";
  userBadges?: string[];
  timestamp: string;
  sector?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: string[];
  helpful: string[];
  niceWork: string[];
  comments: ApiComment[];
  reported: boolean;
  reportsCount: number;
  visibility: "Public" | "Friends" | "Institution Only" | "Private";
}

export interface ApiComment {
  _id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  text: string;
  timestamp: string;
}

export interface ApiChallenge {
  _id: string;
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

export interface ApiEvent {
  _id: string;
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

export interface ApiListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  points: number;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRole: "User" | "Admin";
  sector: string;
  quantity: number;
  imageUrl?: string;
  dateListed: string;
  status: "Available" | "Sold";
}
