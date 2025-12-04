import { Router } from "express";
import * as admin from "../controllers/adminDomainController.js";

const router = Router();

router.get("/", admin.listDomains);
router.get("/check/:domain", admin.checkDomain);
router.post("/", admin.addDomain);
router.delete("/:domain", admin.removeDomain);

export default router;
