import mongoose, { model, Model, Schema } from "mongoose";

interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: mongoose.Types.ObjectId[];
}

const productSchema: Schema<IProduct> = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

productSchema.index({ name: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || model<IProduct>("Product", productSchema);
