import express, { Request, Response, Router } from "express";
import { z } from "zod";
import { Inventory } from "../models/inventory.model";
import { Product } from "../models/product.model";
import {
  connectMongoDB,
  getCachedData,
  setCachedData,
  deleteCachedData,
} from "../lib/db";
import { authMiddleware, masterOnly } from "../middleware/auth";
import { Types } from "mongoose";

const router: Router = express.Router();

const inventorySchema = z.object({
  productId: z
    .string()
    .refine((id) => Types.ObjectId.isValid(id), { message: "Invalid ObjectId" }),
  available: z.number().min(0, "Available must be non-negative"),
  sold: z.number().min(0, "Sold must be non-negative"),
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const cacheKey = "inventory";
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

    const inventory = await Inventory.find().populate("productId", "name").lean();
    console.log(inventory);
    await setCachedData(cacheKey, JSON.stringify(inventory), 3600);
    res.json(inventory);
  } catch (error) {
    console.error("Get inventory error:", error);
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

    const cacheKey = `inventory:${id}`;
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

    const inventory = await Inventory.findById(id).populate("productId", "name").lean();
    if (!inventory) {
      res.status(404).json({ error: "Inventory not found" });
      return;
    }

    await setCachedData(cacheKey, JSON.stringify(inventory), 3600);
    res.json(inventory);
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { productId, available, sold } = inventorySchema.parse(req.body);

    const product = await Product.findById(productId).lean();
    if (!product) {
      res.status(400).json({ error: "Product not found" });
      return;
    }

    const existingInventory = await Inventory.findOne({ productId }).lean();
    if (existingInventory) {
      res.status(400).json({ error: "Inventory already exists for this product" });
      return;
    }

    const inventory = new Inventory({ productId, available, sold });
    await inventory.save();

    await deleteCachedData("inventory");
    await deleteCachedData(`inventory:${inventory._id}`);
    res.status(201).json(inventory);
  } catch (error) {
    console.error("Create inventory error:", error);
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

    const { productId, available, sold } = inventorySchema.parse(req.body);

    const product = await Product.findById(productId).lean();
    if (!product) {
      res.status(400).json({ error: "Product not found" });
      return;
    }

    const existingInventory = await Inventory.findOne({
      productId,
      _id: { $ne: id },
    }).lean();
    if (existingInventory) {
      res.status(400).json({ error: "Inventory already exists for this product" });
      return;
    }

    const inventory = await Inventory.findByIdAndUpdate(
      id,
      { productId, available, sold },
      { new: true }
    ).lean();
    if (!inventory) {
      res.status(404).json({ error: "Inventory not found" });
      return;
    }

    await deleteCachedData("inventory");
    await deleteCachedData(`inventory:${id}`);
    res.json(inventory);
  } catch (error) {
    console.error("Update inventory error:", error);
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

      const inventory = await Inventory.findByIdAndDelete(id).lean();
      if (!inventory) {
        res.status(404).json({ error: "Inventory not found" });
        return;
      }

      await deleteCachedData("inventory");
      await deleteCachedData(`inventory:${id}`);
      res.json({ message: "Inventory deleted" });
    } catch (error) {
      console.error("Delete inventory error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
