import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { notifications } from "@/lib/mock-data";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Eco Recovery Hub" }] }),
  component: () => <RequireUser><Notifs /></RequireUser>,
});

function Notifs() {
  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">Notifications</h1>
      <div className="mt-6 surface-card overflow-hidden">
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-start gap-4 p-4 border-b border-border last:border-0 ${n.unread ? "bg-eco-soft/30" : ""}`}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-eco-soft shrink-0"><Bell className="h-4 w-4 text-leaf" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{n.title}</div>
                {n.unread && <span className="h-2 w-2 rounded-full bg-eco" />}
              </div>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </div>
            <div className="text-xs text-muted-foreground shrink-0">{n.time}</div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
