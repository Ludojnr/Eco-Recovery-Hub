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

type State = {
  user: User | null;
  users: Array<User & { password: string }>;
  scans: ScannedMaterial[];
  pickups: PickupRequest[];
  chats: ChatConversation[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
};

const KEY = "eco-recovery-hub-state-v2";

function getInitialState(): State {
  const admin: User & { password: string } = {
    id: "admin-system",
    fullName: "System Administrator",
    email: "admin@ecorecovery.org",
    phone: "+233 20 111 2222",
    institution: "Eco-Recovery-Hub HQ",
    location: "Accra",
    preferredPickupAddresses: [],
    kycStatus: "Verified",
    points: 15000,
    requestCount: 0,
    uploadCount: 0,
    role: "Admin",
    accountType: "Individual",
    memberSince: new Date("2026-01-01").toISOString(),
    password: "admin123",
    accountStatus: "Active",
  };

  const sampleUser: User & { password: string } = {
    id: "user-kwame",
    fullName: "Kwame Opoku",
    email: "kwame@gmail.com",
    phone: "+233 24 123 4567",
    institution: "University of Ghana",
    location: "Accra",
    preferredPickupAddresses: ["15 Kwame Nkrumah Ave, Kumasi"],
    kycStatus: "Verified",
    points: 1380,
    requestCount: 2,
    uploadCount: 5,
    role: "User",
    orgName: "Koforidua Technical University",
    orgType: "University",
    orgLocation: "Koforidua",
    contactPerson: "Prof. John Doe",
    orgEmail: "sustainability@ktu.edu.gh",
    orgPhone: "+233 24 987 6543",
    memberSince: new Date("2026-04-10").toISOString(),
    password: "password123",
    accountStatus: "Active",
  };

  const sampleInst: User & { password: string } = {
    id: "user-ktu",
    fullName: "Prof. John Doe",
    email: "sustainability@ktu.edu.gh",
    phone: "+233 24 987 6543",
    institution: "Koforidua Technical University",
    location: "Koforidua",
    preferredPickupAddresses: ["Koforidua Technical University Main Campus"],
    kycStatus: "Pending",
    points: 3450,
    requestCount: 4,
    uploadCount: 12,
    role: "User",
    accountType: "Institutional",
    orgName: "Koforidua Technical University",
    orgType: "University",
    orgLocation: "Koforidua",
    contactPerson: "Prof. John Doe",
    orgEmail: "sustainability@ktu.edu.gh",
    orgPhone: "+233 24 987 6543",
    memberSince: new Date("2026-04-10").toISOString(),
    password: "password123",
    accountStatus: "Active",
  };

  const initialScans: ScannedMaterial[] = [
    {
      id: "scan-1",
      userId: "user-kwame",
      userName: "Kwame Opoku",
      userEmail: "kwame@gmail.com",
      item: "Smartphone — Samsung Galaxy A12",
      sector: "e-waste",
      category: "Mobile Device",
      confidence: 0.94,
      points: 260,
      co2: 8.4,
      description: "A modern smartphone with lithium battery and recoverable rare-earth components.",
      handling: "Wipe data → drop-off at a certified e-waste center. Do not bin — battery hazard.",
      status: "Approved",
      date: "2026-06-15",
    },
    {
      id: "scan-2",
      userId: "user-kwame",
      userName: "Kwame Opoku",
      userEmail: "kwame@gmail.com",
      item: "PET water bottle",
      sector: "plastic",
      category: "PET #1",
      confidence: 0.96,
      points: 15,
      co2: 0.3,
      description: "Transparent food-grade polymer, one of the most widely recycled plastics.",
      handling: "Rinse, remove cap and label if required, place in plastics bin.",
      status: "Approved",
      date: "2026-06-16",
    },
    {
      id: "scan-3",
      userId: "user-ktu",
      userName: "Prof. John Doe",
      userEmail: "sustainability@ktu.edu.gh",
      item: "Cotton T-shirt (worn)",
      sector: "textile",
      category: "Textile",
      confidence: 0.88,
      points: 40,
      co2: 3.1,
      description: "Natural-fibre garment eligible for reuse, resale or fibre recovery.",
      handling: "Donate if wearable; otherwise textile recycling bin.",
      status: "Pending Approval",
      date: "2026-07-10",
    },
    {
      id: "scan-4",
      userId: "user-ktu",
      userName: "Prof. John Doe",
      userEmail: "sustainability@ktu.edu.gh",
      item: "HP Printer",
      sector: "e-waste",
      category: "Printer",
      confidence: 0.91,
      points: 180,
      co2: 6.2,
      description: "Office document printer with plastic casing and mechanical assemblies.",
      handling: "Drop off at center or schedule pickup.",
      status: "Pending Approval",
      date: "2026-07-11",
    }
  ];

  const initialPickups: PickupRequest[] = [
    {
      id: "pick-1",
      userId: "user-kwame",
      userName: "Kwame Opoku",
      userEmail: "kwame@gmail.com",
      item: "PET bottles bundle",
      quantity: 24,
      preferredDate: "2026-06-25",
      preferredCenter: "RecoverGH Kumasi",
      address: "15 Kwame Nkrumah Ave, Kumasi",
      status: "Pickup Scheduled",
      points: 60,
      date: "2026-06-18",
    },
    {
      id: "pick-2",
      userId: "user-ktu",
      userName: "Prof. John Doe",
      userEmail: "sustainability@ktu.edu.gh",
      item: "Used Lenovo Laptop",
      quantity: 1,
      preferredDate: "2026-07-15",
      preferredCenter: "GreenHub Accra",
      address: "Koforidua Technical University Main Campus",
      status: "Pending Review",
      points: 150,
      date: "2026-07-11",
    }
  ];

  const initialChats: ChatConversation[] = [
    {
      id: "user-kwame",
      userId: "user-kwame",
      userName: "Kwame Opoku",
      userEmail: "kwame@gmail.com",
      status: "active",
      unreadCount: 0,
      adminUnreadCount: 1,
      lastMessageAt: new Date("2026-07-11T14:30:00Z").toISOString(),
      messages: [
        {
          id: "m1",
          senderId: "user-kwame",
          senderName: "Kwame Opoku",
          text: "Hi support, I have a quick question about my pickup request for the PET bottles.",
          timestamp: new Date("2026-07-11T14:28:00Z").toISOString(),
        },
        {
          id: "m2",
          senderId: "admin",
          senderName: "Admin Staff",
          text: "Hello Kwame! We see your request. A driver has been assigned and will contact you shortly.",
          timestamp: new Date("2026-07-11T14:29:00Z").toISOString(),
        },
        {
          id: "m3",
          senderId: "user-kwame",
          senderName: "Kwame Opoku",
          text: "Great, thanks! Should I keep the bottles in bags?",
          timestamp: new Date("2026-07-11T14:30:00Z").toISOString(),
        }
      ]
    },
    {
      id: "user-ktu",
      userId: "user-ktu",
      userName: "Prof. John Doe",
      userEmail: "sustainability@ktu.edu.gh",
      status: "active",
      unreadCount: 0,
      adminUnreadCount: 0,
      lastMessageAt: new Date("2026-07-11T09:00:00Z").toISOString(),
      messages: [
        {
          id: "m4",
          senderId: "user-ktu",
          senderName: "Prof. John Doe",
          text: "We registered as Koforidua Technical University. We would like to verify our KYC profile.",
          timestamp: new Date("2026-07-11T08:55:00Z").toISOString(),
        },
        {
          id: "m5",
          senderId: "admin",
          senderName: "Admin Staff",
          text: "Hello Prof! We have received your documents. An administrator will review your campus credentials today.",
          timestamp: new Date("2026-07-11T09:00:00Z").toISOString(),
        }
      ]
    }
  ];

  const initialNotifications: AppNotification[] = [
    {
      id: "notif-1",
      userId: "user-kwame",
      type: "pickup",
      title: "Pickup Scheduled",
      body: "Your PET bottle pickup is scheduled for June 25.",
      time: "2h ago",
      unread: true,
    },
    {
      id: "notif-2",
      userId: "user-kwame",
      type: "reward",
      title: "+260 points earned",
      body: "Your Samsung Galaxy A12 scan has been verified and approved.",
      time: "1d ago",
      unread: false,
    }
  ];

  const initialAuditLogs: AuditLog[] = [
    {
      id: "log-1",
      date: "2026-07-10",
      time: "09:30:15",
      adminName: "System Administrator",
      action: "Approved KYC Verification",
      affectedUser: "Kwame Opoku",
      ipAddress: "192.168.1.15",
      deviceInfo: "Chrome 126 / Windows 11",
    },
    {
      id: "log-2",
      date: "2026-07-11",
      time: "11:20:44",
      adminName: "System Administrator",
      action: "Adjusted Reward Points (+100)",
      affectedUser: "Prof. John Doe",
      affectedOrg: "Koforidua Technical University",
      ipAddress: "192.168.1.15",
      deviceInfo: "Edge 125 / macOS",
    },
    {
      id: "log-3",
      date: "2026-07-12",
      time: "01:05:00",
      adminName: "System Administrator",
      action: "Created Bonus Campaign (Plastic Double Points)",
      ipAddress: "192.168.1.15",
      deviceInfo: "Firefox 128 / Linux",
    }
  ];

  return {
    user: null,
    users: [admin, sampleUser, sampleInst],
    scans: initialScans,
    pickups: initialPickups,
    chats: initialChats,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
  };
}

function load(): State {
  if (typeof window === "undefined") return { user: null, users: [], scans: [], pickups: [], chats: [], notifications: [], auditLogs: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user || null,
        users: (parsed.users || []).map((u: any) => ({ accountStatus: "Active", ...u })),
        scans: parsed.scans || [],
        pickups: parsed.pickups || [],
        chats: parsed.chats || [],
        notifications: parsed.notifications || [],
        auditLogs: parsed.auditLogs || [],
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

  signIn(email: string, password: string) {
    const u = state.users.find((u) => u.email === email && u.password === password);
    if (!u) throw new Error("Invalid email or password.");
    const { password: _p, ...pub } = u;
    state = { ...state, user: pub };
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
      kycStatus: "Pending",
      kycMessage: "KYC documents submitted and awaiting review.",
    };
    state = {
      ...state,
      user: updated,
      users: state.users.map((u) => (u.id === updated.id ? updated : u)),
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

  rejectScan(scanId: string) {
    const targetScan = state.scans.find((s) => s.id === scanId);
    state = {
      ...state,
      scans: state.scans.map((s) => (s.id === scanId ? { ...s, status: "Rejected" as const } : s)),
    };
    if (targetScan) {
      this.addAuditLog(`Rejected material scan`, targetScan.userName);
    }
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
};

export function useUser() {
  const s = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return s.user;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
