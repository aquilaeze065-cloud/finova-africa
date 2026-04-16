const router = require("express").Router();
const bcrypt = require("bcryptjs");
const db     = require("../db");
const { signAdmin } = require("../utils/jwt");
const { authAdmin } = require("../middleware/auth");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM admins WHERE email=$1",[email]);
    if (!result.rows[0]) return res.status(404).json({ error: "Admin not found" });
    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });
    const token = signAdmin({ id:result.rows[0].id, email });
    res.json({ token, admin:{ id:result.rows[0].id, name:result.rows[0].name, email } });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stats", authAdmin, async (req, res) => {
  try {
    const [users,active,pending,payments,kyc] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users"),
      db.query("SELECT COUNT(*) FROM users WHERE account_status='active'"),
      db.query("SELECT COUNT(*) FROM users WHERE account_status='pending'"),
      db.query("SELECT COUNT(*) FROM payments WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM kyc_documents WHERE status='pending'"),
    ]);
    res.json({
      totalUsers:      parseInt(users.rows[0].count),
      activeUsers:     parseInt(active.rows[0].count),
      pendingUsers:    parseInt(pending.rows[0].count),
      pendingPayments: parseInt(payments.rows[0].count),
      pendingKyc:      parseInt(kyc.rows[0].count),
    });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/users", authAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id,name,email,account_status,reg_fee_paid,kyc_status,contract_signed,created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
