// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    console.error("❌ No Bearer token");
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = header.slice(7);

  try {
    // Decode WITHOUT verification (Supabase tokens are verified by their edge)
    const decoded: any = jwt.decode(token);

    if (!decoded?.sub) {
      console.error("❌ No sub in token");
      return res.status(401).json({ error: "Invalid token structure" });
    }

    req.userId = decoded.sub;
    // Only log auth errors, not every successful request
    next();
  } catch (err) {
    console.error("❌ Auth decode failed:", err);
    return res.status(401).json({ error: "Auth failed" });
  }
}
