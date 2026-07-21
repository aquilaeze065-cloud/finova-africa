const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.get("/", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM login_history WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json({ history: result.rows });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.post("/record", async (req, res) => {
  try {
    const { userId, ip, device, browser, status } = req.body;
    await db.query(
      "INSERT INTO login_history(user_id,ip_address,device,browser,status) VALUES($1,$2,$3,$4,$5)",
      [userId, ip||"Unknown", device||"Unknown", browser||"Unknown", status||"success"]
    );
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
