import { Job } from "../models/Job.js";

export const listJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(5, Number(req.query.limit || 10));
    const query = (req.query.q || "").trim();

    const filter = query
      ? {
          $or: [
            { company: new RegExp(query, "i") },
            { role: new RegExp(query, "i") },
            { category: new RegExp(query, "i") },
          ],
        }
      : {};

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ company: 1, role: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const { company, role, category, requiredSkills = [], learningResources = [] } = req.body;
    const job = await Job.create({
      company,
      role,
      category,
      requiredSkills,
      learningResources,
    });
    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const job = await Job.findByIdAndUpdate(id, updates, { new: true });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ job });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};
