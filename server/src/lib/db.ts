import { Redis } from "@upstash/redis";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI: string = process.env.MONGODB_URI!;
const REDIS_URL: string = process.env.UPSTASH_REDIS_URL!;
const REDIS_TOKEN: string = process.env.UPSTASH_REDIS_TOKEN!;

if (!MONGODB_URI || !REDIS_URL || !REDIS_TOKEN) {
  throw new Error("Missing MONGODB_URI or REDIS_URL or REDIS_TOKEN");
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
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });
  return redisClient;
}

export async function getCachedToken(token: string): Promise<string | null> {
  try {
    const client = connectRedis();
    return await client.get(`jwt:${token}`);
  } catch (error) {
    console.error("Redis getCachedToken error:", error);
    return null; // Fallback to JWT verification
  }
}

export async function setCachedToken(
  token: string,
  userId: string,
  expiry: number = 3600
): Promise<void> {
  try {
    const client = connectRedis();
    await client.set(`jwt:${token}`, userId, { ex: expiry });
  } catch (error) {
    console.error("Redis setCachedToken error:", error);
    // Continue without crashing
  }
}

export async function deleteCachedToken(token: string): Promise<void> {
  try {
    const client = connectRedis();
    await client.del(`jwt:${token}`);
  } catch (error) {
    console.error("Redis deleteCachedToken error:", error);
  }
}
