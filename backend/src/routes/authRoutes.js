import { Router } from "express";
import { login, logout, me, refresh, signup } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema, refreshSchema, signupSchema } from "../validators/authSchemas.js";

const router = Router();

router.post("/signup", validateRequest(signupSchema), signup);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", validateRequest(refreshSchema), refresh);
router.post("/logout", authMiddleware, validateRequest(refreshSchema.partial()), logout);
router.get("/me", authMiddleware, me);

export default router;
