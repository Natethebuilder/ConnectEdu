import { supabase } from "../lib/supabase";

export async function saveReflection(userId: string, discipline: string, stageId: number, text: string) {
  const { data: existing } = await supabase
    .from("learning_progress")
    .select("reflections")
    .eq("user_id", userId)
    .eq("discipline", discipline)
    .single();

  const reflections = existing?.reflections || {};
  reflections[stageId] = text;

  return supabase
    .from("learning_progress")
    .upsert({ user_id: userId, discipline, reflections })
    .select();
}

export async function saveQuizScore(userId: string, discipline: string, stageId: number, score: number) {
  const { data: existing } = await supabase
    .from("learning_progress")
    .select("quiz_scores")
    .eq("user_id", userId)
    .eq("discipline", discipline)
    .single();

  const quiz_scores = existing?.quiz_scores || {};
  quiz_scores[stageId] = score;

  return supabase
    .from("learning_progress")
    .upsert({ user_id: userId, discipline, quiz_scores })
    .select();
}
