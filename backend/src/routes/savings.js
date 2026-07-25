const adminNotify = require("../services/adminNotify");
const router   = require("express").Router();
const db       = require("../db");
const { authUser } = require("../middleware/auth");

router.get("/my-plan", authUser, async (req, res) => {
  try {
    const plan = await db.query("SELECT * FROM savings_plans WHERE user_id=$1 AND status='active' LIMIT 1",[req.user.id]);
    if (!plan.rows[0]) return res.json({plan:null, weeks:[]});
    const weeks = await db.query("SELECT * FROM savings_weeks WHERE plan_id=$1 ORDER BY week_number ASC",[plan.rows[0].id]);
    res.json({plan:plan.rows[0], weeks:weeks.rows});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/pay-week", authUser, async (req, res) => {
  try {
    const { weekId } = req.body;
    await db.query("UPDATE savings_weeks SET status='paid',paid_at=NOW(),paid_amount=3 WHERE id=$1 AND user_id=$2",[weekId,req.user.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/penalty/submit/:weekId", authUser, async (req, res) => {
  try {
    await db.query("UPDATE savings_weeks SET status='penalty_pending' WHERE id=$1 AND user_id=$2",[req.params.weekId,req.user.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/admin/penalty/approve/:weekId", async (req, res) => {
  try {
    await db.query("UPDATE savings_weeks SET status='paid',paid_amount=4,paid_at=NOW(),is_penalty=true WHERE id=$1",[req.params.weekId]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/admin/credit/:userId", async (req, res) => {
  try {
    const { amount, weekNumber } = req.body;
    const plan = await db.query("SELECT id FROM savings_plans WHERE user_id=$1 AND status='active'",[req.params.userId]);
    if (plan.rows[0]) {
      await db.query("UPDATE savings_weeks SET status='paid',paid_amount=$1,paid_at=NOW() WHERE plan_id=$2 AND week_number=$3",[amount,plan.rows[0].id,weekNumber]);
      await db.query("UPDATE savings_plans SET total_paid=total_paid+$1 WHERE id=$2",[amount,plan.rows[0].id]);
    }
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// Notify admin of penalty payment (from localStorage-based flow)
router.post("/penalty/submit/local", authUser, async (req, res) => {
  try {
    const { weekNumber, screenshotUrl, amount } = req.body;
    const user = await db.query("SELECT name,email FROM users WHERE id=$1",[req.user.id]);
    if (user.rows[0]) {
      const adminNotify = require("../services/adminNotify");
      await adminNotify.penaltyPaymentSubmitted(user.rows[0], weekNumber, amount||4);
    }
    // Save to payments
    await db.query(
      `INSERT INTO payments(user_id,type,amount,currency,screenshot_url,status)
       VALUES($1,'penalty',$2,'USDT',$3,'pending')`,
      [req.user.id, amount||4, screenshotUrl||null]
    ).catch(()=>{});
    res.json({success:true});
  } catch(err) {
    res.status(500).json({error:"Server error"});
  }
});

module.exports = router;
