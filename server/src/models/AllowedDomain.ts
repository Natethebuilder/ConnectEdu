import { Schema, model } from "mongoose";

const allowedDomainSchema = new Schema({
  domain: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AllowedDomain = model("AllowedDomain", allowedDomainSchema);
