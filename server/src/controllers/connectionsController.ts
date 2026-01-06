import { Response } from "express";
import { AuthedRequest } from "../middleware/auth.js";
import { Connection } from "../models/Connection.js";

export async function getMyConnections(req: AuthedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const list = await Connection.find({ userId })
      .sort({ lastTimestamp: -1 })
      .lean();

    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load inbox" });
  }
}

export async function markAsRead(req: AuthedRequest, res: Response) {
  try {
    const userId = req.userId;
    const { otherId } = req.params;

    await Connection.findOneAndUpdate(
      { userId, otherId },
      { unread: 0 }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to mark as read" });
  }
}
