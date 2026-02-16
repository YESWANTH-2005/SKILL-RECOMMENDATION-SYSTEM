import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { getTrendingSkills } from "./services/trendingService.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
