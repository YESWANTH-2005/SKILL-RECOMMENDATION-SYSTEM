import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    knownSkills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    savedSkills: { type: [String], default: [] },
    recommendationRatings: [
      {
        jobRole: String,
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    recommendationFeedback: [
      {
        company: String,
        jobRole: String,
        relevant: { type: Boolean, default: true },
        reason: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    targetRole: { type: String, default: "" },
    backupRole: { type: String, default: "" },
    experienceLevel: { type: String, default: "Fresher" },
    skillProgress: [
      {
        skill: String,
        status: {
          type: String,
          enum: ["not_started", "in_progress", "practicing", "job_ready", "completed"],
          default: "not_started",
        },
        confidence: { type: Number, min: 1, max: 5, default: 1 },
      },
    ],
    weeklyPlan: [
      {
        week: String,
        title: String,
        status: {
          type: String,
          enum: ["not_started", "in_progress", "completed"],
          default: "not_started",
        },
      },
    ],
    completedProjects: { type: [String], default: [] },
    learningStats: {
      streakDays: { type: Number, default: 0 },
      hoursThisWeek: { type: Number, default: 0 },
      lastLearningDate: { type: Date, default: null },
    },
    dashboardPreferences: {
      showBackupRole: { type: Boolean, default: true },
    },
    savedCareerPaths: [
      {
        company: String,
        role: String,
        targetDate: String,
        notes: String,
        status: {
          type: String,
          enum: ["planned", "active", "paused", "completed"],
          default: "planned",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tokenVersion: { type: Number, default: 0 },
    portfolioProjects: [
      {
        title: String,
        description: String,
        skills: { type: [String], default: [] },
        githubUrl: String,
        liveUrl: String,
        status: {
          type: String,
          enum: ["idea", "in_progress", "completed"],
          default: "idea",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resumeProfile: {
      headline: { type: String, default: "" },
      summary: { type: String, default: "" },
      achievements: { type: [String], default: [] },
    },
    reminders: [
      {
        label: String,
        frequency: { type: String, default: "weekly" },
        enabled: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
