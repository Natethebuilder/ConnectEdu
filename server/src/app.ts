import express from "express";
import cors from "cors";
import universitiesRouter from "./routes/universities.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true }));
app.use("/api/universities", universitiesRouter);

export default app;
