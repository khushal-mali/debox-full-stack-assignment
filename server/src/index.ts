import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { connectMongoDB } from "./lib/db";
import authRoutes from "./routes/auth.route";
import categoryRoutes from "./routes/category.route";
import csvRoutes from "./routes/csv.route";
import inventoryRoutes from "./routes/inventory.route";
import productRoutes from "./routes/product.route";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000");

// Middleware
// ✅ CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Allow only specific origin
  credentials: true, // Allow cookies / Authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use morgan to log requests (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/upload", csvRoutes);

app.get("/api/test", (req, res) => {
  res.json({ status: "Success" });
  return;
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`Server running on --port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
