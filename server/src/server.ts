// server/src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";               
import { Server } from "socket.io";   

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

import universityRoutes from "./routes/universities.js";
import learningHubRoutes from "./routes/learningHubRoutes.js";
import learningProfileRoutes from "./routes/learningProfileRoutes.js";
import adminDomainRoutes from "./routes/adminDomainRoutes.js";
import mentorProfileRoutes from "./routes/mentorProfileRoutes.js";
import messageRoutes from "./routes/messages.js";
import connectionRoutes from "./routes/connections.js";




const app = express();

// ---------------------- CORS ----------------------
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) + "..."
);

// ---------------------- DATABASE ----------------------
connectDB().catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});

// ---------------------- ROUTES ----------------------
app.use("/universities", universityRoutes);
app.use("/learning", learningHubRoutes);
app.use("/api/learning-profiles", learningProfileRoutes);
app.use("/admin/domains", adminDomainRoutes);
app.use("/api/mentors", mentorProfileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/connections", connectionRoutes);


// websocket setup

// Create HTTP server that supports Express *and* WebSockets
const server = http.createServer(app);

// Attach socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 WebSocket connected:", socket.id);

  // Client tells us their supabase userID
  socket.on("auth", (userId) => {
    if (!userId) return;
    socket.join(userId); // ⭐ User gets their own personal "inbox room"
    console.log(`📌 User ${userId} joined room ${userId}`);
  });

  // When user sends a message
  socket.on("message:send", (msg) => {
    if (!msg?.recipientId) return;

    console.log("📨 realtime message ->", msg);

    // Deliver ONLY to recipient
    io.to(msg.recipientId).emit("message:receive", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ WebSocket disconnected:", socket.id);
  });
});

// start server
server.listen(env.PORT, () =>
  console.log(`🚀 Server + WebSocket running on port ${env.PORT}`)
);
