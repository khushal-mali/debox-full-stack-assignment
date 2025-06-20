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

// Validate environment variables
const requiredEnvVars = ["MONGODB_URI", "PORT"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

if (isNaN(PORT)) {
  console.error("Invalid PORT value in environment variable");
  process.exit(1);
}

// Middleware
app.use(cors());
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

app.get("/", (req, res) => {
  res.json({ status: "Success" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
});

// Start server
const startServer = async () => {
  try {
    await connectMongoDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on --port ${PORT}`);
    });
    server.setTimeout(30000); // 30 seconds timeout

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Closing server...");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received. Closing server...");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
