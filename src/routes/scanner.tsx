import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { aiDetections } from "@/lib/mock-data";
import { Upload, Sparkles, Camera, RotateCw } from "lucide-react";

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "AI Scanner — EcoRecovery" }] }),
  component: Scanner,
});

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<(typeof aiDetections)[number] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFile = (f?: File) => {
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setScanning(true);
    setTimeout(() => {
      setResult(aiDetections[Math.floor(Math.random() * aiDetections.length)]);
      setScanning(false);
    }, 1600);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Powered by computer vision
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold">AI E-Waste Scanner</h1>
          <p className="mt-2 text-muted-foreground">Upload or capture a photo. We'll identify the device, estimate its recovery value, and recommend disposal.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <label className="surface-card aspect-square grid place-items-center cursor-pointer hover:border-eco transition-colors overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center px-6">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-eco-soft">
                  <Camera className="h-7 w-7 text-leaf" />
                </div>
                <div className="mt-4 font-medium">Click to upload or capture</div>
                <div className="text-xs text-muted-foreground">PNG, JPG up to 10MB</div>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>

          <div className="surface-card p-6">
            {scanning && (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <RotateCw className="mx-auto h-8 w-8 animate-spin text-leaf" />
                  <div className="mt-3 font-medium">Analyzing image…</div>
                  <div className="text-xs text-muted-foreground">Running on EcoRecovery AI</div>
                </div>
              </div>
            )}
            {!scanning && !result && (
              <div className="grid h-full place-items-center text-center text-muted-foreground">
                <div>
                  <Upload className="mx-auto h-10 w-10" />
                  <p className="mt-3">Upload an image to see AI results here.</p>
                </div>
              </div>
            )}
            {!scanning && result && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wider text-leaf">{result.category}</div>
                  <span className="text-xs rounded-full bg-eco-soft px-2 py-1 font-medium">{Math.round(result.confidence * 100)}% match</span>
                </div>
                <div className="mt-3 font-display text-2xl font-bold">{result.device}</div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Metric label="Points" value={`+${result.points}`} />
                  <Metric label="CO₂ saved" value={`${result.co2} kg`} />
                </div>

                <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
                  <div className="font-semibold mb-1">Disposal recommendation</div>
                  <p className="text-muted-foreground">{result.recommendation}</p>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button asChild className="flex-1 bg-eco-gradient text-eco-foreground"><Link to="/pickups">Schedule Pickup</Link></Button>
                  <Button asChild variant="outline" className="flex-1"><Link to="/map">Find Center</Link></Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold">{value}</div>
    </div>
  );
}
