const cron = require("node-cron");
const db   = require("../db");

// Track already-processed transactions
const processedTx = new Set();

// ── TRON TRC-20 USDT MONITOR ──
async function checkTronTransactions(walletAddress) {
  if (!walletAddress || walletAddress.includes("Your")) return [];
  try {
    const url = `https://apilist.tronscan.org/api/transaction?address=${walletAddress}&limit=20&direction=0&db_version=1&start=0`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

// ── ETH / ERC-20 MONITOR ──
async function checkEthTransactions(walletAddress) {
  if (!walletAddress || walletAddress.includes("Your")) return [];
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY || "";
    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&startblock=0&endblock=latest&sort=desc&apikey=${apiKey}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return data.result || [];
  } catch { return []; }
}

// ── MATCH TRANSACTION TO USER ──
async function matchAndCredit(txHash, amount, currency, network, fromAddress) {
  try {
    if (processedTx.has(txHash)) return;
    processedTx.add(txHash);

    const usdtAmount = parseFloat(amount);
    if (usdtAmount < 2.5 || usdtAmount > 200) return; // Skip obvious non-savings

    // Check if this tx was already processed
    const existing = await db.query(
      "SELECT id FROM transactions WHERE tx_hash=$1", [txHash]
    );
    if (existing.rows.length > 0) return;

    // Find pending payment matching this amount from any user
    const payments = await db.query(
      `SELECT p.*, u.id as uid, u.name, u.email
       FROM payments p
       JOIN users u ON p.user_id=u.id
       WHERE p.status='pending'
         AND p.amount=$1
         AND p.currency=$2
         AND p.created_at > NOW() - INTERVAL '48 hours'
       ORDER BY p.created_at DESC LIMIT 1`,
      [Math.round(usdtAmount), currency]
    );

    if (!payments.rows[0]) return;
    const pay = payments.rows[0];

    // Auto-approve payment
    await db.query(
      "UPDATE payments SET status='approved',tx_hash=$1,confirmed_at=NOW(),reviewed_by='AUTO' WHERE id=$2",
      [txHash, pay.id]
    );

    // Credit savings
    const plan = await db.query(
      "SELECT id,current_week FROM savings_plans WHERE user_id=$1 AND status='active' LIMIT 1",
      [pay.uid]
    );

    if (plan.rows[0]) {
      const weekNum = plan.rows[0].current_week || 1;
      await db.query(
        "UPDATE savings_weeks SET status='paid',paid_amount=$1,paid_at=NOW(),tx_hash=$2 WHERE plan_id=$3 AND week_number=$4 AND status!='paid'",
        [usdtAmount, txHash, plan.rows[0].id, weekNum]
      );
      await db.query(
        "UPDATE savings_plans SET total_paid=total_paid+$1,current_week=current_week+1 WHERE id=$2",
        [usdtAmount, plan.rows[0].id]
      );
    }

    // Log transaction
    await db.query(
      `INSERT INTO transactions(user_id,type,crypto,amount,usd_value,status,tx_hash,network)
       VALUES($1,'savings_payment',$2,$3,$3,'confirmed',$4,$5)`,
      [pay.uid, currency, usdtAmount, txHash, network]
    );

    // Notify user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit',$2,$3,'✅','/savings')`,
      [
        pay.uid,
        `Payment Confirmed Automatically ✅`,
        `Your payment of $${usdtAmount} ${currency} has been confirmed on the blockchain! Your savings have been updated.`
      ]
    );

    console.log(`✅ Auto-credited ${usdtAmount} ${currency} to user ${pay.name} (${pay.email})`);
  } catch(err) {
    console.error("Auto-credit error:", err.message);
  }
}

// ── RUN MONITOR ──
async function runMonitor() {
  try {
    // Get all active platform wallets
    const wallets = await db.query("SELECT * FROM platform_wallets WHERE is_active=true");

    for (const wallet of wallets.rows) {
      const addr = wallet.address;
      const net  = (wallet.network||"").toLowerCase();

      if (net.includes("trc") || net.includes("tron")) {
        const txs = await checkTronTransactions(addr);
        for (const tx of txs) {
          if (tx.contractType===31 && tx.confirmed) { // TRC-20 transfer
            await matchAndCredit(tx.hash, tx.amount/1e6, "USDT", "TRC-20", tx.ownerAddress);
          }
        }
      }

      if (net.includes("erc") || net.includes("eth")) {
        const txs = await checkEthTransactions(addr);
        for (const tx of txs) {
          if (tx.confirmations >= 12) {
            await matchAndCredit(tx.hash, parseFloat(tx.value)/1e6, "USDT", "ERC-20", tx.from);
          }
        }
      }
    }
  } catch(err) {
    console.error("Monitor error:", err.message);
  }
}

// Run every 3 minutes
cron.schedule("*/3 * * * *", ()=>{
  console.log("🔍 Checking blockchain for new payments...");
  runMonitor();
});

// Also run on startup after 10 seconds
setTimeout(runMonitor, 10000);

console.log("⛓️ Blockchain monitor started - checking every 3 minutes");
module.exports = { runMonitor };
