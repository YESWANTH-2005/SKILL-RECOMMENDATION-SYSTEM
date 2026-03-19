import { Job } from "../models/Job.js";
import { getTrendingSkills } from "../services/trendingService.js";
import { jobCatalog } from "../data/jobCatalog.js";

const getJobsWithFallback = async () => {
  const jobs = await Job.find({});
  return jobs.length ? jobs : jobCatalog;
};

export const getSkillCategories = async (req, res, next) => {
  try {
    const jobs = await getJobsWithFallback();
    const categories = [...new Set(jobs.map((job) => job.category))];
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryDetails = async (req, res, next) => {
  try {
    const { category } = req.params;
    const jobsFromDb = await Job.find({ category });
    const jobs = jobsFromDb.length ? jobsFromDb : jobCatalog.filter((job) => job.category === category);

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
    const jobs = await getJobsWithFallback();
    const allSkills = jobs.flatMap((job) => job.requiredSkills || []);
    const skills = [...new Set(allSkills.map((skill) => skill.toLowerCase().trim()))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({ skills });
  } catch (error) {
    next(error);
  }
};
