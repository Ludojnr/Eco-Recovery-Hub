import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store } from "@/lib/mock-store";
import { useSyncExternalStore } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Eco-Recovery Hub" }] }),
  component: () => <RequireUser><Notifs /></RequireUser>,
});

const typeIcon: Record<string, string> = {
  pickup: "🚛",
  reward: "🏆",
  system: "📢",
  message: "💬",
};

function Notifs() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const currentUser = useUser();
  const user = snap.user ?? currentUser;

  if (!user) return null;

  // Show only the current user's notifications
  const myNotifs = snap.notifications
    .filter((n) => n.userId === user.id || n.userId === (user as any)._id)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const unreadCount = myNotifs.filter((n) => n.unread).length;

  const handleClearAll = async () => {
    await store.clearNotifications(user.id);
    toast.success("All notifications cleared.");
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr; // already formatted like "2h ago"
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch {
      return timeStr;
    }
  };

  return (
    <PageContainer>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {myNotifs.length > 0 && (
          <Button
            id="clear-all-notifications-btn"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6 surface-card overflow-hidden">
        {myNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Notifications will appear here when admins review your scans, update your pickups, or send announcements.
            </p>
          </div>
        ) : (
          myNotifs.map((n) => (
            <div
              key={n.id}
              id={`notification-${n.id}`}
              className={`flex items-start gap-4 p-4 border-b border-border last:border-0 transition-colors ${
                n.unread ? "bg-eco-soft/20" : ""
              }`}
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-eco-soft shrink-0 text-lg">
                {typeIcon[n.type] ?? <Bell className="h-4 w-4 text-leaf" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold">{n.title}</div>
                  {n.unread && (
                    <span className="h-2 w-2 rounded-full bg-eco shrink-0" aria-label="Unread" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              <div className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                {formatTime(n.time)}
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}
