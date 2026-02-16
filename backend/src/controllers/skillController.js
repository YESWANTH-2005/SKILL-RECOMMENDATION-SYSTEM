import { Job } from "../models/Job.js";
import { getTrendingSkills } from "../services/trendingService.js";

export const getSkillCategories = async (req, res, next) => {
  try {
    const jobs = await Job.find({});
    const categories = [...new Set(jobs.map((job) => job.category))];
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryDetails = async (req, res, next) => {
  try {
    const { category } = req.params;
    const jobs = await Job.find({ category });

    const allSkills = jobs.flatMap((job) => job.requiredSkills);
    const skills = [...new Set(allSkills)];
    const relatedJobs = jobs.map((job) => ({
      company: job.company,
      role: job.role,
      learningResources: job.learningResources,
    }));

    const trendingSkills = await getTrendingSkills();

    res.status(200).json({
      category,
      skills,
      relatedJobs,
      trendingSkills,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicSkillsList = async (req, res, next) => {
  try {
    const jobs = await Job.find({});
    const allSkills = jobs.flatMap((job) => job.requiredSkills || []);
    const skills = [...new Set(allSkills.map((skill) => skill.toLowerCase().trim()))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({ skills });
  } catch (error) {
    next(error);
  }
};
