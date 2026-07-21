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

  const initialPosts: CommunityPost[] = [
    {
      id: "post-1",
      userId: "user-kwame",
      userName: "Kwame Opoku",
      userAvatar: undefined,
      userRole: "User",
      userBadges: ["🌱 Green Starter", "♻ Community Recycler"],
      timestamp: new Date("2026-07-13T10:00:00Z").toISOString(),
      sector: "plastic",
      text: "Just dropped off 15 PET water bottles at the Accra collection point today! Super easy process, and I earned 150 points. Let's keep Accra clean! 🧴♻ #PlasticRecycling #GoGreen",
      mediaUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      mediaType: "image",
      likes: ["user-ktu", "admin-system"],
      helpful: ["user-ktu"],
      niceWork: ["admin-system"],
      comments: [
        {
          id: "comment-1",
          postId: "post-1",
          userId: "user-ktu",
          userName: "Koforidua Technical University",
          userRole: "User",
          text: "Excellent work, Kwame! Setting a great example for all of us.",
          timestamp: new Date("2026-07-13T10:30:00Z").toISOString()
        }
      ],
      reported: false,
      reportsCount: 0,
      visibility: "Public"
    },
    {
      id: "post-2",
      userId: "user-ktu",
      userName: "Koforidua Technical University",
      userAvatar: undefined,
      userRole: "User",
      userBadges: ["🏢 Institutional Partner", "🏆 Sustainability Ambassador"],
      timestamp: new Date("2026-07-14T07:00:00Z").toISOString(),
      sector: "plastic",
      text: "📢 KTU Campus Recycling Drive starts this Saturday! Join us at the campus courtyard for our weekly collection drive. Bring all plastic bottles, cardboard cartons, and old charging cables. Let's make Koforidua green! 🏫💚 #CleanCampus #EcoRecoveryHub",
      mediaUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      mediaType: "image",
      likes: ["user-kwame"],
      helpful: ["user-kwame"],
      niceWork: ["user-kwame"],
      comments: [],
      reported: false,
      reportsCount: 0,
      visibility: "Public"
    }
  ];

  const initialChallenges: CommunityChallenge[] = [
    {
      id: "challenge-1",
      title: "Collect 20 Plastic Bottles",
      description: "Recycle plastic bottles to earn bonus points and save carbon emissions.",
      points: 250,
      co2: 5.5,
      daysRemaining: 12,
      targetQuantity: 20,
      progress: 15,
      completed: false,
      sector: "plastic"
    },
    {
      id: "challenge-2",
      title: "E-Waste Recovery Drive",
      description: "Recover old electronics, chargers, and wires to prevent heavy metal contamination.",
      points: 400,
      co2: 12.0,
      daysRemaining: 5,
      targetQuantity: 3,
      progress: 1,
      completed: false,
      sector: "e-waste"
    },
    {
      id: "challenge-3",
      title: "Sort Your Textiles",
      description: "Recycle clothes, linens, or fabric offcuts to earn points.",
      points: 150,
      co2: 3.5,
      daysRemaining: 20,
      targetQuantity: 5,
      progress: 5,
      completed: true,
      sector: "textile"
    }
  ];

  const initialEvents: CommunityEvent[] = [
    {
      id: "event-1",
      title: "Campus Recycling Day",
      description: "Join Koforidua Technical University's weekly recycling campaign. Volunteers will help sort plastic, paper, and electronic items collected from dormitory blocks.",
      date: "2026-07-19",
      time: "09:00 AM",
      location: "KTU Courtyard, Koforidua",
      host: "Koforidua Technical University",
      hostLogo: undefined,
      volunteers: ["user-kwame"],
      maxVolunteers: 50,
      imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80"
    },
    {
      id: "event-2",
      title: "Accra Beach Clean-up",
      description: "Help clean up plastic waste and marine debris at Labadi Beach. Gloves, collection bags, and snacks will be provided to all registered volunteers.",
      date: "2026-07-25",
      time: "08:00 AM",
      location: "Labadi Beach, Accra",
      host: "Eco-Recovery Hub HQ",
      hostLogo: undefined,
      volunteers: [],
      maxVolunteers: 100,
      imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80"
    },
    {
      id: "event-3",
      title: "E-Waste Recycling Seminar & Expo",
      description: "Learn about the hazards of electronic waste and circular economy opportunities in Ghana. Certified handlers will be on-site to wipe devices and collect electronics safely.",
      date: "2026-08-05",
      time: "10:00 AM",
      location: "University of Ghana Campus, Accra",
      host: "GreenHub Accra",
      hostLogo: undefined,
      volunteers: [],
      maxVolunteers: 200,
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
    }
  ];

  const initialMarketplace: MarketplaceListing[] = [
    {
      id: "list-1",
      title: "Sorted PET Bottles Bundle (approx. 50 pcs)",
      description: "Clean, washed, and sorted PET water bottles, compressed and ready for shredding or product manufacturing.",
      price: 15,
      points: 150,
      sellerId: "user-kwame",
      sellerName: "Kwame Opoku",
      sellerAvatar: undefined,
      sellerRole: "User",
      sector: "plastic",
      quantity: 50,
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      dateListed: "2026-07-12",
      status: "Available"
    },
    {
      id: "list-2",
      title: "Scrap Aluminium Cans (100 pcs)",
      description: "Crushed beverage cans sorted by metal type, clean and dry. Ready for melting or scrap metal reprocessing.",
      price: 35,
      points: 350,
      sellerId: "user-kwame",
      sellerName: "Kwame Opoku",
      sellerAvatar: undefined,
      sellerRole: "User",
      sector: "metal",
      quantity: 100,
      imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80",
      dateListed: "2026-07-13",
      status: "Available"
    },
    {
      id: "list-3",
      title: "Clean Cardboard boxes (medium size)",
      description: "Flat packed cardboard shipping boxes, dry and tape removed. Ideal for packaging or paper mill pulping.",
      price: 20,
      points: 200,
      sellerId: "user-ktu",
      sellerName: "Koforidua Technical University",
      sellerAvatar: undefined,
      sellerRole: "User",
      sector: "paper-cardboard",
      quantity: 20,
      imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
      dateListed: "2026-07-14",
      status: "Available"
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
    posts: initialPosts,
    challenges: initialChallenges,
    events: initialEvents,
    marketplace: initialMarketplace,
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
