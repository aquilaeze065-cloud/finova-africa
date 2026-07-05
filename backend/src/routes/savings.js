const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.get("/my-plan", authUser, async (req, res) => {
  try {
    const planRes = await db.query("SELECT * FROM savings_plans WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1",[req.user.id]);
    if (!planRes.rows[0]) return res.json({ plan:null });
    const plan     = planRes.rows[0];
    const weeksRes = await db.query("SELECT * FROM savings_weeks WHERE plan_id=$1 ORDER BY week_number ASC",[plan.id]);
    const now      = new Date();
    for (const week of weeksRes.rows) {
      if (week.status==="paid") continue;
      if (now > new Date(week.grace_date) && week.status!=="penalty") {
        await db.query("UPDATE savings_weeks SET status='penalty' WHERE id=$1",[week.id]);
        week.status="penalty";
      } else if (now>=new Date(week.due_date) && now<=new Date(week.grace_date) && week.status==="upcoming") {
        await db.query("UPDATE savings_weeks SET status='due' WHERE id=$1",[week.id]);
        week.status="due";
      }
    }
    const penaltyCount = weeksRes.rows.filter(w=>w.status==="penalty").length;
    if (penaltyCount>=5 && plan.status==="active") {
      await db.query("UPDATE savings_plans SET status='terminated' WHERE id=$1",[plan.id]);
      plan.status="terminated";
    }
    res.json({ plan:{ ...plan, weeks:weeksRes.rows } });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/pay-week/:weekId", authUser, async (req, res) => {
  try {
    const weekRes = await db.query("SELECT * FROM savings_weeks WHERE id=$1 AND user_id=$2",[req.params.weekId,req.user.id]);
    if (!weekRes.rows[0]) return res.status(404).json({ error:"Week not found" });
    const week   = weekRes.rows[0];
    const amount = week.status==="penalty" ? 4 : 2;
    await db.query("UPDATE savings_weeks SET status='paid',paid_amount=$1,paid_at=NOW(),is_penalty=$2 WHERE id=$3",[amount,week.status==="penalty",week.id]);
    await db.query("UPDATE savings_plans SET total_paid=total_paid+$1 WHERE id=$2",[amount,week.plan_id]);
    await db.query(
      "INSERT INTO notifications(user_id,type,title,body,icon,action) VALUES($1,'deposit',$2,$3,'💰','/savings')",
      [req.user.id,`Week ${week.week_number} Payment Confirmed`,`$${amount} USDT for week ${week.week_number} has been recorded.`]
    );
    res.json({ success:true, amount, weekNumber:week.week_number });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
