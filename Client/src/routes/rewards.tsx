import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store } from "@/lib/mock-store";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award, Trophy, ShoppingBag, Package } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <Rewards />
    </RequireUser>
  ),
});

// ── Badge definitions — earned dynamically from real user activity ────────────
function computeBadges(user: any, scans: any[], posts: any[]) {
  const approvedScans = scans.filter((s) => s.userId === user.id && s.status === "Approved");
  const uniqueSectors = new Set(approvedScans.map((s: any) => s.sector)).size;
  const co2 = approvedScans.reduce((sum: number, s: any) => sum + (s.co2 ?? 0), 0);
  const hasPosts = posts.some((p) => p.userId === user.id);

  return [
    {
      name: "First Drop",
      desc: "Recycled your first item",
      icon: "🌱",
      earned: user.uploadCount >= 1 || approvedScans.length >= 1,
    },
    {
      name: "Sector Explorer",
      desc: "Recovered from 4 different sectors",
      icon: "🔍",
      earned: uniqueSectors >= 4,
    },
    {
      name: "Carbon Saver",
      desc: "Saved 50 kg of CO₂",
      icon: "🌍",
      earned: co2 >= 50,
    },
    {
      name: "Community Leader",
      desc: "Shared recovery with your community",
      icon: "🏫",
      earned: hasPosts,
    },
    {
      name: "Top Recycler",
      desc: "Reached top 10 on the leaderboard",
      icon: "👑",
      earned: false, // evaluated below after rank is known
    },
    {
      name: "Eco Educator",
      desc: "Read 5 education articles",
      icon: "📚",
      earned: false, // not tracked yet
    },
  ];
}

function Rewards() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const user = snap.user!;

  // ── Live leaderboard from real users ─────────────────────────────────────
  const sortedUsers = [...snap.users].sort((a, b) => b.points - a.points);
  const top10 = sortedUsers.slice(0, 10);
  const myRankIndex = sortedUsers.findIndex((u) => u.id === user.id);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : sortedUsers.length + 1;

  // ── Badges (computed from real data) ─────────────────────────────────────
  const badges = computeBadges(user, snap.scans, snap.posts);
  // Update Top Recycler badge using real rank
  const badgesWithRank = badges.map((b) =>
    b.name === "Top Recycler" ? { ...b, earned: myRank <= 10 } : b
  );

  const earnedCount = badgesWithRank.filter((b) => b.earned).length;

  // ── Marketplace items as redeemable rewards ───────────────────────────────
  const availableItems = snap.marketplace.filter((item) => item.status === "Available");

  const handleRedeem = async (itemId: string, itemTitle: string, cost: number) => {
    if (user.points < cost) {
      toast.error(`You need ${cost - user.points} more points to redeem "${itemTitle}".`);
      return;
    }
    try {
      await store.buyMarketplaceItem(itemId);
      toast.success(`Successfully redeemed: ${itemTitle}! 🎉`);
    } catch (err: any) {
      toast.error(err?.message ?? "Redemption failed. Please try again.");
    }
  };

  const rankBadge = (rank: number) => {
    if (rank === 1) return "🏆";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">My Rewards</h1>
      <p className="mt-1 text-muted-foreground">
        Earn eco points, unlock badges, and climb the leaderboard.
      </p>

      {/* Points & rank hero */}
      <div className="mt-6 surface-card p-6 bg-eco-gradient text-eco-foreground glow-eco flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm opacity-80">Current balance</div>
          <div className="font-display text-5xl font-bold">
            {user.points.toLocaleString()} <span className="text-2xl">pts</span>
          </div>
          <div className="mt-1 text-sm opacity-70">
            {earnedCount} of {badgesWithRank.length} badges earned
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <div className="text-sm">
            <b>Rank #{myRank}</b> globally
          </div>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">
        {/* Badges + Redeemable items */}
        <div className="lg:col-span-2 space-y-10">
          {/* Achievement Badges */}
          <div>
            <h2 className="font-display text-2xl font-bold">Achievement Badges</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {badgesWithRank.map((b) => (
                <div
                  key={b.name}
                  className={`surface-card p-4 text-center transition-opacity ${
                    !b.earned ? "opacity-40" : ""
                  }`}
                >
                  <div className="text-3xl">{b.icon}</div>
                  <div className="mt-2 font-semibold text-sm">{b.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
                  {b.earned && (
                    <div className="mt-2 text-xs font-medium text-leaf">✓ Earned</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Redeemable Rewards from real marketplace */}
          <div>
            <h2 className="font-display text-2xl font-bold">Redeemable Rewards</h2>
            {availableItems.length === 0 ? (
              <div className="mt-4 surface-card p-8 text-center text-muted-foreground text-sm">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No rewards available yet. Check back soon!
              </div>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {availableItems.map((item) => {
                  const canAfford = user.points >= item.points;
                  return (
                    <div
                      key={item.id}
                      id={`reward-item-${item.id}`}
                      className="surface-card p-4 flex items-center gap-4"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-14 w-14 rounded-xl object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-xl bg-eco-soft shrink-0">
                          <ShoppingBag className="h-6 w-6 text-leaf" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.points} pts</div>
                        {!canAfford && (
                          <div className="text-xs text-amber-500 mt-0.5">
                            Need {(item.points - user.points).toLocaleString()} more pts
                          </div>
                        )}
                      </div>
                      <Button
                        id={`redeem-btn-${item.id}`}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handleRedeem(item.id, item.title, item.points)}
                        className="bg-eco-gradient text-eco-foreground shrink-0 disabled:opacity-40"
                      >
                        Redeem
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Real Leaderboard */}
        <div>
          <h2 className="font-display text-2xl font-bold">Leaderboard</h2>
          <div className="mt-4 surface-card overflow-hidden">
            {top10.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No users ranked yet.
              </div>
            ) : (
              top10.map((u, idx) => {
                const rank = idx + 1;
                const isMe = u.id === user.id;
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-3 p-3 border-b border-border last:border-0 ${
                      isMe ? "bg-eco-soft/40" : ""
                    }`}
                  >
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full font-bold text-sm shrink-0 ${
                        isMe
                          ? "bg-eco-gradient text-eco-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {rank}
                    </div>
                    <div className="flex-1 font-medium truncate">
                      {u.fullName.split(" ")[0]}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-leaf font-semibold">(You)</span>
                      )}
                    </div>
                    <div className="text-sm tabular-nums">
                      {u.points.toLocaleString()} {rankBadge(rank)}
                    </div>
                  </div>
                );
              })
            )}
            {/* Show current user if outside top 10 */}
            {myRank > 10 && (
              <>
                <div className="flex items-center gap-3 p-3 border-t border-dashed border-border text-muted-foreground text-xs">
                  <span>···</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-eco-soft/40">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-eco-gradient text-eco-foreground font-bold text-sm shrink-0">
                    {myRank}
                  </div>
                  <div className="flex-1 font-medium">
                    {user.fullName.split(" ")[0]}{" "}
                    <span className="text-xs text-leaf font-semibold">(You)</span>
                  </div>
                  <div className="text-sm tabular-nums">
                    {user.points.toLocaleString()} <Award className="inline h-3.5 w-3.5" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
