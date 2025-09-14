import LearningHub from "../models/LearningHub.js";

export async function getLearningHubByDiscipline(discipline: string) {
  return await LearningHub.findOne({
    discipline: { $regex: new RegExp(`^${discipline}$`, "i") }
  });
}

export async function createOrUpdateLearningHub(data: any) {
  const normalized = {
    ...data,
    discipline: data.discipline.toLowerCase()
  };

  return await LearningHub.findOneAndUpdate(
    { discipline: normalized.discipline },
    normalized,
    { upsert: true, new: true }
  );
}
