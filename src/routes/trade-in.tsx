import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout";
import { tradeInPrices } from "@/lib/mock-data";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Coins } from "lucide-react";

export const Route = createFileRoute("/trade-in")({
  head: () => ({ meta: [{ title: "Trade-In Estimator — Eco Recovery Hub" }] }),
  component: TradeIn,
});

function TradeIn() {
  const types = Object.keys(tradeInPrices);
  const [type, setType] = useState(types[0]);
  const [condition, setCondition] = useState([70]);
  const range = tradeInPrices[type];
  const estimate = Math.round(range.low + ((range.high - range.low) * condition[0]) / 100);

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-eco-soft"><Coins className="h-5 w-5 text-leaf" /></div>
          <div>
            <h1 className="font-display text-4xl font-bold">Trade-In Estimator</h1>
            <p className="text-muted-foreground">Get an instant cash estimate for your device.</p>
          </div>
        </div>

        <div className="mt-8 surface-card p-6 space-y-6">
          <div>
            <Label>Device type</Label>
            <select className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between">
              <Label>Condition</Label>
              <span className="text-sm text-muted-foreground">{condition[0]}%</span>
            </div>
            <Slider value={condition} onValueChange={setCondition} max={100} step={5} className="mt-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Broken</span><span>Like new</span></div>
          </div>

          <div className="rounded-xl bg-eco-gradient p-6 text-eco-foreground text-center glow-eco">
            <div className="text-sm opacity-80">Estimated trade-in value</div>
            <div className="font-display text-5xl font-bold mt-1">₦{estimate.toLocaleString()}</div>
            <div className="mt-2 text-xs opacity-80">Range: ₦{range.low.toLocaleString()} – ₦{range.high.toLocaleString()}</div>
          </div>

          <p className="text-xs text-muted-foreground text-center">Estimates only. Final value confirmed after inspection at a certified center.</p>
        </div>
      </div>
    </PageContainer>
  );
}
