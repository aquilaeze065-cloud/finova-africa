const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

// NGN rate cache
let ngnCache = { rate: 1580, updatedAt: 0 };

async function getNGNRate() {
  if (Date.now() - ngnCache.updatedAt < 5 * 60 * 1000) return ngnCache.rate;
  try {
    // Try multiple sources
    const sources = [
      "https://api.exchangerate-api.com/v4/latest/USD",
      "https://open.er-api.com/v6/latest/USD",
    ];
    for (const url of sources) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        const rate = data.rates?.NGN;
        if (rate && rate > 100) {
          ngnCache = { rate, updatedAt: Date.now() };
          console.log(`💱 NGN rate updated: ${rate}`);
          return rate;
        }
      } catch {}
    }
  } catch {}
  return ngnCache.rate;
}

// Get all transactions for user
router.get("/", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    const rate = await getNGNRate();
    res.json({ transactions: result.rows, ngnRate: rate });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

// Get single transaction (for receipt)
router.get("/:id", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM transactions WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error:"Transaction not found" });
    const rate = await getNGNRate();
    res.json({ transaction: result.rows[0], ngnRate: rate });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

// Get live NGN rate
router.get("/rates/ngn", async (req, res) => {
  try {
    const rate = await getNGNRate();
    res.json({
      rate,
      pairs: {
        USDT_NGN: rate,
        BTC_NGN:  rate * 105000,
        ETH_NGN:  rate * 3800,
      },
      updatedAt: new Date(ngnCache.updatedAt).toISOString(),
    });
  } catch(err) { res.status(500).json({ error:"Server error" }); }
});

module.exports = router;
