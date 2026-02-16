import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { getRecommendationForJob } from "../services/matchingService.js";
import { getTrendingSkills } from "../services/trendingService.js";

export const getDashboardData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const jobs = await Job.find({});

    const recommendations = jobs
      .map((job) => getRecommendationForJob(user.knownSkills, job))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const trendingSkills = await getTrendingSkills();

    res.status(200).json({
      profile: {
        name: user.name,
        knownSkills: user.knownSkills,
        interests: user.interests,
        savedSkills: user.savedSkills,
      },
      recommendations,
      trendingSkills,
    });
  } catch (error) {
    next(error);
  }
};

export const saveSkill = async (req, res, next) => {
  try {
    const { skill } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.savedSkills.includes(skill)) {
      user.savedSkills.push(skill);
      await user.save();
    }

    res.status(200).json({ savedSkills: user.savedSkills });
  } catch (error) {
    next(error);
  }
};

export const rateRecommendation = async (req, res, next) => {
  try {
    const { jobRole, rating } = req.body;
    const user = await User.findById(req.user.id);

    user.recommendationRatings.push({ jobRole, rating });
    await user.save();

    res.status(200).json({ message: "Feedback saved" });
  } catch (error) {
    next(error);
  }
};
