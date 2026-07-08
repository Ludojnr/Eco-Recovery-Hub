import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Eco Recovery Hub" }] }),
  component: () => <RequireUser><Settings /></RequireUser>,
});

function Settings() {
  const user = useUser()!;
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone, institution: user.institution });
  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">Settings</h1>
      <div className="mt-6 max-w-2xl surface-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-eco-gradient text-eco-foreground text-2xl font-bold">{user.fullName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="font-display text-lg font-semibold">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">Member since {new Date(user.memberSince).toLocaleDateString()}</div>
          </div>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            store.updateProfile(form);
            toast.success("Profile updated");
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={user.email} disabled /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Institution</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
          </div>
          <Button type="submit" className="bg-eco-gradient text-eco-foreground">Save changes</Button>
        </form>
      </div>
    </PageContainer>
  );
}
