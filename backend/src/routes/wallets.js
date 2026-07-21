const router = require("express").Router();
const db     = require("../db");

// Get all active platform wallets (public)
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM platform_wallets WHERE is_active=true ORDER BY coin ASC");
    res.json({ wallets: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - get all wallets
router.get("/admin/all", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM platform_wallets ORDER BY coin ASC");
    res.json({ wallets: result.rows });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - add wallet
router.post("/admin", async (req, res) => {
  try {
    const { coin, symbol, network, address } = req.body;
    if (!coin||!address) return res.status(400).json({ error:"Coin and address required" });
    const result = await db.query(
      "INSERT INTO platform_wallets(coin,symbol,network,address) VALUES($1,$2,$3,$4) RETURNING *",
      [coin, symbol||coin, network||"", address]
    );
    res.status(201).json({ wallet: result.rows[0] });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - update wallet
router.put("/admin/:id", async (req, res) => {
  try {
    const { address, is_active } = req.body;
    await db.query(
      "UPDATE platform_wallets SET address=$1,is_active=$2,updated_at=NOW() WHERE id=$3",
      [address, is_active!==false, req.params.id]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// Admin - delete wallet
router.delete("/admin/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM platform_wallets WHERE id=$1",[req.params.id]);
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
