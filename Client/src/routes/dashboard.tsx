import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState, useSyncExternalStore, useEffect } from "react";
import {
  Recycle,
  Truck,
  CheckCircle2,
  Leaf,
  TrendingUp,
  Scan,
  UserCheck,
  Check,
  X,
  Users,
  BarChart3,
  Award,
  Search,
  ArrowRight,
  Shield,
  MapPin,
  Calendar,
  Layers,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <DashboardHandler />
    </RequireUser>
  ),
});

function DashboardHandler() {
  const navigate = useNavigate();
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const currentUser = useUser();
  const user = snap.user ?? currentUser;

  useEffect(() => {
    if (user?.role === "Admin") {
      navigate({ to: "/admin-dashboard", replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading account profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (user.role === "Admin") {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Redirecting to Admin Control Center...</p>
        </div>
      </PageContainer>
    );
  }
  return <UserDashboard user={user} snap={snap} />;
}

// ----------------------------------------------------
// USER DASHBOARD VIEW
// ----------------------------------------------------
function UserDashboard({ user, snap }: { user: any; snap: any }) {
  // Compute user statistics dynamically from scans and pickups in the store
  const userScans = snap.scans.filter((s: any) => s.userId === user.id);
  const userPickups = snap.pickups.filter((p: any) => p.userId === user.id);
  
  const approvedScans = userScans.filter((s: any) => s.status === "Approved");
  const completedPickups = userPickups.filter((p: any) => p.status === "Completed");

  const devicesRecycledCount = approvedScans.length + completedPickups.length;
  const pendingPickupsCount = userPickups.filter((p: any) => p.status === "Pending Review" || p.status === "Pickup Scheduled").length;
  const completedPickupsCount = completedPickups.length;
  
  // Calculate dynamic CO2 saved (scans use exact values, pickups earn a flat 8.5kg per collection)
  const dynamicCo2 = approvedScans.reduce((sum: number, s: any) => sum + s.co2, 0) +
                       completedPickups.reduce((sum: number, p: any) => sum + (p.quantity * 0.5 + 5.0), 0);
  
  const totalCo2Saved = Number(dynamicCo2.toFixed(1));

  // Compute real leaderboard rank from live user data sorted by points
  const sortedByPoints = [...snap.users].sort((a: any, b: any) => b.points - a.points);
  const rankIndex = sortedByPoints.findIndex((u: any) => u.id === user.id);
  const userRank = rankIndex >= 0 ? rankIndex + 1 : sortedByPoints.length + 1;

  const cards = [
    { label: "Eco Points Balance", value: `${user.points.toLocaleString()} pts`, icon: Award, accent: "text-leaf" },
    { label: "Items Recovered", value: devicesRecycledCount, icon: Recycle, accent: "text-leaf" },
    { label: "Pending Pickups", value: pendingPickupsCount, icon: Truck, accent: "text-earth" },
    { label: "Completed Collections", value: completedPickupsCount, icon: CheckCircle2, accent: "text-leaf" },
    { label: "CO₂ Diverted", value: `${totalCo2Saved} kg`, icon: Leaf, accent: "text-eco" },
    { label: "Leaderboard Rank", value: `#${userRank}`, icon: TrendingUp, accent: "text-leaf" },
  ];

  // Combine scans and pickups into a unified recovery log sorted by date
  const combinedHistory = [
    ...userScans.map((s: any) => ({
      id: s.id,
      type: "Scan",
      name: s.item,
      category: s.category,
      date: s.date,
      points: s.status === "Approved" ? `+${s.points} pts` : "—",
      status: s.status,
      center: "AI Classified",
    })),
    ...userPickups.map((p: any) => ({
      id: p.id,
      type: "Pickup",
      name: p.item,
      category: `Qty: ${p.quantity}`,
      date: p.date,
      points: p.status === "Completed" ? `+${p.points} pts` : "—",
      status: p.status,
      center: p.preferredCenter,
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-4xl font-bold flex items-center gap-2">
            {user.fullName.split(" ")[0]} 👋
            {user.accountType === "Institutional" && (
              <span className="text-xs bg-leaf/10 text-leaf border border-leaf/20 px-2 py-0.5 rounded-full font-sans font-medium">
                🏫 Institutional Account ({user.orgType})
              </span>
            )}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user.accountType === "Institutional" 
              ? `Managing circular recovery efforts for ${user.orgName} in ${user.orgLocation}.`
              : "Your recovery activity and environmental impact at a glance."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/scanner"><Scan className="mr-2 h-4 w-4" />Scan material</Link></Button>
          <Button asChild className="bg-eco-gradient text-eco-foreground"><Link to="/pickups">Request pickup</Link></Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-5 w-5 ${c.accent}`} />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Institutional Details Display */}
      {user.accountType === "Institutional" && (
        <div className="mt-8 surface-card p-6 border-border">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            🏫 Organization Details
          </h3>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground block text-xs">Organization Name</span><strong>{user.orgName}</strong></div>
            <div><span className="text-muted-foreground block text-xs">Organization Type</span><strong>{user.orgType}</strong></div>
            <div><span className="text-muted-foreground block text-xs">Campus/Office Location</span><strong>{user.orgLocation}</strong></div>
            <div><span className="text-muted-foreground block text-xs">Primary Contact Person</span><strong>{user.fullName}</strong></div>
            <div><span className="text-muted-foreground block text-xs">Organization Email</span><strong>{user.orgEmail}</strong></div>
            <div><span className="text-muted-foreground block text-xs">Organization Phone</span><strong>{user.orgPhone}</strong></div>
          </div>
        </div>
      )}

      {/* Environmental impact strip */}
      <div className="mt-8 surface-card p-6 bg-eco-gradient text-eco-foreground glow-eco">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm opacity-80">Environmental impact</div>
            <div className="font-display text-2xl font-bold">
              You've saved {totalCo2Saved} kg of CO₂ — equal to planting {Math.max(1, Math.round(totalCo2Saved / 25))} trees 🌳
            </div>
          </div>
          <Button asChild variant="secondary"><Link to="/scanner">Recover more</Link></Button>
        </div>
      </div>

      {/* Recovery history */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">My Recovery History</h2>
          <Link to="/pickups" className="text-sm text-leaf hover:underline">Request New Pickup →</Link>
        </div>
        <div className="mt-4 surface-card overflow-hidden">
          {combinedHistory.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No recovery records found. Try scanning some materials to get started!
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Info/Category</th>
                  <th className="p-3">Date Submitted</th>
                  <th className="p-3">Points</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {combinedHistory.map((r) => {
                  const statusColors: Record<string, string> = {
                    "Completed": "bg-eco-soft text-leaf",
                    "Approved": "bg-eco-soft text-leaf",
                    "Pickup Scheduled": "bg-amber-100 text-amber-800",
                    "Pending Approval": "bg-blue-100 text-blue-800",
                    "Pending Review": "bg-blue-100 text-blue-800",
                    "Rejected": "bg-destructive/10 text-destructive",
                    "Cancelled": "bg-muted text-muted-foreground",
                  };
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                      <td className="p-3 font-semibold text-xs text-muted-foreground uppercase">{r.type}</td>
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3 text-muted-foreground">{r.category}</td>
                      <td className="p-3 text-muted-foreground">{r.date}</td>
                      <td className="p-3 text-muted-foreground font-semibold">{r.points}</td>
                      <td className="p-3 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[r.status] || "bg-muted"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

