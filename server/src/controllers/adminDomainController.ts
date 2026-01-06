import { Request, Response } from "express";
import { AllowedEmail } from "../models/AllowedDomain.js";

export async function checkEmail(req: Request, res: Response) {
  // Decode the email from URL encoding
  const { email } = req.params;
  const decodedEmail = decodeURIComponent(email);
  
  // Normalize email (lowercase, trim whitespace)
  const normalizedEmail = decodedEmail.toLowerCase().trim();
  
  const found = await AllowedEmail.findOne({ email: normalizedEmail });
  
  // Also check case-insensitive match in case email was stored with different casing
  const foundCaseInsensitive = found || await AllowedEmail.findOne({ 
    email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") }
  });
  
  res.json({ allowed: Boolean(foundCaseInsensitive) });
}

export async function addEmail(req: Request, res: Response) {
  const { email } = req.body;
  const created = await AllowedEmail.create({ email });
  res.json(created);
}

export async function removeEmail(req: Request, res: Response) {
  const { email } = req.params;
  await AllowedEmail.deleteOne({ email });
  res.json({ success: true });
}

export async function listEmails(req: Request, res: Response) {
  const docs = await AllowedEmail.find();
  res.json(docs);
}

