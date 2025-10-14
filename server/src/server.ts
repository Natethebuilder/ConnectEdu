// server/src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import universityRoutes from "./routes/universities.js";
import learningHubRoutes from "./routes/learningHub.js";
import learningProfileRoutes from "./routes/learningProfileRoutes.js";

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) + "...");

// DB
connectDB().catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});

// Routes
app.use("/universities", universityRoutes);
app.use("/api/learning-hub", learningHubRoutes);
app.use("/api/learning-profiles", learningProfileRoutes);
app.listen(env.PORT, () => console.log(`🚀 Server running on port ${env.PORT}`));
