import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi, setToken } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Login — Eco-Recovery Hub" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      setToken(token);
      localStorage.setItem("eco-recovery-hub-user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.role === "Admin") {
        navigate({ to: "/admin-dashboard" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your recycling journey.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
        <Field label="Password"><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Remember me
          </label>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-eco-gradient text-eco-foreground">{loading ? "Signing in…" : "Sign in"}</Button>
        <div className="text-center text-sm text-muted-foreground">
          No account? <Link to="/auth/signup" className="text-leaf font-medium hover:underline">Create one</Link>
        </div>

        <SocialDivider />
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled>Google</Button>
          <Button type="button" variant="outline" disabled>Microsoft</Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">Feature coming soon</p>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:py-16">
      <div className="surface-card p-8">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-eco-gradient"><Leaf className="h-5 w-5 text-eco-foreground" /></div>
          <span className="font-display font-bold">Eco-Recovery Hub</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

export function SocialDivider() {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div>
    </div>
  );
}
