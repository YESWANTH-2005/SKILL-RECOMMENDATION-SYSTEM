import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { getRecommendationForJob } from "../services/matchingService.js";
import { getTrendingSkills } from "../services/trendingService.js";
import { jobCatalog } from "../data/jobCatalog.js";

let analyticsCache = { data: null, expiresAt: 0 };

const getJobsWithFallback = async () => {
  const jobs = await Job.find({});
  return jobs.length ? jobs : jobCatalog;
};

const buildDefaultWeeklyPlan = (targetRole = "your target role") => [
  { week: "Week 1", title: `Learn basics required for ${targetRole}`, status: "not_started" },
  { week: "Week 2", title: "Build one mini project", status: "not_started" },
  { week: "Week 3", title: "Practice interview-focused tasks", status: "not_started" },
  { week: "Week 4", title: "Polish resume and portfolio", status: "not_started" },
];

const buildRoadmapByRole = (recommendations = []) =>
  recommendations.slice(0, 5).map((item) => ({
    company: item.company,
    role: item.role,
    matchPercentage: item.matchPercentage,
    roadmap: [
      {
        phase: "Foundation",
        goals: item.requiredSkills.slice(0, 2),
      },
      {
        phase: "Core Build",
        goals: item.requiredSkills.slice(2, 4),
      },
      {
        phase: "Job Ready",
        goals: [item.requiredSkills[4] || "Interview practice", "Project + portfolio"],
      },
    ],
  }));

const generateSkillPlan = (missingSkills = []) => {
  const pick = (from, fallback) => (from.length ? from : fallback);
  const firstThirty = pick(missingSkills.slice(0, 2), ["Core fundamentals", "Practice basics"]);
  const sixty = pick(missingSkills.slice(2, 4), ["Build intermediate project", "Improve code quality"]);
  const ninety = pick(missingSkills.slice(4, 6), ["Mock interviews", "Portfolio polish"]);

  return [
    {
      phase: "0-30 Days",
      focus: "Build foundations and consistency",
      tasks: firstThirty.map((skill) => `Study and practice ${skill}`),
    },
    {
      phase: "31-60 Days",
      focus: "Apply through project work",
      tasks: sixty.map((skill) => `Build one project feature with ${skill}`),
    },
    {
      phase: "61-90 Days",
      focus: "Prepare for interviews and applications",
      tasks: ninety.map((skill) => `Showcase ${skill} in portfolio and resume`),
    },
  ];
};

const getMatchByRole = (recommendations, role) =>
  recommendations.find((item) => item.role === role)?.matchPercentage ?? 0;

const getProgressStats = (skillProgress = []) => {
  const statusCount = {
    not_started: 0,
    in_progress: 0,
    practicing: 0,
    job_ready: 0,
    completed: 0,
  };

  skillProgress.forEach((item) => {
    if (statusCount[item.status] !== undefined) {
      statusCount[item.status] += 1;
    }
  });

  return statusCount;
};

const normalizeCareerPaths = (savedCareerPaths = []) =>
  savedCareerPaths.map((path) => ({
    id: String(path._id),
    company: path.company,
    role: path.role,
    targetDate: path.targetDate || "",
    notes: path.notes || "",
    status: path.status || "planned",
  }));

const buildRoleComparison = (recommendations, roleA, roleB) => {
  const first = recommendations.find((item) => item.role === roleA);
  const second = recommendations.find((item) => item.role === roleB);

  if (!first || !second) {
    return null;
  }

  const onlyInA = first.requiredSkills.filter((skill) => !second.requiredSkills.includes(skill));
  const onlyInB = second.requiredSkills.filter((skill) => !first.requiredSkills.includes(skill));
  const common = first.requiredSkills.filter((skill) => second.requiredSkills.includes(skill));

  return {
    roleA: {
      company: first.company,
      role: first.role,
      matchPercentage: first.matchPercentage,
      requiredSkills: first.requiredSkills,
      missingSkills: first.missingSkills,
    },
    roleB: {
      company: second.company,
      role: second.role,
      matchPercentage: second.matchPercentage,
      requiredSkills: second.requiredSkills,
      missingSkills: second.missingSkills,
    },
    summary: {
      commonSkills: common,
      onlyInRoleA: onlyInA,
      onlyInRoleB: onlyInB,
    },
  };
};

const mockInterviewBank = {
  "Frontend Engineer": [
    "Explain the difference between `var`, `let`, and `const`.",
    "How does React reconciliation work?",
    "Explain CSS specificity with an example.",
  ],
  "Backend Engineer": [
    "Explain REST vs GraphQL tradeoffs.",
    "How would you design a rate limiter?",
    "Explain indexing in MongoDB.",
  ],
  "Data Analyst": [
    "Explain normalization vs denormalization.",
    "Write a SQL query to find top 5 customers by revenue.",
    "How do you validate a dashboard metric?",
  ],
  "DevOps Engineer": [
    "Explain CI/CD pipeline stages.",
    "How would you secure Kubernetes secrets?",
    "Describe blue/green deployment.",
  ],
};

const buildPersonalDashboard = (user, recommendations) => {
  const totalProfileFields = 5;
  const filledProfileFields = [
    user.name,
    user.email,
    user.knownSkills?.length,
    user.targetRole,
    user.interests?.length,
  ].filter(Boolean).length;
  const profileCompleteness = Math.round((filledProfileFields / totalProfileFields) * 100);

  const targetRecommendation =
    recommendations.find((item) => item.role === user.targetRole) || recommendations[0];
  const backupRecommendation =
    recommendations.find((item) => item.role === user.backupRole) || recommendations[1];

  const topSkillGaps = [...new Set(targetRecommendation?.missingSkills || [])].slice(0, 6);
  const nextSkillsToLearn = topSkillGaps.slice(0, 3);
  const weeklyPlan =
    user.weeklyPlan?.length ? user.weeklyPlan : buildDefaultWeeklyPlan(user.targetRole || "your role");
  const statusCount = getProgressStats(user.skillProgress || []);
  const learningPlan = generateSkillPlan(topSkillGaps);

  const projectSuggestions = [
    {
      level: "Beginner",
      title: `Starter project for ${targetRecommendation?.role || "target role"}`,
      mappedSkills: (targetRecommendation?.requiredSkills || []).slice(0, 2),
      outcome: "Demonstrate fundamentals and clean project setup",
    },
    {
      level: "Intermediate",
      title: `${targetRecommendation?.role || "Role"} workflow app`,
      mappedSkills: (targetRecommendation?.requiredSkills || []).slice(1, 4),
      outcome: "Show architecture, testing, and implementation depth",
    },
    {
      level: "Portfolio",
      title: `${targetRecommendation?.company || "Industry"}-style capstone`,
      mappedSkills: targetRecommendation?.requiredSkills || [],
      outcome: "Use as flagship project for resume and interviews",
    },
  ];

  const applicationReadiness = {
    resumeReady: (user.knownSkills?.length || 0) >= 4,
    githubPortfolioReady: (user.completedProjects?.length || 0) >= 1,
    interviewReady: statusCount.job_ready + statusCount.completed >= 3,
  };

  return {
    profileSnapshot: {
      experienceLevel: user.experienceLevel || "Fresher",
      knownSkillsCount: user.knownSkills?.length || 0,
      savedSkillsCount: user.savedSkills?.length || 0,
      profileCompleteness,
    },
    careerGoals: {
      targetRole: user.targetRole || targetRecommendation?.role || "",
      backupRole: user.backupRole || backupRecommendation?.role || "",
    },
    readinessScores: {
      targetRoleMatch: getMatchByRole(recommendations, user.targetRole || targetRecommendation?.role),
      backupRoleMatch: getMatchByRole(recommendations, user.backupRole || backupRecommendation?.role),
      bestOverallMatch: recommendations[0]?.matchPercentage || 0,
    },
    topSkillGaps,
    nextSkillsToLearn,
    weeklyPlan,
    learningPlan,
    roleReadinessScorecard: recommendations.slice(0, 5).map((item) => ({
      company: item.company,
      role: item.role,
      matchPercentage: item.matchPercentage,
      strengthSkills: item.matchedSkills.slice(0, 3),
      gapSkills: item.missingSkills.slice(0, 3),
      estimatedWeeksToReady: Math.max(2, item.missingSkills.length * 2),
    })),
    progressTracker: statusCount,
    projectSuggestions,
    recruiterChecklist: [
      "One role-aligned project with README and screenshots",
      "One deployed project link with clean documentation",
      "Interview prep notes for top 20 role questions",
    ],
    roadmapByRole: buildRoadmapByRole(recommendations),
    learningStats: {
      streakDays: user.learningStats?.streakDays || 0,
      hoursThisWeek: user.learningStats?.hoursThisWeek || 0,
    },
    applicationReadiness,
    recommendedJobs: recommendations.slice(0, 5).map((item) => ({
      company: item.company,
      role: item.role,
      matchPercentage: item.matchPercentage,
    })),
    savedSkills: user.savedSkills || [],
    savedCareerPaths: normalizeCareerPaths(user.savedCareerPaths || []),
    feedbackSummary: {
      total: user.recommendationFeedback?.length || 0,
      relevantCount: (user.recommendationFeedback || []).filter((item) => item.relevant).length,
    },
    portfolioProjects: user.portfolioProjects || [],
    resumeProfile: user.resumeProfile || { headline: "", summary: "", achievements: [] },
    reminders: user.reminders || [],
  };
};

const buildDashboardPayload = async (user) => {
  const jobs = await getJobsWithFallback();
  const recommendations = jobs
    .map((job) => getRecommendationForJob(user.knownSkills, job))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
  const trendingSkills = await getTrendingSkills();

  return {
    profile: {
      name: user.name,
      knownSkills: user.knownSkills,
      interests: user.interests,
      savedSkills: user.savedSkills,
    },
    personalDashboard: buildPersonalDashboard(user, recommendations),
    recommendations,
    trendingSkills,
  };
};

const writeAudit = async (userId, action, metadata = {}) => {
  await AuditLog.create({
    userId,
    action,
    metadata,
  });
};

export const getDashboardData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const payload = await buildDashboardPayload(user);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

export const saveSkill = async (req, res, next) => {
  try {
    const { skill } = req.validatedBody || req.body;
    const user = await User.findById(req.user.id);

    if (!user.savedSkills.includes(skill)) {
      user.savedSkills.push(skill);
      await user.save();
      await writeAudit(req.user.id, "save_skill", { skill });
    }

    res.status(200).json({ savedSkills: user.savedSkills });
  } catch (error) {
    next(error);
  }
};

export const rateRecommendation = async (req, res, next) => {
  try {
    const { jobRole, rating, relevant, reason, company } = req.validatedBody || req.body;
    const user = await User.findById(req.user.id);

    if (typeof rating === "number") {
      user.recommendationRatings.push({ jobRole, rating });
    }
    user.recommendationFeedback.push({ company, jobRole, relevant, reason });

    await user.save();
    await writeAudit(req.user.id, "recommendation_feedback", {
      company,
      jobRole,
      relevant,
      hasReason: Boolean(reason),
      rating: typeof rating === "number" ? rating : null,
    });

    res.status(200).json({ message: "Feedback saved" });
  } catch (error) {
    next(error);
  }
};

export const updateCareerGoals = async (req, res, next) => {
  try {
    const { targetRole = "", backupRole = "", experienceLevel = "Fresher" } =
      req.validatedBody || req.body;
    const user = await User.findById(req.user.id);

    user.targetRole = targetRole;
    user.backupRole = backupRole;
    user.experienceLevel = experienceLevel;
    await user.save();
    await writeAudit(req.user.id, "update_career_goals", {
      targetRole,
      backupRole,
      experienceLevel,
    });

    res.status(200).json({
      message: "Career goals updated",
      careerGoals: {
        targetRole: user.targetRole,
        backupRole: user.backupRole,
        experienceLevel: user.experienceLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { skill, status, confidence = 1, projectTitle = "", hoursThisWeek } =
      req.validatedBody || req.body;
    const user = await User.findById(req.user.id);

    if (skill && status) {
      const existing = user.skillProgress.find((item) => item.skill === skill);
      if (existing) {
        existing.status = status;
        existing.confidence = confidence;
      } else {
        user.skillProgress.push({ skill, status, confidence });
      }
    }

    if (projectTitle && !user.completedProjects.includes(projectTitle)) {
      user.completedProjects.push(projectTitle);
    }

    if (typeof hoursThisWeek === "number") {
      user.learningStats.hoursThisWeek = hoursThisWeek;
      const today = new Date().toDateString();
      const lastLearningDay = user.learningStats.lastLearningDate
        ? new Date(user.learningStats.lastLearningDate).toDateString()
        : null;
      if (lastLearningDay !== today) {
        user.learningStats.streakDays += 1;
      }
      user.learningStats.lastLearningDate = new Date();
    }

    await user.save();
    await writeAudit(req.user.id, "update_progress", {
      skill,
      status,
      confidence,
      projectTitle,
      hoursThisWeek,
    });

    res.status(200).json({ message: "Progress updated" });
  } catch (error) {
    next(error);
  }
};

export const addCareerPath = async (req, res, next) => {
  try {
    const pathPayload = req.validatedBody || req.body;
    const user = await User.findById(req.user.id);
    user.savedCareerPaths.push(pathPayload);
    await user.save();

    const newPath = user.savedCareerPaths[user.savedCareerPaths.length - 1];
    await writeAudit(req.user.id, "add_career_path", { company: newPath.company, role: newPath.role });
    res.status(201).json({ careerPath: normalizeCareerPaths([newPath])[0] });
  } catch (error) {
    next(error);
  }
};

export const updateCareerPath = async (req, res, next) => {
  try {
    const { pathId } = req.params;
    const updates = req.validatedBody || req.body;
    const user = await User.findById(req.user.id);
    const targetPath = user.savedCareerPaths.id(pathId);

    if (!targetPath) {
      return res.status(404).json({ message: "Career path not found" });
    }

    Object.assign(targetPath, updates);
    await user.save();
    await writeAudit(req.user.id, "update_career_path", { pathId, updates });
    return res.status(200).json({ careerPath: normalizeCareerPaths([targetPath])[0] });
  } catch (error) {
    return next(error);
  }
};

export const deleteCareerPath = async (req, res, next) => {
  try {
    const { pathId } = req.params;
    const user = await User.findById(req.user.id);
    const targetPath = user.savedCareerPaths.id(pathId);

    if (!targetPath) {
      return res.status(404).json({ message: "Career path not found" });
    }

    targetPath.deleteOne();
    await user.save();
    await writeAudit(req.user.id, "delete_career_path", { pathId });
    return res.status(200).json({ message: "Career path removed" });
  } catch (error) {
    return next(error);
  }
};

export const addPortfolioProject = async (req, res, next) => {
  try {
    const { title, description = "", skills = [], githubUrl = "", liveUrl = "", status = "idea" } =
      req.body;
    const user = await User.findById(req.user.id);
    user.portfolioProjects.push({ title, description, skills, githubUrl, liveUrl, status });
    await user.save();
    await writeAudit(req.user.id, "add_portfolio_project", { title, status });
    const project = user.portfolioProjects[user.portfolioProjects.length - 1];
    return res.status(201).json({ project });
  } catch (error) {
    return next(error);
  }
};

export const updatePortfolioProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;
    const user = await User.findById(req.user.id);
    const project = user.portfolioProjects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    Object.assign(project, updates);
    await user.save();
    await writeAudit(req.user.id, "update_portfolio_project", { projectId });
    return res.status(200).json({ project });
  } catch (error) {
    return next(error);
  }
};

export const deletePortfolioProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const user = await User.findById(req.user.id);
    const project = user.portfolioProjects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    project.deleteOne();
    await user.save();
    await writeAudit(req.user.id, "delete_portfolio_project", { projectId });
    return res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    return next(error);
  }
};

export const updateResumeProfile = async (req, res, next) => {
  try {
    const { headline = "", summary = "", achievements = [] } = req.body;
    const user = await User.findById(req.user.id);
    user.resumeProfile = { headline, summary, achievements };
    await user.save();
    await writeAudit(req.user.id, "update_resume_profile", { headline });
    return res.status(200).json({ resumeProfile: user.resumeProfile });
  } catch (error) {
    return next(error);
  }
};

export const updateReminders = async (req, res, next) => {
  try {
    const { reminders = [] } = req.body;
    const user = await User.findById(req.user.id);
    user.reminders = reminders;
    await user.save();
    await writeAudit(req.user.id, "update_reminders", { count: reminders.length });
    return res.status(200).json({ reminders: user.reminders });
  } catch (error) {
    return next(error);
  }
};

export const getMockInterview = async (req, res, next) => {
  try {
    const { role } = req.params;
    const questions = mockInterviewBank[role] || [
      "Tell me about yourself.",
      "Describe a project you are proud of.",
      "How do you handle deadlines?",
    ];
    return res.status(200).json({ role, questions });
  } catch (error) {
    return next(error);
  }
};

export const compareRoles = async (req, res, next) => {
  try {
    const { roleA, roleB } = req.validatedBody || req.body;
    const user = await User.findById(req.user.id);
    const payload = await buildDashboardPayload(user);
    const comparison = buildRoleComparison(payload.recommendations, roleA, roleB);

    if (!comparison) {
      return res.status(404).json({ message: "Roles not found for comparison" });
    }

    await writeAudit(req.user.id, "compare_roles", { roleA, roleB });
    return res.status(200).json({ comparison });
  } catch (error) {
    return next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    if (analyticsCache.data && analyticsCache.expiresAt > Date.now()) {
      return res.status(200).json({ analytics: analyticsCache.data, cached: true });
    }
    const users = await User.find({});
    const jobs = await getJobsWithFallback();

    const countMap = (items) => {
      const map = new Map();
      items.forEach((value) => {
        if (!value) return;
        map.set(value, (map.get(value) || 0) + 1);
      });
      return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));
    };

    const topTargetRoles = countMap(users.map((user) => user.targetRole));
    const mostSavedSkills = countMap(users.flatMap((user) => user.savedSkills || []));
    const topCareerPaths = countMap(
      users.flatMap((user) => (user.savedCareerPaths || []).map((path) => `${path.company} - ${path.role}`))
    );
    const feedbackByRole = countMap(
      users.flatMap((user) => (user.recommendationFeedback || []).map((item) => item.jobRole))
    );
    const topMissingSkills = countMap(
      jobs.flatMap((job) => job.requiredSkills || []).map((skill) => skill.toLowerCase())
    );

    const analytics = {
      totalUsers: users.length,
      totalJobs: jobs.length,
      topTargetRoles,
      mostSavedSkills,
      topCareerPaths,
      feedbackByRole,
      topMissingSkills,
    };

    analyticsCache = {
      data: analytics,
      expiresAt: Date.now() + 60 * 1000,
    };

    return res.status(200).json({ analytics });
  } catch (error) {
    return next(error);
  }
};
