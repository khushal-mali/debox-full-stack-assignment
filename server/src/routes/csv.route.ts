import { Options as CsvParseOptions, parse } from "csv-parse";
import express, { Request, Response, Router } from "express";
import fs from "fs";
import multer from "multer";
import { z } from "zod";
import { connectMongoDB, deleteCachedData } from "../lib/db";
import { authMiddleware, masterOnly } from "../middleware/auth";
import { Category } from "../models/category.model";
import { Inventory } from "../models/inventory.model";
import { Product } from "../models/product.model";

// Multer setup
const upload = multer({ dest: "uploads/" });
const router: Router = express.Router();

// Safe delete helper
const safeDeleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Error deleting file:", filePath, err);
  }
};

// Zod schema
const csvSchema = z.object({
  "Category Name": z.string().min(1),
  "Category Description": z.string().min(1),
  "Product Name": z.string().min(1),
  "Product Description": z.string().min(1),
  "Product Price": z
    .string()
    .transform(Number)
    .refine((n) => n >= 0, "Price must be non-negative"),
  "Available Units": z
    .string()
    .transform(Number)
    .refine((n) => n >= 0, "Available must be non-negative"),
  "Sold Units": z
    .string()
    .transform(Number)
    .refine((n) => n >= 0, "Sold must be non-negative"),
});

router.post(
  "/",
  [authMiddleware, masterOnly, upload.single("file")],
  async (req: Request, res: Response) => {
    const filePath = req.file?.path;

    if (!filePath) {
      res.status(400).json({ error: "CSV file is required" });
      return;
    }

    await connectMongoDB();
    const records: any[] = [];

    const parserOptions: CsvParseOptions = {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    };

    const parser = parse(parserOptions);

    parser.on("readable", () => {
      let record;
      while ((record = parser.read())) {
        records.push(record);
      }
    });

    parser.on("error", (err) => {
      console.error("CSV parse error:", err);
      safeDeleteFile(filePath);
      return res.status(400).json({ error: "Failed to parse CSV file" });
    });

    parser.on("end", async () => {
      if (records.length < 20) {
        safeDeleteFile(filePath);
        return res.status(400).json({ error: "CSV must contain at least 20 entries" });
      }

      let processed = 0;
      let skipped = 0;

      for (const record of records) {
        if (!record || typeof record !== "object") {
          console.warn("Skipping invalid record:", record);
          skipped++;
          continue;
        }

        try {
          const data = csvSchema.parse(record);

          // CATEGORY
          let category = await Category.findOne({ name: data["Category Name"] });
          if (!category) {
            category = await Category.create({
              name: data["Category Name"],
              description: data["Category Description"],
              products: [],
            });
          }

          // PRODUCT
          let product = await Product.findOne({ name: data["Product Name"] });
          if (!product) {
            product = await Product.create({
              name: data["Product Name"],
              description: data["Product Description"],
              price: data["Product Price"],
              stock: data["Available Units"],
              categories: [category._id],
            });

            await Category.findByIdAndUpdate(category._id, {
              $addToSet: { products: product._id },
            });
          }

          // INVENTORY
          const existingInventory = await Inventory.findOne({ productId: product._id });
          if (!existingInventory) {
            await Inventory.create({
              productId: product._id,
              available: data["Available Units"],
              sold: data["Sold Units"],
            });
          }

          processed++;
        } catch (err) {
          console.error("Error processing record:", record, err);
          skipped++;
        }
      }

      safeDeleteFile(filePath);

      await Promise.all([
        deleteCachedData("products"),
        deleteCachedData("categories"),
        deleteCachedData("inventory"),
      ]);

      return res.json({
        message: "CSV processed",
        processed,
        skipped,
      });
    });

    // Start piping after listeners are set up
    fs.createReadStream(filePath).pipe(parser);
  }
);

export default router;
