import http from "./http";
import type { LearningHub } from "../types";

/**
 * Fetch a single learning hub by discipline
 */
export async function fetchLearningHub(discipline: string) {
  const res = await http.get<LearningHub>(`/api/learning-hub/${discipline}`);
  return res.data;
}
