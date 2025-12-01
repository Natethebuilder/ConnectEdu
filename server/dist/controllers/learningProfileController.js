import { supabase } from "../supabaseClient.js";
// GET /api/learning-profiles/:user_id
export const getLearningProfile = async (req, res) => {
    const { user_id } = req.params;
    const { data, error } = await supabase
        .from("learning_profiles")
        .select("*")
        .eq("user_id", user_id)
        .single();
    if (error && error.code !== "PGRST116") {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
    if (!data)
        return res.status(404).json({ message: "Not found" });
    res.json(data);
};
// POST /api/learning-profiles
export const upsertLearningProfile = async (req, res) => {
    const { user_id, avatarUrl } = req.body;
    if (!user_id || !avatarUrl) {
        return res.status(400).json({ message: "Missing user_id or avatarUrl" });
    }
    const { data, error } = await supabase
        .from("learning_profiles")
        .upsert({
        user_id,
        avatar_url: avatarUrl, // ✅ correct column
        discipline: "physics",
        profile_strength: 0,
        xp: 0,
        stage: "beginner",
        stats: {},
    }, { onConflict: "user_id" })
        .select()
        .single();
    if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
};
