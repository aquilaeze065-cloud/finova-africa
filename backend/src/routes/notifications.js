const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.get("/",           authUser, async (req, res) => {
  const r = await db.query("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",[req.user.id]);
  res.json({ notifications: r.rows });
});
router.post("/read/:id",  authUser, async (req, res) => {
  await db.query("UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2",[req.params.id,req.user.id]);
  res.json({ success:true });
});
router.post("/read-all",  authUser, async (req, res) => {
  await db.query("UPDATE notifications SET read=true WHERE user_id=$1",[req.user.id]);
  res.json({ success:true });
});
module.exports = router;
