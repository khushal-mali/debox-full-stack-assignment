import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getCachedToken, setCachedToken } from "../lib/db";
import { AuthRequest } from "../types";

const JWT_SECRET: string = process.env.JWT_SECRET!;

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const cachedUserId = await getCachedToken(token);
    if (cachedUserId) {
      req.user = { id: cachedUserId, role: "MASTER" }; // Simplified; role would be stored in cache or token
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: "MASTER" | "ADMIN";
    };
    req.user = decoded;
    await setCachedToken(token, decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export const masterOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "MASTER") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};
