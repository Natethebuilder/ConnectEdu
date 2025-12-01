// server/src/utils/errorHandler.ts
export function handleError(res, message = "Server error", code = 500) {
    return res.status(code).json({ error: message });
}
