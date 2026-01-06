import { Schema, model } from "mongoose";

const allowedEmailSchema = new Schema({
  email: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AllowedEmail = model("AllowedEmail", allowedEmailSchema);



