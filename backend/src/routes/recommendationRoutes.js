import { Router } from "express";
import {
  addCareerPath,
  addPortfolioProject,
  compareRoles,
  deleteCareerPath,
  deletePortfolioProject,
  getAnalytics,
  getDashboardData,
  getMockInterview,
  rateRecommendation,
  saveSkill,
  updatePortfolioProject,
  updateReminders,
  updateResumeProfile,
  updateCareerGoals,
  updateCareerPath,
  updateProgress,
} from "../controllers/recommendationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  careerPathSchema,
  compareRolesSchema,
  portfolioSchema,
  remindersSchema,
  resumeSchema,
  feedbackSchema,
  goalsSchema,
  progressSchema,
  saveSkillSchema,
  updateCareerPathSchema,
} from "../validators/recommendationSchemas.js";

const router = Router();

router.get("/dashboard", authMiddleware, getDashboardData);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/mock-interview/:role", authMiddleware, getMockInterview);
router.post("/save-skill", authMiddleware, validateRequest(saveSkillSchema), saveSkill);
router.post("/feedback", authMiddleware, validateRequest(feedbackSchema), rateRecommendation);
router.post("/compare-roles", authMiddleware, validateRequest(compareRolesSchema), compareRoles);
router.patch("/goals", authMiddleware, validateRequest(goalsSchema), updateCareerGoals);
router.patch("/progress", authMiddleware, validateRequest(progressSchema), updateProgress);
router.post("/career-paths", authMiddleware, validateRequest(careerPathSchema), addCareerPath);
router.patch(
  "/career-paths/:pathId",
  authMiddleware,
  validateRequest(updateCareerPathSchema),
  updateCareerPath
);
router.delete("/career-paths/:pathId", authMiddleware, deleteCareerPath);
router.post("/portfolio", authMiddleware, validateRequest(portfolioSchema), addPortfolioProject);
router.patch("/portfolio/:projectId", authMiddleware, updatePortfolioProject);
router.delete("/portfolio/:projectId", authMiddleware, deletePortfolioProject);
router.put("/resume-profile", authMiddleware, validateRequest(resumeSchema), updateResumeProfile);
router.put("/reminders", authMiddleware, validateRequest(remindersSchema), updateReminders);

export default router;
