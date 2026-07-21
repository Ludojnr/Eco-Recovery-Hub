import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  itemDesc: string; // user-provided description of the item
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
  // Use the e-waste category as a safe default when filename gives no hint
  const pool = matched
    ? aiDetections.filter((d) => d.sector === matched)
    : aiDetections.filter((d) => d.sector === "e-waste");
  // Pick the highest-confidence item deterministically (no random)
  return pool.reduce((best, cur) => (cur.confidence > best.confidence ? cur : best), pool[0]);
}

function Scanner() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    const created: Upload[] = arr.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url: URL.createObjectURL(file),
      scanning: true,
      itemDesc: "",
    }));
    setUploads((prev) => [...created, ...prev]);
    created.forEach((u) => {
      // Simulate analysis delay then assign deterministic classification
      setTimeout(() => {
        setUploads((prev) =>
          prev.map((p) => (p.id === u.id ? { ...p, scanning: false, result: classify(u.file) } : p))
        );
      }, 1200 + Math.random() * 600);
    });
  };

  const remove = (id: string) => {
    setUploads((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const openCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera access is not supported in this browser.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error(error);
      setCameraError("Unable to access the device camera. Please allow camera permissions or use an alternative upload method.");
    }
  };

  const closeCamera = () => {
    setCameraActive(false);
    setStream((prev) => {
      prev?.getTracks().forEach((track) => track.stop());
      return null;
    });
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.png`, { type: "image/png" });
      addFiles([file]);
      setCapturing(true);
      setTimeout(() => {
        setCapturing(false);
        closeCamera();
      }, 500);
    }, "image/png");
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Smart multi-sector classification
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold"> Material Scanner</h1>
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
            <Button variant="outline" onClick={openCamera}>
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

          {cameraError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {cameraError}
            </div>
          )}

          {cameraActive && (
            <div className="mt-4 rounded-3xl border border-border bg-background p-4">
              <div className="relative overflow-hidden rounded-3xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-center p-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="inline-flex items-center gap-2 rounded-full bg-eco-gradient px-4 py-2 text-sm font-semibold text-eco-foreground shadow-lg"
                    disabled={capturing}
                  >
                    <Camera className="h-4 w-4" />
                    {capturing ? "Capturing…" : "Snap photo"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-sm text-muted-foreground shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Point your camera at the material and tap snap. If camera access fails, use the file upload button.
              </p>
            </div>
          )}

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
                <ScanCard
                  key={u.id}
                  upload={u}
                  onRemove={() => remove(u.id)}
                  onDescChange={(desc) =>
                    setUploads((prev) =>
                      prev.map((p) => (p.id === u.id ? { ...p, itemDesc: desc } : p))
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {uploads.some((u) => u.result) && (
          <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Edit item names in the cards below before submitting.
            </p>
            <Button
              id="submit-scans-btn"
              onClick={() => {
                const scannedResults = uploads.filter((u) => u.result);
                scannedResults.forEach((u) => {
                  if (u.result) {
                    store.addScan({
                      // Use user-provided description as item name if filled in
                      item: u.itemDesc.trim() || u.result.item,
                      sector: u.result.sector,
                      category: u.result.category,
                      confidence: u.result.confidence,
                      points: u.result.points,
                      co2: u.result.co2,
                      description: u.itemDesc.trim()
                        ? `${u.itemDesc.trim()} — ${u.result.description}`
                        : u.result.description,
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

function ScanCard({
  upload,
  onRemove,
  onDescChange,
}: {
  upload: Upload;
  onRemove: () => void;
  onDescChange: (desc: string) => void;
}) {
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
            <div className="mt-2 font-display text-base font-semibold">{r.item}</div>
            <div className="text-xs text-muted-foreground">{r.category}</div>
            {/* User-editable item name */}
            <div className="mt-3">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">What is this item? (optional)</label>
              <input
                type="text"
                value={upload.itemDesc}
                onChange={(e) => onDescChange(e.target.value)}
                placeholder={r.item}
                className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
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
