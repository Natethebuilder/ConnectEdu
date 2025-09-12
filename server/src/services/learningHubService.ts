import LearningHub from "../models/LearningHub.js";

export async function getLearningHubByDiscipline(discipline: string) {
  return await LearningHub.findOne({ discipline });
}

export async function createOrUpdateLearningHub(data: any) {
  return await LearningHub.findOneAndUpdate(
    { discipline: data.discipline },
    data,
    { upsert: true, new: true }
  );
}
