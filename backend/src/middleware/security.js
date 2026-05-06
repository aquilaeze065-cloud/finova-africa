const rateLimit = require("express-rate-limit");

// Strict rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts
  message: { error: "Too many attempts. Please wait 15 minutes and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: "Too many requests. Please slow down." },
});

// Admin rate limit
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many admin requests." },
});

// Input sanitizer - removes dangerous characters
function sanitize(obj) {
  if (typeof obj === "string") {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
}

function sanitizeInput(req, res, next) {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  next();
}

// Block suspicious requests
function blockSuspicious(req, res, next) {
  const suspicious = [
    "eval(", "exec(", "system(", "DROP TABLE", "SELECT *",
    "<script>", "javascript:", "UNION SELECT", "../", "etc/passwd",
  ];
  const body = JSON.stringify(req.body || "").toLowerCase();
  const url  = decodeURIComponent(req.url).toLowerCase();
  for (const pattern of suspicious) {
    if (body.includes(pattern.toLowerCase()) || url.includes(pattern.toLowerCase())) {
      return res.status(400).json({ error: "Invalid request detected" });
    }
  }
  next();
}

module.exports = { authLimiter, apiLimiter, adminLimiter, sanitizeInput, blockSuspicious };
