import mongoose, { Schema, model, Model } from "mongoose";

interface IInventory {
  productId: mongoose.Types.ObjectId;
  available: number;
  sold: number;
}

const inventorySchema: Schema<IInventory> = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    available: { type: Number, required: true, min: 0 },
    sold: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || model<IInventory>("Inventory", inventorySchema);
