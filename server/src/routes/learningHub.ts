import { Router } from "express";
import { getLearningHub, upsertLearningHub } from "../controllers/learningHubController.js";

const router = Router();

// GET /api/learning-hub/:discipline
router.get("/:discipline", getLearningHub);

// POST /api/learning-hub (optional admin route for seeding/updating)
router.post("/", upsertLearningHub);

export default router;
