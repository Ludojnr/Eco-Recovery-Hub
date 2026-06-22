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

export const aiDetections = [
  { device: "Smartphone — iPhone 12 (est.)", confidence: 0.94, category: "Mobile Device", points: 260, recommendation: "Trade-in: high recoverable value. Wipe data → drop-off at GreenHub Lagos.", co2: 8.4 },
  { device: "Laptop — Dell XPS 13", confidence: 0.91, category: "Computing", points: 620, recommendation: "Refurbish-eligible. Schedule pickup for secure data destruction.", co2: 22.1 },
  { device: "CRT Television", confidence: 0.97, category: "Display", points: 380, recommendation: "Hazardous (lead). Do not bin. Schedule pickup — handled at certified facility.", co2: 31.0 },
  { device: "Lithium Battery Pack", confidence: 0.88, category: "Battery", points: 90, recommendation: "Fire risk. Tape terminals, drop at battery-only bin.", co2: 2.2 },
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
