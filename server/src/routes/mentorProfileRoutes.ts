import { Router } from "express";
import {
  getMyMentorProfile,
  upsertMyMentorProfile,
} from "../controllers/mentorProfileController.js";

const router = Router();

router.get("/me", getMyMentorProfile);
router.post("/me", upsertMyMentorProfile);

export default router;
