import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // link, video, document, checklist, etc.
  title: { type: String, required: true },
  url: { type: String, required: true }
});

const TaskSchema = new mongoose.Schema({
  type: { type: String, required: true }, // checklist, tracker, etc.
  title: { type: String, required: true },
  url: { type: String, required: false }
});

const StageSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  color: { type: String },
  estimatedTime: { type: String },
  resources: [ResourceSchema],
  tasks: [TaskSchema]
});

const LearningHubSchema = new mongoose.Schema({
  discipline: { type: String, required: true, unique: true },
  stages: [StageSchema]
});

export default mongoose.model("LearningHub", LearningHubSchema);
