import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout";
import { centers } from "@/lib/mock-data";
import { MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Recycling Map — Eco-Recovery Hub" }] }),
  component: MapView,
});

function MapView() {
  const [q, setQ] = useState("");
  const filtered = centers.filter((c) => `${c.name} ${c.address}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <PageContainer>
      <h1 className="font-display text-4xl font-bold">Recycling Map</h1>
      <p className="mt-2 text-muted-foreground">Certified collection centers and drop-off points.</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_2fr] gap-6">
        <div>
          <Input placeholder="Search by city or name…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-4 space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="surface-card p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-eco-soft shrink-0">
                    <MapPin className="h-5 w-5 text-leaf" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.address}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.accepts.map((a) => (
                        <span key={a} className="rounded-full bg-muted px-2 py-0.5 text-xs">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-right shrink-0">
                    <div className="font-semibold">{c.distance}</div>
                    <Button size="sm" variant="ghost" className="mt-1 h-7 px-2"><Navigation className="h-3.5 w-3.5 mr-1" />Go</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card overflow-hidden relative min-h-[500px]">
          {/* Faux map */}
          <div className="absolute inset-0 bg-gradient-to-br from-eco-soft via-background to-accent">
            <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 400" preserveAspectRatio="none">
              <defs>
                <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#g)" />
              <path d="M30 200 Q150 100 250 220 T380 180" stroke="currentColor" fill="none" strokeWidth="2" />
              <path d="M50 320 Q200 280 350 340" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
          </div>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="absolute"
              style={{ left: `${15 + i * 18}%`, top: `${25 + (i % 3) * 22}%` }}
            >
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-eco/30 animate-ping" />
                <div className="relative grid h-9 w-9 place-items-center rounded-full bg-eco-gradient glow-eco">
                  <MapPin className="h-4 w-4 text-eco-foreground" />
                </div>
                <div className="mt-1 -translate-x-1/2 left-1/2 absolute whitespace-nowrap rounded-md bg-card border border-border px-2 py-1 text-xs font-medium shadow">
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
