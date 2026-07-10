const router = require("express").Router();
const bcrypt = require("bcryptjs");
const db     = require("../db");
const { signAdmin } = require("../utils/jwt");
const { authAdmin } = require("../middleware/auth");

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM admins WHERE email=$1",[email]);
    if (!result.rows[0]) return res.status(404).json({ error:"Admin not found" });
    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error:"Incorrect password" });
    const token = signAdmin({ id:result.rows[0].id, email });
    res.json({ token, admin:{ id:result.rows[0].id, name:result.rows[0].name, email } });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

// Dashboard stats
router.get("/stats", authAdmin, async (req, res) => {
  try {
    const [users,active,pending,payments,kyc,referrals] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users"),
      db.query("SELECT COUNT(*) FROM users WHERE account_status='active'"),
      db.query("SELECT COUNT(*) FROM users WHERE account_status='pending'"),
      db.query("SELECT COUNT(*) FROM payments WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM kyc_documents WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM referrals WHERE status='active'"),
    ]);
    res.json({
      totalUsers:      parseInt(users.rows[0].count),
      activeUsers:     parseInt(active.rows[0].count),
      pendingUsers:    parseInt(pending.rows[0].count),
      pendingPayments: parseInt(payments.rows[0].count),
      pendingKyc:      parseInt(kyc.rows[0].count),
      totalReferrals:  parseInt(referrals.rows[0].count),
    });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

// Get all users with full details
router.get("/users", authAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.phone,
        u.account_status, u.reg_fee_paid,
        u.kyc_status, u.contract_signed,
        u.referral_code, u.referred_by,
        u.referral_bonus, u.created_at,
        sp.end_date as contract_end_date,
        sp.total_paid, sp.status as plan_status,
        (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id=u.id) as referral_count
      FROM users u
      LEFT JOIN savings_plans sp ON sp.user_id=u.id AND sp.status='active'
      ORDER BY u.created_at DESC
    `);
    res.json({ users: result.rows });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

// Export users as CSV data
router.get("/export/users", authAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.name, u.email, u.phone,
        u.created_at as registration_date,
        u.account_status, u.referral_code, u.referred_by,
        sp.end_date as contract_expiry,
        sp.total_paid,
        CASE 
          WHEN sp.end_date IS NOT NULL 
          THEN ROUND((156 - COALESCE(sp.total_paid,0))::numeric, 2)
          ELSE NULL 
        END as amount_due_at_expiry,
        (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id=u.id) as referrals_made
      FROM users u
      LEFT JOIN savings_plans sp ON sp.user_id=u.id
      ORDER BY u.created_at DESC
    `);

    // Build CSV
    const headers = [
      "Name","Email","Phone","Registration Date",
      "Account Status","Referral Code","Referred By",
      "Contract Expiry","Total Paid (USDT)",
      "Amount Due At Expiry (USDT)","Referrals Made"
    ];

    const rows = result.rows.map(u=>[
      u.name||"",
      u.email||"",
      u.phone||"",
      u.registration_date ? new Date(u.registration_date).toLocaleDateString("en-GB") : "",
      u.account_status||"",
      u.referral_code||"",
      u.referred_by||"",
      u.contract_expiry ? new Date(u.contract_expiry).toLocaleDateString("en-GB") : "Not started",
      u.total_paid||"0",
      u.amount_due_at_expiry||"156",
      u.referrals_made||"0",
    ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="nexora-users-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error:"Export failed" });
  }
});

// Get referrals list
router.get("/referrals", authAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        r.*,
        u1.name as referrer_name, u1.email as referrer_email, u1.referral_code,
        u2.name as referred_name, u2.email as referred_email,
        u2.created_at as referred_at
      FROM referrals r
      JOIN users u1 ON r.referrer_id=u1.id
      JOIN users u2 ON r.referred_id=u2.id
      ORDER BY r.created_at DESC
    `);
    res.json({ referrals: result.rows });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

module.exports = router;
