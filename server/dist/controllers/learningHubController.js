import * as service from "../services/learningHubService.js";
export async function getLearningHub(req, res) {
    try {
        const { discipline } = req.params;
        const data = await service.getLearningHubData(discipline.toLowerCase());
        res.json(data);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(404).json({ message: err.message });
        }
        else {
            res.status(404).json({ message: String(err) });
        }
    }
}
