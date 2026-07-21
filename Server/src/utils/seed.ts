import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { CommunityChallenge } from "../models/CommunityChallenge";
import { CommunityEvent } from "../models/CommunityEvent";
import { MarketplaceListing } from "../models/MarketplaceListing";
import { CommunityPost } from "../models/CommunityPost";

export async function seedDatabase() {
  try {
    console.log("🔍  Checking if database needs seeding...");

    // 1. Seed Admin User
    let admin = await User.findOne({ role: "Admin" });
    if (!admin) {
      console.log("🌱  Seeding default Admin user...");
      const hashedPassword = await bcrypt.hash("password123", 12);
      admin = await User.create({
        fullName: "System Administrator",
        email: "admin@ecorecovery.org",
        password: hashedPassword,
        phone: "+233 24 123 4567",
        institution: "Eco-Recovery Ghana",
        location: "Accra, Ghana",
        role: "Admin",
        kycStatus: "Verified",
        points: 5000,
        requestCount: 0,
        uploadCount: 0,
        preferredPickupAddresses: ["12 Airport City, Accra"],
        accountStatus: "Active",
        accountType: "Individual",
      });
      console.log("✅  Admin user pre-seeded (admin@ecorecovery.org / password123)");
    }

    // 1b. Seed / reset institutional test accounts
    // Uses upsert so existing accounts in the live DB are also reset to clean state
    console.log("🌱  Ensuring institutional test accounts exist with clean data...");
    const hashedPw = await bcrypt.hash("password123", 12);

    const ktuData = {
      fullName: "KTU Green Office",
      password: hashedPw,
      phone: "+233 34 202 5000",
      institution: "Koforidua Technical University",
      location: "Koforidua, Eastern Region",
      role: "User",
      kycStatus: "Verified",
      points: 0,
      requestCount: 0,
      uploadCount: 0,
      preferredPickupAddresses: ["Koforidua Technical University, Koforidua"],
      accountStatus: "Active",
      accountType: "Institutional",
      orgName: "Koforidua Technical University",
      orgType: "University",
      orgLocation: "Koforidua, Eastern Region, Ghana",
      contactPerson: "Dr. Ama Osei",
      orgEmail: "greenoffice@ktu.edu.gh",
      orgPhone: "+233 34 202 5001",
    };

    const gcData = {
      fullName: "GreenCorp Ghana",
      password: hashedPw,
      phone: "+233 30 277 8900",
      institution: "GreenCorp Ghana Ltd",
      location: "Accra, Greater Accra",
      role: "User",
      kycStatus: "Verified",
      points: 0,
      requestCount: 0,
      uploadCount: 0,
      preferredPickupAddresses: ["1 Ring Road Central, Accra"],
      accountStatus: "Active",
      accountType: "Institutional",
      orgName: "GreenCorp Ghana Ltd",
      orgType: "Private Company",
      orgLocation: "1 Ring Road Central, Accra, Ghana",
      contactPerson: "Mr. Kofi Amponsah",
      orgEmail: "info@greencorpgh.com",
      orgPhone: "+233 30 277 8901",
    };

    await User.findOneAndUpdate(
      { email: "ktu@ecorecovery.org" },
      { $set: ktuData, $setOnInsert: { email: "ktu@ecorecovery.org" } },
      { upsert: true, new: true }
    );
    await User.findOneAndUpdate(
      { email: "greencorp@ecorecovery.org" },
      { $set: gcData, $setOnInsert: { email: "greencorp@ecorecovery.org" } },
      { upsert: true, new: true }
    );
    console.log("✅  Institutional accounts ready with 0 points (ktu@ecorecovery.org, greencorp@ecorecovery.org / password123)");

    // 2. Seed Challenges
    const challengeCount = await CommunityChallenge.countDocuments();
    if (challengeCount === 0) {
      console.log("🌱  Seeding community challenges...");
      await CommunityChallenge.create([
        {
          title: "Plastic Bottle Drive",
          description: "Collect and submit PET plastic beverage bottles. Help clear campus plastics!",
          points: 100,
          co2: 15.0,
          daysRemaining: 12,
          targetQuantity: 500,
          progress: 120,
          completed: false,
          sector: "plastic",
        },
        {
          title: "Old Laptops Recovery Campaign",
          description: "Recover motherboard metals and prevent heavy metal soil poisoning.",
          points: 500,
          co2: 45.0,
          daysRemaining: 8,
          targetQuantity: 50,
          progress: 15,
          completed: false,
          sector: "e-waste",
        },
        {
          title: "Cardboard Recovery Drive",
          description: "Collect corrugated boxes and shipping cartons to save trees.",
          points: 150,
          co2: 20.0,
          daysRemaining: 15,
          targetQuantity: 1000,
          progress: 450,
          completed: false,
          sector: "paper-cardboard",
        },
      ]);
      console.log("✅  Community challenges seeded");
    }

    // 3. Seed Events
    const eventCount = await CommunityEvent.countDocuments();
    if (eventCount === 0) {
      console.log("🌱  Seeding community events...");
      await CommunityEvent.create([
        {
          title: "Labadi Beach Cleanup",
          description: "Help remove plastic bottles, bags, and debris from the shoreline. Refreshments will be provided.",
          date: "2026-07-30",
          time: "08:00",
          location: "Labadi Beach, Accra",
          host: "Green Accra Coalition",
          imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
          volunteers: [],
          maxVolunteers: 100,
        },
        {
          title: "Kumasi E-Waste Drop-off Day",
          description: "Bring your broken chargers, phones, and devices. Free trade-in valuations available on site.",
          date: "2026-08-05",
          time: "10:00",
          location: "Kumasi Cultural Center",
          host: "RecoverGH Kumasi",
          imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
          volunteers: [],
          maxVolunteers: 50,
        },
      ]);
      console.log("✅  Community events seeded");
    }

    // 4. Seed Marketplace Listings
    const listingCount = await MarketplaceListing.countDocuments();
    if (listingCount === 0) {
      console.log("🌱  Seeding marketplace listings...");
      await MarketplaceListing.create([
        {
          title: "GH₵50 Mobile Top-up",
          description: "Convert your eco points into GH₵50 airtime valid on all major networks.",
          price: 0,
          points: 500,
          sellerId: admin._id,
          sellerName: "Eco-Recovery Hub",
          sellerRole: "Admin",
          sector: "all",
          quantity: 20,
          imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
          dateListed: new Date().toISOString().split("T")[0],
          status: "Available",
        },
        {
          title: "Eco Tote Bag",
          description: "Beautiful reusable canvas tote bag for shopping. Zero single-use plastics!",
          price: 0,
          points: 800,
          sellerId: admin._id,
          sellerName: "Eco-Recovery Hub",
          sellerRole: "Admin",
          sector: "all",
          quantity: 10,
          imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
          dateListed: new Date().toISOString().split("T")[0],
          status: "Available",
        },
        {
          title: "Plant a Tree in Northern Ghana",
          description: "Redeem points to have a tree planted in your name. You will receive an email coordinates tag.",
          price: 0,
          points: 300,
          sellerId: admin._id,
          sellerName: "Eco-Recovery Hub",
          sellerRole: "Admin",
          sector: "all",
          quantity: 100,
          imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80",
          dateListed: new Date().toISOString().split("T")[0],
          status: "Available",
        },
      ]);
      console.log("✅  Marketplace listings seeded");
    }

    // 5. Seed Community Posts
    const postCount = await CommunityPost.countDocuments();
    if (postCount === 0) {
      console.log("🌱  Seeding community posts...");
      await CommunityPost.create([
        {
          userId: admin._id,
          userName: admin.fullName,
          userAvatar: admin.avatar,
          userRole: "Admin",
          userBadges: ["🏢 Institutional Partner", "🏆 Sustainability Ambassador"],
          timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
          sector: "all",
          text: "Welcome to the Eco-Recovery Hub! We are excited to transition our operations to a fully real-time backend. Start uploading scans and requesting pickups to earn eco points!",
          likes: [],
          helpful: [],
          niceWork: [],
          comments: [],
          reported: false,
          reportsCount: 0,
          visibility: "Public",
        },
      ]);
      console.log("✅  Community posts seeded");
    }

    console.log("🎉  Seeding check complete!");
  } catch (err) {
    console.error("❌  Seeding database failed:", err);
  }
}
