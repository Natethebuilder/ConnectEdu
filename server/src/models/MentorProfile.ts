// server/src/models/MentorProfile.ts
import { Schema, model } from "mongoose";

const mentorProfileSchema = new Schema(
  {
    // Supabase user id (UUID as string)
    userId: { type: String, required: true, unique: true },

    // Basic info
    name: { type: String, required: true },
    headline: { type: String },
    bio: { type: String },

    // Matching info
    expertise: [{ type: String }],      // freeform tags
    languages: [{ type: String }],      // ["English", "Dutch"]

    // NEW: high-level disciplines for matching
    disciplines: [{ type: String }],    // e.g. ["Physics", "Computer Science"]

    // NEW: how they are affiliated
    affiliationType: {                  // "university" | "company" | "independent"
      type: String,
      enum: ["university", "company", "independent"],
      default: "university",
    },
    affiliationName: { type: String },  // "University of Amsterdam", "Google", etc.

    university: { type: String },       // can keep for backwards compatibility
    degree: { type: String },

    // NEW: how they can help
    helpAreas: [{ type: String }],      // ["personal_statements", "student_life", ...]

    // Links
    linkedin: { type: String },
    calendly: { type: String },

    // Profile picture
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const MentorProfile = model("MentorProfile", mentorProfileSchema);
