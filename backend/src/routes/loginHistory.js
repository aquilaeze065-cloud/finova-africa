const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.get("/", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM login_history WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json({ history:result.rows });
  } catch { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
