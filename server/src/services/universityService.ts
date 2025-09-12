// server/src/services/universityService.ts
import University from "../models/University.js";

export async function findUniversities(course?: string) {
  if (course) {
    return University.find({ [`programs.${course}`]: { $exists: true } }).lean();
  }
  return University.find().lean();
}

export async function findUniversityById(id: string) {
  return University.findById(id).lean();
}
