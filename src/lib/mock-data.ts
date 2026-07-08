export const recyclingHistory = [
  { id: "1", device: "iPhone 11", date: "2026-06-15", center: "GreenHub Lagos", points: 240, status: "Completed" },
  { id: "2", device: "Dell Latitude 7480", date: "2026-06-02", center: "EcoCycle Abuja", points: 580, status: "Completed" },
  { id: "3", device: "Samsung TV 42\"", date: "2026-05-20", center: "GreenHub Lagos", points: 420, status: "Completed" },
  { id: "4", device: "HP Printer", date: "2026-06-18", center: "Pickup Scheduled", points: 0, status: "Pending" },
];

export const dashboardStats = {
  points: 1240,
  devicesRecycled: 12,
  pendingPickups: 1,
  completedPickups: 8,
  co2Saved: 84.5, // kg
  rank: 47,
};

export const notifications = [
  { id: "1", type: "pickup", title: "Pickup approved", body: "Your HP Printer pickup is scheduled for Jun 24, 10am.", time: "2h ago", unread: true },
  { id: "2", type: "reward", title: "+240 points earned", body: "Recycling your iPhone 11 added 240 eco points.", time: "1d ago", unread: true },
  { id: "3", type: "system", title: "New leaderboard rank", body: "You moved up to rank #47 this week.", time: "2d ago", unread: false },
  { id: "4", type: "message", title: "GreenHub Lagos replied", body: "Thanks for your drop-off — your batch has been processed.", time: "3d ago", unread: false },
];

export const messages = [
  { id: "1", from: "GreenHub Lagos", avatar: "G", preview: "Thanks for your drop-off — your batch...", time: "3d", unread: 0 },
  { id: "2", from: "Support Team", avatar: "S", preview: "We've updated your pickup window to...", time: "1w", unread: 2 },
  { id: "3", from: "EcoCycle Abuja", avatar: "E", preview: "Your monthly impact report is ready.", time: "2w", unread: 0 },
];

export const centers = [
  { id: "1", name: "GreenHub Lagos", address: "12 Adeola Odeku St, Victoria Island", distance: "2.1 km", accepts: ["Phones", "Laptops", "TVs"], lat: 6.43, lng: 3.42 },
  { id: "2", name: "EcoCycle Abuja", address: "Plot 44 Kashim Ibrahim Way, Maitama", distance: "640 km", accepts: ["All e-waste"], lat: 9.08, lng: 7.49 },
  { id: "3", name: "ReVolt Ibadan", address: "Ring Road, Challenge", distance: "128 km", accepts: ["Batteries", "Small appliances"], lat: 7.36, lng: 3.9 },
  { id: "4", name: "PCB Recovery PH", address: "Aba Road, Port Harcourt", distance: "498 km", accepts: ["Circuit boards", "Cables"], lat: 4.85, lng: 7.04 },
];

export const leaderboard = [
  { rank: 1, name: "Ada Okafor", points: 8420, badge: "🏆" },
  { rank: 2, name: "Tunde Bello", points: 7110, badge: "🥈" },
  { rank: 3, name: "Ngozi Eze", points: 6380, badge: "🥉" },
  { rank: 4, name: "Kunle Adams", points: 5920, badge: "" },
  { rank: 5, name: "Fatima Sani", points: 5210, badge: "" },
];

export const badges = [
  { name: "First Drop", desc: "Recycled your first device", earned: true, icon: "🌱" },
  { name: "10 Devices", desc: "Recycled 10 devices", earned: true, icon: "♻️" },
  { name: "Carbon Saver", desc: "Saved 50kg CO₂", earned: true, icon: "🌍" },
  { name: "Streak 7", desc: "7-day activity streak", earned: false, icon: "🔥" },
  { name: "Top 10", desc: "Reach top 10 on leaderboard", earned: false, icon: "👑" },
  { name: "Educator", desc: "Read 5 articles", earned: false, icon: "📚" },
];

export const rewards = [
  { id: "1", name: "₦2,000 Airtime", cost: 500, icon: "📱" },
  { id: "2", name: "Eco T-Shirt", cost: 1200, icon: "👕" },
  { id: "3", name: "Plant a Tree", cost: 300, icon: "🌳" },
  { id: "4", name: "₦5,000 Voucher", cost: 1500, icon: "🎁" },
];

export const articles = [
  { id: "1", title: "Why E-Waste Matters", category: "Basics", time: "4 min read", excerpt: "Discarded electronics leak heavy metals into soil and water. Here's what every household can do." },
  { id: "2", title: "Data Security Before Recycling", category: "Security", time: "6 min read", excerpt: "Factory reset is not enough. Step-by-step wipe for phones, laptops, and storage drives." },
  { id: "3", title: "The Circular Economy", category: "Concepts", time: "8 min read", excerpt: "How urban mining recovers gold, copper, and rare earths from old devices." },
  { id: "4", title: "What Pickup Day Looks Like", category: "Guide", time: "3 min read", excerpt: "Prepare your devices, label cables, and meet your collector with confidence." },
];

export type SectorId = "e-waste" | "plastic" | "metal" | "glass" | "paper-cardboard" | "textile";

export const sectors: {
  id: SectorId;
  name: string;
  icon: string;
  short: string;
  examples: string;
}[] = [
  { id: "e-waste", name: "E-Waste / Electronics", icon: "🔌", short: "Recover value from old electronics and safely handle hazardous components.", examples: "Circuit boards, motherboards, phones, chargers, laptops, cables, small appliances." },
  { id: "plastic", name: "Plastic", icon: "🧴", short: "Sort household and packaging plastics by polymer type for clean recycling.", examples: "PET bottles, HDPE containers, plastic packaging, household plastics." },
  { id: "metal", name: "Metal", icon: "🥫", short: "Aluminum, steel and scrap metals recovered for smelting and reuse.", examples: "Cans, scrap metal, metal parts, household metal waste, device housings." },
  { id: "glass", name: "Glass", icon: "🍾", short: "Clean glass streams turned into new bottles and containers.", examples: "Bottles, jars, glass containers, reusable and recyclable glass materials." },
  { id: "paper-cardboard", name: "Paper & Cardboard", icon: "📦", short: "Fibre-based packaging recovered into new paper products.", examples: "Cartons, paper packaging, cardboard boxes, office paper." },
  { id: "textile", name: "Clothing / Leather / Fabrics", icon: "👕", short: "Textiles and leather diverted from landfill for reuse and fibre recovery.", examples: "Old clothes, shoes, leather items, worn textiles, household fabric materials." },
];

export const aiDetections: {
  item: string;
  sector: SectorId;
  category: string;
  confidence: number;
  points: number;
  co2: number;
  description: string;
  handling: string;
}[] = [
  { item: "Smartphone — iPhone 12 (est.)", sector: "e-waste", category: "Mobile Device", confidence: 0.94, points: 260, co2: 8.4, description: "A modern smartphone with lithium battery and recoverable rare-earth components.", handling: "Wipe data → drop-off at a certified e-waste center. Do not bin — battery hazard." },
  { item: "Laptop motherboard", sector: "e-waste", category: "Circuit Board", confidence: 0.92, points: 340, co2: 12.1, description: "Printed circuit board rich in copper, gold traces and solder alloys.", handling: "Send to a certified urban-mining facility for metal recovery." },
  { item: "PET water bottle", sector: "plastic", category: "PET #1", confidence: 0.96, points: 15, co2: 0.3, description: "Transparent food-grade polymer, one of the most widely recycled plastics.", handling: "Rinse, remove cap and label if required, place in plastics bin." },
  { item: "HDPE detergent container", sector: "plastic", category: "HDPE #2", confidence: 0.9, points: 22, co2: 0.5, description: "Rigid opaque plastic used for household product bottles.", handling: "Rinse thoroughly and drop in plastic recycling stream." },
  { item: "Aluminum beverage can", sector: "metal", category: "Aluminum", confidence: 0.97, points: 30, co2: 0.9, description: "Fully recyclable light metal — one of the highest-value curbside recyclables.", handling: "Empty, lightly rinse, and place in metal recycling." },
  { item: "Steel food can", sector: "metal", category: "Steel", confidence: 0.93, points: 25, co2: 0.7, description: "Tin-plated steel packaging suitable for magnetic sorting and smelting.", handling: "Rinse and drop at metal recycling point." },
  { item: "Glass bottle (clear)", sector: "glass", category: "Glass", confidence: 0.95, points: 20, co2: 0.6, description: "Endlessly recyclable soda-lime glass container.", handling: "Rinse, remove lid, sort by color at glass drop-off." },
  { item: "Cardboard carton", sector: "paper-cardboard", category: "Corrugated", confidence: 0.94, points: 18, co2: 0.4, description: "Corrugated fibreboard packaging, easily pulped into new paper.", handling: "Flatten and keep dry. Remove tape and plastic labels if possible." },
  { item: "Office paper stack", sector: "paper-cardboard", category: "Mixed Paper", confidence: 0.9, points: 12, co2: 0.2, description: "Printer / office paper suitable for standard paper recycling streams.", handling: "Remove staples and clips; place in paper bin." },
  { item: "Cotton T-shirt (worn)", sector: "textile", category: "Textile", confidence: 0.88, points: 40, co2: 3.1, description: "Natural-fibre garment eligible for reuse, resale or fibre recovery.", handling: "Donate if wearable; otherwise textile recycling bin." },
  { item: "Leather shoes", sector: "textile", category: "Leather", confidence: 0.85, points: 55, co2: 4.2, description: "Leather footwear that can be refurbished or processed for material reuse.", handling: "Pair and drop at a textile / shoe recovery point." },
  { item: "CRT Television", sector: "e-waste", category: "Display", confidence: 0.97, points: 380, co2: 31.0, description: "Legacy display containing leaded glass — treated as hazardous.", handling: "Do not bin. Schedule pickup — handled at certified hazardous facility." },
];

export const tradeInPrices: Record<string, { low: number; high: number }> = {
  "Smartphone (working)": { low: 12000, high: 85000 },
  "Smartphone (broken)": { low: 2000, high: 18000 },
  "Laptop (working)": { low: 35000, high: 280000 },
  "Laptop (broken)": { low: 8000, high: 45000 },
  "Tablet": { low: 6000, high: 70000 },
  "Smartwatch": { low: 3000, high: 28000 },
  "TV / Monitor": { low: 4000, high: 60000 },
  "Game Console": { low: 12000, high: 95000 },
};
