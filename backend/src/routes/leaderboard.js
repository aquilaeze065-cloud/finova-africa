const router = require("express").Router();
const db     = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id as user_id,
        u.name,
        COALESCE(sp.total_paid,0) as total_saved,
        COALESCE((SELECT COUNT(*) FROM savings_weeks sw WHERE sw.user_id=u.id AND sw.status='paid'),0) as weeks_paid,
        COALESCE(sp.current_streak,0) as streak
      FROM users u
      LEFT JOIN savings_plans sp ON sp.user_id=u.id AND sp.status='active'
      WHERE COALESCE(sp.total_paid,0) > 0
      ORDER BY weeks_paid DESC, total_saved DESC
      LIMIT 50
    `);
    res.json({ leaders: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
