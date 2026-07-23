require("dotenv").config();
require("./services/scheduler");
require("./services/blockchainMonitor");

const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");

const {
  authLimiter, otpLimiter, apiLimiter, adminLimiter,
  sanitizeInput, blockSuspicious, securityHeaders,
  bruteForceProtection, hppProtect,
  hideServerInfo, activityLogger,
} = require("./middleware/security");

const app = express();

// ── SECURITY HEADERS (first) ──
securityHeaders(app);
app.use(hideServerInfo);

// ── CORS ──
const ALLOWED = [
  process.env.FRONTEND_URL || "https://finova-africa.vercel.app",
  "https://finova-africa.vercel.app",
  "https://nexora.com",
  "http://localhost:3000",
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED.includes(origin)) return cb(null, true);
    console.warn(`🚨 Blocked CORS from: ${origin}`);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
}));

// ── BODY PARSER ──
app.use(express.json({ limit:"5mb" }));
app.use(express.urlencoded({ extended:true, limit:"5mb" }));

// ── SECURITY MIDDLEWARE ──
app.use(hppProtect);           // HTTP parameter pollution
app.use(blockSuspicious);      // Block known attacks
app.use(sanitizeInput);        // Clean all inputs
app.use(bruteForceProtection); // IP brute force protection
app.use(activityLogger);       // Log suspicious activity

// ── LOGGING ──
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
else app.use(morgan("combined"));

// ── GLOBAL RATE LIMIT ──
app.use("/api", apiLimiter);

// ── ROUTES ──
app.use("/api/auth",          authLimiter,  require("./routes/auth"));
app.use("/api/otp",           otpLimiter,   require("./routes/otp"));
app.use("/api/payments",                    require("./routes/payments"));
app.use("/api/savings",                     require("./routes/savings"));
app.use("/api/kyc",                         require("./routes/kyc"));
app.use("/api/admin",         adminLimiter, require("./routes/admin"));
app.use("/api/notifications",               require("./routes/notifications"));
app.use("/api/profile",                     require("./routes/profile"));
app.use("/api/support",                     require("./routes/support"));
app.use("/api/transactions",  require("./routes/transactions"));
app.use("/api/leaderboard",   require("./routes/leaderboard"));
app.use("/api/wallets",                     require("./routes/wallets"));

// ── HEALTH CHECK ──
app.get("/health", (req, res) => res.json({
  status:"ok", service:"NEXORA API", version:"2.0.0",
  timestamp: new Date().toISOString(),
}));

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error:"Not found" });
});

// ── ERROR HANDLER (never expose internals) ──
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error:"Access denied" });
  }
  res.status(500).json({ error:"Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 NEXORA API running on port ${PORT}`);
  console.log(`🔒 Security: Helmet + CORS + Rate Limiting + XSS + SQLi Protection`);
  console.log(`🛡️  Brute Force Protection: Active`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}\n`);
});
