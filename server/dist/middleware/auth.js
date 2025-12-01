import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or malformed token" });
    }
    const token = header.slice(7);
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.userId = decoded.sub || decoded.user_id || decoded.id;
        next();
    }
    catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
