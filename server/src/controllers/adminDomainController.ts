import { Request, Response } from "express";
import { AllowedDomain } from "../models/AllowedDomain.js";

export async function checkDomain(req: Request, res: Response) {
  const { domain } = req.params;
  const found = await AllowedDomain.findOne({ domain });
  res.json({ allowed: Boolean(found) });
}

export async function addDomain(req: Request, res: Response) {
  const { domain } = req.body;
  const created = await AllowedDomain.create({ domain });
  res.json(created);
}

export async function removeDomain(req: Request, res: Response) {
  const { domain } = req.params;
  await AllowedDomain.deleteOne({ domain });
  res.json({ success: true });
}

export async function listDomains(req: Request, res: Response) {
  const docs = await AllowedDomain.find();
  res.json(docs);
}
