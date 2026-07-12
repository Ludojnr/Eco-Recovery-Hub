import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { aiDetections, sectors, type SectorId } from "@/lib/mock-data";
import { Upload, Sparkles, Camera, RotateCw, X, ImagePlus, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/lib/mock-store";

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "AI Scanner — Eco-Recovery Hub" }] }),
  component: Scanner,
});

type Upload = {
  id: string;
  file: File;
  url: string;
  result?: (typeof aiDetections)[number];
  scanning: boolean;
};

function classify(file: File): (typeof aiDetections)[number] {
  const name = file.name.toLowerCase();
  const map: [RegExp, SectorId][] = [
    [/bottle|pet|plastic/, "plastic"],
    [/can|metal|alum|steel|tin/, "metal"],
    [/glass|jar/, "glass"],
    [/cardboard|paper|carton|box/, "paper-cardboard"],
    [/shirt|shoe|cloth|fabric|leather|textile/, "textile"],
    [/phone|laptop|board|cable|charger|tv|battery|electronic/, "e-waste"],
  ];
  const matched = map.find(([re]) => re.test(name))?.[1];
  const pool = matched ? aiDetections.filter((d) => d.sector === matched) : aiDetections;
  return pool[Math.floor(Math.random() * pool.length)];
}

function Scanner() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    const created: Upload[] = arr.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url: URL.createObjectURL(file),
      scanning: true,
    }));
    setUploads((prev) => [...created, ...prev]);
    created.forEach((u) => {
      setTimeout(() => {
        setUploads((prev) => prev.map((p) => (p.id === u.id ? { ...p, scanning: false, result: classify(u.file) } : p)));
      }, 1400 + Math.random() * 800);
    });
  };

  const remove = (id: string) => {
    setUploads((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Smart multi-sector classification
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold">AI Material Scanner</h1>
          <p className="mt-2 text-muted-foreground">
            Upload one or more images of your materials or devices. Our AI classifies each item across e-waste, plastic, metal, glass, paper &amp; cardboard, and textiles.
          </p>
        </div>

        {/* Facebook-style composer */}
        <div
          className={`mt-8 surface-card p-4 transition-colors ${dragOver ? "border-eco bg-eco-soft/40" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => fileInput.current?.click()} className="bg-eco-gradient text-eco-foreground">
              <ImagePlus className="mr-2 h-4 w-4" />Add photos
            </Button>
            <Button variant="outline" onClick={() => cameraInput.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />Use camera
            </Button>
            <span className="text-xs text-muted-foreground ml-1">or drag &amp; drop images here</span>
            {uploads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => { uploads.forEach((u) => URL.revokeObjectURL(u.url)); setUploads([]); }}
              >
                Clear all
              </Button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }}
          />
          <input
            ref={cameraInput}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }}
          />

          {uploads.length === 0 ? (
            <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-border py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-eco-soft">
                <ScanLine className="h-7 w-7 text-leaf" />
              </div>
              <div className="mt-3 font-medium">Drop images to scan</div>
              <div className="text-xs text-muted-foreground">PNG, JPG · multiple files supported</div>
            </div>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploads.map((u) => (
                <ScanCard key={u.id} upload={u} onRemove={() => remove(u.id)} />
              ))}
            </div>
          )}
        </div>

        {uploads.some((u) => u.result) && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                const scannedResults = uploads.filter((u) => u.result);
                scannedResults.forEach((u) => {
                  if (u.result) {
                    store.addScan({
                      item: u.result.item,
                      sector: u.result.sector,
                      category: u.result.category,
                      confidence: u.result.confidence,
                      points: u.result.points,
                      co2: u.result.co2,
                      description: u.result.description,
                      handling: u.result.handling,
                      imageUrl: u.url,
                    });
                  }
                });
                toast.success(`${scannedResults.length} item(s) submitted for administrator approval!`);
                setUploads([]);
              }}
              className="bg-eco-gradient text-eco-foreground"
            >
              Submit for recovery
            </Button>
          </div>
        )}

        {/* Sector reference */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Sectors we recover</h2>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectors.map((s) => (
              <div key={s.id} className="surface-card p-4">
                <div className="text-2xl">{s.icon}</div>
                <div className="mt-1 font-display text-lg font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function ScanCard({ upload, onRemove }: { upload: Upload; onRemove: () => void }) {
  const r = upload.result;
  const sector = r ? sectors.find((s) => s.id === r.sector) : null;
  return (
    <div className="surface-card overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <img src={upload.url} alt="uploaded" className="h-full w-full object-cover" />
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 hover:bg-background shadow"
        >
          <X className="h-4 w-4" />
        </button>
        {upload.scanning && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
            <div className="text-center">
              <RotateCw className="mx-auto h-6 w-6 animate-spin text-leaf" />
              <div className="mt-2 text-xs font-medium">Analyzing…</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {r && sector ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-eco-soft px-2 py-1 text-[11px] font-medium text-leaf">
                {sector.icon} {sector.name}
              </span>
              <span className="text-[11px] rounded-full bg-muted px-2 py-1 font-medium">{Math.round(r.confidence * 100)}% match</span>
            </div>
            <div className="mt-2 font-display text-lg font-semibold">{r.item}</div>
            <div className="text-xs text-muted-foreground">{r.category}</div>
            <p className="mt-2 text-sm">{r.description}</p>
            <div className="mt-3 rounded-lg bg-muted p-3 text-xs">
              <div className="font-semibold mb-0.5">Handling</div>
              <p className="text-muted-foreground">{r.handling}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border p-2">
                <div className="text-[10px] uppercase text-muted-foreground">Points</div>
                <div className="font-semibold">+{r.points}</div>
              </div>
              <div className="rounded-lg border border-border p-2">
                <div className="text-[10px] uppercase text-muted-foreground">CO₂ saved</div>
                <div className="font-semibold">{r.co2} kg</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" className="flex-1 bg-eco-gradient text-eco-foreground"><Link to="/pickups">Schedule pickup</Link></Button>
              <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/map">Find center</Link></Button>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Waiting for AI classification…</div>
        )}
      </div>
    </div>
  );
}
