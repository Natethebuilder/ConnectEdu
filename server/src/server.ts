// server/src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import universityRoutes from "./routes/universities.js";
import learningHubRoutes from "./routes/learningHubRoutes.js";
import learningProfileRoutes from "./routes/learningProfileRoutes.js";
import adminDomainRoutes from "./routes/adminDomainRoutes.js";
import mentorProfileRoutes from "./routes/mentorProfileRoutes.js";

const app = express();
// CORS CONFIG
const allowedOrigins = env.CORS_ORIGIN.split(",").map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

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
app.use("/learning", learningHubRoutes);
app.use("/api/learning-profiles", learningProfileRoutes);
app.use("/admin/domains", adminDomainRoutes);
app.use("/api/mentors", mentorProfileRoutes);
app.listen(env.PORT, () => console.log(`🚀 Server running on port ${env.PORT}`));
