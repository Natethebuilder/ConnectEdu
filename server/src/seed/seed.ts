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

// ---- helpers ----
const normalizeSlug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, "-")   // "Art & Design" -> "art-design"
    .replace(/[\s_]+/g, "-")    // spaces/underscores -> hyphen
    .replace(/-+/g, "-");       // collapse multiple hyphens

/** Normalize all keys inside programs: {"Art & Design":{}} -> {"art-design":{}} */
function normalizePrograms(programs: any): any {
  if (!programs || typeof programs !== "object") return programs;
  const out: Record<string, any> = {};
  for (const k of Object.keys(programs)) {
    const nk = normalizeSlug(k);
    out[nk] = programs[k];
  }
  return out;
}

async function seed() {
  try {
    await connectDB();

    // clear old data
    await University.deleteMany({});
    await LearningHub.deleteMany({});
    console.log("🗑️ Cleared existing universities and learning hubs");

    // ----- Seed universities -----
    const uniFiles = fs
      .readdirSync(uniDir)
      .filter((f) => f.endsWith(".json") && !f.startsWith("."));

    let totalUnis = 0;

    for (const file of uniFiles) {
      const rawDiscipline = path.basename(file, ".json"); // e.g. "art-design"
      const discipline = normalizeSlug(rawDiscipline);
      const filePath = path.join(uniDir, file);

      try {
        const raw = fs.readFileSync(filePath, "utf-8").trim();
        if (!raw) {
          console.warn(`⚠️ Skipped empty file: ${file}`);
          continue;
        }
        const universities = JSON.parse(raw);
        if (!Array.isArray(universities)) {
          console.warn(`⚠️ Skipped (not an array): ${file}`);
          continue;
        }

        const normalized = universities.map((u: any, idx: number) => {
          const programs = normalizePrograms(u.programs);

          // Ensure there is at least a programs[discipline] key (helps if file used a display name)
          if (
            programs &&
            typeof programs === "object" &&
            !Object.prototype.hasOwnProperty.call(programs, discipline)
          ) {
            // If there is exactly one program key, mirror it to the normalized discipline
            const keys = Object.keys(programs);
            if (keys.length === 1) {
              programs[discipline] = programs[keys[0]];
            }
          }

          return {
            ...u,
            programs,
            discipline,             // store normalized discipline
            rank: Number(u.rank) || idx + 1, // ensure number, fallback to order
            name: String(u.name || "").trim(),
            city: u.city,
            country: u.country,
            website: u.website,
            photoUrl: u.photoUrl,
            location: u.location,
          };
        });

        await University.insertMany(normalized);
        console.log(`🏫 Inserted ${normalized.length} ${discipline} universities from ${file}`);
        totalUnis += normalized.length;
      } catch (e: any) {
        console.error(`❌ Failed to seed universities from ${file}:`, e.message);
      }
    }

    // ----- Seed learning hubs -----
    const learningFiles = fs
      .readdirSync(learningDir)
      .filter((f) => f.endsWith(".json") && !f.startsWith("."));
    let totalHubs = 0;

    for (const file of learningFiles) {
      const filePath = path.join(learningDir, file);
      try {
        const raw = fs.readFileSync(filePath, "utf-8").trim();
        if (!raw) {
          console.warn(`⚠️ Skipped empty learning file: ${file}`);
          continue;
        }
        const hubData = JSON.parse(raw);

        if (!hubData || !hubData.discipline || !Array.isArray(hubData.stages)) {
          console.warn(`⚠️ Skipped invalid learning hub JSON: ${file}`);
          continue;
        }

        // normalize discipline slug for learning hubs too
        hubData.discipline = normalizeSlug(hubData.discipline);
        await LearningHub.create(hubData);
        console.log(`🧠 Inserted learning hub for ${hubData.discipline}`);
        totalHubs++;
      } catch (e: any) {
        console.error(`❌ Failed to seed learning hub from ${file}:`, e.message);
      }
    }

    console.log(`🎉 Done! ${totalUnis} universities + ${totalHubs} learning hubs seeded.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
