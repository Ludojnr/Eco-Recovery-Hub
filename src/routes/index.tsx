import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Scan,
  MapPin,
  ArrowRight,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Upload,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sectors } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eco-Recovery Hub — Multi-Sector Recycling & Recovery" },
      { name: "description", content: "A smart multi-sector recovery platform. Upload materials, get AI classification across e-waste, plastic, metal, glass, paper & textiles, schedule pickup, and track your impact." },
      { property: "og:title", content: "Eco-Recovery Hub — Multi-Sector Recycling & Recovery" },
      { property: "og:description", content: "Identify, sort, upload and recover recyclable materials across six sectors with AI-assisted guidance." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-eco/10 blur-3xl" />
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-leaf/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-6 pt-16 pb-16 lg:pt-24 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered multi-sector recovery
              </div>
              <h1 className="mt-5 font-display text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Recover more than electronics.{" "}
                <span className="text-gradient-eco">Every material has a second life.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                Eco-Recovery Hub is a multi-sector sustainability platform. Upload or scan your materials, our AI
                identifies the sector, and we guide you through the right recycling path — from e-waste to textiles.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-eco-gradient text-eco-foreground hover:opacity-90 glow-eco">
                  <Link to="/auth/signup">Create Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/scanner"><Upload className="mr-2 h-4 w-4" />Upload &amp; Scan</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                <Stat n="6" l="Recovery sectors" />
                <Stat n="180T" l="CO₂ diverted" />
                <Stat n="96" l="Partner centers" />
              </div>
            </div>

            {/* Visual — AI scan preview */}
            <div className="relative">
              <div className="surface-card p-6 glow-eco">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-eco-soft">
                      <Scan className="h-5 w-5 text-leaf" />
                    </div>
                    <div className="font-medium">AI Scan Result</div>
                  </div>
                  <span className="text-xs rounded-full bg-eco-soft px-2 py-1 font-medium">96% match</span>
                </div>
                <div className="mt-5 aspect-video rounded-xl bg-gradient-to-br from-eco-soft via-background to-accent grid place-items-center">
                  <div className="text-center">
                    <div className="text-5xl">🧴</div>
                    <div className="mt-2 font-semibold">PET Water Bottle</div>
                    <div className="text-xs text-muted-foreground">Plastic · PET #1</div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <Row label="Sector" value="Plastic" />
                  <Row label="Handling" value="Rinse & drop-off" />
                  <Row label="CO₂ saved" value="0.3 kg" />
                </div>
                <Button asChild className="mt-5 w-full bg-eco-gradient text-eco-foreground">
                  <Link to="/scanner">Try the scanner</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-background px-3 py-1 text-xs font-medium">
              <Leaf className="h-3.5 w-3.5 text-leaf" /> Recovery Sectors
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold">Sectors we recover</h2>
            <p className="mt-3 text-muted-foreground">
              Eco-Recovery Hub goes beyond electronics. Upload or scan your material and we&apos;ll classify it
              into the right recovery stream with sector-specific handling guidance.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sectors.map((s) => (
              <Link
                key={s.id}
                to="/sectors/$sectorId"
                params={{ sectorId: s.id }}
                className="surface-card overflow-hidden hover:border-eco transition-colors text-left flex flex-col group"
              >
                {/* Photo header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                      <span>{s.icon}</span> {s.name}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <p className="text-sm text-muted-foreground">{s.short}</p>
                  <div className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Examples: </span>{s.examples}
                  </div>
                  <div className="mt-auto pt-4 inline-flex items-center text-xs font-semibold text-leaf group-hover:underline">
                    View sector details &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-eco-gradient text-eco-foreground">
              <Link to="/scanner"><Upload className="mr-2 h-4 w-4" />Upload materials to classify</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="mx-auto max-w-7xl px-4 lg:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold">A complete recovery workflow</h2>
          <p className="mt-3 text-muted-foreground">From identification to impact — everything you need to recycle responsibly.</p>
        </div>
        <div className="mt-10 grid lg:grid-cols-3 gap-4">
          <Feature icon={Scan} title="AI Scanner" body="Upload or capture images and get instant sector classification." to="/scanner" />
          <Feature icon={MapPin} title="Recycling Map" body="Find certified drop-off and collection centers near you." to="/map" />
          <Feature icon={Upload} title="Pickup Requests" body="Schedule door-to-door pickup with chain-of-custody tracking." to="/pickups" />
          <Feature icon={ShieldCheck} title="Data Security" body="Certified data destruction before device refurbishment." to="/security" />
          <Feature icon={TrendingUp} title="Impact Dashboard" body="Track your CO₂ savings, activity and personal impact." to="/dashboard" />
          <Feature icon={BookOpen} title="Education" body="Learn how to sort, prepare and recover across every sector." to="/knowledge" />
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl font-bold">Your recovery journey</h2>
            <p className="mt-3 text-muted-foreground">Nine simple steps from signup to celebrating your environmental impact.</p>
          </div>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Create Account", "Sign up in seconds."],
              ["Upload Material", "Snap or upload photos of your items."],
              ["AI Classifies", "Sector, category and confidence in one tap."],
              ["Get Handling Guide", "Sector-specific recycling instructions."],
              ["Schedule Pickup / Drop-off", "Find the nearest certified center."],
              ["Earn Eco Points", "Recovery activity converts into rewards."],
              ["Track Impact", "Watch your CO₂ savings grow."],
              ["Compete on Leaderboards", "Climb ranks with friends and orgs."],
              ["Learn & Improve", "Access the Education library."],
            ].map(([t, d], i) => (
              <li key={t} className="surface-card p-5">
                <div className="text-xs font-bold text-leaf">STEP {i + 1}</div>
                <div className="mt-1 font-display text-lg font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 lg:px-6 py-20">
        <div className="surface-card p-10 lg:p-16 bg-eco-gradient text-eco-foreground glow-eco overflow-hidden relative">
          <Leaf className="absolute -bottom-8 -right-8 h-64 w-64 opacity-10" />
          <h2 className="font-display text-4xl lg:text-5xl font-bold max-w-2xl">
            Ready to make every material part of the solution?
          </h2>
          <p className="mt-3 max-w-xl text-eco-foreground/80">
            Join households, schools and businesses recovering across six recycling sectors with Eco-Recovery Hub.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/auth/signup">Create Free Account</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-eco-foreground/30 bg-transparent text-eco-foreground hover:bg-eco-foreground/10"><Link to="/knowledge">Visit Education</Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold">{n}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
function Feature({ icon: Icon, title, body, to }: any) {
  return (
    <Link to={to} className="surface-card p-6 hover:border-eco transition-colors group">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-eco-soft">
        <Icon className="h-5 w-5 text-leaf" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 inline-flex items-center text-sm font-medium text-leaf">
        Explore <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
