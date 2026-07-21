const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.get("/", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.put("/:id/read", authUser, async (req, res) => {
  try {
    await db.query("UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2",[req.params.id, req.user.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.put("/read-all", authUser, async (req, res) => {
  try {
    await db.query("UPDATE notifications SET read=true WHERE user_id=$1",[req.user.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
