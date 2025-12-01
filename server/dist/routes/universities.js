// server/src/routes/universities.ts
import { Router } from "express";
import { getUniversities, getUniversityById } from "../controllers/universityController.js";
const router = Router();
router.get("/", getUniversities); // /universities?course=physics
router.get("/:id", getUniversityById); // /universities/123
export default router;
