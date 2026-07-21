const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.post("/submit", authUser, async (req, res) => {
  try {
    const { amount, currency, txHash, screenshot, network, type } = req.body;
    const result = await db.query(
      `INSERT INTO payments(user_id,type,amount,currency,tx_hash,screenshot_url,network,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`,
      [req.user.id, type||"registration", amount||4, currency||"USDT", txHash||null, screenshot||null, network||"TRC-20"]
    );
    res.status(201).json({success:true, paymentId:result.rows[0].id});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.get("/my-payments", authUser, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM payments WHERE user_id=$1 ORDER BY created_at DESC",[req.user.id]);
    res.json({payments:result.rows});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/admin/approve/:id", async (req, res) => {
  try {
    await db.query("UPDATE payments SET status='approved',reviewed_at=NOW() WHERE id=$1",[req.params.id]);
    const pay = await db.query("SELECT user_id FROM payments WHERE id=$1",[req.params.id]);
    if (pay.rows[0]) {
      await db.query("UPDATE users SET account_status='active',reg_fee_paid=true WHERE id=$1",[pay.rows[0].user_id]);
    }
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/admin/reject/:id", async (req, res) => {
  try {
    await db.query("UPDATE payments SET status='rejected',reviewed_at=NOW() WHERE id=$1",[req.params.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
