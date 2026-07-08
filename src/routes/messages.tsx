import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { messages } from "@/lib/mock-data";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Eco Recovery Hub" }] }),
  component: () => <RequireUser><Msgs /></RequireUser>,
});

function Msgs() {
  const [active, setActive] = useState(messages[0]);
  const [draft, setDraft] = useState("");
  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">Messages</h1>
      <p className="mt-1 text-muted-foreground">Direct messaging with collection centers, admins, and support.</p>

      <div className="mt-6 grid md:grid-cols-[320px_1fr] gap-4 surface-card overflow-hidden min-h-[500px]">
        <div className="border-r border-border">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className={`w-full text-left flex items-center gap-3 p-4 border-b border-border last:border-0 ${active.id === m.id ? "bg-eco-soft/40" : "hover:bg-muted"}`}
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-eco-gradient text-eco-foreground font-bold">{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold truncate">{m.from}</div>
                  <div className="text-xs text-muted-foreground">{m.time}</div>
                </div>
                <div className="text-sm text-muted-foreground truncate">{m.preview}</div>
              </div>
              {m.unread > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-eco text-eco-foreground text-xs font-bold">{m.unread}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-eco-gradient text-eco-foreground font-bold">{active.avatar}</div>
            <div className="font-semibold">{active.from}</div>
          </div>
          <div className="flex-1 p-6 space-y-3">
            <Bubble side="them">{active.preview}</Bubble>
            <Bubble side="me">Thanks for the update!</Bubble>
          </div>
          <form
            className="p-3 border-t border-border flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setDraft("");
            }}
          >
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" />
            <Button type="submit" className="bg-eco-gradient text-eco-foreground"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

function Bubble({ side, children }: { side: "me" | "them"; children: React.ReactNode }) {
  return (
    <div className={`flex ${side === "me" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${side === "me" ? "bg-eco-gradient text-eco-foreground" : "bg-muted"}`}>{children}</div>
    </div>
  );
}
