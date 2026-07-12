import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { sectors, sectorMaterials, aiDetections, type SectorId } from "@/lib/mock-data";
import { store, useUser } from "@/lib/mock-store";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  Truck,
  MapPin,
  RotateCw,
  X,
  Plus,
  Info
} from "lucide-react";

export const Route = createFileRoute("/sectors/$sectorId")({
  head: ({ params }) => {
    const s = sectors.find((sec) => sec.id === params.sectorId);
    return {
      meta: [{ title: `${s?.name || "Sector"} Details — Eco-Recovery Hub` }],
    };
  },
  component: () => (
    <RequireUser>
      <SectorDetail />
    </RequireUser>
  ),
});

type UploadState = {
  id: string;
  file: File;
  url: string;
  scanning: boolean;
  result?: (typeof aiDetections)[number];
};

function SectorDetail() {
  const { sectorId } = Route.useParams();
  const navigate = useNavigate();
  const user = useUser()!;
  
  const sector = sectors.find((s) => s.id === sectorId);
  const materials = sectorMaterials.filter((m) => m.sector === sectorId);

  const [activeUpload, setActiveUpload] = useState<UploadState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  if (!sector) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Sector not found</h2>
          <Button asChild className="mt-4"><Link to="/">Back to Home</Link></Button>
        </div>
      </PageContainer>
    );
  }

  // Simulated AI classification restricted to this sector
  const handleClassify = (file: File) => {
    const name = file.name.toLowerCase();
    
    // Custom filter pool for this sector
    const pool = aiDetections.filter((d) => d.sector === sectorId);
    const finalPool = pool.length > 0 ? pool : aiDetections;
    
    // Choose result
    const result = finalPool[Math.floor(Math.random() * finalPool.length)];

    const id = `${Date.now()}`;
    const url = URL.createObjectURL(file);

    setActiveUpload({
      id,
      file,
      url,
      scanning: true,
    });

    setTimeout(() => {
      setActiveUpload((prev) => (prev ? { ...prev, scanning: false, result } : null));
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleClassify(e.target.files[0]);
    }
  };

  const handleSubmitForRecovery = () => {
    if (!activeUpload?.result) return;
    
    store.addScan({
      item: activeUpload.result.item,
      sector: activeUpload.result.sector,
      category: activeUpload.result.category,
      confidence: activeUpload.result.confidence,
      points: activeUpload.result.points,
      co2: activeUpload.result.co2,
      description: activeUpload.result.description,
      handling: activeUpload.result.handling,
      imageUrl: activeUpload.url,
    });

    toast.success(`Successfully submitted ${activeUpload.result.item} for recovery!`);
    setActiveUpload(null);
    navigate({ to: "/dashboard" });
  };

  // Sector-specific visual content for "textile"
  const isTextile = sectorId === "textile";

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-leaf hover:underline gap-1 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Sectors
        </Link>

        {/* Hero Header */}
        <div className="surface-card p-6 md:p-8 bg-gradient-to-br from-eco-soft/40 to-background border-eco/20 glow-eco rounded-2xl">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-eco-gradient text-4xl shadow-md shrink-0">
              {sector.icon}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{sector.name}</h1>
              <p className="mt-2 text-muted-foreground text-base max-w-3xl">{sector.detail}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Actions & Accepted Materials */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action 1: Upload & Scan */}
            <div className="surface-card p-6">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-leaf animate-pulse" />
                AI-Assisted Material Scan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload or capture an image of your {sector.name.toLowerCase()} material to get instantly classified.
              </p>

              {/* Upload area */}
              {!activeUpload ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleClassify(e.dataTransfer.files[0]); }}
                  className={`mt-4 border border-dashed rounded-xl py-10 text-center transition-all ${
                    dragOver ? "border-leaf bg-eco-soft/20 scale-[0.99]" : "border-border hover:border-eco bg-muted/20"
                  }`}
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <div className="mt-3 text-sm font-medium">Drag and drop your image here</div>
                  <div className="text-xs text-muted-foreground mt-1">PNG, JPG, or WEBP files</div>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button size="sm" onClick={() => fileInput.current?.click()} className="bg-eco-gradient text-eco-foreground">
                      Browse Files
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => cameraInput.current?.click()}>
                      <Camera className="h-4 w-4 mr-1" /> Camera
                    </Button>
                  </div>
                  <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="mt-4 border rounded-xl overflow-hidden bg-muted/10">
                  <div className="relative aspect-video bg-black/5 flex items-center justify-center">
                    <img src={activeUpload.url} alt="To scan" className="h-full w-full object-contain" />
                    {activeUpload.scanning && (
                      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm grid place-items-center">
                        <div className="text-center">
                          <RotateCw className="h-8 w-8 animate-spin text-leaf mx-auto" />
                          <p className="mt-2 text-sm font-medium">AI Analyzing Material...</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => { URL.revokeObjectURL(activeUpload.url); setActiveUpload(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {!activeUpload.scanning && activeUpload.result && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-eco-soft px-2.5 py-1 text-xs font-semibold text-leaf">
                          {sector.icon} {sector.name} Approved Stream
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {Math.round(activeUpload.result.confidence * 100)}% Match Confidence
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">{activeUpload.result.item}</h3>
                        <p className="text-xs text-muted-foreground">{activeUpload.result.category}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{activeUpload.result.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center text-sm">
                        <div className="rounded-lg border bg-muted/10 p-3">
                          <div className="text-xs text-muted-foreground">Estimated Points</div>
                          <div className="font-semibold text-base text-leaf">+{activeUpload.result.points} pts</div>
                        </div>
                        <div className="rounded-lg border bg-muted/10 p-3">
                          <div className="text-xs text-muted-foreground">Estimated CO₂ Saved</div>
                          <div className="font-semibold text-base text-eco">{activeUpload.result.co2} kg</div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-eco-soft/30 p-3 text-xs border border-eco/10">
                        <div className="font-bold text-leaf flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Handling Guidance</div>
                        <p className="mt-1 text-muted-foreground">{activeUpload.result.handling}</p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => { URL.revokeObjectURL(activeUpload.url); setActiveUpload(null); }}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitForRecovery} className="bg-eco-gradient text-eco-foreground">
                          Submit for Recovery &rarr;
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action 2: View Accepted Materials */}
            <div className="surface-card p-6">
              <h2 className="font-display text-xl font-bold">Accepted Recovery Items</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We accept the following classifications of {sector.name.toLowerCase()} in our circular economy stream:
              </p>

              {isTextile ? (
                /* Textile-specific accepted materials checklist */
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-4 bg-muted/5">
                    <h3 className="font-semibold text-leaf flex items-center gap-2">👕 Reusable & Donatable Clothing</h3>
                    <p className="text-xs text-muted-foreground mt-1">High quality items sorted for local secondary markets & organizations.</p>
                    <ul className="mt-3 text-xs space-y-1.5 text-muted-foreground list-disc pl-4">
                      <li>Shirts, trousers, dresses, and jackets</li>
                      <li>Clean school & sports uniforms</li>
                      <li>Shoes, sneakers, sandals, and handbags</li>
                      <li>Curtains, bedsheets, blankets, and towels</li>
                      <li>Wearable winter coats and denim wear</li>
                    </ul>
                  </div>
                  <div className="border rounded-xl p-4 bg-muted/5">
                    <h3 className="font-semibold text-earth flex items-center gap-2">✂️ Recyclable / Worn-out Fabrics</h3>
                    <p className="text-xs text-muted-foreground mt-1">Damaged fabrics collected for mechanical shredding and fibre extraction.</p>
                    <ul className="mt-3 text-xs space-y-1.5 text-muted-foreground list-disc pl-4">
                      <li>Worn-out, stained, or torn clothing</li>
                      <li>Fabric offcuts & industrial tailoring waste</li>
                      <li>Cotton materials & poly-cotton blends</li>
                      <li>Polyester and mixed synthetic fabrics</li>
                      <li>Leather products suitable for refurbishment</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Generic accepted materials */
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {materials.map((m) => (
                    <div key={m.id} className="flex gap-3 border rounded-xl p-3 bg-muted/5">
                      <div className="text-2xl">{m.icon}</div>
                      <div>
                        <div className="font-semibold text-sm">{m.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: Sector Information & Pickup Trigger */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <div className="surface-card p-6 bg-gradient-to-br from-muted/50 to-background border-border">
              <h3 className="font-display font-semibold text-lg">Recovery Actions</h3>
              <div className="mt-4 space-y-3">
                <Button asChild className="w-full bg-eco-gradient text-eco-foreground">
                  <Link to="/pickups">
                    <Truck className="h-4 w-4 mr-2" /> Request Pickup Collection
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-eco text-leaf hover:bg-eco-soft/20">
                  <Link to="/map">
                    <MapPin className="h-4 w-4 mr-2" /> Find Drop-off Point
                  </Link>
                </Button>
              </div>
            </div>

            {/* Upload Guidance / Preparations */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-leaf" /> Preparation Steps
              </h3>
              
              {isTextile ? (
                /* Textile-specific upload guidance */
                <ul className="text-sm space-y-3 text-muted-foreground list-none pl-0">
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">1</span>
                    <span><b>Wash & Dry:</b> Materials must be clean and completely dry to prevent mold growth during bulk storage.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">2</span>
                    <span><b>Sort by Condition:</b> Separate clean, wearable items for donation from torn scraps suitable only for recycling.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">3</span>
                    <span><b>Bag & Tie:</b> Pack your textiles in clean, heavy-duty bags (trash bags or sacks) and tie them securely before pickup.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">4</span>
                    <span><b>Remove Metals:</b> Remove metal hangers, heavy padlocks, or non-textile accessories if possible. Standard zippers are fine.</span>
                  </li>
                </ul>
              ) : (
                /* Generic Guidance */
                <ul className="text-sm space-y-3 text-muted-foreground list-none pl-0">
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">1</span>
                    <span><b>Clean Streams:</b> Ensure bottles are rinsed, cans are emptied, and paper remains dry.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">2</span>
                    <span><b>Hazard Check:</b> Remove standard batteries from devices before scanning; pack lithium batteries separately.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-eco-soft text-leaf text-xs font-bold shrink-0">3</span>
                    <span><b>Secure Cords:</b> Bundle device power adapters, charging cords, and peripherals together with the item.</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Circular Impact info */}
            <div className="surface-card p-6 bg-eco-soft/20 border-eco/20 text-sm">
              <h4 className="font-semibold text-leaf">Why recycle {sector.name}?</h4>
              <p className="mt-2 text-muted-foreground leading-relaxed text-xs">
                {isTextile 
                  ? "Diverting clothes from landfills reduces methane emissions, saves millions of litres of water needed for new cotton growth, and provides clothing materials for secondary reuse markets across Ghana."
                  : "Material recovery loops recover precious metals, reduce raw mining needs, and lower plastic/glass accumulation in water channels and ecosystems."
                }
              </p>
            </div>

          </div>

        </div>
      </div>
    </PageContainer>
  );
}
