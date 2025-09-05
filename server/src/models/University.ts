// server/src/models/University.ts
import { Schema, model, Document } from "mongoose";

export interface IEntryRequirements {
  highSchool?: string;
  standardizedTests?: string;
  diploma?: string;
  ib?: string;
  aLevels?: string;
  admissionsTest?: string;
}

export interface IProgram {
  offered?: boolean; // default true; false if not offered
  entryRequirements?: IEntryRequirements;
  applicationProcess?: string;
  applicationFee?: string;
  annualTuition?: string;
}

export interface IResource {
  title: string;
  url: string;
}

export interface IUniversity extends Document {
  name: string;
  rank: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  programs: Map<string, IProgram>;
  scholarships?: string[];
  resources?: IResource[];
}

const EntryRequirementsSchema = new Schema<IEntryRequirements>(
  {
    highSchool: String,
    standardizedTests: String,
    diploma: String,
    ib: String,
    aLevels: String,
    admissionsTest: String,
  },
  { _id: false }
);

const ProgramSchema = new Schema<IProgram>(
  {
    offered: { type: Boolean, default: true },
    entryRequirements: EntryRequirementsSchema,
    applicationProcess: String,
    applicationFee: String,
    annualTuition: String,
  },
  { _id: false }
);

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const UniversitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, index: true },
    rank: { type: Number, required: true, index: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: "location.coordinates must be [lng, lat]",
        },
      },
    },
    programs: {
      type: Map,
      of: ProgramSchema,
      required: true,
    },
    scholarships: [String],
    resources: [ResourceSchema], // ✅ objects with {title,url}
  },
  { timestamps: true }
);

UniversitySchema.index({ location: "2dsphere" });

export default model<IUniversity>("University", UniversitySchema);
