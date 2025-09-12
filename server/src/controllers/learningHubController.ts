import { Request, Response } from "express";
import * as learningHubService from "../services/learningHubService.js";

export async function getLearningHub(req: Request, res: Response) {
  try {
    const { discipline } = req.params;
    const hub = await learningHubService.getLearningHubByDiscipline(discipline);

    if (!hub) {
      return res.status(404).json({ message: "Learning Hub not found" });
    }

    res.json(hub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// (Optional — for seeding via API)
export async function upsertLearningHub(req: Request, res: Response) {
  try {
    const saved = await learningHubService.createOrUpdateLearningHub(req.body);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
