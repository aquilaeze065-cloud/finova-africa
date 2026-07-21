const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

router.post("/submit", authUser, async (req, res) => {
  try {
    const { documentType, documentUrl, selfieUrl, addressUrl } = req.body;
    await db.query(
      `INSERT INTO kyc_documents(user_id,document_type,document_url,selfie_url,address_url,status)
       VALUES($1,$2,$3,$4,$5,'pending')
       ON CONFLICT(user_id) DO UPDATE SET document_type=$2,document_url=$3,selfie_url=$4,address_url=$5,status='pending',submitted_at=NOW()`,
      [req.user.id, documentType||"national_id", documentUrl||null, selfieUrl||null, addressUrl||null]
    );
    await db.query("UPDATE users SET kyc_status='pending' WHERE id=$1",[req.user.id]);
    res.json({success:true, message:"KYC submitted for review"});
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

router.get("/status", authUser, async (req, res) => {
  try {
    const result = await db.query("SELECT kyc_status FROM users WHERE id=$1",[req.user.id]);
    res.json({ status: result.rows[0]?.kyc_status||"unverified" });
  } catch(err) { res.status(500).json({error:"Server error"}); }
});

module.exports = router;
