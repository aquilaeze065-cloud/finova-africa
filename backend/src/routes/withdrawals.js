const adminNotify = require("../services/adminNotify");
const router   = require("express").Router();
const db       = require("../db");
const { authUser } = require("../middleware/auth");

// Check withdrawal eligibility
router.get("/eligibility", authUser, async (req, res) => {
  try {
    const user = await db.query(
      "SELECT id,name,account_status FROM users WHERE id=$1",
      [req.user.id]
    );
    if (!user.rows[0]) return res.status(404).json({error:"User not found"});

    // Check savings plan
    const plan = await db.query(
      `SELECT sp.*,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='paid') as weeks_paid,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id) as total_weeks
       FROM savings_plans sp WHERE sp.user_id=$1 AND sp.status='active' LIMIT 1`,
      [req.user.id]
    );

    if (!plan.rows[0]) {
      return res.json({
        eligible: false,
        reason: "no_plan",
        message: "You have no active savings plan.",
        weeksCompleted: 0,
        weeksRequired: 52,
      });
    }

    const p = plan.rows[0];
    const weeksPaid = parseInt(p.weeks_paid)||0;
    const completed = weeksPaid >= 52;
    const endDate   = p.end_date ? new Date(p.end_date) : null;
    const planDone  = endDate ? new Date() >= endDate : false;

    if (!completed && !planDone) {
      return res.json({
        eligible: false,
        reason: "plan_incomplete",
        message: `You have completed ${weeksPaid} of 52 weeks. Withdrawal is only allowed after completing your full 52-week savings plan.`,
        weeksCompleted: weeksPaid,
        weeksRequired: 52,
        weeksRemaining: 52 - weeksPaid,
        estimatedDate: endDate,
      });
    }

    // Plan complete — check if clearance already submitted
    const existing = await db.query(
      "SELECT * FROM withdrawal_requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );

    res.json({
      eligible: true,
      planComplete: true,
      weeksCompleted: weeksPaid,
      totalSaved: parseFloat(p.total_paid)||0,
      existingRequest: existing.rows[0]||null,
      message: "Your 52-week plan is complete! Upload your clearance form and payment receipt to request withdrawal.",
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({error:"Server error"});
  }
});

// Submit withdrawal request with clearance form
router.post("/request", authUser, async (req, res) => {
  try {
    const { amount, currency, walletAddress, network, clearanceFormUrl, paymentReceiptUrl } = req.body;
    if (!clearanceFormUrl) return res.status(400).json({error:"Clearance form is required"});
    if (!paymentReceiptUrl) return res.status(400).json({error:"Payment receipt is required"});
    if (!walletAddress)     return res.status(400).json({error:"Wallet address is required"});
    if (!amount)            return res.status(400).json({error:"Amount is required"});

    // Verify eligibility
    const plan = await db.query(
      `SELECT sp.*,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='paid') as weeks_paid
       FROM savings_plans sp WHERE sp.user_id=$1 AND sp.status='active' LIMIT 1`,
      [req.user.id]
    );
    const weeksPaid = parseInt(plan.rows[0]?.weeks_paid)||0;
    if (weeksPaid < 52) {
      return res.status(403).json({
        error:`Withdrawal not allowed. You have completed ${weeksPaid}/52 weeks. Complete your full savings plan first.`
      });
    }

    // Check no pending request
    const pending = await db.query(
      "SELECT id FROM withdrawal_requests WHERE user_id=$1 AND status='pending'",
      [req.user.id]
    );
    if (pending.rows.length > 0) {
      return res.status(400).json({error:"You already have a pending withdrawal request."});
    }

    const result = await db.query(
      `INSERT INTO withdrawal_requests(user_id,amount,currency,wallet_address,network,clearance_form_url,payment_receipt_url)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [req.user.id, amount, currency||"USDT", walletAddress, network||"TRC-20", clearanceFormUrl, paymentReceiptUrl]
    );

    // Notify admin via DB
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       SELECT id,'withdrawal','New Withdrawal Request','A user has submitted a withdrawal request with clearance documents.','💸','/admin'
       FROM admins LIMIT 1`
    ).catch(()=>{});

    // Notify user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'info','Withdrawal Request Submitted','Your withdrawal request is under review. Admin will process within 24-48 hours.','⏳','/withdraw')`,
      [req.user.id]
    );

    // Notify admin
    const u = await db.query("SELECT name,email FROM users WHERE id=$1",[req.user.id]);
    if(u.rows[0]) adminNotify.withdrawalRequested(u.rows[0],amount,walletAddress).catch(()=>{});
    res.status(201).json({
      success: true,
      requestId: result.rows[0].id,
      message: "Withdrawal request submitted successfully. Admin will review within 24-48 hours.",
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({error:"Server error"});
  }
});

// Get user's withdrawal requests
router.get("/my-requests", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM withdrawal_requests WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ requests: result.rows });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// ADMIN - get all withdrawal requests
router.get("/admin/all", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT wr.*,u.name,u.email FROM withdrawal_requests wr
       JOIN users u ON wr.user_id=u.id ORDER BY wr.created_at DESC`
    );
    res.json({ requests: result.rows });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// ADMIN - approve withdrawal
router.post("/admin/approve/:id", async (req, res) => {
  try {
    const { note } = req.body;
    const wr = await db.query("SELECT * FROM withdrawal_requests WHERE id=$1",[req.params.id]);
    if (!wr.rows[0]) return res.status(404).json({error:"Request not found"});

    await db.query(
      "UPDATE withdrawal_requests SET status='approved',reviewed_at=NOW(),reviewed_by='Admin' WHERE id=$1",
      [req.params.id]
    );
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','Withdrawal Approved! ✅','Your withdrawal of $' || $2 || ' USDT has been approved and will be processed within 24 hours.','💸','/withdraw')`,
      [wr.rows[0].user_id, wr.rows[0].amount]
    );
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// ADMIN - reject withdrawal
router.post("/admin/reject/:id", async (req, res) => {
  try {
    const { reason } = req.body;
    const wr = await db.query("SELECT * FROM withdrawal_requests WHERE id=$1",[req.params.id]);
    if (!wr.rows[0]) return res.status(404).json({error:"Request not found"});

    await db.query(
      "UPDATE withdrawal_requests SET status='rejected',rejection_reason=$1,reviewed_at=NOW() WHERE id=$2",
      [reason||"Documents incomplete", req.params.id]
    );
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'penalty','Withdrawal Rejected','Your withdrawal request was rejected. Reason: ' || $2 || '. Please resubmit with correct documents.','❌','/withdraw')`,
      [wr.rows[0].user_id, reason||"Documents incomplete"]
    );
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
