// Mock auth + app store (persisted in localStorage)
import { useEffect, useState, useSyncExternalStore } from "react";

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
  
  // Institutional identification fields
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
  id: string; // Typically user ID
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
  likes: string[]; // userIds
  helpful: string[]; // userIds
  niceWork: string[]; // userIds
  comments: CommunityComment[];
  reported: boolean;
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
  volunteers: string[]; // userIds
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
  users: Array<User & { password: string }>;
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

const KEY = "eco-recovery-hub-state-v3";

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

function load(): State {
  if (typeof window === "undefined") return { user: null, users: [], scans: [], pickups: [], chats: [], notifications: [], auditLogs: [], posts: [], challenges: [], events: [], marketplace: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user ? { ...parsed.user, role: parsed.user.id === "admin-system" ? "Admin" : "User" } : null,
        users: (parsed.users || []).map((u: any) => ({ ...u, accountStatus: u.accountStatus || "Active", role: u.id === "admin-system" ? "Admin" : "User" })),
        scans: parsed.scans || [],
        pickups: parsed.pickups || [],
        chats: parsed.chats || [],
        notifications: parsed.notifications || [],
        auditLogs: parsed.auditLogs || [],
        posts: parsed.posts || [],
        challenges: parsed.challenges || [],
        events: parsed.events || [],
        marketplace: parsed.marketplace || [],
      };
    }
  } catch {}
  return getInitialState();
}

let state: State = load();
const listeners = new Set<() => void>();

function save() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  
  getSnapshot: () => state,

  signUp(input: Omit<User, "id" | "memberSince" | "preferredPickupAddresses" | "kycStatus" | "kycMessage" | "points" | "requestCount" | "uploadCount" | "role"> & { password: string }) {
    if (state.users.find((u) => u.email === input.email)) {
      throw new Error("An account with this email already exists.");
    }
    
    const user: User & { password: string } = {
      ...input,
      preferredPickupAddresses: [],
      kycStatus: "Not Started",
      kycMessage: undefined,
      points: 0,
      requestCount: 0,
      uploadCount: 0,
      role: "User",
      accountStatus: "Active",
      id: crypto.randomUUID(),
      memberSince: new Date().toISOString(),
    };
    
    state = { ...state, users: [...state.users, user], user };
    save();
  },

  signIn(email: string, password?: string) {
    const u = state.users.find(u => u.email === email && (!password || u.password === password));
    if (!u) throw new Error("Invalid email or password");
    // Ensure role sanitization applies even if in-memory state was stale
    const sanitizedUser = { ...u, role: (u.id === "admin-system" ? "Admin" : "User") as "Admin"|"User" };
    state = { ...state, user: sanitizedUser };
    save();
  },

  signOut() {
    state = { ...state, user: null };
    save();
  },

  updateProfile(patch: Partial<User>) {
    if (!state.user) return;
    const updated = { ...state.user, ...patch };
    state = {
      ...state,
      user: updated,
      users: state.users.map((u) => (u.id === updated.id ? { ...u, ...patch } : u)),
    };
    save();
  },

  submitKyc() {
    if (!state.user) return;
    const updated = {
      ...state.user,
      kycStatus: "Pending" as const,
      kycMessage: "KYC documents submitted and awaiting review.",
    };
    state = {
      ...state,
      user: updated,
      users: state.users.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    };
    save();
  },



  // Admin: KYC approval workflows
  approveKyc(userId: string) {
    const userToVerify = state.users.find((u) => u.id === userId);
    if (!userToVerify) return;

    state = {
      ...state,
      users: state.users.map((u) => (u.id === userId ? { ...u, kycStatus: "Verified", kycMessage: "Verified successfully!" } : u)),
      notifications: [
        {
          id: crypto.randomUUID(),
          userId,
          type: "system",
          title: "Profile Verified",
          body: "Your KYC document submission has been approved and verified.",
          time: "Just now",
          unread: true,
        },
        ...state.notifications,
      ],
      user: state.user && state.user.id === userId ? { ...state.user, kycStatus: "Verified", kycMessage: "Verified successfully!" } : state.user,
    };
    save();
  },

  rejectKyc(userId: string, feedback: string) {
    const userToVerify = state.users.find((u) => u.id === userId);
    if (!userToVerify) return;

    state = {
      ...state,
      users: state.users.map((u) => (u.id === userId ? { ...u, kycStatus: "Rejected", kycMessage: feedback } : u)),
      notifications: [
        {
          id: crypto.randomUUID(),
          userId,
          type: "system",
          title: "KYC Submission Rejected",
          body: `Rejection details: ${feedback}`,
          time: "Just now",
          unread: true,
        },
        ...state.notifications,
      ],
      user: state.user && state.user.id === userId ? { ...state.user, kycStatus: "Rejected", kycMessage: feedback } : state.user,
    };
    save();
  },

  // Scanned material submissions
  addScan(scan: Omit<ScannedMaterial, "id" | "userId" | "userEmail" | "userName" | "date" | "status">) {
    if (!state.user) return;
    const newScan: ScannedMaterial = {
      ...scan,
      id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: state.user.id,
      userEmail: state.user.email,
      userName: state.user.fullName,
      status: "Pending Approval",
      date: new Date().toISOString().split("T")[0],
    };

    state = {
      ...state,
      scans: [newScan, ...state.scans],
      user: {
        ...state.user,
        uploadCount: state.user.uploadCount + 1,
      },
      users: state.users.map((u) => (u.id === state.user!.id ? { ...u, uploadCount: u.uploadCount + 1 } : u)),
    };
    save();
  },

  approveScan(scanId: string) {
    const scan = state.scans.find((s) => s.id === scanId);
    if (!scan || scan.status !== "Pending Approval") return;

    state = {
      ...state,
      scans: state.scans.map((s) => (s.id === scanId ? { ...s, status: "Approved" } : s)),
      users: state.users.map((u) => {
        if (u.id === scan.userId) {
          return {
            ...u,
            points: u.points + scan.points,
          };
        }
        return u;
      }),
      notifications: [
        {
          id: crypto.randomUUID(),
          userId: scan.userId,
          type: "reward",
          title: `+${scan.points} Points Earned`,
          body: `Your scan of "${scan.item}" was approved by the admin.`,
          time: "Just now",
          unread: true,
        },
        ...state.notifications,
      ],
      user: state.user && state.user.id === scan.userId ? { ...state.user, points: state.user.points + scan.points } : state.user,
    };
    save();
  },

  rejectScan(scanId: string) {
    const scan = state.scans.find((s) => s.id === scanId);
    if (!scan || scan.status !== "Pending Approval") return;

    state = {
      ...state,
      scans: state.scans.map((s) => (s.id === scanId ? { ...s, status: "Rejected" } : s)),
      notifications: [
        {
          id: crypto.randomUUID(),
          userId: scan.userId,
          type: "system",
          title: "Scan Submission Rejected",
          body: `Your material submission "${scan.item}" was rejected because it did not match quality guidelines.`,
          time: "Just now",
          unread: true,
        },
        ...state.notifications,
      ],
    };
    save();
  },

  // Pickup Requests
  addPickupRequest(pickup: Omit<PickupRequest, "id" | "userId" | "userName" | "userEmail" | "date" | "status">) {
    if (!state.user) return;
    const newPickup: PickupRequest = {
      ...pickup,
      id: `pick-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: state.user.id,
      userName: state.user.fullName,
      userEmail: state.user.email,
      status: "Pending Review",
      date: new Date().toISOString().split("T")[0],
    };

    state = {
      ...state,
      pickups: [newPickup, ...state.pickups],
      user: {
        ...state.user,
        requestCount: state.user.requestCount + 1,
      },
      users: state.users.map((u) => (u.id === state.user!.id ? { ...u, requestCount: u.requestCount + 1 } : u)),
    };
    save();
  },

  updatePickupStatus(pickupId: string, nextStatus: PickupRequest["status"]) {
    const pickup = state.pickups.find((p) => p.id === pickupId);
    if (!pickup) return;

    let pointsAwarded = 0;
    if (nextStatus === "Completed" && pickup.status !== "Completed") {
      pointsAwarded = pickup.points;
    }

    state = {
      ...state,
      pickups: state.pickups.map((p) => (p.id === pickupId ? { ...p, status: nextStatus } : p)),
      users: state.users.map((u) => {
        if (u.id === pickup.userId && pointsAwarded > 0) {
          return { ...u, points: u.points + pointsAwarded };
        }
        return u;
      }),
      notifications: [
        {
          id: crypto.randomUUID(),
          userId: pickup.userId,
          type: "pickup",
          title: `Pickup Request: ${nextStatus}`,
          body: nextStatus === "Completed" 
            ? `Your pickup for "${pickup.item}" was completed. +${pointsAwarded} points awarded!`
            : `Your pickup for "${pickup.item}" status updated to "${nextStatus}".`,
          time: "Just now",
          unread: true,
        },
        ...state.notifications,
      ],
      user: state.user && state.user.id === pickup.userId && pointsAwarded > 0 
        ? { ...state.user, points: state.user.points + pointsAwarded }
        : state.user,
    };
    save();
  },

  // Chat / Messages
  sendMessage(chatUserId: string, text: string, attachment?: { url: string; name: string; isImage: boolean }) {
    if (!state.user) return;
    const isSenderAdmin = state.user.role === "Admin";
    const senderId = state.user.id;
    const senderName = state.user.fullName;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      fileUrl: attachment?.url,
      fileName: attachment?.name,
      isImage: attachment?.isImage,
    };

    let chat = state.chats.find((c) => c.userId === chatUserId);
    if (!chat) {
      // Find the user details to create a new chat
      const chattingUser = state.users.find((u) => u.id === chatUserId);
      chat = {
        id: chatUserId,
        userId: chatUserId,
        userName: chattingUser?.fullName || "Anonymous User",
        userEmail: chattingUser?.email || "",
        status: "active",
        unreadCount: 0,
        adminUnreadCount: 0,
        lastMessageAt: new Date().toISOString(),
        messages: [],
      };
    }

    const updatedChat: ChatConversation = {
      ...chat,
      status: "active",
      lastMessageAt: new Date().toISOString(),
      messages: [...chat.messages, newMessage],
      unreadCount: isSenderAdmin ? chat.unreadCount + 1 : 0,
      adminUnreadCount: isSenderAdmin ? 0 : chat.adminUnreadCount + 1,
    };

    state = {
      ...state,
      chats: [updatedChat, ...state.chats.filter((c) => c.userId !== chatUserId)],
    };
    save();

    // Simulation trigger: if a normal user messages and admin is not actively replying,
    // trigger a quick bot reply to demonstrate the "working prototype" nature of the chat.
    if (!isSenderAdmin) {
      setTimeout(() => {
        // Fetch fresh state inside the timeout to ensure we don't clobber updates
        const freshState = load();
        const currentChat = freshState.chats.find((c) => c.userId === chatUserId);
        if (currentChat && currentChat.messages[currentChat.messages.length - 1].senderId !== "admin-system") {
          const autoReplies = [
            "Thank you for contacting Eco-Recovery-Hub Support. An administrator has been notified of your message and will review your inquiry shortly.",
            "Understood! We are currently checking our collection logs. Let us know if you need to add any detail about the location or materials.",
            "Hello! Your message has been routed to our logistics queue. We will get back to you soon regarding your request."
          ];
          const botReplyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          const botMessage: ChatMessage = {
            id: `msg-bot-${Date.now()}`,
            senderId: "admin-system",
            senderName: "Support Bot (Eco-Recovery-Hub)",
            text: botReplyText,
            timestamp: new Date().toISOString(),
          };
          
          state = {
            ...state,
            chats: state.chats.map((c) => 
              c.userId === chatUserId 
                ? { ...c, messages: [...c.messages, botMessage], unreadCount: c.unreadCount + 1, lastMessageAt: new Date().toISOString() } 
                : c
            ),
          };
          save();
        }
      }, 3000);
    }
  },

  markChatResolved(chatUserId: string) {
    state = {
      ...state,
      chats: state.chats.map((c) => (c.userId === chatUserId ? { ...c, status: "resolved" as const } : c)),
    };
    save();
  },

  clearUnreadCount(chatUserId: string, isAdmin: boolean) {
    state = {
      ...state,
      chats: state.chats.map((c) => 
        c.userId === chatUserId 
          ? {
              ...c,
              unreadCount: isAdmin ? c.unreadCount : 0,
              adminUnreadCount: isAdmin ? 0 : c.adminUnreadCount
            }
          : c
      ),
    };
    save();
  },

  clearNotifications(userId: string) {
    state = {
      ...state,
      notifications: state.notifications.map((n) => (n.userId === userId ? { ...n, unread: false } : n)),
    };
    save();
  },

  // Administrative Operations
  suspendUser(userId: string) {
    state = {
      ...state,
      users: state.users.map((u) => (u.id === userId ? { ...u, accountStatus: "Suspended" as const } : u)),
    };
    const targetUser = state.users.find((u) => u.id === userId);
    this.addAuditLog(`Suspended user account`, targetUser?.fullName, targetUser?.orgName);
    save();
  },

  reactivateUser(userId: string) {
    state = {
      ...state,
      users: state.users.map((u) => (u.id === userId ? { ...u, accountStatus: "Active" as const } : u)),
    };
    const targetUser = state.users.find((u) => u.id === userId);
    this.addAuditLog(`Reactivated user account`, targetUser?.fullName, targetUser?.orgName);
    save();
  },

  deleteUser(userId: string) {
    const targetUser = state.users.find((u) => u.id === userId);
    state = {
      ...state,
      users: state.users.filter((u) => u.id !== userId),
      user: state.user && state.user.id === userId ? null : state.user,
    };
    this.addAuditLog(`Deleted user account`, targetUser?.fullName, targetUser?.orgName);
    save();
  },

  verifyUser(userId: string) {
    this.approveKyc(userId);
    const targetUser = state.users.find((u) => u.id === userId);
    this.addAuditLog(`Manually verified user`, targetUser?.fullName, targetUser?.orgName);
  },

  adjustUserPoints(userId: string, pointsChange: number, reason: string) {
    state = {
      ...state,
      users: state.users.map((u) => (u.id === userId ? { ...u, points: Math.max(0, u.points + pointsChange) } : u)),
      user: state.user && state.user.id === userId ? { ...state.user, points: Math.max(0, state.user.points + pointsChange) } : state.user,
      notifications: [
        {
          id: crypto.randomUUID(),
          userId,
          type: "reward",
          title: pointsChange >= 0 ? `Points Added: +${pointsChange}` : `Points Deducted: ${pointsChange}`,
          body: `Reason: ${reason}`,
          time: "Just now",
          unread: true,
        },
        ...state.notifications,
      ],
    };
    const targetUser = state.users.find((u) => u.id === userId);
    this.addAuditLog(`Adjusted points by ${pointsChange} (${reason})`, targetUser?.fullName, targetUser?.orgName);
    save();
  },

  deleteScan(scanId: string) {
    const targetScan = state.scans.find((s) => s.id === scanId);
    state = {
      ...state,
      scans: state.scans.filter((s) => s.id !== scanId),
    };
    if (targetScan) {
      this.addAuditLog(`Deleted material upload`, targetScan.userName);
    }
    save();
  },

  editScan(scanId: string, patch: Partial<ScannedMaterial>) {
    const targetScan = state.scans.find((s) => s.id === scanId);
    state = {
      ...state,
      scans: state.scans.map((s) => (s.id === scanId ? { ...s, ...patch } : s)),
    };
    if (targetScan) {
      this.addAuditLog(`Edited material scan data`, targetScan.userName);
    }
    save();
  },

  assignPickupDriver(pickupId: string, driverName: string) {
    state = {
      ...state,
      pickups: state.pickups.map((p) => (p.id === pickupId ? { ...p, preferredCenter: driverName, status: "Pickup Scheduled" as const } : p)),
    };
    const targetPickup = state.pickups.find((p) => p.id === pickupId);
    this.addAuditLog(`Assigned collector (${driverName}) to pickup`, targetPickup?.userName);
    save();
  },

  broadcastAnnouncement(title: string, body: string, recipientType: "all" | "institutions") {
    const targets = state.users.filter((u) => {
      if (recipientType === "institutions") return u.accountType === "Institutional";
      return u.role === "User";
    });

    const newNotifs = targets.map((u) => ({
      id: crypto.randomUUID(),
      userId: u.id,
      type: "system" as const,
      title,
      body,
      time: "Just now",
      unread: true,
    }));

    state = {
      ...state,
      notifications: [...newNotifs, ...state.notifications],
    };
    this.addAuditLog(`Broadcasted Announcement: ${title} (${recipientType})`);
    save();
  },

  addAuditLog(action: string, affectedUser?: string, affectedOrg?: string) {
    const now = new Date();
    const newLog: AuditLog = {
      id: `audit-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0],
      adminName: state.user?.fullName || "System Administrator",
      action,
      affectedUser,
      affectedOrg,
      ipAddress: "192.168.1.15",
      deviceInfo: "Chrome 126 / Windows 11",
    };
    state = {
      ...state,
      auditLogs: [newLog, ...state.auditLogs],
    };
  },

  createPost(text: string, sector?: string, mediaUrl?: string, mediaType?: "image" | "video", visibility: CommunityPost["visibility"] = "Public") {
    if (!state.user) return;
    const isInst = state.user.accountType === "Institutional";
    const badges = isInst 
      ? ["🏢 Institutional Partner", "🏆 Sustainability Ambassador"]
      : ["🌱 Green Starter"];

    const newPost: CommunityPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: state.user.id,
      userName: state.user.fullName,
      userAvatar: state.user.avatar,
      userRole: state.user.role,
      userBadges: badges,
      timestamp: new Date().toISOString(),
      sector,
      text,
      mediaUrl,
      mediaType,
      likes: [],
      helpful: [],
      niceWork: [],
      comments: [],
      reported: false,
      reportsCount: 0,
      visibility
    };

    // Add points for posting
    const updatedUser = { ...state.user, points: state.user.points + 10 };

    state = {
      ...state,
      posts: [newPost, ...state.posts],
      user: updatedUser,
      users: state.users.map((u) => (u.id === updatedUser.id ? { ...u, points: updatedUser.points } : u))
    };
    this.addAuditLog("Created community post");
    save();
  },

  likePost(postId: string) {
    if (!state.user) return;
    const userId = state.user.id;
    state = {
      ...state,
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likes.includes(userId);
        return {
          ...p,
          likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId]
        };
      })
    };
    save();
  },

  reactToPost(postId: string, reactionType: "helpful" | "niceWork") {
    if (!state.user) return;
    const userId = state.user.id;
    state = {
      ...state,
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const arr = reactionType === "helpful" ? p.helpful : p.niceWork;
        const active = arr.includes(userId);
        const updated = active ? arr.filter((id) => id !== userId) : [...arr, userId];
        return {
          ...p,
          [reactionType]: updated
        };
      })
    };
    save();
  },

  addComment(postId: string, text: string) {
    if (!state.user) return;
    const newComment: CommunityComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      postId,
      userId: state.user.id,
      userName: state.user.fullName,
      userAvatar: state.user.avatar,
      userRole: state.user.role,
      text,
      timestamp: new Date().toISOString()
    };

    state = {
      ...state,
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      })
    };
    save();
  },

  reportPost(postId: string) {
    state = {
      ...state,
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reported: true,
          reportsCount: p.reportsCount + 1
        };
      })
    };
    save();
  },

  resolvePostReport(postId: string, dismiss: boolean) {
    if (dismiss) {
      state = {
        ...state,
        posts: state.posts.map((p) => (p.id === postId ? { ...p, reported: false, reportsCount: 0 } : p))
      };
    } else {
      state = {
        ...state,
        posts: state.posts.filter((p) => p.id !== postId)
      };
    }
    save();
  },

  joinEvent(eventId: string) {
    if (!state.user) return;
    const userId = state.user.id;
    state = {
      ...state,
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        if (e.volunteers.includes(userId)) return e;
        return {
          ...e,
          volunteers: [...e.volunteers, userId]
        };
      })
    };
    save();
  },

  leaveEvent(eventId: string) {
    if (!state.user) return;
    const userId = state.user.id;
    state = {
      ...state,
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          volunteers: e.volunteers.filter((id) => id !== userId)
        };
      })
    };
    save();
  },

  createMarketplaceListing(title: string, description: string, price: number, points: number, sector: string, quantity: number, imageUrl?: string) {
    if (!state.user) return;
    const newListing: MarketplaceListing = {
      id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      price,
      points,
      sellerId: state.user.id,
      sellerName: state.user.fullName,
      sellerAvatar: state.user.avatar,
      sellerRole: state.user.role,
      sector,
      quantity,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      dateListed: new Date().toISOString().split("T")[0],
      status: "Available"
    };

    state = {
      ...state,
      marketplace: [newListing, ...state.marketplace]
    };
    this.addAuditLog(`Listed marketplace material: ${title}`);
    save();
  },

  buyMarketplaceItem(listingId: string) {
    if (!state.user) return;
    const buyer = state.user;
    const item = state.marketplace.find((l) => l.id === listingId);
    if (!item || item.status === "Sold") return;

    if (buyer.points < item.points) {
      throw new Error(`Insufficient eco points. You need ${item.points} pts but have ${buyer.points} pts.`);
    }

    // Deduct points from buyer
    const updatedBuyer = { ...buyer, points: buyer.points - item.points };

    state = {
      ...state,
      marketplace: state.marketplace.map((l) => (l.id === listingId ? { ...l, status: "Sold" as const } : l)),
      user: updatedBuyer,
      users: state.users.map((u) => {
        if (u.id === updatedBuyer.id) return { ...u, points: updatedBuyer.points };
        // Credit the seller points if they are in the user pool
        if (u.id === item.sellerId) return { ...u, points: u.points + item.points };
        return u;
      })
    };

    this.addAuditLog(`Claimed marketplace item: ${item.title}`);
    save();
  },

  adminResolveReport(postId: string, approve: boolean) {
    if (approve) {
      // Keep post, dismiss report
      state = {
        ...state,
        posts: state.posts.map((p) => (p.id === postId ? { ...p, reported: false, reportsCount: 0 } : p))
      };
      this.addAuditLog(`Dismissed community post reports for post ${postId}`);
    } else {
      // Reject and delete post
      state = {
        ...state,
        posts: state.posts.filter((p) => p.id !== postId)
      };
      this.addAuditLog(`Moderator deleted reported post ${postId}`);
    }
    save();
  },

  adminDeletePost(postId: string) {
    state = {
      ...state,
      posts: state.posts.filter((p) => p.id !== postId)
    };
    this.addAuditLog(`Deleted community post ${postId}`);
    save();
  },

  adminCreateChallenge(title: string, description: string, points: number, co2: number, targetQuantity: number, sector: string, daysRemaining: number) {
    const newChallenge: CommunityChallenge = {
      id: `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      points,
      co2,
      daysRemaining,
      targetQuantity,
      progress: 0,
      completed: false,
      sector
    };
    state = {
      ...state,
      challenges: [newChallenge, ...state.challenges]
    };
    this.addAuditLog(`Created challenge: ${title}`);
    save();
  },

  adminCreateEvent(title: string, description: string, date: string, time: string, location: string, host: string, imageUrl?: string) {
    const newEvent: CommunityEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      date,
      time,
      location,
      host,
      volunteers: [],
      maxVolunteers: 100,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80"
    };
    state = {
      ...state,
      events: [newEvent, ...state.events]
    };
    this.addAuditLog(`Created event: ${title}`);
    save();
  },
};

/**
 * useUser — reads from the API-authenticated user in localStorage first.
 * Falls back to the in-memory mock store during migration.
 */
export function useUser(): (User & { id: string }) | null {
  const [apiUser, setApiUser] = useState<(User & { id: string }) | null>(() => {
    try {
      const raw = localStorage.getItem("eco-recovery-hub-user");
      if (raw) {
        const parsed = JSON.parse(raw);
        // MongoDB uses _id; normalise to id
        return { ...parsed, id: parsed._id || parsed.id };
      }
    } catch {}
    return null;
  });

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

  // Prefer API user; fall back to mock store user
  const storeUser = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot).user;
  return apiUser ?? storeUser;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

/**
 * signOut — clears both the JWT token and the in-memory store.
 * Call this from any logout button.
 */
export function signOut() {
  localStorage.removeItem("eco-recovery-hub-token");
  localStorage.removeItem("eco-recovery-hub-user");
  store.signOut();
}
