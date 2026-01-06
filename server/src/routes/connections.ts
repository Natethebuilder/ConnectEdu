import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMyConnections, markAsRead } from "../controllers/connectionsController.js";

const router = Router();

router.get("/", requireAuth, getMyConnections);
router.post("/read/:otherId", requireAuth, markAsRead);

export default router;
