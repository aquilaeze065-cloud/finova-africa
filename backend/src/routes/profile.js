const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const db      = require("../db");
const { authUser } = require("../middleware/auth");

router.put("/save", authUser, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await db.query("UPDATE users SET name=$1,phone=$2 WHERE id=$3",[name, phone, req.user.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.put("/change-password", authUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await db.query("SELECT password_hash FROM users WHERE id=$1",[req.user.id]);
    if (!result.rows[0]) return res.status(404).json({error:"User not found"});
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({error:"Current password is incorrect"});
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash=$1 WHERE id=$2",[hash, req.user.id]);
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.put("/notifications", authUser, async (req, res) => {
  try {
    const { emailNotifs, pushNotifs } = req.body;
    await db.query(
      "INSERT INTO user_settings(user_id,email_notifs,push_notifs) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET email_notifs=$2,push_notifs=$3",
      [req.user.id, emailNotifs, pushNotifs]
    );
    res.json({success:true});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
