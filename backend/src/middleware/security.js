const rateLimit = require("express-rate-limit");
const helmet    = require("helmet");
const hpp       = require("hpp");

// ── RATE LIMITERS ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error:"Too many login attempts. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 3,
  message: { error:"Too many OTP requests. Please wait 5 minutes." },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  message: { error:"Too many requests. Please slow down." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error:"Too many admin requests." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error:"Too many uploads. Please wait." },
});

// ── INPUT SANITIZER ──
function sanitizeInput(req, res, next) {
  function clean(obj) {
    if (typeof obj === "string") {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/eval\s*\(/gi, "")
        .replace(/\$where/gi, "")
        .replace(/\$ne/gi, "")
        .replace(/\$gt/gi, "")
        .replace(/\{\s*\$[a-z]/gi, "")
        .trim();
    }
    if (Array.isArray(obj)) return obj.map(clean);
    if (obj && typeof obj === "object") {
      const result = {};
      for (const key of Object.keys(obj)) {
        const cleanKey = clean(key);
        result[cleanKey] = clean(obj[key]);
      }
      return result;
    }
    return obj;
  }
  if (req.body)  req.body  = clean(req.body);
  if (req.query) req.query = clean(req.query);
  next();
}

// ── BLOCK SUSPICIOUS REQUESTS ──
const BLOCKED_PATTERNS = [
  /\.\.\//,           // Path traversal
  /etc\/passwd/,      // Linux file access
  /proc\/self/,       // Process info
  /<script/i,         // XSS
  /union.*select/i,   // SQL injection
  /drop\s+table/i,    // SQL injection
  /insert\s+into/i,   // SQL injection
  /delete\s+from/i,   // SQL injection  
  /exec\s*\(/i,       // Code execution
  /base64_decode/i,   // Encoded attacks
  /\/wp-admin/,       // WordPress scans
  /\/phpmyadmin/,     // DB admin scans
  /\.php$/,           // PHP file access
  /\.env$/,           // Env file access
  /\.git\//,          // Git access
  /xmlrpc\.php/,      // XML-RPC attacks
];

function blockSuspicious(req, res, next) {
  const url  = decodeURIComponent(req.url).toLowerCase();
  const body = JSON.stringify(req.body || "").toLowerCase();
  const ua   = req.headers["user-agent"] || "";

  // Block suspicious URLs
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url) || pattern.test(body)) {
      console.warn(`🚨 Blocked suspicious request: ${req.ip} → ${req.url}`);
      return res.status(400).json({ error:"Invalid request" });
    }
  }

  // Block known bad user agents
  const badAgents = ["sqlmap", "nikto", "nmap", "masscan", "zgrab", "dirbuster", "burpsuite"];
  if (badAgents.some(b => ua.toLowerCase().includes(b))) {
    console.warn(`🚨 Blocked bad agent: ${ua}`);
    return res.status(403).json({ error:"Forbidden" });
  }

  next();
}

// ── SECURITY HEADERS ──
function securityHeaders(app) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        fontSrc:     ["'self'", "https://fonts.gstatic.com"],
        imgSrc:      ["'self'", "data:", "https:", "blob:"],
        connectSrc:  ["'self'", "https://api.coingecko.com", "https://api.mailersend.com"],
        frameSrc:    ["'none'"],
        objectSrc:   ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy:"cross-origin" },
    hsts: { maxAge:31536000, includeSubDomains:true, preload:true },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy:"strict-origin-when-cross-origin" },
  }));
}

// ── BRUTE FORCE IP TRACKER ──
const failedAttempts = new Map();
const BLOCK_THRESHOLD = 20;
const BLOCK_DURATION  = 30 * 60 * 1000; // 30 minutes

function bruteForceProtection(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (failedAttempts.has(ip)) {
    const data = failedAttempts.get(ip);
    // Clear if block duration passed
    if (now - data.firstFail > BLOCK_DURATION) {
      failedAttempts.delete(ip);
    } else if (data.count >= BLOCK_THRESHOLD) {
      const remaining = Math.ceil((BLOCK_DURATION - (now - data.firstFail)) / 60000);
      return res.status(429).json({
        error:`Too many failed attempts. Your IP is temporarily blocked. Try again in ${remaining} minutes.`
      });
    }
  }
  next();
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  if (!failedAttempts.has(ip)) {
    failedAttempts.set(ip, { count:1, firstFail:now });
  } else {
    const data = failedAttempts.get(ip);
    data.count++;
    failedAttempts.set(ip, data);
  }
}

function clearFailedAttempts(ip) {
  failedAttempts.delete(ip);
}

// ── PARAMETER POLLUTION PROTECTION ──
const hppProtect = hpp();

// ── REQUEST SIZE LIMITER ──
const REQUEST_SIZE = "5mb";

// ── HIDE SERVER INFO ──
function hideServerInfo(req, res, next) {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
}

// ── LOG SUSPICIOUS ACTIVITY ──
function activityLogger(req, res, next) {
  const suspicious = ["/admin", "/wp-", "/api/auth/signin", "/api/auth/signup"];
  if (suspicious.some(s => req.url.includes(s))) {
    console.log(`📍 ${new Date().toISOString()} | ${req.method} ${req.url} | IP: ${req.ip}`);
  }
  next();
}

module.exports = {
  authLimiter,
  otpLimiter,
  apiLimiter,
  adminLimiter,
  uploadLimiter,
  sanitizeInput,
  blockSuspicious,
  securityHeaders,
  bruteForceProtection,
  recordFailedAttempt,
  clearFailedAttempts,
  hppProtect,
  REQUEST_SIZE,
  hideServerInfo,
  activityLogger,
};
