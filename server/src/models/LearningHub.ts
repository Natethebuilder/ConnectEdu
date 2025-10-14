import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  title: String,
  type: String, // "course", "article", "project"
  link: String,
  platform: String,
  estimatedHours: Number,
});

const RegionSchema = new mongoose.Schema({
  overview: String,
  resources: [ResourceSchema],
  checklist: [String],
});

const StageSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  regions: { type: Map, of: RegionSchema },
});

const LearningHubSchema = new mongoose.Schema({
  discipline: { type: String, unique: true },
  stages: [StageSchema],
});

export default mongoose.model("LearningHub", LearningHubSchema);
