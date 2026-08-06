const router = require("express").Router();
const db     = require("../db");

// GET all users with their savings progress
router.get("/users", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.phone,
        u.account_status, u.reg_fee_paid, u.reg_fee_submitted,
        u.kyc_status, u.created_at,
        COALESCE(sp.total_paid, 0)   as total_saved,
        COALESCE(sp.current_week, 0) as current_week,
        (SELECT COUNT(*) FROM savings_weeks sw 
         WHERE sw.plan_id=sp.id AND sw.status='paid') as weeks_paid,
        (SELECT COUNT(*) FROM referrals r 
         WHERE r.referrer_id=u.id) as referral_count
      FROM users u
      LEFT JOIN savings_plans sp ON sp.user_id=u.id AND sp.status='active'
      ORDER BY u.created_at DESC
    `);
    res.json({ users: result.rows, total: result.rows.length });
  } catch(err) {
    console.error("Admin users error:", err.message);
    res.status(500).json({ error:"Server error" });
  }
});

// GET pending registration fee payments
router.get("/pending-registrations", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        rp.*, u.name, u.email, u.phone, u.created_at as registered_at
      FROM registration_payments rp
      JOIN users u ON rp.user_id=u.id
      WHERE rp.status='pending'
      ORDER BY rp.created_at DESC
    `);
    res.json({ payments: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// GET all payments (deposits, reg fees, penalties)
router.get("/payments", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.name, u.email 
      FROM payments p
      JOIN users u ON p.user_id=u.id
      ORDER BY p.created_at DESC
      LIMIT 200
    `);
    res.json({ payments: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// GET dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [users, active, revenue, pending, pendingWR, savings] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users"),
      db.query("SELECT COUNT(*) FROM users WHERE account_status='active'"),
      db.query("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='approved'"),
      db.query("SELECT COUNT(*) FROM payments WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM withdrawal_requests WHERE status='pending'"),
      db.query("SELECT COALESCE(SUM(total_paid),0) as total FROM savings_plans WHERE status='active'"),
    ]);
    res.json({
      totalUsers:    parseInt(users.rows[0].count),
      activeUsers:   parseInt(active.rows[0].count),
      totalRevenue:  parseFloat(revenue.rows[0].total),
      pendingPayments: parseInt(pending.rows[0].count),
      pendingWithdrawals: parseInt(pendingWR.rows[0].count),
      totalSaved:    parseFloat(savings.rows[0].total),
    });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// GET savings contributions per user
router.get("/savings", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, u.name, u.email,
        sp.id as plan_id, sp.total_paid, sp.start_date, sp.end_date, sp.status as plan_status,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='paid') as weeks_paid,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id) as total_weeks
      FROM savings_plans sp
      JOIN users u ON sp.user_id=u.id
      WHERE sp.status='active'
      ORDER BY weeks_paid DESC
    `);
    res.json({ savings: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// APPROVE registration fee
router.post("/approve-registration/:userId", async (req, res) => {
  try {
    await db.query(
      "UPDATE users SET reg_fee_paid=true,account_status='active' WHERE id=$1",
      [req.params.userId]
    );
    await db.query(
      "UPDATE registration_payments SET status='approved',reviewed_at=NOW() WHERE user_id=$1 AND status='pending'",
      [req.params.userId]
    );
    // Notify user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','Account Activated! 🎉',
       'Your $4 USDT registration fee has been confirmed! Your NEXORA account is now fully active. Start your savings journey now!',
       '✅','/dashboard')`,
      [req.params.userId]
    );
    // Telegram alert
    const tgToken  = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChatId) {
      const user = await db.query("SELECT name,email FROM users WHERE id=$1",[req.params.userId]);
      if (user.rows[0]) {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`,{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({chat_id:tgChatId,text:`✅ You approved ${user.rows[0].name}'s registration!\n\nAccount is now ACTIVE.`,parse_mode:"Markdown"}),
        }).catch(()=>{});
      }
    }
    res.json({ success:true, message:"Account activated!" });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// REJECT registration fee
router.post("/reject-registration/:userId", async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query(
      "UPDATE registration_payments SET status='rejected',reviewed_at=NOW() WHERE user_id=$1 AND status='pending'",
      [req.params.userId]
    );
    await db.query("UPDATE users SET reg_fee_submitted=false WHERE id=$1",[req.params.userId]);
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'penalty','Payment Rejected ❌',
       $2,'❌','/regfee')`,
      [req.params.userId, `Your registration fee payment was rejected. Reason: ${reason||"Screenshot unclear or incorrect amount"}. Please resubmit with a valid screenshot.`]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// APPROVE payment
router.post("/approve-payment/:paymentId", async (req, res) => {
  try {
    const pay = await db.query("SELECT * FROM payments WHERE id=$1",[req.params.paymentId]);
    if (!pay.rows[0]) return res.status(404).json({error:"Not found"});
    await db.query("UPDATE payments SET status='approved',reviewed_at=NOW() WHERE id=$1",[req.params.paymentId]);
    if (pay.rows[0].type==="registration") {
      await db.query("UPDATE users SET reg_fee_paid=true,account_status='active' WHERE id=$1",[pay.rows[0].user_id]);
    }
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','Payment Approved! ✅','Your payment has been confirmed and credited to your account.','💰','/dashboard')`,
      [pay.rows[0].user_id]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// REJECT payment
router.post("/reject-payment/:paymentId", async (req, res) => {
  try {
    const { reason } = req.body;
    const pay = await db.query("SELECT * FROM payments WHERE id=$1",[req.params.paymentId]);
    if (!pay.rows[0]) return res.status(404).json({error:"Not found"});
    await db.query("UPDATE payments SET status='rejected',reviewed_at=NOW() WHERE id=$1",[req.params.paymentId]);
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'penalty','Payment Rejected','Your payment was rejected. ${reason||"Please resubmit with a clear screenshot."}','❌','/deposit')`,
      [pay.rows[0].user_id]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
