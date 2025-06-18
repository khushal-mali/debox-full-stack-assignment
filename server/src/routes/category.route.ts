import express, { Request, Response, Router } from "express";
import { z } from "zod";
// import { Category } from "../models/category";
// import { Product } from "../models/product";
import {
  connectMongoDB,
  getCachedData,
  setCachedData,
  deleteCachedData,
} from "../lib/db";
import { authMiddleware, masterOnly } from "../middleware/auth";
import { Types } from "mongoose";
import { Category } from "../models/category.model";
import { Product } from "../models/product.model";

const router: Router = express.Router();

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  productIds: z
    .array(
      z
        .string()
        .refine((id) => Types.ObjectId.isValid(id), { message: "Invalid ObjectId" })
    )
    .optional(),
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const cacheKey = "categories";
    const cached = await getCachedData(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const categories = await Category.find().populate("products", "name").lean();
    await setCachedData(cacheKey, JSON.stringify(categories), 3600);
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const cacheKey = `category:${id}`;
    const cached = await getCachedData(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const category = await Category.findById(id).populate("products", "name").lean();
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    await setCachedData(cacheKey, JSON.stringify(category), 3600);
    res.json(category);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { name, description, productIds } = categorySchema.parse(req.body);

    if (productIds?.length) {
      const validProducts = await Product.find({ _id: { $in: productIds } }).select(
        "_id"
      );
      if (validProducts.length !== productIds.length) {
        res.status(400).json({ error: "Invalid product IDs" });
        return;
      }
    }

    const category = new Category({ name, description, products: productIds || [] });
    await category.save();

    if (productIds?.length) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $addToSet: { categories: category._id } }
      );
    }

    await deleteCachedData("categories");
    await deleteCachedData(`category:${category._id}`);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const { name, description, productIds } = categorySchema.parse(req.body);

    if (productIds?.length) {
      const validProducts = await Product.find({ _id: { $in: productIds } }).select(
        "_id"
      );
      if (validProducts.length !== productIds.length) {
        res.status(400).json({ error: "Invalid product IDs" });
        return;
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, products: productIds || [] },
      { new: true }
    ).lean();
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    await Product.updateMany({ categories: id }, { $pull: { categories: id } });
    if (productIds?.length) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $addToSet: { categories: id } }
      );
    }

    await deleteCachedData("categories");
    await deleteCachedData(`category:${id}`);
    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
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
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }

      const category = await Category.findByIdAndDelete(id).lean();
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      await Product.updateMany({ categories: id }, { $pull: { categories: id } });
      await deleteCachedData("categories");
      await deleteCachedData(`category:${id}`);
      res.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
