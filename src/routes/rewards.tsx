import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { badges, leaderboard, rewards, dashboardStats } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award, Trophy } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards — EcoRecovery" }] }),
  component: () => (
    <RequireUser>
      <Rewards />
    </RequireUser>
  ),
});

function Rewards() {
  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">My Rewards</h1>
      <p className="mt-1 text-muted-foreground">Earn eco points, unlock badges, and climb the leaderboard.</p>

      <div className="mt-6 surface-card p-6 bg-eco-gradient text-eco-foreground glow-eco flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm opacity-80">Current balance</div>
          <div className="font-display text-5xl font-bold">{dashboardStats.points.toLocaleString()} <span className="text-2xl">pts</span></div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <div className="text-sm"><b>Rank #{dashboardStats.rank}</b> this week</div>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">
        {/* Badges */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold">Achievement badges</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.name} className={`surface-card p-4 text-center ${!b.earned && "opacity-50"}`}>
                <div className="text-3xl">{b.icon}</div>
                <div className="mt-2 font-semibold">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.desc}</div>
                {b.earned && <div className="mt-2 text-xs font-medium text-leaf">Earned</div>}
              </div>
            ))}
          </div>

          <h2 className="mt-10 font-display text-2xl font-bold">Redeemable rewards</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {rewards.map((r) => (
              <div key={r.id} className="surface-card p-4 flex items-center gap-4">
                <div className="text-4xl">{r.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.cost} pts</div>
                </div>
                <Button size="sm" onClick={() => toast.success(`Redeemed: ${r.name}`)} className="bg-eco-gradient text-eco-foreground">Redeem</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="font-display text-2xl font-bold">Leaderboard</h2>
          <div className="mt-4 surface-card overflow-hidden">
            {leaderboard.map((u) => (
              <div key={u.rank} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-muted font-bold text-sm">{u.rank}</div>
                <div className="flex-1 font-medium">{u.name}</div>
                <div className="text-sm">{u.points.toLocaleString()} {u.badge}</div>
              </div>
            ))}
            <div className="flex items-center gap-3 p-3 bg-eco-soft">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-eco-gradient text-eco-foreground font-bold text-sm">{dashboardStats.rank}</div>
              <div className="flex-1 font-medium">You</div>
              <div className="text-sm">{dashboardStats.points.toLocaleString()} <Award className="inline h-3.5 w-3.5" /></div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
