const router = require("express").Router();
const db     = require("../db");
const { authUser, authAdmin } = require("../middleware/auth");

router.post("/reg-fee", authUser, async (req, res) => {
  try {
    const { network, txHash, screenshotUrl } = req.body;
    const result = await db.query(
      "INSERT INTO payments(user_id,type,amount,currency,network,tx_hash,screenshot_url) VALUES($1,'registration',4,'USDT',$2,$3,$4) RETURNING *",
      [req.user.id, network, txHash||null, screenshotUrl||null]
    );
    await db.query("UPDATE users SET reg_fee_submitted=true WHERE id=$1",[req.user.id]);
    res.status(201).json({ payment: result.rows[0] });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my-status", authUser, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM payments WHERE user_id=$1 ORDER BY submitted_at DESC LIMIT 5",[req.user.id]);
    res.json({ payments: result.rows });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/all", authAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT p.*,u.name as user_name,u.email as user_email FROM payments p JOIN users u ON p.user_id=u.id ORDER BY p.submitted_at DESC"
    );
    res.json({ payments: result.rows });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/approve/:id", authAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const payRes = await db.query("SELECT * FROM payments WHERE id=$1",[req.params.id]);
    if (!payRes.rows[0]) return res.status(404).json({ error: "Payment not found" });
    await db.query(
      "UPDATE payments SET status='approved',review_note=$1,reviewed_at=NOW(),reviewed_by=$2 WHERE id=$3",
      [note||null, req.admin.email, req.params.id]
    );
    const userId = payRes.rows[0].user_id;
    await db.query("UPDATE users SET reg_fee_paid=true,account_status='active' WHERE id=$1",[userId]);
    await db.query(
      "INSERT INTO notifications(user_id,type,title,body,icon,action) VALUES($1,'deposit','Account Activated!','Your registration fee is confirmed. Welcome to Finova Africa!','👑','/dashboard')",
      [userId]
    );
    const endDate = new Date(); endDate.setFullYear(endDate.getFullYear()+1);
    const planRes = await db.query("INSERT INTO savings_plans(user_id,end_date) VALUES($1,$2) RETURNING id",[userId,endDate]);
    const planId  = planRes.rows[0].id;
    const now = new Date();
    for (let i=0; i<52; i++) {
      const due   = new Date(now); due.setDate(due.getDate()+i*7);
      const grace = new Date(due); grace.setDate(grace.getDate()+1);
      await db.query(
        "INSERT INTO savings_weeks(plan_id,user_id,week_number,due_date,grace_date) VALUES($1,$2,$3,$4,$5)",
        [planId,userId,i+1,due,grace]
      );
    }
    res.json({ success:true, message:"Payment approved and account activated" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/reject/:id", authAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    await db.query(
      "UPDATE payments SET status='rejected',review_note=$1,reviewed_at=NOW(),reviewed_by=$2 WHERE id=$3",
      [note||null, req.admin.email, req.params.id]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
