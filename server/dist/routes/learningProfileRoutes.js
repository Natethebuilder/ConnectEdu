import express from "express";
import { getLearningProfile, upsertLearningProfile, } from "../controllers/learningProfileController.js";
const router = express.Router();
router.get("/:user_id", getLearningProfile);
router.post("/", upsertLearningProfile);
export default router;
