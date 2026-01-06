import { Router } from "express";
import { sendMessage, getConversation } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();


router.post("/", requireAuth, sendMessage);
router.get("/conversation/:otherId", requireAuth, getConversation);

export default router;
