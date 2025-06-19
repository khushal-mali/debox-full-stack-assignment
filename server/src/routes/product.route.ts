import express, { Request, Response, Router } from "express";
import { z } from "zod";
import {
  connectMongoDB,
  deleteCachedData,
  getCachedData,
  setCachedData,
} from "../lib/db";
import { authMiddleware, masterOnly } from "../middleware/auth";
import { Category } from "../models/category.model";
import { Inventory } from "../models/inventory.model";
import { Product } from "../models/product.model";

const router: Router = express.Router();

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  categoryIds: z.array(z.string()).optional(),
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const cacheKey = "products";
    const cached = await getCachedData(cacheKey);
    if (cached) {
      try {
        // Ensure cached is a string and parse it
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        res.json(parsed);
        return;
      } catch (parseError) {
        console.error("Cache parse error:", parseError);
        // Proceed to fetch from DB if parsing fails
      }
    }

    const products = await Product.find().populate("categories", "name");
    await setCachedData(cacheKey, JSON.stringify(products), 3600);
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { name, description, price, stock, categoryIds } = productSchema.parse(
      req.body
    );

    const product = new Product({
      name,
      description,
      price,
      stock,
      categories: categoryIds || [],
    });
    await product.save();

    if (categoryIds?.length) {
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { products: product._id } }
      );
    }

    await deleteCachedData("products");
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { id } = req.params;
    const { name, description, price, stock, categoryIds } = productSchema.parse(
      req.body
    );

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, categories: categoryIds || [] },
      { new: true }
    );
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await Category.updateMany({ products: id }, { $pull: { products: id } });
    if (categoryIds?.length) {
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { products: id } }
      );
    }

    await deleteCachedData("products");
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete(
  "/:id",
  [authMiddleware, masterOnly],
  async (req: Request, res: Response) => {
    try {
      await connectMongoDB();
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      await Category.updateMany({ products: id }, { $pull: { products: id } });
      await Inventory.deleteOne({ productId: id });
      await deleteCachedData("products");
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
