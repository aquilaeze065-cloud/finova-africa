const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.get("/status", authUser, async (req, res) => {
  try {
    const result = await db.query("SELECT enabled,method,phone FROM two_factor WHERE user_id=$1",[req.user.id]);
    res.json({ enabled:result.rows[0]?.enabled||false, method:result.rows[0]?.method||"whatsapp", phone:result.rows[0]?.phone||null });
  } catch { res.status(500).json({error:"Server error"}); }
});

router.post("/setup/send", authUser, async (req, res) => {
  try {
    const clean = (req.body.phone||"").replace(/\D/g,"");
    if (!clean) return res.status(400).json({error:"Phone required"});
    const code = generateOTP();
    otpStore.set(`2fa_${req.user.id}`,{code,phone:clean,expires:Date.now()+10*60*1000});
    const text = `*NEXORA 2FA Setup*\n\nYour code: *${code}*\n\nExpires in 10 min.`;
    res.json({success:true,code,waUrl:`https://wa.me/${clean}?text=${encodeURIComponent(text)}`,phone:clean});
  } catch { res.status(500).json({error:"Server error"}); }
});

router.post("/setup/verify", authUser, async (req, res) => {
  try {
    const stored = otpStore.get(`2fa_${req.user.id}`);
    if (!stored||Date.now()>stored.expires) return res.status(400).json({error:"Code expired"});
    if (stored.code!==req.body.code?.toString().trim()) return res.status(400).json({error:"Wrong code"});
    otpStore.delete(`2fa_${req.user.id}`);
    const backupCodes = Array.from({length:8},()=>Math.random().toString(36).substring(2,10).toUpperCase());
    await db.query(
      `INSERT INTO two_factor(user_id,enabled,method,phone,backup_codes) VALUES($1,true,'whatsapp',$2,$3)
       ON CONFLICT(user_id) DO UPDATE SET enabled=true,phone=$2,backup_codes=$3,updated_at=NOW()`,
      [req.user.id,stored.phone,backupCodes]
    );
    await db.query("UPDATE users SET two_factor_enabled=true WHERE id=$1",[req.user.id]);
    res.json({success:true,backupCodes});
  } catch { res.status(500).json({error:"Server error"}); }
});

router.post("/disable", authUser, async (req, res) => {
  try {
    await db.query("UPDATE two_factor SET enabled=false WHERE user_id=$1",[req.user.id]);
    await db.query("UPDATE users SET two_factor_enabled=false WHERE id=$1",[req.user.id]);
    res.json({success:true});
  } catch { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
