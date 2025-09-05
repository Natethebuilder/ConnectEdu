// server/src/seed/seed.ts
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import "dotenv/config";
import University from "../models/University.js";
import { fileURLToPath } from "url";
import { normalizeEntryRequirements } from "../utils/normalizeEntryRequirements.js";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const uri = process.env.MONGO_URI!;
  if (!uri) throw new Error("MONGO_URI missing");

  await mongoose.connect(uri);
  console.log("✅ Mongo connected");

  const file = path.join(__dirname, "universities.json");
  const raw = fs.readFileSync(file, "utf-8");
  const items = JSON.parse(raw);

  const docs = items.map((u: any) => {
    // normalize programs
    const programs = new Map<string, any>();
    for (const [k, v] of Object.entries(u.programs || {})) {
      const val = v as any;
      programs.set(k, {
        offered: val.offered === false ? false : true,
        entryRequirements: normalizeEntryRequirements(val.entryRequirements),
        applicationProcess: val.applicationProcess,
        applicationFee: val.applicationFee,
        annualTuition: val.annualTuition,
      });
    }

    // normalize resources
    let resources: { title: string; url: string }[] = [];
    if (Array.isArray(u.resources)) {
      resources = u.resources.map((r: any) => {
        if (typeof r === "string") {
          return { title: r, url: "#" }; // fallback if just a string
        } else {
          return { title: r.title || "Resource", url: r.url || "#" };
        }
      });
    }

    return {
      name: u.name,
      rank: u.rank,
      location: u.location,
      programs,
      scholarships: u.scholarships || [],
      resources,
    };
  });

  // reset + seed
  await University.deleteMany({});
  console.log("🗑️ Old universities removed");

  const bulk = University.collection.initializeOrderedBulkOp();
  for (const d of docs) {
    bulk.find({ name: d.name }).upsert().updateOne({ $set: d });
  }
  const res = await bulk.execute();

  console.log("✅ Seed complete:", {
    inserted: res.insertedCount,
    matched: res.matchedCount,
    modified: res.modifiedCount,
    deleted: res.deletedCount,
    upserted: res.upsertedCount,
  });

  const total = await University.countDocuments();
  console.log(`📊 Total universities in DB: ${total}`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
