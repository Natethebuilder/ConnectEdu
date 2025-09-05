// server/src/utils/normalizeEntryRequirements.ts
interface RawEntryRequirements {
  [key: string]: string;
}

export function normalizeEntryRequirements(raw: RawEntryRequirements = {}) {
  return {
    highSchool: raw.HighSchoolDiploma || raw["High School"] || null,
    standardizedTests: raw.StandardizedTests || raw["Standardized Tests"] || null,
    diploma: raw.Diploma || null,
    ib: raw.IB || raw.Ib || null,
    aLevels: raw["A-levels"] || raw.ALevels || null,
    admissionsTest: raw.AdmissionsTest || raw["Admissions Test"] || null,
  };
}
