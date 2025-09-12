// --- University Types ---
export type ProgramInfo = {
  entryRequirements?: Record<string, string>;
  fees?: {
    local?: string | number;
    international?: string | number;
  };
};

export type University = {
  _id: string;
  name: string;
  rank?: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  programs?: Record<string, ProgramInfo>;

  // 👇 optional fields for UI
  city?: string;
  country?: string;
  website?: string;
  photoUrl?: string;
};


// --- Learning Hub Types ---
export type LearningResource = {
  title: string;
  type: "link" | "pdf" | "video" | "article" | "task";
  url: string;
  description?: string;
};

export type LearningStage = {
  title: string;
  description: string;
  resources: LearningResource[];
};

export type LearningHub = {
  _id: string;
  discipline: string;
  stages: LearningStage[];
};
