import { Router } from "express";
import * as admin from "../controllers/adminDomainController.js";

const router = Router();

router.get("/check/:email", admin.checkEmail);
router.post("/", admin.addEmail);
router.delete("/:email", admin.removeEmail);


export default router;
