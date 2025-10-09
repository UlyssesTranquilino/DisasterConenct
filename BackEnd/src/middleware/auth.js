import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
	const header = req.headers.authorization || "";
	const token = header.startsWith("Bearer ") ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: "Missing bearer token" });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me");
		req.user = payload;
		return next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

