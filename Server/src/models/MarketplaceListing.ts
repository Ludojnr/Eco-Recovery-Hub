import mongoose, { Document, Schema } from "mongoose";

export interface IMarketplaceListing extends Document {
  title: string;
  description: string;
  price: number;
  points: number;
  sellerId: mongoose.Types.ObjectId;
  sellerName: string;
  sellerAvatar?: string;
  sellerRole: "User" | "Admin";
  sector: string;
  quantity: number;
  imageUrl?: string;
  dateListed: string;
  status: "Available" | "Sold";
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    points: { type: Number, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String },
    sellerRole: { type: String, enum: ["User", "Admin"], required: true },
    sector: { type: String, required: true },
    quantity: { type: Number, required: true },
    imageUrl: { type: String },
    dateListed: { type: String, required: true },
    status: { type: String, enum: ["Available", "Sold"], default: "Available" },
  },
  { timestamps: true }
);

export const MarketplaceListing = mongoose.model<IMarketplaceListing>(
  "MarketplaceListing",
  MarketplaceListingSchema
);
