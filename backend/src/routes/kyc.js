const router = require("express").Router();
const db     = require("../db");
const { authUser, authAdmin } = require("../middleware/auth");

router.post("/submit", authUser, async (req, res) => {
  try {
    const { idType, idFrontUrl, idBackUrl, selfieUrl, addressDocUrl, profile } = req.body;
    await db.query(
      "INSERT INTO kyc_documents(user_id,id_type,id_front_url,id_back_url,selfie_url,address_doc_url) VALUES($1,$2,$3,$4,$5,$6)",
      [req.user.id,idType,idFrontUrl,idBackUrl,selfieUrl,addressDocUrl]
    );
    if (profile) {
      const ex = await db.query("SELECT id FROM user_profiles WHERE user_id=$1",[req.user.id]);
      if (ex.rows[0]) {
        await db.query(
          "UPDATE user_profiles SET full_name=$1,dob=$2,gender=$3,phone=$4,address=$5,city=$6,state=$7,bvn=$8,nin=$9,updated_at=NOW() WHERE user_id=$10",
          [profile.fullName,profile.dob,profile.gender,profile.phone,profile.address,profile.city,profile.state,profile.bvn,profile.nin,req.user.id]
        );
      } else {
        await db.query(
          "INSERT INTO user_profiles(user_id,full_name,dob,gender,phone,address,city,state,bvn,nin) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
          [req.user.id,profile.fullName,profile.dob,profile.gender,profile.phone,profile.address,profile.city,profile.state,profile.bvn,profile.nin]
        );
      }
    }
    await db.query("UPDATE users SET kyc_submitted=true,kyc_status='pending' WHERE id=$1",[req.user.id]);
    res.json({ success:true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my-status", authUser, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM kyc_documents WHERE user_id=$1 ORDER BY submitted_at DESC LIMIT 1",[req.user.id]);
    res.json({ kyc: result.rows[0]||null });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/pending", authAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT k.*,u.name,u.email FROM kyc_documents k JOIN users u ON k.user_id=u.id WHERE k.status='pending' ORDER BY k.submitted_at DESC"
    );
    res.json({ kyc: result.rows });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/approve/:id", authAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const kycRes = await db.query("SELECT * FROM kyc_documents WHERE id=$1",[req.params.id]);
    if (!kycRes.rows[0]) return res.status(404).json({ error:"Not found" });
    await db.query("UPDATE kyc_documents SET status='approved',review_note=$1,reviewed_at=NOW() WHERE id=$2",[note||null,req.params.id]);
    await db.query("UPDATE users SET kyc_status='verified' WHERE id=$1",[kycRes.rows[0].user_id]);
    await db.query(
      "INSERT INTO notifications(user_id,type,title,body,icon,action) VALUES($1,'kyc','KYC Approved!','Your identity has been verified successfully!','🛡️','/my-progress')",
      [kycRes.rows[0].user_id]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/reject/:id", authAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const kycRes = await db.query("SELECT * FROM kyc_documents WHERE id=$1",[req.params.id]);
    await db.query("UPDATE kyc_documents SET status='rejected',review_note=$1,reviewed_at=NOW() WHERE id=$2",[note||null,req.params.id]);
    await db.query("UPDATE users SET kyc_status='rejected' WHERE id=$1",[kycRes.rows[0].user_id]);
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
