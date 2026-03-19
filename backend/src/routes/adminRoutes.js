import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { createJob, deleteJob, listJobs, updateJob } from "../controllers/adminController.js";

const router = Router();

router.get("/jobs", authMiddleware, adminMiddleware, listJobs);
router.post("/jobs", authMiddleware, adminMiddleware, createJob);
router.patch("/jobs/:id", authMiddleware, adminMiddleware, updateJob);
router.delete("/jobs/:id", authMiddleware, adminMiddleware, deleteJob);

export default router;
