// server/src/seed/seed.ts
import "dotenv/config";
import { connectDB } from "../config/db.js";
import University from "../models/University.js";
import LearningHub from "../models/LearningHub.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uniDir = path.join(__dirname, "data/universities");
const learningDir = path.join(__dirname, "data/learning");

async function seed() {
  try {
    await connectDB();

    // clear old data
    await University.deleteMany({});
    await LearningHub.deleteMany({});
    console.log("🗑️ Cleared existing universities and learning hubs");

    // ----- Seed universities -----
    const uniFiles = fs.readdirSync(uniDir).filter(f => f.endsWith(".json"));
    let totalUnis = 0;

    for (const file of uniFiles) {
      const filePath = path.join(uniDir, file);
      const universities = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (!Array.isArray(universities)) continue;

      await University.insertMany(universities);
      console.log(`🏫 Inserted ${universities.length} universities from ${file}`);
      totalUnis += universities.length;
    }

    // ----- Seed learning hubs -----
    const learningFiles = fs.readdirSync(learningDir).filter(f => f.endsWith(".json"));
    let totalHubs = 0;

    for (const file of learningFiles) {
      const filePath = path.join(learningDir, file);
      const hubData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (!hubData || !hubData.discipline || !Array.isArray(hubData.stages)) continue;

      await LearningHub.create(hubData);
      console.log(`🧠 Inserted learning hub for ${hubData.discipline}`);
      totalHubs++;
    }

    console.log(`🎉 Done! ${totalUnis} universities + ${totalHubs} learning hubs seeded.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
