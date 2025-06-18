import mongoose, { model, Model, Schema } from "mongoose";

interface ICategory  {
  name: string;
  description: string;
  products: mongoose.Types.ObjectId[];
}

const categorySchema: Schema<ICategory> = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

categorySchema.index({ name: "text" });

export const Category: Model<ICategory> =
  mongoose.models.Category || model<ICategory>("Category", categorySchema);
