import * as universityService from "../services/universityService.js";
export async function getUniversities(req, res) {
    try {
        const { course } = req.query;
        const universities = await universityService.findUniversities(course);
        res.json(universities);
    }
    catch (err) {
        console.error("❌ Error fetching universities:", err);
        res.status(500).json({ error: "Failed to fetch universities" });
    }
}
export async function getUniversityById(req, res) {
    try {
        const uni = await universityService.findUniversityById(req.params.id);
        if (!uni) {
            return res.status(404).json({ error: "University not found" });
        }
        res.json(uni);
    }
    catch (err) {
        console.error("❌ Error fetching university:", err);
        res.status(500).json({ error: "Failed to fetch university" });
    }
}
