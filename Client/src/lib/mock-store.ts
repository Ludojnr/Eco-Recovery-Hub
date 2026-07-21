// React-compatible state store bridged to Express.js backend API
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getToken,
  setToken,
  clearToken,
  authApi,
  usersApi,
  scansApi,
  pickupsApi,
  chatsApi,
  notificationsApi,
  auditLogsApi,
  communityApi,
  marketplaceApi,
  ApiUser,
  ApiScan,
  ApiPickup,
  ApiNotification,
  ApiAuditLog,
  ApiPost,
  ApiChallenge,
  ApiEvent,
  ApiListing,
  ApiChat,
  ApiComment,
} from "./api";

// ─── Type definitions (fully compatible with existing route files) ──────────

export type KycStatus = "Not Started" | "Pending" | "Verified" | "Rejected";

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  location: string;
  department?: string;
  address?: string;
  avatar?: string;
  preferredPickupAddresses: string[];
  kycStatus: KycStatus;
  kycMessage?: string;
  points: number;
  requestCount: number;
  uploadCount: number;
  role: "User" | "Admin";
  memberSince: string;
  accountStatus?: "Active" | "Suspended";
  accountType: "Individual" | "Institutional";
  orgName?: string;
  orgType?: string;
  orgLocation?: string;
  orgLogo?: string;
  contactPerson?: string;
  orgEmail?: string;
  orgPhone?: string;
};

export type AuditLog = {
  id: string;
  date: string;
  time: string;
  adminName: string;
  action: string;
  affectedUser?: string;
  affectedOrg?: string;
  ipAddress: string;
  deviceInfo: string;
};

export type ScannedMaterial = {
  id: string;
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
};

export type PickupRequest = {
  id: string;
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
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  isImage?: boolean;
  isQuickReply?: boolean;
};

export type ChatConversation = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "active" | "resolved";
  unreadCount: number;
  adminUnreadCount: number;
  lastMessageAt: string;
  messages: ChatMessage[];
};

export type AppNotification = {
  id: string;
  userId: string;
  type: "pickup" | "reward" | "system" | "message";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type CommunityComment = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  text: string;
  timestamp: string;
};

export type CommunityPost = {
  id: string;
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
  comments: CommunityComment[];
  reported: boolean;
  reportedCount?: number; // compat
  reportsCount: number;
  visibility: "Public" | "Friends" | "Institution Only" | "Private";
};

export type CommunityChallenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  co2: number;
  daysRemaining: number;
  targetQuantity: number;
  progress: number;
  completed: boolean;
  sector: string;
};

export type CommunityEvent = {
  id: string;
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
};

export type MarketplaceListing = {
  id: string;
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
};

type State = {
  user: User | null;
  users: User[];
  scans: ScannedMaterial[];
  pickups: PickupRequest[];
  chats: ChatConversation[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  posts: CommunityPost[];
  challenges: CommunityChallenge[];
  events: CommunityEvent[];
  marketplace: MarketplaceListing[];
};

// ─── Data conversion / mapping helpers ──────────────────────────────────────

function convertUser(u: ApiUser): User {
  return {
    ...u,
    id: u._id || (u as any).id,
    preferredPickupAddresses: u.preferredPickupAddresses || [],
    memberSince: u.memberSince ? new Date(u.memberSince).toISOString() : new Date().toISOString(),
  };
}

function convertScan(s: ApiScan): ScannedMaterial {
  return {
    ...s,
    id: s._id || (s as any).id,
  };
}

function convertPickup(p: ApiPickup): PickupRequest {
  return {
    ...p,
    id: p._id || (p as any).id,
  };
}

function convertNotification(n: ApiNotification): AppNotification {
  return {
    ...n,
    id: n._id || (n as any).id,
  };
}

function convertAuditLog(l: ApiAuditLog): AuditLog {
  return {
    ...l,
    id: l._id || (l as any).id,
  };
}

function convertComment(c: ApiComment): CommunityComment {
  return {
    ...c,
    id: c._id || (c as any).id,
    timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : new Date().toISOString(),
  };
}

function convertPost(p: ApiPost): CommunityPost {
  return {
    ...p,
    id: p._id || (p as any).id,
    timestamp: p.timestamp ? new Date(p.timestamp).toISOString() : new Date().toISOString(),
    comments: (p.comments || []).map(convertComment),
  };
}

function convertChallenge(c: ApiChallenge): CommunityChallenge {
  return {
    ...c,
    id: c._id || (c as any).id,
  };
}

function convertEvent(e: ApiEvent): CommunityEvent {
  return {
    ...e,
    id: e._id || (e as any).id,
  };
}

function convertListing(l: ApiListing): MarketplaceListing {
  return {
    ...l,
    id: l._id || (l as any).id,
  };
}

function convertChat(c: ApiChat): ChatConversation {
  return {
    ...c,
    id: c._id || (c as any).id,
    messages: (c.messages || []).map((m: any) => ({
      ...m,
      id: m._id || m.id,
      timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
    })),
  };
}

// ─── Reactive Client Store ──────────────────────────────────────────────────

function getInitialState(): State {
  return {
    user: null,
    users: [],
    scans: [],
    pickups: [],
    chats: [],
    notifications: [],
    auditLogs: [],
    posts: [],
    challenges: [],
    events: [],
    marketplace: [],
  };
}

let state: State = getInitialState();
const listeners = new Set<() => void>();

function save() {
  listeners.forEach((l) => l());
}

let isSyncing = false;

export async function syncWithApi() {
  if (isSyncing) return;
  const token = getToken();
  if (!token) {
    state = getInitialState();
    save();
    return;
  }

  isSyncing = true;
  try {
    const currentUser = await authApi.me();
    
    // Fetch collections concurrently
    const [
      scans,
      pickups,
      posts,
      challenges,
      events,
      marketplace,
      notifications,
      leaderboardUsers,
    ] = await Promise.all([
      scansApi.list().catch(() => []),
      pickupsApi.list().catch(() => []),
      communityApi.listPosts().catch(() => []),
      communityApi.listChallenges().catch(() => []),
      communityApi.listEvents().catch(() => []),
      marketplaceApi.list().catch(() => []),
      notificationsApi.list().catch(() => []),
      usersApi.leaderboard().catch(() => []),
    ]);

    let allUsers: ApiUser[] = leaderboardUsers;
    let auditLogs: ApiAuditLog[] = [];
    let chats: ApiChat[] = [];

    const isAdmin = currentUser.role === "Admin";
    if (isAdmin) {
      const [fullUsers, fetchedAuditLogs, fetchedChats] = await Promise.all([
        usersApi.list().catch(() => []),
        auditLogsApi.list().catch(() => []),
        chatsApi.list().catch(() => []),
      ]);
      allUsers = fullUsers;
      auditLogs = fetchedAuditLogs;
      chats = fetchedChats;
    } else {
      const chat = await chatsApi.getConversation(currentUser._id).catch(() => null);
      chats = chat ? [chat] : [];
    }

    state = {
      user: convertUser(currentUser),
      users: allUsers.map(convertUser),
      scans: scans.map(convertScan),
      pickups: pickups.map(convertPickup),
      chats: chats.map(convertChat),
      notifications: notifications.map(convertNotification),
      auditLogs: auditLogs.map(convertAuditLog),
      posts: posts.map(convertPost),
      challenges: challenges.map(convertChallenge),
      events: events.map(convertEvent),
      marketplace: marketplace.map(convertListing),
    };
    save();
  } catch (err) {
    console.error("API sync error:", err);
  } finally {
    isSyncing = false;
  }
}

// Automatically sync when the file loads
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncWithApi();
  }, 100);

  // Auto-refresh every 30 seconds so all open devices/tabs stay up to date
  setInterval(() => {
    if (getToken()) {
      syncWithApi();
    }
  }, 30_000);

  // Also re-sync when the tab becomes visible again (user switches back)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && getToken()) {
      syncWithApi();
    }
  });
}


// ─── Store Actions ──────────────────────────────────────────────────────────

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  getSnapshot: () => state,

  async signUp(input: any) {
    const { token, user } = await authApi.signup(input);
    setToken(token);
    localStorage.setItem("eco-recovery-hub-user", JSON.stringify(user));
    await syncWithApi();
  },

  async signIn(email: string, password?: string) {
    if (!password) {
      await syncWithApi();
      return;
    }
    const { token, user } = await authApi.login(email, password);
    setToken(token);
    localStorage.setItem("eco-recovery-hub-user", JSON.stringify(user));
    await syncWithApi();
  },

  async signOut() {
    clearToken();
    state = getInitialState();
    save();
  },

  async updateProfile(patch: Partial<User>) {
    await authApi.updateProfile(patch);
    await syncWithApi();
  },

  async submitKyc() {
    await authApi.submitKyc();
    await syncWithApi();
  },

  async approveKyc(userId: string) {
    await usersApi.approveKyc(userId);
    await syncWithApi();
  },

  async rejectKyc(userId: string, feedback: string) {
    await usersApi.rejectKyc(userId, feedback);
    await syncWithApi();
  },

  async addScan(scan: any) {
    await scansApi.create(scan);
    await syncWithApi();
  },

  async approveScan(scanId: string) {
    await scansApi.approve(scanId);
    await syncWithApi();
  },

  async rejectScan(scanId: string) {
    await scansApi.reject(scanId);
    await syncWithApi();
  },

  async addPickupRequest(pickup: any) {
    await pickupsApi.create(pickup);
    await syncWithApi();
  },

  async updatePickupStatus(pickupId: string, nextStatus: any) {
    await pickupsApi.updateStatus(pickupId, nextStatus);
    await syncWithApi();
  },

  async sendMessage(chatUserId: string, text: string, attachment?: any) {
    await chatsApi.sendMessage(chatUserId, text, attachment);
    await syncWithApi();
  },

  async markChatResolved(chatUserId: string) {
    await chatsApi.resolve(chatUserId);
    await syncWithApi();
  },

  async clearUnreadCount(chatUserId: string, _isAdmin: boolean) {
    await chatsApi.clearUnread(chatUserId);
    await syncWithApi();
  },

  async clearNotifications(_userId: string) {
    await notificationsApi.clearAll();
    await syncWithApi();
  },

  async suspendUser(userId: string) {
    await usersApi.suspend(userId);
    await syncWithApi();
  },

  async reactivateUser(userId: string) {
    await usersApi.reactivate(userId);
    await syncWithApi();
  },

  async deleteUser(userId: string) {
    await usersApi.delete(userId);
    await syncWithApi();
  },

  async verifyUser(userId: string) {
    await usersApi.approveKyc(userId);
    await syncWithApi();
  },

  async adjustUserPoints(userId: string, pointsChange: number, reason: string) {
    await usersApi.adjustPoints(userId, pointsChange, reason);
    await syncWithApi();
  },

  async deleteScan(scanId: string) {
    await scansApi.delete(scanId);
    await syncWithApi();
  },

  async editScan(scanId: string, patch: any) {
    await scansApi.update(scanId, patch);
    await syncWithApi();
  },

  async assignPickupDriver(pickupId: string, driverName: string) {
    await pickupsApi.assignDriver(pickupId, driverName);
    await syncWithApi();
  },

  async broadcastAnnouncement(title: string, body: string, recipientType: any) {
    await usersApi.broadcast(title, body, recipientType);
    await syncWithApi();
  },

  async addAuditLog(_action: string, _affectedUser?: string, _affectedOrg?: string) {
    await syncWithApi();
  },

  async createPost(text: string, sector?: string, mediaUrl?: string, mediaType?: any, visibility?: any) {
    await communityApi.createPost({ text, sector, mediaUrl, mediaType, visibility });
    await syncWithApi();
  },

  async likePost(postId: string) {
    await communityApi.likePost(postId);
    await syncWithApi();
  },

  async reactToPost(postId: string, reactionType: any) {
    await communityApi.reactToPost(postId, reactionType);
    await syncWithApi();
  },

  async addComment(postId: string, text: string) {
    await communityApi.addComment(postId, text);
    await syncWithApi();
  },

  async reportPost(postId: string) {
    await communityApi.reportPost(postId);
    await syncWithApi();
  },

  async resolvePostReport(postId: string, dismiss: boolean) {
    await communityApi.resolveReport(postId, dismiss);
    await syncWithApi();
  },

  async joinEvent(eventId: string) {
    await communityApi.joinEvent(eventId);
    await syncWithApi();
  },

  async leaveEvent(eventId: string) {
    await communityApi.leaveEvent(eventId);
    await syncWithApi();
  },

  async createMarketplaceListing(title: string, description: string, price: number, points: number, sector: string, quantity: number, imageUrl?: string) {
    await marketplaceApi.create({ title, description, price, points, sector, quantity, imageUrl });
    await syncWithApi();
  },

  async buyMarketplaceItem(listingId: string) {
    await marketplaceApi.buy(listingId);
    await syncWithApi();
  },

  async adminResolveReport(postId: string, approve: boolean) {
    await communityApi.resolveReport(postId, approve);
    await syncWithApi();
  },

  async adminDeletePost(postId: string) {
    await communityApi.deletePost(postId);
    await syncWithApi();
  },

  async adminCreateChallenge(title: string, description: string, points: number, co2: number, targetQuantity: number, sector: string, daysRemaining: number) {
    await communityApi.createChallenge({ title, description, points, co2, targetQuantity, sector, daysRemaining });
    await syncWithApi();
  },

  async adminCreateEvent(title: string, description: string, date: string, time: string, location: string, host: string, imageUrl?: string) {
    await communityApi.createEvent({ title, description, date, time, location, host, imageUrl });
    await syncWithApi();
  },
};

// ─── Custom React Hooks ─────────────────────────────────────────────────────

export function useUser(): (User & { id: string }) | null {
  const [apiUser, setApiUser] = useState<(User & { id: string }) | null>(() => {
    try {
      const raw = localStorage.getItem("eco-recovery-hub-user");
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...parsed, id: parsed._id || parsed.id };
      }
    } catch {}
    return null;
  });

  const storeUser = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot).user;

  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem("eco-recovery-hub-user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setApiUser({ ...parsed, id: parsed._id || parsed.id });
        } else {
          setApiUser(null);
        }
      } catch {
        setApiUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (getToken() && !storeUser) {
      syncWithApi();
    }
  }, [storeUser]);

  return apiUser ?? storeUser;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function signOut() {
  clearToken();
  localStorage.removeItem("eco-recovery-hub-user");
  state = getInitialState();
  save();
}
