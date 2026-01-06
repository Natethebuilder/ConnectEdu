// server/src/controllers/mentorProfileController.ts
import { Request, Response } from "express";
import { AuthedRequest } from "../middleware/auth.js";
import { MentorProfile } from "../models/MentorProfile.js";

/**
 * GET /api/mentors/me
 * Uses req.userId from requireAuth
 */
export async function getMyMentorProfile(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      console.error("❌ No userId in request");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const profile = await MentorProfile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("❌ getMyMentorProfile error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/mentors/by-user/:userId
 * For chat & mentor cards
 */
export async function getMentorByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const profile = await MentorProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error("getMentorByUserId error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/mentors/by-discipline/:discipline
 * Students searching for mentors
 */
export async function getMentorsByDiscipline(req: Request, res: Response) {
  try {
    const { discipline } = req.params;

    const mentors = await MentorProfile.find({
      disciplines: { $regex: new RegExp(`^${discipline}$`, "i") }
    });

    res.json(mentors);
  } catch (err) {
    console.error("❌ getMentorsByDiscipline error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /api/mentors/me
 */
export async function upsertMyMentorProfile(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      console.error("❌ No userId in request");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const data = req.body;

    const profile = await MentorProfile.findOneAndUpdate(
      { userId: req.userId },
      data,
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error("❌ upsertMyMentorProfile error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
