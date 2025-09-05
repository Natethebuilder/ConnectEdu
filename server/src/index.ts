import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import jwt from "jsonwebtoken";
import { Message } from "./models/Message.js";

async function start() {
  await connectDB();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("no token"));
    try { jwt.verify(token, env.JWT_SECRET); next(); }
    catch { next(new Error("bad token")); }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (room: string) => socket.join(room));
    socket.on("message", async ({ room, text, userId }: { room: string; text: string; userId: string }) => {
      const msg = await Message.create({ room, text, sender: userId });
      io.to(room).emit("message", { id: msg.id, text: msg.text, room, userId, createdAt: msg.createdAt });
    });
  });

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${env.PORT}`);
  });
}

start();
