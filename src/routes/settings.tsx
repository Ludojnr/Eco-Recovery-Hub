import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, User, Landmark, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Eco-Recovery Hub" }] }),
  component: () => <RequireUser><Settings /></RequireUser>,
});

function Settings() {
  const user = useUser()!;
  
  // Individual fields form state
  const [indForm, setIndForm] = useState({
    fullName: user.fullName,
    phone: user.phone,
    institution: user.institution,
    location: user.location,
  });

  // Institutional fields form state
  const [instForm, setInstForm] = useState({
    orgName: user.orgName || user.institution || "",
    orgType: user.orgType || "University",
    orgLocation: user.orgLocation || user.location || "",
    contactPerson: user.contactPerson || user.fullName || "",
    orgEmail: user.orgEmail || user.email || "",
    orgPhone: user.orgPhone || user.phone || "",
  });

  const handleIndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({
      fullName: indForm.fullName,
      phone: indForm.phone,
      institution: indForm.institution,
      location: indForm.location,
    });
    toast.success("Profile settings updated!");
  };

  const handleInstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({
      fullName: instForm.contactPerson, // Contact person mapped to fullName
      phone: instForm.orgPhone,
      institution: instForm.orgName,
      location: instForm.orgLocation,
      orgName: instForm.orgName,
      orgType: instForm.orgType,
      orgLocation: instForm.orgLocation,
      contactPerson: instForm.contactPerson,
      orgEmail: instForm.orgEmail,
      orgPhone: instForm.orgPhone,
    });
    toast.success("Institutional organization profile updated!");
  };

  const isInst = user.accountType === "Institutional";

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information, classification details, and sandbox roles.</p>
        </div>

        {/* User Card */}
        <div className="surface-card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-eco-gradient text-eco-foreground text-2xl font-bold shrink-0 shadow-sm">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-xl font-bold flex flex-wrap justify-center sm:justify-start items-center gap-2">
              {user.fullName}
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                isInst ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {user.accountType}
              </span>
            </h2>
            <div className="text-xs text-muted-foreground mt-1">Role: <span className="font-semibold text-foreground uppercase">{user.role}</span> · Registered since {new Date(user.memberSince).toLocaleDateString()}</div>
          </div>
        </div>



        {/* Form Panel */}
        <div className="surface-card p-6">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2 mb-6">
            {isInst ? <Landmark className="h-5 w-5 text-leaf" /> : <User className="h-5 w-5 text-leaf" />}
            {isInst ? "Institutional Profile Details" : "Personal Profile Details"}
          </h3>

          {!isInst ? (
            /* Individual settings form */
            <form className="space-y-4" onSubmit={handleIndSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={indForm.fullName} onChange={(e) => setIndForm({ ...indForm, fullName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email (Non-editable)</Label>
                  <Input value={user.email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input value={indForm.phone} onChange={(e) => setIndForm({ ...indForm, phone: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Affiliated Institution / School</Label>
                  <Input value={indForm.institution} onChange={(e) => setIndForm({ ...indForm, institution: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>General Location / Area</Label>
                  <Input value={indForm.location} onChange={(e) => setIndForm({ ...indForm, location: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="bg-eco-gradient text-eco-foreground">Save Changes</Button>
            </form>
          ) : (
            /* Institutional settings form */
            <form className="space-y-4" onSubmit={handleInstSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Organization Name</Label>
                  <Input value={instForm.orgName} onChange={(e) => setInstForm({ ...instForm, orgName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization Type</Label>
                  <select
                    value={instForm.orgType}
                    onChange={(e) => setInstForm({ ...instForm, orgType: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="University">University</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Company">Company</option>
                    <option value="NGO">NGO (Non-Governmental Org)</option>
                    <option value="Government Agency">Government Agency</option>
                    <option value="Environmental Organization">Environmental Organization</option>
                    <option value="Corporate Recycling Partner">Corporate Recycling Partner</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Person Name</Label>
                  <Input value={instForm.contactPerson} onChange={(e) => setInstForm({ ...instForm, contactPerson: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Registration Email (Non-editable)</Label>
                  <Input value={user.email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization Email</Label>
                  <Input type="email" value={instForm.orgEmail} onChange={(e) => setInstForm({ ...instForm, orgEmail: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization Phone Number</Label>
                  <Input value={instForm.orgPhone} onChange={(e) => setInstForm({ ...instForm, orgPhone: e.target.value })} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Campus / Office Location Address</Label>
                  <Input value={instForm.orgLocation} onChange={(e) => setInstForm({ ...instForm, orgLocation: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="bg-eco-gradient text-eco-foreground">Save Organization Profile</Button>
            </form>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
