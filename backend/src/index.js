require("dotenv").config();
require("./services/scheduler"); // Daily payment notifications
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const { authLimiter, apiLimiter, adminLimiter, sanitizeInput, blockSuspicious } = require("./middleware/security");

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "*"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - only allow your frontend
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://finova-africa.vercel.app",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("combined"));

// Security middleware on all routes
app.use(sanitizeInput);
app.use(blockSuspicious);
app.use("/api", apiLimiter);

// Hide server info
app.disable("x-powered-by");

// Routes with specific rate limits
app.use("/api/auth",          authLimiter,  require("./routes/auth"));
app.use("/api/payments",                    require("./routes/payments"));
app.use("/api/savings",                     require("./routes/savings"));
app.use("/api/kyc",                         require("./routes/kyc"));
app.use("/api/admin",         adminLimiter, require("./routes/admin"));
app.use("/api/notifications",               require("./routes/notifications"));
app.use("/api/profile",                     require("./routes/profile"));

// Health check
app.get("/health", (req, res) => res.json({
  status: "ok",
  service: "NEXORA API",
  version: "1.0.0",
}));

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler - never expose stack traces
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 NEXORA API → http://localhost:" + PORT);
  console.log("🔒 Security: Rate limiting + Input sanitization + CSP headers active");
});
