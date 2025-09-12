import mongoose, { Schema, Document } from "mongoose";

export interface ProgramInfo {
  entryRequirements?: Record<string, string>;
  fees?: {
    local?: string | number;
    international?: string | number;
  };
  duration?: string;
  degreeType?: string;
}

export interface University extends Document {
  name: string;
  rank?: number;
  city?: string;
  country?: string;
  website?: string;
  photoUrl?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  programs?: {
    [discipline: string]: ProgramInfo;
  };
}

const UniversitySchema = new Schema<University>(
  {
    name: { type: String, required: true },
    rank: { type: Number },
    city: { type: String },
    country: { type: String },
    website: { type: String },
    photoUrl: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lon, lat]
    },
    programs: { type: Schema.Types.Mixed }, // flexible discipline -> ProgramInfo
  },
  { timestamps: true }
);

UniversitySchema.index({ location: "2dsphere" }); // ✅ spatial queries if needed

export default mongoose.model<University>("University", UniversitySchema);
