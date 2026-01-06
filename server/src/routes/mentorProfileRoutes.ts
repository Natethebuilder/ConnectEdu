import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as controller from "../controllers/mentorProfileController.js";

const router = Router();

/**
 * Get the current authenticated mentor’s profile
 * GET /api/mentors/me
 */
router.get("/me", requireAuth, controller.getMyMentorProfile);

/**
 * Create/update your own mentor profile
 * POST /api/mentors/me
 */
router.post("/me", requireAuth, controller.upsertMyMentorProfile);

/**
 * Students use this to fetch mentors for a discipline
 * GET /api/mentors/by-discipline/:discipline
 */
router.get("/by-discipline/:discipline", controller.getMentorsByDiscipline);

/**
 * Chat & messaging use this to fetch mentor card data
 * GET /api/mentors/by-user/:userId
 */
router.get("/by-user/:userId", controller.getMentorByUserId);

export default router;
