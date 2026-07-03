const router = require("express").Router();
const db     = require("../db");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SEND OTP
router.post("/send", async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error:"WhatsApp number required" });

    const clean   = phone.replace(/\D/g,"");
    const code    = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP
    await db.query("DELETE FROM otp_codes WHERE identifier=$1", [clean]);
    await db.query(
      "INSERT INTO otp_codes(identifier,code,type,expires_at) VALUES($1,$2,'verify',$3)",
      [clean, code, expires]
    );

    // Build WhatsApp message URL (sends OTP to user's WhatsApp)
    const text = `👑 *NEXORA Verification*\n\nHi ${name||"there"}! Your verification code is:\n\n*${code}*\n\n⏱ Expires in 10 minutes.\n🔒 Do not share this code with anyone.`;
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;

    res.json({
      success: true,
      code,        // Always return code so user sees it on screen too
      waUrl,       // WhatsApp link
      phone: clean,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:"Server error" });
  }
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone||!code) return res.status(400).json({ error:"Phone and code required" });

    const clean  = phone.replace(/\D/g,"");
    const result = await db.query(
      "SELECT * FROM otp_codes WHERE identifier=$1 AND code=$2 AND used=false AND expires_at>NOW()",
      [clean, code]
    );

    if (!result.rows[0]) {
      return res.status(400).json({ error:"Invalid or expired code. Request a new one." });
    }

    await db.query("UPDATE otp_codes SET used=true WHERE id=$1",[result.rows[0].id]);
    res.json({ success:true, verified:true });
  } catch (err) {
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
