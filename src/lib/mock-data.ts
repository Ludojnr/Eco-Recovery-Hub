export const recyclingHistory = [
  { id: "1", device: "Samsung Galaxy A12", date: "2026-06-15", center: "GreenHub Accra", points: 240, status: "Completed" },
  { id: "2", device: "Lenovo IdeaPad 3", date: "2026-06-02", center: "RecoverGH Kumasi", points: 580, status: "Completed" },
  { id: "3", device: "Smart TV 42\"", date: "2026-05-20", center: "Tema Recovery Hub", points: 420, status: "Completed" },
  { id: "4", device: "HP Printer", date: "2026-06-18", center: "Pending collection", points: 0, status: "Pending" },
];

export const dashboardStats = {
  points: 1380,
  devicesRecycled: 14,
  pendingPickups: 1,
  completedPickups: 9,
  co2Saved: 96.8, // kg
  rank: 33,
};

export const notifications = [
  { id: "1", type: "pickup", title: "Pickup approved", body: "Your laptop pickup is scheduled for Jun 28, 10am.", time: "2h ago", unread: true },
  { id: "2", type: "reward", title: "+150 points earned", body: "Submitting PET bottles added 150 eco points.", time: "1d ago", unread: true },
  { id: "3", type: "system", title: "New verification milestone", body: "Your profile is now 80% complete.", time: "2d ago", unread: false },
  { id: "4", type: "message", title: "Accra Hub replied", body: "We will collect your items on Wednesday morning.", time: "3d ago", unread: false },
];

export const messages = [
  { id: "1", from: "Accra Hub", avatar: "A", preview: "Your pickup is confirmed for June 28…", time: "3d", unread: 0 },
  { id: "2", from: "Support Team", avatar: "S", preview: "Please prepare your device and charger…", time: "1w", unread: 2 },
  { id: "3", from: "Green Campus", avatar: "G", preview: "Koforidua University collection drive starts…", time: "2w", unread: 0 },
];

export const centers = [
  { id: "1", name: "GreenHub Accra", address: "12 Airport City, Accra", distance: "3.1 km", accepts: ["Phones", "Laptops", "TVs"], lat: 5.608, lng: -0.196 },
  { id: "2", name: "RecoverGH Kumasi", address: "4 Ahodwo Roundabout, Kumasi", distance: "250 km", accepts: ["All e-waste", "Batteries"], lat: 6.688, lng: -1.619 },
  { id: "3", name: "Tema Recovery Hub", address: "Tema Motorway, Tema", distance: "30 km", accepts: ["Plastic", "Metal", "Glass"], lat: 5.669, lng: 0.016 },
  { id: "4", name: "Koforidua Campus Drop-off", address: "Koforidua Technical University", distance: "82 km", accepts: ["Textiles", "Paper", "Cardboard"], lat: 6.089, lng: -0.259 },
];

export const leaderboard = [
  { rank: 1, name: "Afia Mensah", points: 9240, badge: "🏆" },
  { rank: 2, name: "Kwame Opoku", points: 8110, badge: "🥈" },
  { rank: 3, name: "Nana Amankwah", points: 7320, badge: "🥉" },
  { rank: 4, name: "Efua Asante", points: 6020, badge: "" },
  { rank: 5, name: "Yaw Boateng", points: 5480, badge: "" },
];

export const badges = [
  { name: "First Drop", desc: "Recycled your first item", earned: true, icon: "🌱" },
  { name: "Sector Explorer", desc: "Recovered from 4 different sectors", earned: true, icon: "🔍" },
  { name: "Carbon Saver", desc: "Saved 50kg CO₂", earned: true, icon: "🌍" },
  { name: "Community Leader", desc: "Shared recovery with your campus community", earned: false, icon: "🏫" },
  { name: "Top Recycler", desc: "Reach top 10 on the leaderboard", earned: false, icon: "👑" },
  { name: "Eco Educator", desc: "Read 5 education articles", earned: false, icon: "📚" },
];

export const rewards = [
  { id: "1", name: "GH₵50 Mobile Top-up", cost: 500, icon: "📱" },
  { id: "2", name: "Eco Tote Bag", cost: 800, icon: "🛍️" },
  { id: "3", name: "Plant a Tree", cost: 300, icon: "🌳" },
  { id: "4", name: "GH₵100 Market Voucher", cost: 1500, icon: "🎁" },
];

export const articles = [
  { id: "1", title: "Why E-Waste Matters in Ghana", category: "Basics", time: "4 min read", excerpt: "Discarded electronics leak heavy metals into soil and water. Here's what every household can do." },
  { id: "2", title: "Data Security Before Recycling", category: "Security", time: "6 min read", excerpt: "Factory reset is not enough. Step-by-step wipe for phones, laptops, and storage drives." },
  { id: "3", title: "The Circular Economy in Accra", category: "Concepts", time: "8 min read", excerpt: "How urban mining recovers gold, copper, and rare earths from old devices." },
  { id: "4", title: "What Pickup Day Looks Like", category: "Guide", time: "3 min read", excerpt: "Prepare your devices, label cables, and meet your collector with confidence." },
];

import eWasteImg from "../E waste   sector.jpg";
import plasticImg from "../plastics.jpg";
import metalImg from "../metal.jpg";
import glassImg from "../glass sector.jpg";
import paperImg from "../paper and cardboard.jpg";
import textileImg from "../clothing and textiles sector.jpg";

export type SectorId = "e-waste" | "plastic" | "metal" | "glass" | "paper-cardboard" | "textile";

export const sectors: {
  id: SectorId;
  name: string;
  icon: string;
  photo: string;
  short: string;
  examples: string;
  detail: string;
}[] = [
  { id: "e-waste", name: "E-Waste / Electronics", icon: "🔌", photo: eWasteImg, short: "Recover value from old electronics and safely handle hazardous components.", examples: "Circuit boards, motherboards, phones, chargers, laptops, cables, small appliances.", detail: "Upload devices like phones, computers and chargers. We classify hazardous electronics and match them to certified recovery routes." },
  { id: "plastic", name: "Plastic", icon: "🧴", photo: plasticImg, short: "Sort household and packaging plastics by polymer type for clean recycling.", examples: "PET bottles, HDPE containers, plastic packaging, household plastics.", detail: "Submit plastic bottles, containers and packaging. We guide you to the correct polymer stream for reuse or industrial recovery." },
  { id: "metal", name: "Metal / Recovery Materials", icon: "🥫", photo: metalImg, short: "Aluminum, steel and scrap metals recovered for smelting and reuse.", examples: "Cans, scrap metal, metal parts, household metal waste, device housings.", detail: "Capture metal items and components. Our platform routes them through recycling partners for maximum material recovery." },
  { id: "glass", name: "Glass", icon: "🍾", photo: glassImg, short: "Clean glass streams turned into new bottles and containers.", examples: "Bottles, jars, glass containers, reusable and recyclable glass materials.", detail: "Upload glass containers and bottles to keep them in the circular economy rather than landfill." },
  { id: "paper-cardboard", name: "Paper & Cardboard", icon: "📦", photo: paperImg, short: "Fibre-based packaging recovered into new paper products.", examples: "Cartons, paper packaging, cardboard boxes, office paper.", detail: "Submit paper and cardboard materials for pulping and reuse in new packaging and stationery." },
  { id: "textile", name: "Clothing & Textiles", icon: "👕", photo: textileImg, short: "Recycle and reuse textiles, garments, leather, and fabric materials to divert them from landfills.", examples: "Shirts, Trousers, Dresses, Jackets, Shoes, Bags, Uniforms, Curtains, Bedsheets, Towels, Fabric offcuts, Leather products, Denim, Cotton, Polyester, Mixed textiles.", detail: "Donate wearable clothing and shoes for reuse, or submit worn textiles, leather products, fabric offcuts and polyester materials for fibre recovery and recycling." },
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
  { item: "Smartphone — Samsung Galaxy A12", sector: "e-waste", category: "Mobile Device", confidence: 0.94, points: 260, co2: 8.4, description: "A modern smartphone with lithium battery and recoverable rare-earth components.", handling: "Wipe data → drop-off at a certified e-waste center. Do not bin — battery hazard." },
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

export const sectorMaterials: {
  id: string;
  sector: SectorId | "all";
  title: string;
  icon: string;
  description: string;
}[] = [
  { id: "mat-1", sector: "e-waste", title: "Smartphones & chargers", icon: "📱", description: "Phones, cables and power adapters." },
  { id: "mat-2", sector: "e-waste", title: "Laptop components", icon: "💻", description: "Laptops, motherboards and keyboards." },
  { id: "mat-3", sector: "plastic", title: "PET bottles", icon: "🥤", description: "Water and beverage bottles." },
  { id: "mat-4", sector: "plastic", title: "HDPE containers", icon: "🧴", description: "Detergent bottles and jerrycans." },
  { id: "mat-5", sector: "metal", title: "Aluminium cans", icon: "🥫", description: "Drink cans and lightweight metal scrap." },
  { id: "mat-6", sector: "metal", title: "Copper wiring", icon: "🔌", description: "Electrical wire, cables and metal parts." },
  { id: "mat-7", sector: "glass", title: "Glass bottles", icon: "🍾", description: "Beverage and condiment bottles." },
  { id: "mat-8", sector: "paper-cardboard", title: "Cardboard boxes", icon: "📦", description: "Shipping boxes, cartons, paper packaging." },
  { id: "mat-9", sector: "textile", title: "Wearable Clothes & Shoes", icon: "👕", description: "Shirts, trousers, dresses, jackets, and shoes suitable for donation or reuse." },
  { id: "mat-11", sector: "textile", title: "Linens & Household Fabrics", icon: "🛌", description: "Curtains, bedsheets, towels, and mixed fabric items." },
  { id: "mat-12", sector: "textile", title: "Leather & Denim Goods", icon: "💼", description: "Bags, jackets, shoes, leather products, and heavy denim materials." },
  { id: "mat-13", sector: "textile", title: "Recyclable Scraps & Offcuts", icon: "✂️", description: "Fabric offcuts, worn-out clothing, cotton, polyester and mixed fibres." },
  { id: "mat-10", sector: "all", title: "Mixed recyclables", icon: "♻️", description: "Household recovery across multiple streams." },
];

export const pickupRequests = [
  { id: "1", item: "Used Lenovo Laptop", sector: "e-waste", status: "Pending Review", address: "23 Koforidua Road, Accra", date: "2026-06-22", points: 150, quantity: 1, preferredDate: "2026-06-28" },
  { id: "2", item: "PET bottles bundle", sector: "plastic", status: "Pickup Scheduled", address: "15 Kwame Nkrumah Ave, Kumasi", date: "2026-06-18", points: 60, quantity: 24, preferredDate: "2026-06-25" },
  { id: "3", item: "Aluminium cans", sector: "metal", status: "Completed", address: "4 Cape Coast Rd, Takoradi", date: "2026-06-10", points: 45, quantity: 32, preferredDate: "2026-06-12" },
];

export const tradeInPrices: Record<string, { low: number; high: number }> = {
  "Smartphone (working)": { low: 400, high: 2500 },
  "Smartphone (broken)": { low: 80, high: 900 },
  "Laptop (working)": { low: 1200, high: 9000 },
  "Laptop (broken)": { low: 350, high: 2800 },
  "Tablet": { low: 260, high: 4200 },
  "Smartwatch": { low: 140, high: 1800 },
  "TV / Monitor": { low: 500, high: 6300 },
};
