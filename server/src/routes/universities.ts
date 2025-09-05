import { Router } from "express";
import { listUniversities } from "../controllers/universityController.js";

const router = Router();

router.get("/", listUniversities);

export default router;
