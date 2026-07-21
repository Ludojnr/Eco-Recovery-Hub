import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import {
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Leaf,
  Menu,
  X,
  LayoutDashboard,
  Award,
  Truck,
  Upload,
  LogOut,
  Settings as SettingsIcon,
  BookOpen,
  ShieldCheck,
  BadgeCheck,
  User as UserIcon,
  Users,
  ShoppingBag,
} from "lucide-react";
import { useHydrated, useUser, signOut } from "@/lib/mock-store";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications, dashboardStats } from "@/lib/mock-data";
import { UserAvatar } from "@/routes/settings";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/sectors", label: "Sectors" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/scanner", label: "AI Scanner" },
  { to: "/community", label: "Community" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/map", label: "Recycling Map" },
  { to: "/pickups", label: "Pickups" },
] as const;

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-eco-gradient glow-eco">
        <Leaf className="h-5 w-5 text-eco-foreground" strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Eco-Recovery <span className="text-gradient-eco">Hub</span>
      </span>
    </span>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const user = snap.user;
  const userNotifications = user ? snap.notifications.filter((n) => n.userId === user.id) : [];
  const unread = userNotifications.filter((n) => n.unread).length;
  const unreadMessages = user ? snap.chats.filter(c => c.userId === user.id).reduce((sum, c) => sum + c.unreadCount, 0) : 0;
  const kycStatus = user?.kycStatus ?? "Not Started";
  const kycBadgeClass =
    kycStatus === "Verified"
      ? "bg-leaf/10 text-leaf"
      : kycStatus === "Pending"
      ? "bg-amber-100 text-amber-700"
      : kycStatus === "Rejected"
      ? "bg-destructive/10 text-destructive"
      : "bg-muted text-muted-foreground";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link to="/" className="shrink-0">
          <BrandMark />
        </Link>

        {/* Center nav */}
        <nav className="mx-auto hidden xl:flex items-center gap-1">
          {navLinks.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-eco-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>

          {hydrated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open account menu"
                  className="ml-1 flex items-center gap-2 rounded-full border border-border pl-1 pr-3 py-1 hover:bg-muted"
                >
                  <UserAvatar user={user} size="sm" className="rounded-full" />
                  <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">{user.fullName.split(' ')[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="md" className="rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.fullName} <span className="text-xs text-muted-foreground font-normal">({user.role})</span></div>
                        <div className="text-xs font-normal text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${kycBadgeClass}`}>
                        <BadgeCheck className="h-3 w-3" /> {kycStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Points</span>
                      <span className="font-semibold text-foreground">{user.points.toLocaleString()} pts</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to={user.role === "Admin" ? "/admin-dashboard" : "/dashboard"}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/scanner"><Upload className="mr-2 h-4 w-4" />Upload / Scan</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/marketplace"><ShoppingBag className="mr-2 h-4 w-4" />Marketplace</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/community"><Users className="mr-2 h-4 w-4" />Community</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/leaderboard"><Award className="mr-2 h-4 w-4" />Leaderboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/pickups"><Truck className="mr-2 h-4 w-4" />Pickup Requests</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/rewards"><Award className="mr-2 h-4 w-4" />Rewards</Link></DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="mr-2 h-4 w-4" />Notifications
                    {unread > 0 && <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{unread}</span>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />Messages
                    {unreadMessages > 0 && <span className="ml-auto rounded-full bg-leaf px-1.5 text-[10px] font-bold text-background">{unreadMessages}</span>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" />Profile / Account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/knowledge"><BookOpen className="mr-2 h-4 w-4" />Education</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/security"><ShieldCheck className="mr-2 h-4 w-4" />Data Security</Link></DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggle}>
                  {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : hydrated ? (
            <div className="ml-2 hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm"><Link to="/auth/login">Login</Link></Button>
              <Button asChild size="sm" className="bg-eco-gradient text-eco-foreground hover:opacity-90"><Link to="/auth/signup">Sign Up</Link></Button>
            </div>
          ) : null}

          <button
            className="ml-1 xl:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-7xl flex flex-col p-2">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === l.to ? "bg-eco-soft" : "hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {hydrated && user && (
              <>
                <div className="mt-2 border-t border-border pt-2 text-xs uppercase text-muted-foreground px-3">Account hub</div>
                <div className="rounded-2xl border border-border bg-muted px-3 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar user={user} size="sm" className="rounded-xl" />
                    <div>
                      <div className="font-medium text-foreground">{user.fullName}</div>
                      <div className="text-xs">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-1 text-[11px]">
                    <div className="flex items-center justify-between"><span>Points</span><span>{dashboardStats.points} pts</span></div>
                    <div className="flex items-center justify-between"><span>KYC</span><span className={kycBadgeClass}>{kycStatus}</span></div>
                  </div>
                </div>
                <Link to={user.role === "Admin" ? "/admin-dashboard" : "/dashboard"} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Dashboard</Link>
                <Link to="/scanner" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Upload / Scan</Link>
                <Link to="/marketplace" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Marketplace</Link>
                <Link to="/community" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Community Feed</Link>
                <Link to="/leaderboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Leaderboard</Link>
                <Link to="/pickups" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Pickup Requests</Link>
                <Link to="/rewards" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Rewards</Link>
                <Link to="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Profile / Account</Link>
                <Link to="/notifications" onClick={() => setOpen(false)} className="flex justify-between items-center rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  Notifications {unread > 0 && <span className="rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{unread}</span>}
                </Link>
                <Link to="/messages" onClick={() => setOpen(false)} className="flex justify-between items-center rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  Messages {unreadMessages > 0 && <span className="rounded-full bg-leaf px-1.5 text-[10px] font-bold text-background">{unreadMessages}</span>}
                </Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted">Logout</button>
              </>
            )}
            {hydrated && !user && (
              <div className="flex gap-2 p-2 sm:hidden">
                <Button asChild variant="outline" className="flex-1"><Link to="/auth/login" onClick={() => setOpen(false)}>Login</Link></Button>
                <Button asChild className="flex-1 bg-eco-gradient text-eco-foreground"><Link to="/auth/signup" onClick={() => setOpen(false)}>Sign Up</Link></Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PageContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 lg:px-6 py-8 ${className}`}>{children}</div>;
}

export function RequireUser({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated) return null;
  if (!user) {
    return (
      <PageContainer>
        <div className="surface-card p-12 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-bold">Sign in required</h2>
          <p className="mt-2 text-muted-foreground">Create an account or log in to access this section.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild variant="outline"><Link to="/auth/login">Login</Link></Button>
            <Button asChild className="bg-eco-gradient text-eco-foreground"><Link to="/auth/signup">Create Account</Link></Button>
          </div>
        </div>
      </PageContainer>
    );
  }
  return <>{children}</>;
}
