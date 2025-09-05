import { Request, Response } from "express";
import University from "../models/University.js";

export async function listUniversities(req: Request, res: Response) {
  const subject = String(req.query.course || "").trim();
  // Optional: level is not used now since dataset doesn't encode level-specific data
  // const level = String(req.query.level || "").trim();

  const match: any = {};
  if (subject) {
    // programs.<Subject>.offered == true
    match[`programs.${subject}.offered`] = true;
  }

  // Only minimal fields needed by the map
 const unis = await University.find(match, {
  name: 1,
  rank: 1,
  location: 1,
  programs: 1,
  scholarships: 1,
  resources: 1, // ✅ now included
})
.sort({ rank: 1 })
.lean();

  res.json(unis);
}
