import express from "express";
import { getLearningHub } from "../controllers/learningHubController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:discipline", requireAuth, getLearningHub);

export default router;
