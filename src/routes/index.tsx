import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Recycle,
  Scan,
  MapPin,
  Award,
  ArrowRight,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoRecovery — Smart E-Waste Management & Circular Economy" },
      { name: "description", content: "Upload e-waste, get AI disposal recommendations, schedule pickups, earn eco points, and track your environmental impact." },
      { property: "og:title", content: "EcoRecovery — Smart E-Waste Management" },
      { property: "og:description", content: "A circular economy platform for responsible electronic waste recovery." },
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
        <div className="mx-auto max-w-7xl px-4 lg:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered e-waste platform
              </div>
              <h1 className="mt-5 font-display text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                Turn old electronics into{" "}
                <span className="text-gradient-eco">a greener tomorrow</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                EcoRecovery is a smart electronic waste management and circular economy platform.
                Upload your e-waste, let AI identify it, schedule pickup, and earn eco points
                while we track your environmental impact.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-eco-gradient text-eco-foreground hover:opacity-90 glow-eco">
                  <Link to="/auth/signup">Create Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/scanner">Try the AI Scanner</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                <Stat n="42K+" l="Devices recycled" />
                <Stat n="180T" l="CO₂ saved" />
                <Stat n="96" l="Centers" />
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="surface-card p-6 glow-eco">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-eco-soft">
                      <Scan className="h-5 w-5 text-leaf" />
                    </div>
                    <div className="font-medium">AI Scan Result</div>
                  </div>
                  <span className="text-xs rounded-full bg-eco-soft px-2 py-1 font-medium">94% match</span>
                </div>
                <div className="mt-5 aspect-video rounded-xl bg-gradient-to-br from-eco-soft via-background to-accent grid place-items-center">
                  <div className="text-center">
                    <div className="text-5xl">📱</div>
                    <div className="mt-2 font-semibold">iPhone 12 (est.)</div>
                    <div className="text-xs text-muted-foreground">Mobile Device · High recovery value</div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <Row label="Estimated points" value="+260" />
                  <Row label="CO₂ saved" value="8.4 kg" />
                  <Row label="Recommendation" value="Trade-in" />
                </div>
                <Button asChild className="mt-5 w-full bg-eco-gradient text-eco-foreground">
                  <Link to="/pickups">Schedule Pickup</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl font-bold">The user journey</h2>
            <p className="mt-3 text-muted-foreground">From signup to celebrating impact — every action is tracked to your account.</p>
          </div>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Create Account", "Sign up in seconds."],
              ["Upload E-Waste", "Snap a photo of your device."],
              ["AI Identifies Waste", "Instant classification + safety notes."],
              ["Get Disposal Recommendation", "Trade-in, drop-off, or hazardous handling."],
              ["Schedule Pickup or Drop-off", "Find the nearest certified center."],
              ["Earn Eco Points", "Convert recycling into rewards."],
              ["Track Environmental Impact", "Watch your CO₂ savings grow."],
              ["Compete on Leaderboards", "Climb ranks with friends and orgs."],
              ["Access Educational Resources", "Learn the why behind the how."],
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

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 lg:px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-4">
          <Feature icon={Scan} title="AI Scanner" body="Computer-vision identifies devices, hazards, and recovery value." to="/scanner" />
          <Feature icon={MapPin} title="Recycling Map" body="Find certified collection centers near you." to="/map" />
          <Feature icon={Recycle} title="Pickup Requests" body="Door-to-door pickup with chain-of-custody tracking." to="/pickups" />
          <Feature icon={Award} title="Rewards & Badges" body="Earn airtime, vouchers, and tree-planting rewards." to="/rewards" />
          <Feature icon={ShieldCheck} title="Data Security" body="Certified data destruction before refurbishment." to="/security" />
          <Feature icon={TrendingUp} title="Impact Dashboard" body="See your CO₂ savings, rank, and history." to="/dashboard" />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 lg:px-6 pb-20">
        <div className="surface-card p-10 lg:p-16 bg-eco-gradient text-eco-foreground glow-eco overflow-hidden relative">
          <Leaf className="absolute -bottom-8 -right-8 h-64 w-64 opacity-10" />
          <h2 className="font-display text-4xl lg:text-5xl font-bold max-w-2xl">
            Ready to make your electronics part of the solution?
          </h2>
          <p className="mt-3 max-w-xl text-eco-foreground/80">
            Join thousands of households, schools, and businesses keeping toxic e-waste out of landfills.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/auth/signup">Create Free Account</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-eco-foreground/30 bg-transparent text-eco-foreground hover:bg-eco-foreground/10"><Link to="/knowledge">Learn More</Link></Button>
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
