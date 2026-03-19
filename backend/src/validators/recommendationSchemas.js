import { z } from "zod";

const asSafeString = (value) => (typeof value === "string" ? value : "");

export const saveSkillSchema = z.object({
  skill: z.string().trim().min(1, "Skill is required"),
});

export const feedbackSchema = z.object({
  jobRole: z.string().trim().min(1, "Job role is required"),
  company: z.string().trim().optional().default(""),
  rating: z.number().int().min(1).max(5).optional(),
  relevant: z.boolean().optional().default(true),
  reason: z.string().trim().max(220).optional().default(""),
});

export const goalsSchema = z.object({
  targetRole: z.string().trim().optional().default(""),
  backupRole: z.string().trim().optional().default(""),
  experienceLevel: z.string().trim().optional().default("Fresher"),
});

export const progressSchema = z.object({
  skill: z.string().trim().optional().default(""),
  status: z
    .enum(["not_started", "in_progress", "practicing", "job_ready", "completed"])
    .optional(),
  confidence: z.number().int().min(1).max(5).optional().default(1),
  projectTitle: z.string().trim().optional().default(""),
  hoursThisWeek: z.number().min(0).max(168).optional(),
});

export const careerPathSchema = z.object({
  company: z.preprocess(asSafeString, z.string().trim().min(1, "Company is required")),
  role: z.preprocess(asSafeString, z.string().trim().min(1, "Role is required")),
  targetDate: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
  notes: z.preprocess(asSafeString, z.string().trim().max(280)).optional().default(""),
  status: z.enum(["planned", "active", "paused", "completed"]).optional().default("planned"),
});

export const updateCareerPathSchema = z.object({
  targetDate: z.string().trim().optional(),
  notes: z.string().trim().max(280).optional(),
  status: z.enum(["planned", "active", "paused", "completed"]).optional(),
});

export const compareRolesSchema = z.object({
  roleA: z.string().trim().min(1, "roleA is required"),
  roleB: z.string().trim().min(1, "roleB is required"),
});

export const portfolioSchema = z.object({
  title: z.string().trim().min(1, "Project title is required"),
  description: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  githubUrl: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
  liveUrl: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
  status: z.enum(["idea", "in_progress", "completed"]).optional().default("idea"),
});

export const resumeSchema = z.object({
  headline: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
  summary: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
  achievements: z.array(z.string()).optional().default([]),
});

export const remindersSchema = z.object({
  reminders: z.array(
    z.object({
      label: z.preprocess(asSafeString, z.string().trim()).optional().default(""),
      frequency: z.preprocess(asSafeString, z.string().trim()).optional().default("weekly"),
      enabled: z.boolean().optional().default(true),
    })
  ).optional().default([]),
});
