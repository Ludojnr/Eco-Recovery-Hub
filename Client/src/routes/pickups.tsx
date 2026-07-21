import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { centers } from "@/lib/mock-data";
import { store, useUser } from "@/lib/mock-store";
import { useState, useSyncExternalStore } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Truck, Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/pickups")({
  head: () => ({ meta: [{ title: "Pickup Requests — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <Pickups />
    </RequireUser>
  ),
});

function Pickups() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const currentUser = useUser();
  const user = snap.user ?? currentUser;
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    item: "",
    quantity: "1",
    preferredDate: "",
    preferredCenter: centers[0]?.name || "GreenHub Accra",
    address: user?.preferredPickupAddresses?.[0] || "",
    notes: "",
  });

  if (!user) return null;

  // Filter pickups matching current user
  const userPickups = snap.pickups.filter((p: any) => p.userId === user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item.trim() || !form.preferredDate || !form.address.trim()) {
      return toast.error("Please fill in all required fields.");
    }

    // Estimate points based on device/item keywords
    let estimatedPoints = 50; // default for textile, paper, glass
    const itemLower = form.item.toLowerCase();
    if (itemLower.includes("laptop") || itemLower.includes("pc") || itemLower.includes("tv") || itemLower.includes("phone") || itemLower.includes("electronics") || itemLower.includes("e-waste")) {
      estimatedPoints = 150;
    } else if (itemLower.includes("bottle") || itemLower.includes("plastic") || itemLower.includes("pet")) {
      estimatedPoints = 60;
    } else if (itemLower.includes("can") || itemLower.includes("metal") || itemLower.includes("aluminium") || itemLower.includes("tin")) {
      estimatedPoints = 45;
    }

    store.addPickupRequest({
      item: form.item,
      quantity: Number(form.quantity),
      preferredDate: form.preferredDate,
      preferredCenter: form.preferredCenter,
      address: form.address,
      notes: form.notes,
      points: estimatedPoints,
    });

    toast.success("Pickup request submitted for admin review!");
    setShowForm(false);
    
    // Reset form fields
    setForm({
      item: "",
      quantity: "1",
      preferredDate: "",
      preferredCenter: centers[0]?.name || "GreenHub Accra",
      address: user.preferredPickupAddresses[0] || "",
      notes: "",
    });
  };

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
        <form onSubmit={handleSubmit} className="mt-6 surface-card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Item / Device Type</Label>
              <Input
                required
                placeholder="e.g. Used Laptop, PET bottles bundle, old clothes"
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                required
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred Date</Label>
              <Input
                type="date"
                required
                value={form.preferredDate}
                onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred Center / Route</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.preferredCenter}
                onChange={(e) => setForm({ ...form, preferredCenter: e.target.value })}
                required
              >
                {centers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Pickup Address</Label>
            <Input
              required
              placeholder="Street, city, area"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Anything we should know (access instructions, packaging details, fragile items…)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-eco-gradient text-eco-foreground">Submit request</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-3">
        {userPickups.length === 0 ? (
          <div className="surface-card p-8 text-center text-muted-foreground text-sm">
            No pickup requests submitted yet. Click "New request" to schedule your first door-to-door collection!
          </div>
        ) : (
          userPickups.map((r: any) => {
            const statusColors: Record<string, string> = {
              "Completed": "bg-eco-soft text-leaf",
              "Pickup Scheduled": "bg-amber-100 text-amber-800",
              "Pending Review": "bg-blue-100 text-blue-800",
              "Cancelled": "bg-muted text-muted-foreground",
            };
            return (
              <div key={r.id} className="surface-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-eco-soft shrink-0">
                    <Truck className="h-5 w-5 text-leaf" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-base">{r.item}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 gap-y-1 items-center">
                      <span className="flex items-center gap-0.5"><Calendar className="h-3.5 w-3.5" /> Date: {r.preferredDate}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3.5 w-3.5" /> Center: {r.preferredCenter}</span>
                      <span>·</span>
                      <span>Qty: {r.quantity}</span>
                    </div>
                    {r.notes && <p className="text-xs text-muted-foreground italic mt-1 bg-muted/40 p-1.5 rounded">{r.notes}</p>}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 gap-2 shrink-0">
                  <div className="text-right">
                    <div className="font-semibold text-sm text-leaf">+{r.points} pts</div>
                    <div className="text-[10px] text-muted-foreground">Est. Reward</div>
                  </div>
                  <span className={`text-xs rounded-full px-2.5 py-0.5 font-semibold ${statusColors[r.status] || "bg-muted"}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
