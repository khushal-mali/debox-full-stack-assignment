import mongoose, { Schema, model, Model } from "mongoose";

interface IUser {
  email: string;
  password: string;
  role: "Master" | "Admin";
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Master", "Admin"], required: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || model<IUser>("User", userSchema);
