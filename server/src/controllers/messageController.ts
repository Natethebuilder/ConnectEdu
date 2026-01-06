// server/src/controllers/messageController.ts
import { Request, Response } from "express";
import { AuthedRequest } from "../middleware/auth.js";   // <-- IMPORTANT
import { Message } from "../models/Message.js";
import { Connection } from "../models/Connection.js";





// POST /api/messages
export const sendMessage = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { recipientId, text } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!recipientId || !text || !text.trim()) {
      return res
        .status(400)
        .json({ message: "recipientId and non-empty text are required" });
    }

    const msg = await Message.create({
      senderId: userId,
      recipientId,
      text: text.trim(),
    });

    // ---------------------- UPDATE CONNECTIONS ----------------------
    await Connection.findOneAndUpdate(
    { userId, otherId: recipientId },
    {
        lastMessage: text.trim(),
        lastTimestamp: new Date(),
    },
    { upsert: true }
    );

    // For the recipient: increase unread count
    await Connection.findOneAndUpdate(
    { userId: recipientId, otherId: userId },
    {
        $inc: { unread: 1 },
        lastMessage: text.trim(),
        lastTimestamp: new Date(),
    },
    { upsert: true }
    );

    return res.status(201).json(msg);
  } catch (err) {
    console.error("sendMessage error", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

// GET /api/messages/conversation/:otherId
export const getConversation = async (
  req: AuthedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { otherId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!otherId) {
      return res.status(400).json({ message: "otherId is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(500);

    return res.json(messages);
  } catch (err) {
    console.error("getConversation error", err);
    return res.status(500).json({ message: "Failed to load conversation" });
  }
};
