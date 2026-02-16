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
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
