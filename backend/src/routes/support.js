const router = require("express").Router();
const db     = require("../db");
const { authAdmin } = require("../middleware/auth");

// Get support team
router.get("/team", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM support_team WHERE active=true ORDER BY created_at ASC");
    res.json({ team: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - get all support team
router.get("/admin/team", authAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM support_team ORDER BY created_at DESC");
    res.json({ team: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - add support agent
router.post("/admin/team", authAdmin, async (req, res) => {
  try {
    const { name, whatsapp, role, avatar } = req.body;
    if (!name||!whatsapp) return res.status(400).json({ error:"Name and WhatsApp required" });
    const clean = whatsapp.replace(/\D/g,"");
    const result = await db.query(
      "INSERT INTO support_team(name,whatsapp,role,avatar) VALUES($1,$2,$3,$4) RETURNING *",
      [name, clean, role||"Support Agent", avatar||""]
    );
    res.status(201).json({ agent: result.rows[0] });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - toggle agent active
router.post("/admin/team/:id/toggle", authAdmin, async (req, res) => {
  try {
    await db.query("UPDATE support_team SET active=NOT active WHERE id=$1",[req.params.id]);
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - delete agent
router.delete("/admin/team/:id", authAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM support_team WHERE id=$1",[req.params.id]);
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
