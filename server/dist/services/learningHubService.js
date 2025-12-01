import LearningHub from "../models/LearningHub.js";
import fs from "fs";
import path from "path";
export async function getLearningHubData(discipline) {
    let hub = await LearningHub.findOne({ discipline });
    if (!hub) {
        // fallback to static JSON
        const filePath = path.join(__dirname, "../data/learningHub", `${discipline}.json`);
        if (!fs.existsSync(filePath))
            throw new Error("Discipline not found");
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        hub = await LearningHub.create(data);
    }
    return hub;
}
