import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "../models/Job.js";
import { jobCatalog } from "./jobCatalog.js";

dotenv.config();

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Job.deleteMany({});
    await Job.insertMany(jobCatalog);
    console.log("Jobs seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedJobs();
