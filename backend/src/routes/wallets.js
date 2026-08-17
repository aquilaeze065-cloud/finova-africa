const router = require("express").Router();
const db     = require("../db");
const { authUser } = require("../middleware/auth");

// ── TELEGRAM ALERT ──
async function tg(msg) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "HTML" }),
  }).catch(() => {});
}

// ── GET USER WALLET BALANCE ──
router.get("/balance", authUser, async (req, res) => {
  try {
    // Get or create wallet balance
    let result = await db.query(
      "SELECT * FROM wallet_balances WHERE user_id=$1", [req.user.id]
    );
    if (!result.rows[0]) {
      result = await db.query(
        `INSERT INTO wallet_balances(user_id,usdt_balance,total_deposited,total_withdrawn)
         VALUES($1,0,0,0) RETURNING *`, [req.user.id]
      );
    }
    const wallet = result.rows[0];

    // Get savings plan
    const plan = await db.query(
      `SELECT sp.*,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='paid') as weeks_paid,
        (SELECT MIN(week_number) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='pending') as next_week
       FROM savings_plans sp WHERE sp.user_id=$1 AND sp.status='active' LIMIT 1`,
      [req.user.id]
    );

    // Get recent wallet transactions
    const txns = await db.query(
      "SELECT * FROM wallet_transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10",
      [req.user.id]
    );

    res.json({
      balance: parseFloat(wallet.usdt_balance || 0),
      totalDeposited: parseFloat(wallet.total_deposited || 0),
      totalWithdrawn: parseFloat(wallet.total_withdrawn || 0),
      plan: plan.rows[0] || null,
      weeksPaid: parseInt(plan.rows[0]?.weeks_paid || 0),
      nextWeek: parseInt(plan.rows[0]?.next_week || 1),
      transactions: txns.rows,
    });
  } catch (err) {
    console.error("Balance error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── MOVE FROM WALLET TO SAVINGS (manual) ──
router.post("/move-to-savings", authUser, async (req, res) => {
  try {
    const { weekNumber } = req.body;
    const WEEKLY_AMT = 3.00;

    // Get wallet balance
    const wallet = await db.query(
      "SELECT * FROM wallet_balances WHERE user_id=$1", [req.user.id]
    );
    const balance = parseFloat(wallet.rows[0]?.usdt_balance || 0);

    if (balance < WEEKLY_AMT) {
      return res.status(400).json({
        error: `Insufficient balance. You have $${balance.toFixed(2)} USDT but need $${WEEKLY_AMT} USDT.`,
        balance,
      });
    }

    // Get savings plan
    const plan = await db.query(
      "SELECT * FROM savings_plans WHERE user_id=$1 AND status='active' LIMIT 1",
      [req.user.id]
    );
    if (!plan.rows[0]) {
      return res.status(404).json({ error: "No active savings plan found." });
    }

    // Get the week to pay
    const weekNum = weekNumber || plan.rows[0].current_week || 1;
    const week = await db.query(
      "SELECT * FROM savings_weeks WHERE plan_id=$1 AND week_number=$2 LIMIT 1",
      [plan.rows[0].id, weekNum]
    );

    if (!week.rows[0]) {
      return res.status(404).json({ error: `Week ${weekNum} not found.` });
    }
    if (week.rows[0].status === "paid") {
      return res.status(400).json({ error: `Week ${weekNum} is already paid.` });
    }

    // Deduct from wallet
    await db.query(
      `UPDATE wallet_balances
       SET usdt_balance = usdt_balance - $1,
           total_withdrawn = total_withdrawn + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [WEEKLY_AMT, req.user.id]
    );

    // Mark week as paid
    await db.query(
      `UPDATE savings_weeks
       SET status='paid', paid_amount=$1, paid_at=NOW()
       WHERE id=$2`,
      [WEEKLY_AMT, week.rows[0].id]
    );

    // Update savings plan total
    await db.query(
      `UPDATE savings_plans
       SET total_paid = total_paid + $1,
           current_week = GREATEST(current_week, $2 + 1)
       WHERE id = $3`,
      [WEEKLY_AMT, weekNum, plan.rows[0].id]
    );

    // Record wallet transaction
    const newBalance = balance - WEEKLY_AMT;
    await db.query(
      `INSERT INTO wallet_transactions(user_id,type,amount,balance_before,balance_after,description)
       VALUES($1,'savings_payment',$2,$3,$4,$5)`,
      [req.user.id, WEEKLY_AMT, balance, newBalance, `Week ${weekNum} savings payment`]
    );

    // Record in payments table
    await db.query(
      `INSERT INTO payments(user_id,type,amount,currency,status,week_number,reviewed_by,reviewed_at)
       VALUES($1,'savings_payment',$2,'USDT','approved',$3,'AUTO_WALLET',NOW())`,
      [req.user.id, WEEKLY_AMT, weekNum]
    );

    // Notify user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','✅ Week ${ weekNum } Paid!',
       'Your Week ${weekNum} savings payment of $${WEEKLY_AMT} USDT has been deducted from your wallet and credited to your savings plan!',
       '💰','/savings')`,
      [req.user.id]
    );

    const user = await db.query("SELECT name FROM users WHERE id=$1", [req.user.id]);
    await tg(`💰 <b>Savings Payment from Wallet</b>\n\n👤 ${user.rows[0]?.name}\n📅 Week ${weekNum}\n💵 $${WEEKLY_AMT} USDT\n🔄 Auto-deducted from wallet\n💼 New balance: $${newBalance.toFixed(2)}`);

    res.json({
      success: true,
      message: `Week ${weekNum} paid successfully from your wallet!`,
      newBalance: newBalance,
      weekPaid: weekNum,
    });
  } catch (err) {
    console.error("Move to savings error:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ── GET PLATFORM WALLETS (for deposit) ──
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM platform_wallets WHERE is_active=true ORDER BY coin ASC"
    );
    res.json({ wallets: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN - GET ALL WALLETS ──
router.get("/admin/all", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM platform_wallets ORDER BY coin ASC");
    res.json({ wallets: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN - ADD WALLET ──
router.post("/admin", async (req, res) => {
  try {
    const { coin, symbol, network, address } = req.body;
    if (!address) return res.status(400).json({ error: "Address required" });
    const result = await db.query(
      "INSERT INTO platform_wallets(coin,symbol,network,address) VALUES($1,$2,$3,$4) RETURNING *",
      [coin||"USDT", symbol||"USDT", network||"TRC-20", address]
    );
    res.status(201).json({ wallet: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN - UPDATE WALLET ──
router.put("/admin/:id", async (req, res) => {
  try {
    const { address, is_active } = req.body;
    await db.query(
      "UPDATE platform_wallets SET address=$1,is_active=$2,updated_at=NOW() WHERE id=$3",
      [address, is_active !== false, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN - DELETE WALLET ──
router.delete("/admin/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM platform_wallets WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
