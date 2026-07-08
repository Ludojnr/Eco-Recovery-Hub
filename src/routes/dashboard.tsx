import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { useUser } from "@/lib/mock-store";
import { dashboardStats, recyclingHistory } from "@/lib/mock-data";
import { Recycle, Truck, CheckCircle2, Leaf, TrendingUp, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Eco Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <Dashboard />
    </RequireUser>
  ),
});

function Dashboard() {
  const user = useUser()!;
  const cards = [
    { label: "Items Recovered", value: dashboardStats.devicesRecycled, icon: Recycle, accent: "text-leaf" },
    { label: "Pending Pickups", value: dashboardStats.pendingPickups, icon: Truck, accent: "text-earth" },
    { label: "Completed Pickups", value: dashboardStats.completedPickups, icon: CheckCircle2, accent: "text-leaf" },
    { label: "CO₂ Saved", value: `${dashboardStats.co2Saved} kg`, icon: Leaf, accent: "text-eco" },
    { label: "Leaderboard Rank", value: `#${dashboardStats.rank}`, icon: TrendingUp, accent: "text-leaf" },
  ];

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-4xl font-bold">{user.fullName.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-muted-foreground">Your recovery activity and environmental impact at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/scanner"><Scan className="mr-2 h-4 w-4" />Scan material</Link></Button>
          <Button asChild className="bg-eco-gradient text-eco-foreground"><Link to="/pickups">Request pickup</Link></Button>
        </div>
      </div>

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

      {/* Environmental impact strip */}
      <div className="mt-8 surface-card p-6 bg-eco-gradient text-eco-foreground glow-eco">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm opacity-80">Environmental impact</div>
            <div className="font-display text-2xl font-bold">You've saved {dashboardStats.co2Saved} kg of CO₂ — equal to planting 4 trees 🌳</div>
          </div>
          <Button asChild variant="secondary"><Link to="/scanner">Recover more</Link></Button>
        </div>
      </div>


      {/* Recovery history */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">My Recovery History</h2>
          <Link to="/pickups" className="text-sm text-leaf hover:underline">View all →</Link>
        </div>
        <div className="mt-4 surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Date</th>
                <th className="p-3">Center</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recyclingHistory.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-medium">{r.device}</td>
                  <td className="p-3 text-muted-foreground">{r.date}</td>
                  <td className="p-3 text-muted-foreground">{r.center}</td>
                  <td className="p-3 text-right">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${r.status === "Completed" ? "bg-eco-soft text-leaf" : "bg-accent text-foreground"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </PageContainer>
  );
}
