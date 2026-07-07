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

// Submit penalty payment proof
router.post("/penalty/submit/:weekId", authUser, async (req, res) => {
  try {
    const { weekId } = req.params;
    const { screenshotUrl } = req.body;

    const weekRes = await db.query(
      "SELECT * FROM savings_weeks WHERE id=$1 AND user_id=$2",
      [weekId, req.user.id]
    );
    if (!weekRes.rows[0]) return res.status(404).json({ error:"Week not found" });
    if (weekRes.rows[0].status !== "penalty") {
      return res.status(400).json({ error:"This week is not in penalty status" });
    }

    // Mark as penalty_pending (awaiting admin verification)
    await db.query(
      "UPDATE savings_weeks SET status='penalty_pending' WHERE id=$1",
      [weekId]
    );

    // Create payment record
    await db.query(
      `INSERT INTO payments(user_id,type,amount,currency,screenshot_url,status)
       VALUES($1,'penalty',4,'USDT',$2,'pending')`,
      [req.user.id, screenshotUrl||null]
    );

    // Notify user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'info','Penalty Payment Submitted','Your $4 USDT penalty payment has been submitted and is awaiting admin verification.','⏳','/savings')`,
      [req.user.id]
    );

    res.json({ success:true, message:"Penalty payment submitted for review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - approve penalty payment
router.post("/admin/penalty/approve/:weekId", require("../middleware/auth").authAdmin, async (req, res) => {
  try {
    const { weekId } = req.params;

    const weekRes = await db.query(
      "SELECT sw.*, sp.id as plan_id FROM savings_weeks sw JOIN savings_plans sp ON sw.plan_id=sp.id WHERE sw.id=$1",
      [weekId]
    );
    if (!weekRes.rows[0]) return res.status(404).json({ error:"Week not found" });

    const week = weekRes.rows[0];

    // Mark week as paid
    await db.query(
      "UPDATE savings_weeks SET status='paid',paid_amount=4,paid_at=NOW(),is_penalty=true WHERE id=$1",
      [weekId]
    );

    // Update plan total
    await db.query(
      "UPDATE savings_plans SET total_paid=total_paid+4,penalty_weeks=penalty_weeks+1 WHERE id=$1",
      [week.plan_id]
    );

    // Update payment record
    await db.query(
      "UPDATE payments SET status='approved',reviewed_at=NOW(),reviewed_by=$1 WHERE user_id=$2 AND type='penalty' AND status='pending'",
      [req.admin.email, week.user_id]
    );

    // Notify user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','Penalty Payment Approved ✅','Your $4 USDT penalty payment has been verified. Your savings plan is now active again!','✅','/savings')`,
      [week.user_id]
    );

    res.json({ success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
