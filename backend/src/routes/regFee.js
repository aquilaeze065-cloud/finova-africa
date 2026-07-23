const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

// Submit registration fee payment
router.post("/submit", authUser, async (req, res) => {
  try {
    const { screenshotUrl, txHash } = req.body;
    if (!screenshotUrl) return res.status(400).json({error:"Payment screenshot is required"});

    // Check not already paid
    const user = await db.query("SELECT reg_fee_paid,reg_fee_submitted FROM users WHERE id=$1",[req.user.id]);
    if (user.rows[0]?.reg_fee_paid) return res.json({success:true,message:"Registration fee already confirmed"});

    // Save payment record
    await db.query(
      `INSERT INTO registration_payments(user_id,amount,currency,screenshot_url,tx_hash,status)
       VALUES($1,2.00,'USDT',$2,$3,'pending')
       ON CONFLICT DO NOTHING`,
      [req.user.id, screenshotUrl, txHash||null]
    );
    await db.query("UPDATE users SET reg_fee_submitted=true WHERE id=$1",[req.user.id]);

    res.json({success:true, message:"Payment submitted. Admin will verify within 24 hours."});
  } catch(err) {
    console.error(err);
    res.status(500).json({error:"Server error"});
  }
});

// Check reg fee status
router.get("/status", authUser, async (req, res) => {
  try {
    const user = await db.query(
      "SELECT reg_fee_paid,reg_fee_submitted,account_status FROM users WHERE id=$1",
      [req.user.id]
    );
    const payment = await db.query(
      "SELECT * FROM registration_payments WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    res.json({
      paid:      user.rows[0]?.reg_fee_paid||false,
      submitted: user.rows[0]?.reg_fee_submitted||false,
      status:    user.rows[0]?.account_status||"pending",
      payment:   payment.rows[0]||null,
    });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// ADMIN - get all pending reg fee payments
router.get("/admin/pending", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT rp.*,u.name,u.email FROM registration_payments rp
       JOIN users u ON rp.user_id=u.id
       WHERE rp.status='pending' ORDER BY rp.created_at DESC`
    );
    res.json({ payments: result.rows });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// ADMIN - approve reg fee
router.post("/admin/approve/:userId", async (req, res) => {
  try {
    await db.query(
      "UPDATE users SET reg_fee_paid=true,account_status='active' WHERE id=$1",
      [req.params.userId]
    );
    await db.query(
      "UPDATE registration_payments SET status='approved',reviewed_at=NOW() WHERE user_id=$1 AND status='pending'",
      [req.params.userId]
    );
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','Account Activated! ✅','Your $2 USDT registration fee has been confirmed. Your NEXORA account is now fully active!','🎉','/dashboard')`,
      [req.params.userId]
    );
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// ADMIN - reject reg fee
router.post("/admin/reject/:userId", async (req, res) => {
  try {
    await db.query(
      "UPDATE registration_payments SET status='rejected',reviewed_at=NOW() WHERE user_id=$1 AND status='pending'",
      [req.params.userId]
    );
    await db.query(
      "UPDATE users SET reg_fee_submitted=false WHERE id=$1",
      [req.params.userId]
    );
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'penalty','Payment Rejected','Your registration fee payment was rejected. Please resubmit with a valid screenshot.','❌','/regfee')`,
      [req.params.userId]
    );
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
