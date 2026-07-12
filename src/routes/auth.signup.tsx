import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { store } from "@/lib/mock-store";
import { toast } from "sonner";
import { AuthLayout, Field, SocialDivider } from "./auth.login";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create Account — Eco-Recovery Hub" }] }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"Individual" | "Institutional">("Individual");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    location: "",
    password: "",
    confirm: "",
    
    // Institutional fields
    orgName: "",
    orgType: "University",
    orgLocation: "",
    contactPerson: "",
    orgEmail: "",
    orgPhone: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return toast.error("Passwords do not match.");
    
    try {
      if (accountType === "Individual") {
        store.signUp({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          institution: form.institution || "None",
          location: form.location,
          password: form.password,
          accountType: "Individual",
        });
      } else {
        store.signUp({
          fullName: form.contactPerson, // Principal identifier
          email: form.orgEmail,
          phone: form.orgPhone,
          institution: form.orgName,
          location: form.orgLocation,
          password: form.password,
          accountType: "Institutional",
          orgName: form.orgName,
          orgType: form.orgType,
          orgLocation: form.orgLocation,
          contactPerson: form.contactPerson,
          orgEmail: form.orgEmail,
          orgPhone: form.orgPhone,
        });
      }
      toast.success("Account created — welcome to Eco-Recovery-Hub!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start your recovery journey across Ghana’s recycling sectors.">
      <form onSubmit={submit} className="space-y-4">
        {/* Account Type Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Account Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType("Individual")}
              className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                accountType === "Individual"
                  ? "bg-eco-gradient text-eco-foreground border-transparent font-semibold shadow-sm"
                  : "bg-background border-input hover:bg-muted text-muted-foreground"
              }`}
            >
              👤 Individual
            </button>
            <button
              type="button"
              onClick={() => setAccountType("Institutional")}
              className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                accountType === "Institutional"
                  ? "bg-eco-gradient text-eco-foreground border-transparent font-semibold shadow-sm"
                  : "bg-background border-input hover:bg-muted text-muted-foreground"
              }`}
            >
              🏫 Institutional
            </button>
          </div>
        </div>

        {accountType === "Individual" ? (
          <>
            <Field label="Full Name"><Input required value={form.fullName} onChange={set("fullName")} placeholder="Afia Mensah" /></Field>
            <Field label="Email Address"><Input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" /></Field>
            <Field label="Phone Number"><Input type="tel" required value={form.phone} onChange={set("phone")} placeholder="+233 20 000 0000" /></Field>
            <Field label="Affiliated Institution (Optional)"><Input value={form.institution} onChange={set("institution")} placeholder="e.g. University of Ghana" /></Field>
            <Field label="Location"><Input required value={form.location} onChange={set("location")} placeholder="e.g. Accra" /></Field>
          </>
        ) : (
          <>
            <Field label="Organization Name"><Input required value={form.orgName} onChange={set("orgName")} placeholder="e.g. Koforidua Technical University" /></Field>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Organization Type</label>
              <select
                required
                value={form.orgType}
                onChange={set("orgType")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

            <Field label="Organization Location"><Input required value={form.orgLocation} onChange={set("orgLocation")} placeholder="e.g. Koforidua" /></Field>
            <Field label="Contact Person"><Input required value={form.contactPerson} onChange={set("contactPerson")} placeholder="e.g. Prof. John Doe" /></Field>
            <Field label="Organization Email"><Input type="email" required value={form.orgEmail} onChange={set("orgEmail")} placeholder="sustainability@ktu.edu.gh" /></Field>
            <Field label="Organization Phone Number"><Input type="tel" required value={form.orgPhone} onChange={set("orgPhone")} placeholder="+233 24 000 0000" /></Field>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Password"><Input type="password" required value={form.password} onChange={set("password")} /></Field>
          <Field label="Confirm"><Input type="password" required value={form.confirm} onChange={set("confirm")} /></Field>
        </div>
        <Button type="submit" className="w-full bg-eco-gradient text-eco-foreground">Create Account</Button>
        <div className="text-center text-sm text-muted-foreground">
          Already a member? <Link to="/auth/login" className="text-leaf font-medium hover:underline">Sign in</Link>
        </div>
        <SocialDivider />
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled>Google</Button>
          <Button type="button" variant="outline" disabled>Microsoft</Button>
        </div>
      </form>
    </AuthLayout>
  );
}
