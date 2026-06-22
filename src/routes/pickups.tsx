import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { recyclingHistory, centers } from "@/lib/mock-data";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Truck } from "lucide-react";

export const Route = createFileRoute("/pickups")({
  head: () => ({ meta: [{ title: "Pickup Requests — EcoRecovery" }] }),
  component: () => (
    <RequireUser>
      <Pickups />
    </RequireUser>
  ),
});

function Pickups() {
  const [showForm, setShowForm] = useState(false);
  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Pickup Requests</h1>
          <p className="mt-1 text-muted-foreground">Door-to-door collection with chain-of-custody tracking.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)} className="bg-eco-gradient text-eco-foreground">
          <Plus className="h-4 w-4 mr-1" /> New request
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Pickup request submitted! We'll be in touch shortly.");
            setShowForm(false);
          }}
          className="mt-6 surface-card p-6 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Device type</Label><Input required placeholder="e.g. Laptop, TV, phone" /></div>
            <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" required min={1} defaultValue={1} /></div>
            <div className="space-y-1.5"><Label>Preferred date</Label><Input type="date" required /></div>
            <div className="space-y-1.5"><Label>Preferred center</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                {centers.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Pickup address</Label><Input required placeholder="Street, city" /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="Anything we should know (access, hazardous items, fragile…)" /></div>
          <div className="flex gap-2"><Button type="submit" className="bg-eco-gradient text-eco-foreground">Submit request</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </form>
      )}

      <div className="mt-8 grid gap-3">
        {recyclingHistory.map((r) => (
          <div key={r.id} className="surface-card p-4 flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-eco-soft"><Truck className="h-5 w-5 text-leaf" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{r.device}</div>
              <div className="text-sm text-muted-foreground">{r.date} · {r.center}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">{r.points ? `+${r.points} pts` : "—"}</div>
              <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${r.status === "Completed" ? "bg-eco-soft text-leaf" : "bg-accent text-foreground"}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
