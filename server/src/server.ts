// server/src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import universityRoutes from "./routes/universities.js";
import learningHubRoutes from "./routes/learningHub.js";

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// DB
connectDB().catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});

// Routes
app.use("/universities", universityRoutes);
app.use("/api/learning-hub", learningHubRoutes);
app.listen(env.PORT, () => console.log(`🚀 Server running on port ${env.PORT}`));
