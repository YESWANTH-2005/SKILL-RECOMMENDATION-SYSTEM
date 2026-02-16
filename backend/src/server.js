import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

dotenv.config();

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start();
