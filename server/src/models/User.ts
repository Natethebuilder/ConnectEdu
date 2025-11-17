// server/src/models/User.ts
import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["student", "mentor"], required: true }, // ✅ add role
  interests: [String],
  savedUniversities: [{ type: Schema.Types.ObjectId, ref: "University" }]
}, { timestamps: true });

export const User = model("User", userSchema);
