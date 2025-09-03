import mongoose from "mongoose";
import { log1 } from "../lib/general.lib.js";

export const connectDB = async () => {
   try {
      await mongoose.connect(process.env.DATABASE_URL)
      log1(["MongoDB connected successfully"]);
   } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
   }
};
