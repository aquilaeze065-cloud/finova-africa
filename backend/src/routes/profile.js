const router = require("express").Router();
const bcrypt = require("bcryptjs");
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.post("/save", authUser, async (req, res) => {
  try {
    const p = req.body;
    const ex = await db.query("SELECT id FROM user_profiles WHERE user_id=$1",[req.user.id]);
    if (ex.rows[0]) {
      await db.query(
        "UPDATE user_profiles SET full_name=$1,dob=$2,gender=$3,marital_status=$4,nationality=$5,occupation=$6,alt_phone=$7,address=$8,city=$9,state=$10,country=$11,bvn=$12,nin=$13,nok_name=$14,nok_phone=$15,nok_relation=$16,nok_address=$17,phone=$18,updated_at=NOW() WHERE user_id=$19",
        [p.fullName,p.dob,p.gender,p.maritalStatus,p.nationality,p.occupation,p.altPhone,p.address,p.city,p.state,p.country,p.bvn,p.nin,p.nokName,p.nokPhone,p.nokRelation,p.nokAddress,p.phone,req.user.id]
      );
    } else {
      await db.query(
        "INSERT INTO user_profiles(user_id,full_name,dob,gender,marital_status,nationality,occupation,alt_phone,address,city,state,country,bvn,nin,nok_name,nok_phone,nok_relation,nok_address,phone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)",
        [req.user.id,p.fullName,p.dob,p.gender,p.maritalStatus,p.nationality,p.occupation,p.altPhone,p.address,p.city,p.state,p.country,p.bvn,p.nin,p.nokName,p.nokPhone,p.nokRelation,p.nokAddress,p.phone]
      );
    }
    res.json({ success:true });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

router.post("/change-password", authUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (newPassword.length<8) return res.status(400).json({ error:"Password too short" });
    const userRes = await db.query("SELECT password_hash FROM users WHERE id=$1",[req.user.id]);
    const valid   = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error:"Current password incorrect" });
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash=$1 WHERE id=$2",[hash,req.user.id]);
    res.json({ success:true });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

router.post("/notifications", authUser, async (req, res) => {
  try {
    const s = req.body;
    await db.query(
      "INSERT INTO user_settings(user_id,weekly_reminder,payment_confirm,kyc_updates,price_alerts,promotions,admin_messages) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(user_id) DO UPDATE SET weekly_reminder=$2,payment_confirm=$3,kyc_updates=$4,price_alerts=$5,promotions=$6,admin_messages=$7,updated_at=NOW()",
      [req.user.id,s.weeklyReminder,s.paymentConfirm,s.kycUpdates,s.priceAlerts,s.promotions,s.adminMessages]
    );
    res.json({ success:true });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

module.exports = router;
