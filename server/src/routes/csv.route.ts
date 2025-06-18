import express, { Request, Response, Router } from "express";
import { parse } from "csv-parse";
import { z } from "zod";
import { Product } from "../models/product.model";
import { Category } from "../models/category.model";
import { Inventory } from "../models/inventory.model";
import { connectMongoDB, deleteCachedData } from "../lib/db";
import { authMiddleware, masterOnly } from "../middleware/auth";
import { IInventory } from "../models/inventory.model"; // Import interface for typing
import { UploadedFile } from "express-fileupload";

const router: Router = express.Router();

// Zod schema for CSV validation
const csvSchema = z.object({
  "Category Name": z.string().min(1, "Category Name is required"),
  "Category Description": z.string().min(1, "Category Description is required"),
  "Product Name": z.string().min(1, "Product Name is required"),
  "Product Description": z.string().min(1, "Product Description is required"),
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
  "/upload",
  [authMiddleware, masterOnly],
  async (req: Request, res: Response) => {
    try {
      await connectMongoDB();
      // Validate request content type
      if (!req.is("multipart/form-data")) {
        res.status(400).json({ error: "Expected multipart/form-data" });
        return;
      }

      // Validate file upload
      const file: UploadedFile | undefined = req.files?.file as UploadedFile;
      if (!file) {
        res.status(400).json({ error: "Single CSV file required" });
        return;
      }
      if (Array.isArray(file)) {
        res.status(400).json({ error: "Only one file is allowed" });
        return;
      }

      const records: any[] = [];
      const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

      parser.on("readable", () => {
        let record;
        while ((record = parser.read())) {
          records.push(record);
        }
      });

      parser.on("error", (error) => {
        console.error("CSV parse error:", error);
        res.status(400).json({ error: "Invalid CSV format" });
      });

      parser.on("end", async () => {
        // Ensure at least 20 entries as per requirements
        if (records.length < 20) {
          res.status(400).json({ error: "CSV must contain at least 20 entries" });
          return;
        }

        try {
          for (const record of records) {
            // Validate CSV row with Zod
            const data = csvSchema.parse(record);

            // Handle Category
            let category = await Category.findOne({ name: data["Category Name"] });
            if (!category) {
              category = new Category({
                name: data["Category Name"],
                description: data["Category Description"],
                products: [],
              });
              await category.save();
            }

            // Handle Product
            let product = await Product.findOne({ name: data["Product Name"] });
            if (!product) {
              product = new Product({
                name: data["Product Name"],
                description: data["Product Description"],
                price: data["Product Price"],
                stock: data["Available Units"],
                categories: [category._id],
              });
              await product.save();

              // Update Category's products array
              await Category.findByIdAndUpdate(category._id, {
                $addToSet: { products: product._id },
              });
            }

            // Handle Inventory (fixed: removed lean() to allow save)
            let inventory = (await Inventory.findOne({
              productId: product._id,
            })) as IInventory | null;
            if (!inventory) {
              inventory = new Inventory({
                productId: product._id,
                available: data["Available Units"],
                sold: data["Sold Units"],
              });
              await inventory.save();
            }
            // Note: If inventory exists, skip creation to enforce one-to-one relationship
          }

          // Invalidate Redis caches
          await Promise.all([
            deleteCachedData("products"),
            deleteCachedData("categories"),
            deleteCachedData("inventory"),
          ]);
          res.json({ message: "CSV data uploaded successfully" });
        } catch (error) {
          console.error("CSV processing error:", error);
          res.status(500).json({ error: "Server error" });
        }
      });

      parser.write(file.data);
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
