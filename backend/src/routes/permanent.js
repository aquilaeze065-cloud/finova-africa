const router = require("express").Router();
const db     = require("../db");

// ════════════════════════════════════
// PLATFORM WALLETS — Permanent in DB
// ════════════════════════════════════

router.get("/wallets", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM platform_wallets WHERE is_active=true ORDER BY created_at ASC");
    res.json({ wallets: r.rows });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.get("/wallets/all", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM platform_wallets ORDER BY created_at ASC");
    res.json({ wallets: r.rows });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.post("/wallets", async (req, res) => {
  try {
    const { coin, symbol, network, address } = req.body;
    if (!address) return res.status(400).json({error:"Wallet address is required"});
    const r = await db.query(
      "INSERT INTO platform_wallets(coin,symbol,network,address) VALUES($1,$2,$3,$4) RETURNING *",
      [coin||"USDT", symbol||"USDT", network||"TRC-20 (TRON)", address]
    );
    res.json({ success:true, wallet:r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.put("/wallets/:id", async (req, res) => {
  try {
    const { address, coin, network, is_active } = req.body;
    await db.query(
      "UPDATE platform_wallets SET address=COALESCE($1,address),coin=COALESCE($2,coin),network=COALESCE($3,network),is_active=COALESCE($4,is_active) WHERE id=$5",
      [address, coin, network, is_active, req.params.id]
    );
    res.json({ success:true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.delete("/wallets/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM platform_wallets WHERE id=$1", [req.params.id]);
    res.json({ success:true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

// ════════════════════════════════════
// EXCHANGERS — Permanent in DB
// ════════════════════════════════════

router.get("/exchangers", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM exchangers ORDER BY created_at ASC");
    res.json({ exchangers: r.rows });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.post("/exchangers", async (req, res) => {
  try {
    const { name, phone, whatsapp, bank, accountNo, accountName, network, walletAddress, country } = req.body;
    if (!name) return res.status(400).json({error:"Name is required"});
    const r = await db.query(
      `INSERT INTO exchangers(name,phone,whatsapp,bank,account_no,account_name,network,wallet_address,country)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, phone||"", whatsapp||"", bank||"", accountNo||"", accountName||"", network||"", walletAddress||"", country||"Nigeria"]
    );
    res.json({ success:true, exchanger:r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.put("/exchangers/:id", async (req, res) => {
  try {
    const { active } = req.body;
    await db.query("UPDATE exchangers SET active=$1 WHERE id=$2", [active, req.params.id]);
    res.json({ success:true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.delete("/exchangers/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM exchangers WHERE id=$1", [req.params.id]);
    res.json({ success:true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

// ════════════════════════════════════
// SUPPORT TEAM — Permanent in DB
// ════════════════════════════════════

router.get("/support-team", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM support_team ORDER BY created_at ASC");
    res.json({ team: r.rows });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.post("/support-team", async (req, res) => {
  try {
    const { name, whatsapp, role } = req.body;
    if (!name || !whatsapp) return res.status(400).json({error:"Name and WhatsApp are required"});
    const clean = whatsapp.replace(/\D/g,"");
    const r = await db.query(
      "INSERT INTO support_team(name,whatsapp,role) VALUES($1,$2,$3) RETURNING *",
      [name, clean, role||"Support Agent"]
    );
    // Also sync to localStorage format for LiveChat
    res.json({ success:true, agent:r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.put("/support-team/:id", async (req, res) => {
  try {
    const { active } = req.body;
    await db.query("UPDATE support_team SET active=$1 WHERE id=$2", [active, req.params.id]);
    res.json({ success:true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

router.delete("/support-team/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM support_team WHERE id=$1", [req.params.id]);
    res.json({ success:true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

module.exports = router;
