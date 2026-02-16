import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true },
    requiredSkills: { type: [String], required: true },
    learningResources: [
      {
        title: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
