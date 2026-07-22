import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { CommunityChallenge } from "../models/CommunityChallenge";
import { CommunityEvent } from "../models/CommunityEvent";
import { MarketplaceListing } from "../models/MarketplaceListing";
import { CommunityPost } from "../models/CommunityPost";

export async function seedDatabase() {
  try {
    console.log("🔍  Checking if database needs seeding...");

    // 1. Ensure default Admin account exists (upsert password on first create only)
    const adminEmail = "admin@ecorecovery.org";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log("🌱  Seeding default Admin user...");
      const hashedPassword = await bcrypt.hash("password123", 12);
      admin = await User.create({
        fullName: "System Administrator",
        email: adminEmail,
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
    } else if (admin.role !== "Admin" || admin.accountStatus !== "Active") {
      admin.role = "Admin";
      admin.accountStatus = "Active";
      admin.kycStatus = "Verified";
      await admin.save();
      console.log("✅  Admin account role/status restored");
    } else {
      console.log("ℹ️   Admin account already present (admin@ecorecovery.org)");
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

    // Clear any legacy demo/sample records from early database seeding
    await CommunityPost.deleteMany({ text: /Welcome to the Eco-Recovery Hub!/i });
    await CommunityChallenge.deleteMany({ title: { $in: ["Plastic Bottle Drive", "Old Laptops Recovery Campaign", "Cardboard Recovery Drive"] } });
    await CommunityEvent.deleteMany({ title: { $in: ["Labadi Beach Cleanup", "Kumasi E-Waste Drop-off Day"] } });
    await MarketplaceListing.deleteMany({ title: { $in: ["GH₵50 Mobile Top-up", "Eco Tote Bag", "Plant a Tree in Northern Ghana"] } });

    console.log("🧹  Sample data check clean — community and marketplace are 100% user & admin driven!");

    console.log("🎉  Seeding check complete!");
  } catch (err) {
    console.error("❌  Seeding database failed:", err);
  }
}
