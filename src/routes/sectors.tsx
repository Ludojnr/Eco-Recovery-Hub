import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout";
import { sectors } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Shield } from "lucide-react";

export const Route = createFileRoute("/sectors")({
  head: () => ({ meta: [{ title: "Recovery Sectors — Eco-Recovery Hub" }] }),
  component: SectorsList,
});

function SectorsList() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-semibold text-leaf">
          <Leaf className="h-3.5 w-3.5" />
          Multi-Sector Recovery Directory
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Explore Our <span className="text-gradient-eco">Recovery Streams</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Eco-Recovery Hub handles six primary recycling sectors. Learn how each material is classified by our AI system and routed to certified collection centers.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {sectors.map((s) => (
          <div
            key={s.id}
            className="surface-card overflow-hidden hover:border-eco transition-all duration-300 flex flex-col group hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            {/* Sector Image Header */}
            <div className="relative h-48 overflow-hidden bg-muted">
              <img
                src={s.photo}
                alt={s.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-xl text-white">
                  {s.icon}
                </span>
                <h3 className="font-display font-bold text-lg text-white drop-shadow-sm">
                  {s.name}
                </h3>
              </div>
            </div>

            {/* Sector Content */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.short}
                </p>
                <div className="rounded-xl bg-muted/50 border border-border p-3.5 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground mb-1">Common Items:</div>
                  {s.examples}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-leaf" /> Certified Handling
                </span>
                <Button asChild size="sm" variant="ghost" className="text-leaf hover:text-leaf hover:bg-eco-soft group-hover:translate-x-0.5 transition-transform">
                  <Link to="/sectors/$sectorId" params={{ sectorId: s.id }}>
                    Guide <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Callout */}
      <div className="mt-16 max-w-3xl mx-auto rounded-2xl bg-eco-soft/30 border border-eco/20 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-eco-gradient shadow-[0_0_15px_rgba(167,217,48,0.2)]">
          <Leaf className="h-6 w-6 text-eco-foreground" />
        </span>
        <div>
          <h4 className="font-display font-bold text-lg">Not sure where your material belongs?</h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            Use our AI scanner to take a picture of your material and get instant sector identification, instructions, and reward estimates.
          </p>
        </div>
        <Button asChild className="shrink-0 bg-eco-gradient text-eco-foreground hover:opacity-90 mt-3 sm:mt-0">
          <Link to="/scanner">Launch AI Scanner</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
