export type EntryRequirements = {
  highSchool?: string;
  standardizedTests?: string;
  diploma?: string;
  ib?: string;
  aLevels?: string;
  admissionsTest?: string;
  SAT?: string;
  ACT?: string;
};

export type ProgramInfo = {
  offered?: boolean;
  entryRequirements?: EntryRequirements;
  applicationProcess?: string;
  applicationFee?: string;
  annualTuition?: string;
};

export type Resource = { title: string; url: string };

export type University = {
  _id: string;
  name: string;
  rank?: number;
  location: { type: string; coordinates: [number, number] };
  programs?: Record<string, ProgramInfo>; // discipline → info
  scholarships?: string[];
  resources?: Resource[];
};
