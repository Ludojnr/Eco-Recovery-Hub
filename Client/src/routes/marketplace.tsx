import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, RequireUser } from "@/components/layout";
import { store, useUser } from "@/lib/mock-store";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/routes/settings";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ShoppingBag,
  Tag,
  Info,
  Calendar,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  DollarSign,
  User
} from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Eco-Marketplace — Eco-Recovery Hub" }] }),
  component: () => (
    <RequireUser>
      <MarketplacePage />
    </RequireUser>
  ),
});

function MarketplacePage() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const currentUser = useUser();
  const user = snap.user ?? currentUser;

  if (!user) return null;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  
  // Listing creator states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [newSector, setNewSector] = useState("plastic");
  const [newQty, setNewQty] = useState("");
  const [newImgUrl, setNewImgUrl] = useState("");

  // Submit Listing Handler
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newPrice || !newPoints || !newQty) {
      return toast.error("Please fill in all listing details.");
    }
    
    const priceNum = parseFloat(newPrice);
    const pointsNum = parseInt(newPoints);
    const qtyNum = parseInt(newQty);

    if (isNaN(priceNum) || isNaN(pointsNum) || isNaN(qtyNum)) {
      return toast.error("Price, points, and quantity must be numeric.");
    }

    store.createMarketplaceListing(
      newTitle,
      newDesc,
      priceNum,
      pointsNum,
      newSector,
      qtyNum,
      newImgUrl || undefined
    );

    toast.success("Material listed successfully on the marketplace!");
    
    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewPrice("");
    setNewPoints("");
    setNewSector("plastic");
    setNewQty("");
    setNewImgUrl("");
    setShowAddForm(false);
  };

  // Buy/Claim Material handler
  const handleBuyItem = (itemId: string) => {
    try {
      store.buyMarketplaceItem(itemId);
      toast.success("Material claimed successfully! Points deducted and transaction recorded.");
    } catch (err: any) {
      toast.error(err.message || "Failed to buy material.");
    }
  };

  // Filtering
  const filteredListings = snap.marketplace.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "all" || item.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <PageContainer>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft/50 px-3 py-1 text-xs font-semibold text-leaf mb-2">
            <ShoppingBag className="h-3.5 w-3.5" />
            Circular Material Exchange
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Eco-Recovery <span className="text-gradient-eco">Marketplace</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Buy and sell sorted, clean, recyclable materials. Trade items in Ghanaian Cedis (GH₵) or redeem them using your accumulated Eco Points.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-eco-gradient text-eco-foreground hover:opacity-90 rounded-xl px-5 h-11 font-bold shrink-0 shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" /> List Recovered Material
        </Button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search materials (e.g. PET bottles, copper wire, keyboards)..."
            className="pl-10 h-11 rounded-xl text-sm"
          />
        </div>

        {/* Sector Filter select */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { id: "all", label: "All Sectors" },
            { id: "plastic", label: "Plastic" },
            { id: "e-waste", label: "E-Waste" },
            { id: "metal", label: "Metal" },
            { id: "glass", label: "Glass" },
            { id: "paper-cardboard", label: "Paper" },
            { id: "textile", label: "Textiles" },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === sec.id
                  ? "bg-leaf text-white shadow-sm"
                  : "bg-muted/65 text-muted-foreground hover:bg-muted"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ADD LISTING MODAL DIALOG */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-leaf" /> List Material for Sale
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Material Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Shredded PET Plastic Flakes (10kg)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Description & Processing</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe your material. Mention if it is sorted, washed, or processed. e.g. Clean PET bottles, shredded to 10mm flakes, completely dry."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (GH₵)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="points">Redemption points value</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="250"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sector">Recycling Sector</Label>
                  <select
                    id="sector"
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="plastic">Plastic</option>
                    <option value="e-waste">E-Waste</option>
                    <option value="metal">Metal</option>
                    <option value="glass">Glass</option>
                    <option value="paper-cardboard">Paper & Cardboard</option>
                    <option value="textile">Textiles</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qty">Quantity / Count</Label>
                  <Input
                    id="qty"
                    type="number"
                    placeholder="50"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="img">Simulate image attachment URL (Optional)</Label>
                <Input
                  id="img"
                  placeholder="Leave blank for a random Ghana recycling image"
                  value={newImgUrl}
                  onChange={(e) => setNewImgUrl(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-eco-gradient text-eco-foreground hover:opacity-90 rounded-xl"
                >
                  Publish Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATERIAL LISTINGS GRID */}
      <div className="mt-10">
        {filteredListings.length === 0 ? (
          <div className="surface-card p-16 text-center space-y-4 max-w-lg mx-auto">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto animate-bounce" />
            <h3 className="font-display font-bold text-lg">No listings match your search</h3>
            <p className="text-xs text-muted-foreground">
              Try selecting a different recycling sector filter or check back later for newly added circular materials.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const isSellerMe = item.sellerId === user.id;
              const sectorColorMap: Record<string, string> = {
                "plastic": "bg-blue-100 text-blue-800 border-blue-200",
                "e-waste": "bg-purple-100 text-purple-800 border-purple-200",
                "metal": "bg-amber-100 text-amber-800 border-amber-200",
                "glass": "bg-emerald-100 text-emerald-800 border-emerald-200",
                "paper-cardboard": "bg-indigo-100 text-indigo-800 border-indigo-200",
                "textile": "bg-pink-100 text-pink-800 border-pink-200"
              };

              return (
                <div
                  key={item.id}
                  className="surface-card overflow-hidden hover:border-eco transition-all duration-300 flex flex-col group relative shadow-sm"
                >
                  {/* Status Overlay */}
                  {item.status === "Sold" && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-4 text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted border-2 border-border text-lg mb-2">
                        🔒
                      </span>
                      <h4 className="font-display font-bold text-base text-foreground">Material Claimed</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">This recycling batch was claimed and is now processing.</p>
                    </div>
                  )}

                  {/* Material image header */}
                  <div className="relative h-44 overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 shadow-sm ${sectorColorMap[item.sector] || ""}`}>
                        {item.sector}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-2 py-1 rounded-lg">
                      Qty: {item.quantity}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-base text-foreground line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and points */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-border/60">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">Standard Price</span>
                        <span className="font-display font-bold text-foreground text-sm">
                          GH₵{item.price.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">Eco points exchange</span>
                        <span className="font-display font-bold text-leaf text-sm flex items-center gap-1">
                          {item.points.toLocaleString()} <span className="text-[10px] text-muted-foreground">pts</span>
                        </span>
                      </div>
                    </div>

                    {/* Seller row & CTAs */}
                    <div className="pt-2 flex items-center justify-between gap-4">
                      {/* Seller info */}
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar
                          user={{ fullName: item.sellerName, avatar: item.sellerAvatar, role: item.sellerRole }}
                          size="sm"
                          className="h-6 w-6 rounded-full"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] text-muted-foreground block">Seller</span>
                          <span className="font-bold text-[11px] text-foreground truncate block">
                            {isSellerMe ? "Me (You)" : item.sellerName}
                          </span>
                        </div>
                      </div>

                      {/* Buy action */}
                      {!isSellerMe ? (
                        <Button
                          size="sm"
                          onClick={() => handleBuyItem(item.id)}
                          className="bg-eco-soft text-leaf hover:bg-leaf hover:text-white rounded-xl text-xs px-3 font-semibold h-8"
                        >
                          Claim Batch
                        </Button>
                      ) : (
                        <span className="text-[10px] bg-muted border border-border px-2 py-1 rounded-lg text-muted-foreground font-semibold uppercase">
                          My Listing
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
