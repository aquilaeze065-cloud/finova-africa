const router = require("express").Router();
const db     = require("../db");

// Get all admin notifications
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100"
    );
    const unread = await db.query("SELECT COUNT(*) FROM admin_notifications WHERE read=false");
    res.json({ notifications: result.rows, unread: parseInt(unread.rows[0].count) });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// Mark all as read
router.put("/read-all", async (req, res) => {
  try {
    await db.query("UPDATE admin_notifications SET read=true WHERE read=false");
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// Mark one as read
router.put("/:id/read", async (req, res) => {
  try {
    await db.query("UPDATE admin_notifications SET read=true WHERE id=$1",[req.params.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

// Get unread count (for polling)
router.get("/count", async (req, res) => {
  try {
    const r = await db.query("SELECT COUNT(*) FROM admin_notifications WHERE read=false");
    res.json({ unread: parseInt(r.rows[0].count) });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
