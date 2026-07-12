import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useHydrated, store, useUser } from "@/lib/mock-store";
import { useTheme } from "@/lib/theme";
import { useState, useSyncExternalStore, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building,
  Layers,
  Scan,
  Truck,
  UserCheck,
  Award,
  MessageSquare,
  Bell,
  BarChart3,
  ScrollText,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Check,
  X,
  Plus,
  Minus,
  RotateCw,
  Send,
  Sliders,
  Shield,
  Activity,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Laptop,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-dashboard")({
  head: () => ({ meta: [{ title: "Admin Portal — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireAdmin>
      <AdminDashboardLayout />
    </RequireAdmin>
  ),
});

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && (!user || user.role !== "Admin")) {
      toast.error("Access denied. Admin authorization required.");
      navigate({ to: "/auth/login" });
    }
  }, [hydrated, user, navigate]);

  if (!hydrated || !user || user.role !== "Admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <Shield className="h-12 w-12 text-leaf mx-auto animate-pulse" />
          <h2 className="text-xl font-bold">Verifying Admin Credentials...</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

type TabType =
  | "dashboard"
  | "users"
  | "institutions"
  | "materials"
  | "scanner"
  | "pickups"
  | "kyc"
  | "rewards"
  | "messages"
  | "notifications"
  | "analytics"
  | "audit"
  | "settings";

function AdminDashboardLayout() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const user = snap.user!;

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) +
          " · " +
          now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    store.signOut();
    toast.success("Administrator logged out successfully.");
    navigate({ to: "/auth/login" });
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "institutions", label: "Institutional Users", icon: Building },
    { id: "materials", label: "Material Management", icon: Layers },
    { id: "scanner", label: "Scanner Review", icon: Scan },
    { id: "pickups", label: "Pickup Requests", icon: Truck },
    { id: "kyc", label: "KYC Verification", icon: UserCheck },
    { id: "rewards", label: "Rewards Management", icon: Award },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: snap.chats.filter(c => c.adminUnreadCount > 0).length },
    { id: "notifications", label: "Notifications", icon: Bell, badge: snap.notifications.filter(n => n.unread).length },
    { id: "analytics", label: "Reports & Analytics", icon: BarChart3 },
    { id: "audit", label: "Audit Logs", icon: ScrollText },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  return (
    <div className={`min-h-screen font-sans antialiased bg-background text-foreground flex flex-col md:flex-row`}>
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 border-b border-border flex items-center px-6 gap-3 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-eco-gradient shadow-[0_0_10px_rgba(167,217,48,0.3)]">
            <Shield className="h-5 w-5 text-background" strokeWidth={2.5} />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Eco-Recovery <span className="text-leaf">Admin</span>
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-muted text-leaf shadow-[inset_3px_0_0_hsl(var(--leaf))] border-l-3 border-leaf"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${active ? "text-leaf" : "text-muted-foreground"}`} />
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="bg-leaf text-background font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer Area with Logout */}
        <div className="p-4 border-t border-border space-y-2 bg-muted/50 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-8 w-8 rounded-full bg-eco-gradient grid place-items-center text-xs font-bold text-background">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user.fullName}</div>
              <div className="text-[10px] text-muted-foreground truncate">Sys Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Global Search users, institutions, uploads..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground h-9 text-xs focus-visible:ring-[#A7D930]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground font-mono hidden sm:inline">{currentTime}</span>
            <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-muted-foreground">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6">
          <ActiveTabContent activeTab={activeTab} snap={snap} globalSearch={globalSearch} />
        </main>

        {/* FOOTER */}
        <footer className="h-12 border-t border-border bg-card flex items-center justify-between px-6 text-[10px] text-muted-foreground shrink-0">
          <div>Eco-Recovery Hub Administrator Panel · v2.1.0</div>
          <div>© {new Date().getFullYear()} Eco-Recovery Hub. All rights reserved · System: <span className="text-leaf font-bold">ONLINE</span></div>
        </footer>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// ROUTER FOR VIEW CONTENTS
// ------------------------------------------------------------------
function ActiveTabContent({ activeTab, snap, globalSearch }: { activeTab: TabType; snap: any; globalSearch: string }) {
  switch (activeTab) {
    case "dashboard":
      return <AdminDashboardHome snap={snap} />;
    case "users":
      return <AdminUserManagement snap={snap} globalSearch={globalSearch} />;
    case "institutions":
      return <AdminInstitutionalManagement snap={snap} globalSearch={globalSearch} />;
    case "materials":
      return <AdminMaterialManagement snap={snap} globalSearch={globalSearch} />;
    case "scanner":
      return <AdminScannerReview snap={snap} />;
    case "pickups":
      return <AdminPickupManagement snap={snap} />;
    case "kyc":
      return <AdminKycPanel snap={snap} />;
    case "rewards":
      return <AdminRewardsManagement snap={snap} />;
    case "messages":
      return <AdminMessagingCentre snap={snap} />;
    case "notifications":
      return <AdminNotificationCentre snap={snap} />;
    case "analytics":
      return <AdminAnalyticsPanel snap={snap} />;
    case "audit":
      return <AdminAuditLogs snap={snap} />;
    case "settings":
      return <AdminSettingsPanel snap={snap} />;
    default:
      return <AdminDashboardHome snap={snap} />;
  }
}

// ------------------------------------------------------------------
// TAB 1: DASHBOARD HOME
// ------------------------------------------------------------------
function AdminDashboardHome({ snap }: { snap: any }) {
  // Aggregate data
  const totalUsers = snap.users.length;
  const totalInstitutions = snap.users.filter((u: any) => u.accountType === "Institutional").length;
  const totalMaterials = snap.scans.length;
  const totalPickups = snap.pickups.length;
  const pendingScans = snap.scans.filter((s: any) => s.status === "Pending Approval").length;
  const pendingKyc = snap.users.filter((u: any) => u.kycStatus === "Pending").length;
  const completedCollections = snap.pickups.filter((p: any) => p.status === "Completed").length;
  const verifiedUsers = snap.users.filter((u: any) => u.kycStatus === "Verified" && u.accountType === "Individual").length;
  const verifiedInsts = snap.users.filter((u: any) => u.kycStatus === "Verified" && u.accountType === "Institutional").length;

  const totalPoints = snap.scans.filter((s: any) => s.status === "Approved").reduce((acc: number, s: any) => acc + s.points, 0) +
                      snap.pickups.filter((p: any) => p.status === "Completed").reduce((acc: number, p: any) => acc + p.points, 0);

  const stats = [
    { title: "Total Registered Users", value: totalUsers, change: "+14%", icon: Users },
    { title: "Total Institutional Users", value: totalInstitutions, change: "+8%", icon: Building },
    { title: "Total Materials Uploaded", value: totalMaterials, change: "+22%", icon: Layers },
    { title: "Total Recycling Requests", value: totalPickups, change: "+12%", icon: Truck },
    { title: "Pending Material Approvals", value: pendingScans, change: "Review Queue", icon: Scan, isAlert: pendingScans > 0 },
    { title: "Pending KYC Requests", value: pendingKyc, change: "Verification Queue", icon: UserCheck, isAlert: pendingKyc > 0 },
    { title: "Completed Recycling Collections", value: completedCollections, change: "+15%", icon: Check },
    { title: "Total Reward Points Issued", value: `${totalPoints.toLocaleString()} pts`, change: "+24%", icon: Award },
    { title: "Total Verified Users", value: verifiedUsers, change: "Trust Badge", icon: Shield },
    { title: "Total Verified Institutions", value: verifiedInsts, change: "Trust Badge", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Profile Details */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-eco-gradient grid place-items-center text-lg font-bold text-background shadow-[0_0_15px_rgba(167,217,48,0.2)]">
            AD
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Welcome Back, System Admin
              <span className="text-[10px] bg-leaf/10 text-leaf border border-leaf/20 px-2 py-0.5 rounded-full font-medium">
                Root Admin
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Control Center for Multi-Sector circular waste streams across Ghana.</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground md:text-right">
          <div>System Health: <span className="text-leaf font-bold">100% Operational</span></div>
          <div className="mt-1">Active Admin Session: <span className="font-mono">admin-system</span></div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground font-medium leading-tight">{s.title}</span>
              <s.icon className={`h-4 w-4 shrink-0 ${s.isAlert ? "text-amber-500 animate-pulse" : "text-leaf"}`} />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-display">{s.value}</div>
              <div className={`text-[10px] mt-1 font-semibold ${s.isAlert ? "text-amber-500" : "text-leaf"}`}>
                {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Recent Activity & Quick Actions & System monitor */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 flex flex-col">
          <h3 className="font-display font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-leaf" /> Recent Platform Activity
          </h3>
          <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto">
            {snap.auditLogs.slice(0, 6).map((log: any) => (
              <div key={log.id} className="text-xs border-b border-border pb-2 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                    {log.action}
                    {log.affectedUser && <span className="text-muted-foreground font-normal">({log.affectedUser})</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">By {log.adminName} · {log.deviceInfo}</div>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground shrink-0 text-right">
                  <div>{log.date}</div>
                  <div>{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel & Live System Health */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-4 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-leaf" /> Quick Operations Panel
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button onClick={() => toast.success("Drafting broadcast report...")} variant="outline" className="border-border text-foreground hover:bg-muted h-10">
                Generate Monthly PDF
              </Button>
              <Button onClick={() => toast.success("Reviewing confidence parameters...")} variant="outline" className="border-border text-foreground hover:bg-muted h-10">
                Modify AI Threshold
              </Button>
              <Button onClick={() => toast.success("Scanning server caches...")} variant="outline" className="border-border text-foreground hover:bg-muted h-10">
                Clear System Temp
              </Button>
              <Button onClick={() => toast.success("Backup uploaded to cloud storage.")} variant="outline" className="border-border text-foreground hover:bg-muted h-10">
                Full DB Backup
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
              <Laptop className="h-4 w-4 text-leaf" /> Live Platform Monitor
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Vite Server Host</span>
                <span className="bg-leaf/10 text-leaf px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>MongoDB Replica Set</span>
                <span className="bg-leaf/10 text-leaf px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Scanner Engine (V8.1)</span>
                <span className="bg-leaf/10 text-leaf px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Wrangler Cloud Worker</span>
                <span className="bg-leaf/10 text-leaf px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage Usage</span>
                <span className="text-foreground font-mono">42% (8.4GB of 20GB)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 2: USER MANAGEMENT
// ------------------------------------------------------------------
function AdminUserManagement({ snap, globalSearch }: { snap: any; globalSearch: string }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userQuery, setUserQuery] = useState("");
  const [pointsAdjustment, setPointsAdjustment] = useState("100");
  const [adjustReason, setAdjustReason] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);

  // Filter
  const filteredUsers = snap.users.filter((u: any) => {
    const s = (globalSearch || userQuery).toLowerCase();
    return (
      (u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.phone.includes(s)) &&
      u.role === "User"
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">User Accounts Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Oversee and modify individual accounts registered on the platform.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="pl-8 bg-card border-border text-xs h-8 focus-visible:ring-[#A7D930]"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">User Details</th>
              <th className="p-3">Location</th>
              <th className="p-3">Registration Date</th>
              <th className="p-3">KYC Status</th>
              <th className="p-3">Account Status</th>
              <th className="p-3">Points</th>
              <th className="p-3 text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u: any) => (
              <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-eco-gradient text-[10px] font-bold text-background grid place-items-center uppercase">
                      {u.fullName.charAt(0)}
                    </span>
                    <div>
                      <div className="font-semibold text-foreground">{u.fullName}</div>
                      <div className="text-[10px] text-muted-foreground">{u.email} · {u.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{u.location || "Not Provided"}</td>
                <td className="p-3 text-muted-foreground">{new Date(u.memberSince).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    u.kycStatus === "Verified" ? "bg-leaf/10 text-leaf" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {u.kycStatus}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    u.accountStatus === "Suspended" ? "bg-destructive/10 text-destructive animate-pulse" : "bg-leaf/10 text-leaf"
                  }`}>
                    {u.accountStatus || "Active"}
                  </span>
                </td>
                <td className="p-3 font-semibold font-mono text-leaf">{u.points.toLocaleString()} pts</td>
                <td className="p-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button onClick={() => setSelectedUser(u)} size="xs" variant="outline" className="border-border text-xs h-7">
                      Profile
                    </Button>
                    <Button onClick={() => setEditingUser(u)} size="xs" variant="outline" className="border-border text-xs h-7">
                      Edit
                    </Button>
                    {u.accountStatus === "Suspended" ? (
                      <Button onClick={() => { store.reactivateUser(u.id); toast.success("Account Reactivated"); }} size="xs" className="bg-leaf hover:bg-leaf/90 text-background h-7 font-bold">
                        Activate
                      </Button>
                    ) : (
                      <Button onClick={() => { store.suspendUser(u.id); toast.error("Account Suspended"); }} size="xs" variant="destructive" className="h-7 text-xs font-bold">
                        Suspend
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl">
            <div className="h-12 border-b border-border bg-muted px-6 flex items-center justify-between">
              <span className="font-semibold text-sm">Detailed User Profile Profile</span>
              <button onClick={() => setSelectedUser(null)}><X className="h-4 w-4 hover:text-leaf" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="h-14 w-14 rounded-full bg-eco-gradient text-lg font-bold text-background grid place-items-center">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {selectedUser.fullName}
                    {selectedUser.kycStatus === "Verified" && <span className="text-leaf text-xs">✔ Verified</span>}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedUser.email} · Registered {new Date(selectedUser.memberSince).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-muted-foreground block">Phone Number</span><strong>{selectedUser.phone}</strong></div>
                <div><span className="text-muted-foreground block">Affiliated Institution</span><strong>{selectedUser.institution || "None"}</strong></div>
                <div><span className="text-muted-foreground block">Primary Location</span><strong>{selectedUser.location}</strong></div>
                <div><span className="text-muted-foreground block">Account Status</span><strong>{selectedUser.accountStatus || "Active"}</strong></div>
              </div>

              {/* Points Adjustment Tool */}
              <div className="border border-border rounded-lg p-4 bg-muted/40 space-y-3">
                <h4 className="font-semibold text-xs text-leaf">Adjust Reward Points Balance</h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pointsAdjustment}
                    onChange={(e) => setPointsAdjustment(e.target.value)}
                    className="bg-card border-border text-xs"
                    placeholder="Points offset (e.g. 100)"
                  />
                  <Input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="bg-card border-border text-xs"
                    placeholder="Reason for change..."
                  />
                  <Button
                    onClick={() => {
                      if (!adjustReason.trim()) return toast.error("Provide a reason");
                      store.adjustUserPoints(selectedUser.id, Number(pointsAdjustment), adjustReason);
                      setSelectedUser({ ...selectedUser, points: selectedUser.points + Number(pointsAdjustment) });
                      toast.success("Points balance updated.");
                      setAdjustReason("");
                    }}
                    className="bg-leaf text-background font-bold text-xs"
                  >
                    Adjust Points
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER INFO MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="h-12 border-b border-border bg-muted px-6 flex items-center justify-between">
              <span className="font-semibold text-sm">Edit User Information</span>
              <button onClick={() => setEditingUser(null)}><X className="h-4 w-4 hover:text-leaf" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Patch profile in mock DB
                store.adjustUserPoints(editingUser.id, 0, "Admin profile update"); // updates store and logs it
                toast.success("User profile parameters saved.");
                setEditingUser(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input value={editingUser.fullName} onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })} className="bg-card border-border" />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="bg-card border-border" />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={editingUser.phone} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} className="bg-card border-border" />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={editingUser.location} onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })} className="bg-card border-border" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button type="submit" className="bg-leaf text-background font-bold">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 3: INSTITUTIONAL USERS
// ------------------------------------------------------------------
function AdminInstitutionalManagement({ snap, globalSearch }: { snap: any; globalSearch: string }) {
  const [instQuery, setInstQuery] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");

  const filteredInsts = snap.users.filter((u: any) => {
    const s = (globalSearch || instQuery).toLowerCase();
    return (
      u.accountType === "Institutional" &&
      (u.orgName?.toLowerCase().includes(s) || u.orgType?.toLowerCase().includes(s) || u.fullName.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Registered Institutions Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Approve, monitor, and coordinate circular metrics for affiliated schools and businesses.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutions..."
            value={instQuery}
            onChange={(e) => setInstQuery(e.target.value)}
            className="pl-8 bg-card border-border text-xs h-8 focus-visible:ring-[#A7D930]"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Institution Profile</th>
              <th className="p-3">Category</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Total uploads</th>
              <th className="p-3">KYC Status</th>
              <th className="p-3">Eco points</th>
              <th className="p-3 text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredInsts.map((i: any) => (
              <tr key={i.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    {i.orgName}
                    {i.kycStatus === "Verified" && (
                      <span className="text-leaf text-[10px] bg-leaf/10 border border-leaf/20 px-1.5 py-0.2 rounded font-sans font-semibold">
                        ✔ Trust Partner
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{i.orgLocation} · {i.orgEmail}</div>
                </td>
                <td className="p-3 text-muted-foreground">{i.orgType}</td>
                <td className="p-3">
                  <div className="font-semibold">{i.contactPerson || i.fullName}</div>
                  <div className="text-[10px] text-muted-foreground">{i.phone}</div>
                </td>
                <td className="p-3 font-semibold text-foreground">{i.uploadCount} items</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    i.kycStatus === "Verified" ? "bg-leaf/10 text-leaf" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {i.kycStatus}
                  </span>
                </td>
                <td className="p-3 font-semibold font-mono text-leaf">{i.points.toLocaleString()} pts</td>
                <td className="p-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {i.kycStatus !== "Verified" && (
                      <Button
                        onClick={() => {
                          store.verifyUser(i.id);
                          toast.success(`${i.orgName} successfully verified.`);
                        }}
                        size="xs"
                        className="bg-leaf hover:bg-leaf/90 text-background font-bold h-7"
                      >
                        Verify Partner
                      </Button>
                    )}
                    <Button onClick={() => { store.suspendUser(i.id); toast.error("Institution suspended."); }} size="xs" variant="destructive" className="h-7 text-xs font-bold">
                      Suspend
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Broad announcement tool */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display font-bold text-sm text-leaf">Broadcast Institutional Announcement</h3>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5 md:col-span-1">
            <Label>Announcement Header</Label>
            <Input
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Scheduled Waste Pickups on Campus"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Message Content</Label>
            <div className="flex gap-2">
              <Textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Write announcement body..."
                className="bg-background border-border h-9 min-h-[36px]"
              />
              <Button
                onClick={() => {
                  if (!broadcastTitle.trim() || !announcementText.trim()) return toast.error("Fields cannot be blank");
                  store.broadcastAnnouncement(broadcastTitle, announcementText, "institutions");
                  toast.success("Broadcast announcement sent to all institutional accounts.");
                  setBroadcastTitle("");
                  setAnnouncementText("");
                }}
                className="bg-leaf text-background font-bold shrink-0 self-end"
              >
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 4: MATERIAL MANAGEMENT
// ------------------------------------------------------------------
function AdminMaterialManagement({ snap, globalSearch }: { snap: any; globalSearch: string }) {
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [uploaderType, setUploaderType] = useState<string>("all");

  const filteredScans = snap.scans.filter((s: any) => {
    // Search match
    const searchMatch =
      s.item.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.userName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.sector.toLowerCase().includes(globalSearch.toLowerCase());

    // Sector match
    const sectorMatch = sectorFilter === "all" || s.sector === sectorFilter;

    // Status match
    const statusMatch = statusFilter === "all" || s.status === statusFilter;

    // User type match (Institutional vs Individual)
    const matchedUserObj = snap.users.find((u: any) => u.id === s.userId);
    const uploaderMatch =
      uploaderType === "all" ||
      (uploaderType === "institutional" && matchedUserObj?.accountType === "Institutional") ||
      (uploaderType === "individual" && matchedUserObj?.accountType === "Individual");

    return searchMatch && sectorMatch && statusMatch && uploaderMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Uploaded Materials Register</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Approve, audit, and trace recovered items submitted across circular streams.</p>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-card border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
          >
            <option value="all">All Sectors</option>
            <option value="e-waste">E-Waste</option>
            <option value="plastic">Plastic</option>
            <option value="metal">Metal</option>
            <option value="glass">Glass</option>
            <option value="paper">Paper &amp; Cardboard</option>
            <option value="textile">Clothing &amp; Textiles</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Approval">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={uploaderType}
            onChange={(e) => setUploaderType(e.target.value)}
            className="bg-card border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
          >
            <option value="all">All Uploaders</option>
            <option value="individual">Individuals Only</option>
            <option value="institutional">Institutions Only</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Material item</th>
              <th className="p-3">Uploader</th>
              <th className="p-3">AI Verdict</th>
              <th className="p-3">Upload Date</th>
              <th className="p-3">Points &amp; Carbon</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.map((s: any) => (
              <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="font-semibold text-foreground">{s.item}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Sector: <b>{s.sector}</b> · {s.category}</div>
                </td>
                <td className="p-3">
                  <div className="font-semibold">{s.userName}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{s.userEmail}</div>
                </td>
                <td className="p-3">
                  <div className="text-leaf font-semibold">{Math.round(s.confidence * 100)}% Match</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{s.handling}</div>
                </td>
                <td className="p-3 text-muted-foreground">{s.date}</td>
                <td className="p-3">
                  <div className="font-semibold text-leaf">+{s.points} pts</div>
                  <div className="text-[10px] text-muted-foreground">{s.co2} kg CO₂ saved</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    s.status === "Approved" ? "bg-leaf/10 text-leaf" : s.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {s.status === "Pending Approval" && (
                      <>
                        <Button
                          onClick={() => {
                            store.approveScan(s.id);
                            toast.success("Material approved and points disbursed.");
                          }}
                          size="xs"
                          className="bg-leaf hover:bg-leaf/90 text-background font-bold"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            store.rejectScan(s.id);
                            toast.error("Material submission rejected.");
                          }}
                          size="xs"
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button onClick={() => { store.deleteScan(s.id); toast.error("Material upload deleted."); }} size="xs" variant="ghost" className="text-destructive">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 5: SCANNER REVIEW
// ------------------------------------------------------------------
function AdminScannerReview({ snap }: { snap: any }) {
  const [correctItem, setCorrectItem] = useState("");
  const [correctSector, setCorrectSector] = useState("e-waste");
  const [correctDesc, setCorrectDesc] = useState("");
  const [correctingScanId, setCorrectingScanId] = useState<string | null>(null);

  const pendingScans = snap.scans.filter((s: any) => s.status === "Pending Approval");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">AI Scanner Review Feed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Approve, modify, or override automated neural classifications on raw uploads.</p>
      </div>

      <div className="grid gap-4">
        {pendingScans.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-xs">
            🎉 No scanner results require review. The queue is empty!
          </div>
        ) : (
          pendingScans.map((s: any) => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row gap-5">
              {/* Mock Scan Image */}
              <div className="h-32 w-32 rounded-lg bg-muted border border-border flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                <Scan className="h-8 w-8 text-leaf mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-muted-foreground">Scan Preview</span>
                {s.imageUrl && <img src={s.imageUrl} alt="Scan preview" className="absolute inset-0 h-full w-full object-cover" />}
              </div>

              {/* Scan Info */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground">{s.item}</h3>
                  <span className="bg-leaf/10 text-leaf px-2 py-0.5 rounded text-[10px] font-bold">
                    AI confidence: {Math.round(s.confidence * 100)}%
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                  <div>Uploader: <strong className="text-foreground">{s.userName}</strong> ({s.userEmail})</div>
                  <div>Suggested Sector: <strong className="text-foreground uppercase">{s.sector}</strong> · {s.category}</div>
                  <div className="sm:col-span-2 mt-1">Suggested Handling Guide: <span className="italic">"{s.handling}"</span></div>
                </div>

                {correctingScanId === s.id ? (
                  <div className="mt-3 border border-border rounded-lg p-3 bg-muted/40 space-y-3">
                    <h4 className="font-bold text-[10px] text-leaf">Correct Classification Parameters</h4>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Item Name</Label>
                        <Input value={correctItem} onChange={(e) => setCorrectItem(e.target.value)} className="bg-card border-border h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Assigned Sector</Label>
                        <select
                          value={correctSector}
                          onChange={(e) => setCorrectSector(e.target.value)}
                          className="w-full bg-card border border-border rounded-md h-8 text-xs text-foreground px-2"
                        >
                          <option value="e-waste">E-Waste</option>
                          <option value="plastic">Plastic</option>
                          <option value="metal">Metal</option>
                          <option value="glass">Glass</option>
                          <option value="paper">Paper &amp; Cardboard</option>
                          <option value="textile">Clothing &amp; Textiles</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Description</Label>
                        <Input value={correctDesc} onChange={(e) => setCorrectDesc(e.target.value)} className="bg-card border-border h-8 text-xs" />
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        onClick={() => {
                          if (!correctItem.trim()) return toast.error("Provide item name");
                          store.editScan(s.id, { item: correctItem, sector: correctSector, description: correctDesc });
                          store.approveScan(s.id);
                          toast.success("Classification parameters updated and approved.");
                          setCorrectingScanId(null);
                        }}
                        size="xs"
                        className="bg-leaf text-background font-bold"
                      >
                        Apply &amp; Approve
                      </Button>
                      <Button onClick={() => setCorrectingScanId(null)} size="xs" variant="ghost">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => {
                        store.approveScan(s.id);
                        toast.success("Scanner result verified and approved.");
                      }}
                      size="xs"
                      className="bg-leaf hover:bg-leaf/90 text-background font-bold"
                    >
                      Approve AI Result
                    </Button>
                    <Button
                      onClick={() => {
                        setCorrectingScanId(s.id);
                        setCorrectItem(s.item);
                        setCorrectSector(s.sector);
                        setCorrectDesc(s.description);
                      }}
                      size="xs"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted"
                    >
                      Correct Classification
                    </Button>
                    <Button
                      onClick={() => {
                        store.rejectScan(s.id);
                        toast.error("Scan submission rejected.");
                      }}
                      size="xs"
                      variant="destructive"
                    >
                      Reject Scan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 6: PICKUP REQUESTS
// ------------------------------------------------------------------
function AdminPickupManagement({ snap }: { snap: any }) {
  const [driverName, setDriverName] = useState("");
  const [assigningPickupId, setAssigningPickupId] = useState<string | null>(null);

  const activePickups = snap.pickups;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Door-to-door Collections Registry</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Approve pickup requests, allocate local collection drivers, and monitor schedules.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Requester Details</th>
              <th className="p-3">Recyclables</th>
              <th className="p-3">Address &amp; Route</th>
              <th className="p-3">Scheduled Date</th>
              <th className="p-3">Collection Status</th>
              <th className="p-3 text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {activePickups.map((p: any) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="font-semibold text-foreground">{p.userName}</div>
                  <div className="text-[10px] text-muted-foreground">{p.userEmail}</div>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-foreground">{p.item}</div>
                  <div className="text-[10px] text-muted-foreground">Quantity: <b>{p.quantity}</b> · <b>+{p.points} pts</b></div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-leaf" /> {p.address}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Hub Route: {p.preferredCenter}</div>
                </td>
                <td className="p-3 text-muted-foreground">
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-leaf" /> {p.preferredDate}</div>
                  <div className="text-[10px] mt-0.5">Requested: {p.date}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    p.status === "Completed" ? "bg-leaf/10 text-leaf" : p.status === "Pickup Scheduled" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {assigningPickupId === p.id ? (
                    <div className="flex gap-1 justify-end items-center max-w-[200px] ml-auto">
                      <Input
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Driver / Center Name"
                        className="bg-background border-border h-7 text-[11px]"
                      />
                      <Button
                        onClick={() => {
                          if (!driverName.trim()) return toast.error("Provide collector name");
                          store.assignPickupDriver(p.id, driverName);
                          toast.success("Driver assigned successfully.");
                          setAssigningPickupId(null);
                          setDriverName("");
                        }}
                        size="xs"
                        className="bg-leaf text-background font-bold"
                      >
                        Assign
                      </Button>
                      <button onClick={() => setAssigningPickupId(null)}><X className="h-4 w-4 ml-1" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 justify-end">
                      {p.status === "Pending Review" && (
                        <Button
                          onClick={() => {
                            setAssigningPickupId(p.id);
                            setDriverName(p.preferredCenter);
                          }}
                          size="xs"
                          className="bg-leaf hover:bg-leaf/90 text-background font-bold"
                        >
                          Assign Driver
                        </Button>
                      )}
                      {p.status === "Pickup Scheduled" && (
                        <Button
                          onClick={() => {
                            store.updatePickupStatus(p.id, "Completed");
                            toast.success(`Completed pickup. pts transferred.`);
                          }}
                          size="xs"
                          className="bg-leaf hover:bg-leaf/90 text-foreground font-semibold"
                        >
                          Mark Completed
                        </Button>
                      )}
                      {p.status !== "Completed" && p.status !== "Cancelled" && (
                        <Button
                          onClick={() => {
                            store.updatePickupStatus(p.id, "Cancelled");
                            toast.error("Pickup request cancelled.");
                          }}
                          size="xs"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 7: KYC PANEL
// ------------------------------------------------------------------
function AdminKycPanel({ snap }: { snap: any }) {
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [kycFeedback, setKycFeedback] = useState("");

  const pendingKycUsers = snap.users.filter((u: any) => u.kycStatus === "Pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">KYC Trust Document Verification</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Authenticate corporate, school, or individual registration credentials to assign verification badges.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {pendingKycUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            🎉 No KYC files require validation. All users are verified!
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
              <tr>
                <th className="p-3">User / Partner details</th>
                <th className="p-3">Verification Details</th>
                <th className="p-3">Upload Identification</th>
                <th className="p-3 text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {pendingKycUsers.map((u: any) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{u.fullName}</div>
                    <div className="text-[10px] text-muted-foreground">{u.email} · {u.phone}</div>
                    {u.accountType === "Institutional" && (
                      <div className="text-[10px] bg-muted p-1.5 rounded mt-1 border border-border max-w-xs">
                        🏫 Org: <b>{u.orgName}</b> ({u.orgType})
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{u.accountType} Partner Registration verification</td>
                  <td className="p-3">
                    <div className="h-10 w-24 rounded border border-border bg-background flex items-center justify-center text-[9px] text-muted-foreground hover:bg-muted cursor-pointer">
                      View Document (PDF) <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    {rejectingUserId === u.id ? (
                      <div className="space-y-2 max-w-[200px] ml-auto">
                        <Textarea
                          placeholder="Rejection feedback..."
                          className="bg-background border-border text-[10px] h-14"
                          value={kycFeedback}
                          onChange={(e) => setKycFeedback(e.target.value)}
                        />
                        <div className="flex gap-1 justify-end">
                          <Button
                            onClick={() => {
                              if (!kycFeedback.trim()) return toast.error("Provide rejection reason");
                              store.rejectKyc(u.id, kycFeedback);
                              setRejectingUserId(null);
                              setKycFeedback("");
                              toast.error("KYC rejected and feedback sent.");
                            }}
                            size="xs"
                            variant="destructive"
                          >
                            Reject
                          </Button>
                          <Button onClick={() => setRejectingUserId(null)} size="xs" variant="ghost">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          onClick={() => {
                            store.verifyUser(u.id);
                            toast.success(`Verified user ${u.fullName}`);
                          }}
                          size="xs"
                          className="bg-leaf hover:bg-leaf/90 text-background font-bold"
                        >
                          Verify Account
                        </Button>
                        <Button
                          onClick={() => setRejectingUserId(u.id)}
                          size="xs"
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 8: REWARDS MANAGEMENT
// ------------------------------------------------------------------
function AdminRewardsManagement({ snap }: { snap: any }) {
  const [pointsAdjustVal, setPointsAdjustVal] = useState("100");
  const [adjustReason, setAdjustReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Points &amp; Rewards Operations</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manually adjust account reward points and audit points transactions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Adjust Balance */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm text-leaf">Adjust Reward Points Balance</h3>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Select User Account</Label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-background border border-border rounded-md h-9 text-xs text-foreground px-2.5 focus:border-leaf"
              >
                <option value="">-- Choose Account --</option>
                {snap.users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.points} pts) - {u.accountType}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Points (use - for deduction)</Label>
                <Input
                  type="number"
                  value={pointsAdjustVal}
                  onChange={(e) => setPointsAdjustVal(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1">
                <Label>Audit Note / Reason</Label>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Campaign reward error correction"
                  className="bg-background border-border"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                if (!selectedUserId) return toast.error("Select a user account");
                if (!adjustReason.trim()) return toast.error("Provide adjustment reason");
                store.adjustUserPoints(selectedUserId, Number(pointsAdjustVal), adjustReason);
                toast.success("Points offset calculated and disbursed.");
                setAdjustReason("");
              }}
              className="w-full bg-leaf hover:bg-leaf/90 text-background font-bold"
            >
              Apply Adjustment
            </Button>
          </div>
        </div>

        {/* Configure Reward Rules */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 text-xs">
          <h3 className="font-display font-bold text-sm text-leaf">Material Rewards Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">E-Waste / Electronics per Item</span>
              <strong>150 pts</strong>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Plastic per Item Detections</span>
              <strong>60 pts</strong>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Metal Recyclables per Item</span>
              <strong>45 pts</strong>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Clothing &amp; Textiles per Item</span>
              <strong>50 pts</strong>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Glass / Bottles per Item</span>
              <strong>40 pts</strong>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Paper &amp; Cardboard per Item</span>
              <strong>30 pts</strong>
            </div>
            <Button onClick={() => toast.success("Bonus configurations saved.")} variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              Modify points parameters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 9: MESSAGING CENTRE
// ------------------------------------------------------------------
function AdminMessagingCentre({ snap }: { snap: any }) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [replyText, setReplyText] = useState("");

  const activeChat = snap.chats.find((c: any) => c.userId === selectedUserId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Admin Support Messaging Hub</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Chat in real-time with users and broadcast announcements.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-[450px]">
        {/* Chat sidebar list */}
        <div className="bg-card border border-border rounded-xl overflow-y-auto p-3 space-y-1">
          <h4 className="font-semibold text-xs text-muted-foreground px-2 mb-2">Active Conversations</h4>
          {snap.chats.map((c: any) => (
            <button
              key={c.userId}
              onClick={() => {
                setSelectedUserId(c.userId);
                store.clearUnreadCount(c.userId, true);
              }}
              className={`w-full text-left p-2.5 rounded-lg text-xs space-y-1 transition-colors ${
                selectedUserId === c.userId ? "bg-muted border-l-2 border-leaf" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground truncate max-w-[120px]">{c.userName}</span>
                {c.adminUnreadCount > 0 && (
                  <span className="bg-leaf text-background font-bold text-[9px] px-1.5 py-0.2 rounded-full shrink-0 animate-bounce">
                    {c.adminUnreadCount}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {c.messages[c.messages.length - 1]?.text || "No messages"}
              </div>
            </button>
          ))}
        </div>

        {/* Message Window */}
        <div className="bg-card border border-border rounded-xl md:col-span-2 flex flex-col overflow-hidden">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="h-12 bg-muted border-b border-border px-4 flex items-center justify-between shrink-0">
                <div className="text-xs">
                  <span className="font-bold">{activeChat.userName}</span>
                  <span className="text-muted-foreground ml-2">({activeChat.userEmail})</span>
                </div>
                <Button
                  onClick={() => {
                    store.markChatResolved(activeChat.userId);
                    toast.success("Conversation marked resolved.");
                  }}
                  size="xs"
                  className="bg-leaf hover:bg-leaf/90 text-foreground"
                >
                  Resolve Chat
                </Button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/40">
                {activeChat.messages.map((m: any) => {
                  const isAdmin = m.senderId === "admin";
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg p-2.5 text-xs ${
                        isAdmin ? "bg-leaf text-background" : "bg-muted text-foreground border border-border"
                      }`}>
                        <div className="font-semibold text-[10px] opacity-75">{m.senderName}</div>
                        <div className="mt-1 leading-tight">{m.text}</div>
                        <div className="text-[9px] opacity-60 text-right mt-1 font-mono">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Reply bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!replyText.trim()) return;
                  store.sendMessage(activeChat.userId, replyText, true);
                  setReplyText("");
                  toast.success("Reply dispatched.");
                }}
                className="p-3 bg-card border-t border-border flex gap-2 shrink-0"
              >
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type support reply..."
                  className="bg-background border-border text-xs h-9 focus-visible:ring-[#A7D930]"
                />
                <Button type="submit" className="bg-leaf hover:bg-leaf/90 text-background font-bold">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs">
              <MessageSquare className="h-10 w-10 mb-2 text-leaf" />
              Select an active conversation to begin direct support reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 10: NOTIFICATIONS CENTRE
// ------------------------------------------------------------------
function AdminNotificationCentre({ snap }: { snap: any }) {
  const adminNotifs = snap.notifications.filter((n: any) => n.userId === "admin-system" || n.type === "system");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-xl font-bold">System Notifications</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Inbox of operational logs and system event warnings.</p>
        </div>
        <Button
          onClick={() => {
            store.clearNotifications("admin-system");
            toast.success("Notifications marked read.");
          }}
          variant="outline"
          size="xs"
          className="border-border"
        >
          Clear Unread Badges
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-[#2F2F2F]">
        {adminNotifs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            No system notifications.
          </div>
        ) : (
          adminNotifs.map((n: any) => (
            <div key={n.id} className={`p-4 flex items-center justify-between gap-4 text-xs ${n.unread ? "bg-muted/40" : ""}`}>
              <div className="space-y-1">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  {n.title}
                  {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-leaf" />}
                </h4>
                <p className="text-muted-foreground leading-tight">{n.body}</p>
                <div className="text-[10px] text-muted-foreground">{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 11: REPORTS & ANALYTICS
// ------------------------------------------------------------------
function AdminAnalyticsPanel({ snap }: { snap: any }) {
  // Aggregate stats
  const totalScans = snap.scans.length;
  const approvedScans = snap.scans.filter((s: any) => s.status === "Approved").length;
  const accuracy = totalScans > 0 ? Math.round((approvedScans / totalScans) * 100) : 100;

  const triggerExport = (format: string) => {
    toast.success(`Exporting platform statistics report in ${format} format...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Platform Diagnostics &amp; Impact Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Aggregate reports for circular economy recovery volumes and carbon offsets.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => triggerExport("PDF")} variant="outline" size="sm" className="border-border text-xs">
            Export PDF
          </Button>
          <Button onClick={() => triggerExport("Excel")} variant="outline" size="sm" className="border-border text-xs">
            Export Excel
          </Button>
          <Button onClick={() => triggerExport("CSV")} variant="outline" size="sm" className="border-border text-xs">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-xs">
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <span className="text-muted-foreground">AI Scanner Precision Accuracy</span>
          <div className="mt-4 text-4xl font-extrabold text-leaf">{accuracy}%</div>
          <p className="text-[10px] text-muted-foreground mt-2">Percentage of AI classifications approved by Admin without corrections</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <span className="text-muted-foreground">Collection Success Rate</span>
          <div className="mt-4 text-4xl font-extrabold text-leaf">98.2%</div>
          <p className="text-[10px] text-muted-foreground mt-2">Logistics completion rate for assigned pickup collections</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <span className="text-muted-foreground">Active Users Ratio</span>
          <div className="mt-4 text-4xl font-extrabold text-leaf">84.6%</div>
          <p className="text-[10px] text-muted-foreground mt-2">Daily active users recycling vs dormant accounts</p>
        </div>
      </div>

      {/* Sector Breakdown Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display font-semibold text-sm mb-4">Volume breakdown by Recycling Sector</h3>
        <div className="space-y-4">
          {[
            { name: "E-Waste / Electronics", percentage: 42, color: "bg-blue-500", count: 12 },
            { name: "Plastic Polymers", percentage: 28, color: "bg-emerald-500", count: 8 },
            { name: "Metal / Iron / Copper", percentage: 14, color: "bg-amber-500", count: 4 },
            { name: "Clothing & Textiles", percentage: 10, color: "bg-purple-500", count: 3 },
            { name: "Glass / Ceramics", percentage: 4, color: "bg-sky-500", count: 1 },
            { name: "Paper & Cardboard", percentage: 2, color: "bg-stone-500", count: 1 },
          ].map((sec) => (
            <div key={sec.name} className="space-y-1.5 text-xs">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{sec.name}</span>
                <span className="text-muted-foreground">{sec.percentage}% ({sec.count} items)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-background overflow-hidden">
                <div className={`h-full ${sec.color} rounded-full`} style={{ width: `${sec.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 12: AUDIT LOGS
// ------------------------------------------------------------------
function AdminAuditLogs({ snap }: { snap: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Immutable System Audit Trails</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Cryptographically signed logs of all actions performed by administrators. Logs are permanent.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Audit Timestamp</th>
              <th className="p-3">Administrator</th>
              <th className="p-3">Action Performed</th>
              <th className="p-3">Target entity</th>
              <th className="p-3">IP address</th>
              <th className="p-3">System device info</th>
            </tr>
          </thead>
          <tbody>
            {snap.auditLogs.map((log: any) => (
              <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-leaf" />
                    <span>{log.date} {log.time}</span>
                  </div>
                </td>
                <td className="p-3 font-semibold text-foreground">{log.adminName}</td>
                <td className="p-3 font-semibold text-leaf">{log.action}</td>
                <td className="p-3 text-foreground">
                  {log.affectedUser || "—"}
                  {log.affectedOrg && <div className="text-[10px] text-muted-foreground">{log.affectedOrg}</div>}
                </td>
                <td className="p-3 font-mono text-muted-foreground">{log.ipAddress}</td>
                <td className="p-3 text-muted-foreground truncate max-w-[150px]">{log.deviceInfo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TAB 13: SETTINGS
// ------------------------------------------------------------------
function AdminSettingsPanel({ snap }: { snap: any }) {
  const [platformName, setPlatformName] = useState("Eco-Recovery Hub");
  const [threshold, setThreshold] = useState(85);
  const [pointsPerKg, setPointsPerKg] = useState(10);
  const [contactEmail, setContactEmail] = useState("admin@ecorecovery.org");

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="font-display text-xl font-bold">System Configuration Console</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure platform thresholds, scanner settings, points rules, and metadata parameters.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General settings */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm text-leaf">General Platform Metadata</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Platform Brand Name</Label>
              <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <Label>Contact Support Email</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="bg-background border-border" />
            </div>
            <Button onClick={() => { store.addAuditLog("Modified General System Settings"); toast.success("General settings saved."); }} className="bg-leaf hover:bg-leaf/90 text-background font-bold w-full">
              Save General Parameters
            </Button>
          </div>
        </div>

        {/* AI Scanner Settings */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm text-leaf">AI Scanner Parameterization</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="flex justify-between">
                <span>AI Scanner Confidence Threshold</span>
                <span className="font-mono text-leaf font-bold">{threshold}%</span>
              </Label>
              <input
                type="range"
                min="50"
                max="98"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-[#A7D930]"
              />
              <p className="text-[10px] text-muted-foreground">Scans below this confidence level are automatically routed to the Review Queue.</p>
            </div>
            <Button onClick={() => { store.addAuditLog(`Set AI scanner confidence threshold to ${threshold}%`); toast.success("AI threshold adjustments saved."); }} className="bg-leaf hover:bg-leaf/90 text-background font-bold w-full">
              Save Scanner Weights
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
