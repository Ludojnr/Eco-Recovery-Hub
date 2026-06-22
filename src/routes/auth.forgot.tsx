import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthLayout, Field } from "./auth.login";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Reset Password — EcoRecovery" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a secure reset link.">
      {sent ? (
        <div className="rounded-lg bg-eco-soft p-4 text-sm">
          A reset link has been sent to <b>{email}</b>. Check your inbox.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Reset link sent (demo)");
          }}
          className="space-y-4"
        >
          <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Button className="w-full bg-eco-gradient text-eco-foreground">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}
