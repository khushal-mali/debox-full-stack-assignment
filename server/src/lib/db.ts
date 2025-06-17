import mongoose from "mongoose";
import Redis from "ioredis";

const MONGODB_URI: string = process.env.MONGODB_URI!;
const REDIS_URL: string = process.env.REDIS_URL!;

if (!MONGODB_URI || !REDIS_URL) {
  throw new Error("Missing MONGODB_URI or REDIS_URL");
}

let mongooseConnected: boolean = false;
let redisClient: Redis | null = null;

export async function connectMongoDB(): Promise<void> {
  if (mongooseConnected) return;
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    mongooseConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export function connectRedis(): Redis {
  if (redisClient) return redisClient;
  try {
    redisClient = new Redis(REDIS_URL);
    redisClient.on("connect", () => console.log("Redis connected"));
    redisClient.on("error", (error) => console.error("Redis connection error:", error));
    return redisClient;
  } catch (error) {
    console.error("Redis connection error:", error);
    throw error;
  }
}

export async function getCachedToken(token: string): Promise<string | null> {
  const client = connectRedis();
  return client.get(`jwt:${token}`);
}

export async function setCachedToken(
  token: string,
  userId: string,
  expiry: number = 3600
): Promise<void> {
  const client = connectRedis();
  await client.set(`jwt:${token}`, userId, "EX", expiry);
}

export async function deleteCachedToken(token: string): Promise<void> {
  const client = connectRedis();
  await client.del(`jwt:${token}`);
}
