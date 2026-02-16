import { Router } from "express";
import {
  getCategoryDetails,
  getPublicSkillsList,
  getSkillCategories,
} from "../controllers/skillController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/public/list", getPublicSkillsList);
router.get("/categories", authMiddleware, getSkillCategories);
router.get("/categories/:category", authMiddleware, getCategoryDetails);

export default router;
