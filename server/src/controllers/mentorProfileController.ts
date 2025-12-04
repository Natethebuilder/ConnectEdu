// server/src/controllers/mentorProfileController.ts
import { Request, Response } from "express";
import { MentorProfile } from "../models/MentorProfile.js";

// GET /api/mentors/me?userId=XXX
export async function getMyMentorProfile(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string | undefined;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const profile = await MentorProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("getMyMentorProfile error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// POST /api/mentors/me
export async function upsertMyMentorProfile(req: Request, res: Response) {
  try {
    const {
      userId,
      name,
      headline,
      bio,
      expertise,
      languages,
      university,
      degree,
      linkedin,
      calendly,
      imageUrl,

      // NEW
      disciplines,
      affiliationType,
      affiliationName,
      helpAreas,
    } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: "userId and name are required" });
    }

    const normalizeStringArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
      if (typeof val === "string" && val.trim()) {
        return val.split(",").map(s => s.trim()).filter(Boolean);
      }
      return [];
    };

    const normalized = {
      userId,
      name,
      headline: headline ?? "",
      bio: bio ?? "",
      expertise: normalizeStringArray(expertise),
      languages: normalizeStringArray(languages),

      disciplines: normalizeStringArray(disciplines),

      affiliationType:
        affiliationType === "company" ||
        affiliationType === "independent" ||
        affiliationType === "university"
          ? affiliationType
          : "university",
      affiliationName: affiliationName ?? "",

      university: university ?? "",
      degree: degree ?? "",
      helpAreas: normalizeStringArray(helpAreas),

      linkedin: linkedin ?? "",
      calendly: calendly ?? "",
      imageUrl: imageUrl ?? "",
    };

    const profile = await MentorProfile.findOneAndUpdate(
      { userId },
      normalized,
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error("upsertMyMentorProfile error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
