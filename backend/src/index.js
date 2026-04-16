require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 50 }));

app.use("/api/auth",          require("./routes/auth"));
app.use("/api/payments",      require("./routes/payments"));
app.use("/api/savings",       require("./routes/savings"));
app.use("/api/kyc",           require("./routes/kyc"));
app.use("/api/admin",         require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/profile",       require("./routes/profile"));

app.get("/health", (req, res) => res.json({
  status:"ok", service:"Finova Africa API", version:"1.0.0", time: new Date()
}));

app.use((req, res) => res.status(404).json({ error:"Route not found" }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error:"Internal server error" }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Finova Africa API → http://localhost:${PORT}`);
  console.log(`📊 Health check → http://localhost:${PORT}/health`);
});
