import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: passwordSchema,
  knownSkills: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token is required"),
});
