import { Router } from "express";
import {
  getDashboardData,
  rateRecommendation,
  saveSkill,
} from "../controllers/recommendationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard", authMiddleware, getDashboardData);
router.post("/save-skill", authMiddleware, saveSkill);
router.post("/feedback", authMiddleware, rateRecommendation);

export default router;
