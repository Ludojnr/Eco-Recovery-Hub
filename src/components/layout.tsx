import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
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
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
  BookOpen,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { useHydrated, useUser, store } from "@/lib/mock-store";
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

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/scanner", label: "AI Scanner" },
  { to: "/map", label: "Recycling Map" },
  { to: "/pickups", label: "Pickup Requests" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/knowledge", label: "Education" },
  { to: "/trade-in", label: "Trade-In Estimator" },
  { to: "/security", label: "Data Security" },
] as const;

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-eco-gradient glow-eco">
        <Leaf className="h-5 w-5 text-eco-foreground" strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Eco <span className="text-gradient-eco">Recovery Hub</span>
      </span>
    </span>
  );
}

export function Navbar() {
  const hydrated = useHydrated();
  const user = useUser();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => n.unread).length;

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
                  className="ml-1 flex items-center gap-2 rounded-full border border-border pl-1 pr-2 py-1 hover:bg-muted"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-eco-gradient text-xs font-bold text-eco-foreground">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                  <Menu className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-eco-soft px-2 py-0.5 text-[10px] font-medium text-leaf">
                      <BadgeCheck className="h-3 w-3" /> KYC Verified
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings"><UserIcon className="mr-2 h-4 w-4" />Profile / Account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rewards">
                    <Award className="mr-2 h-4 w-4" />Rewards
                    <span className="ml-auto text-xs text-muted-foreground">{dashboardStats.points.toLocaleString()} pts</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="mr-2 h-4 w-4" />Notifications
                    {unread > 0 && <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{unread}</span>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/pickups"><Truck className="mr-2 h-4 w-4" />My Requests</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/knowledge"><BookOpen className="mr-2 h-4 w-4" />Education</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/security"><ShieldCheck className="mr-2 h-4 w-4" />Data Security</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggle}>
                  {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.signOut()} className="text-destructive focus:text-destructive">
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
                <div className="mt-2 border-t border-border pt-2 text-xs uppercase text-muted-foreground px-3">Account</div>
                <Link to="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Profile / Account</Link>
                <Link to="/rewards" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Rewards</Link>
                <Link to="/notifications" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Notifications</Link>
                <Link to="/messages" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Messages</Link>
                <Link to="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Settings</Link>
                <button onClick={() => { store.signOut(); setOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted">Logout</button>
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
