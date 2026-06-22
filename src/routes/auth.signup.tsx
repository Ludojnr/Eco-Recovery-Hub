import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { store } from "@/lib/mock-store";
import { toast } from "sonner";
import { AuthLayout, Field, SocialDivider } from "./auth.login";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create Account — EcoRecovery" }] }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    password: "",
    confirm: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return toast.error("Passwords do not match.");
    try {
      store.signUp({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        institution: form.institution,
        password: form.password,
      });
      toast.success("Account created — welcome to EcoRecovery!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your e-waste impact today.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full Name"><Input required value={form.fullName} onChange={set("fullName")} placeholder="Ada Okafor" /></Field>
        <Field label="Email Address"><Input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" /></Field>
        <Field label="Phone Number"><Input type="tel" required value={form.phone} onChange={set("phone")} placeholder="+234 800 000 0000" /></Field>
        <Field label="Institution / Organization"><Input required value={form.institution} onChange={set("institution")} placeholder="University of Lagos" /></Field>
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
