import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { getTrendingSkills } from "./services/trendingService.js";

export const createApp = () => {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        const isDev = process.env.NODE_ENV !== "production";
        if (isDev || !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(limiter);
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/api/public/trending-skills", async (req, res, next) => {
    try {
      const trendingSkills = await getTrendingSkills();
      res.status(200).json({ trendingSkills });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/skills", skillRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
