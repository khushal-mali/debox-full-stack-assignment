import express, { Request, Response, Router } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/user.model";
import { connectMongoDB, setCachedToken, deleteCachedToken } from "../lib/db";
import { authMiddleware, masterOnly } from "../middleware/auth";
import { AuthRequest } from "../types";

const router: Router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Master", "Admin"]),
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    await setCachedToken(token, user._id.toString());

    res.json({
      token,
      user: { id: user._id.toString(), email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectMongoDB();
    const { email, password, role } = signupSchema.parse(req.body);

    if (role === "Master" && req.user?.role !== "Master") {
      res.status(403).json({ error: "Only Master users can create Master accounts" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id.toString(), email, role },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await deleteCachedToken(token);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
