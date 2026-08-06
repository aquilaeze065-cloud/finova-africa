const router = require("express").Router();
const db     = require("../db");

// ── TELEGRAM HELPER ──
async function tg(msg) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token||!chatId) return;
  fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({chat_id:chatId,text:msg,parse_mode:"HTML"}),
  }).catch(()=>{});
}

// ── DASHBOARD STATS ──
router.get("/stats", async (req, res) => {
  try {
    const [users,active,revenue,pendingPays,pendingReg,pendingWR,totalSaved,thisWeek] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users"),
      db.query("SELECT COUNT(*) FROM users WHERE account_status='active'"),
      db.query("SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='approved'"),
      db.query("SELECT COUNT(*) FROM payments WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM registration_payments WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM withdrawal_requests WHERE status='pending'"),
      db.query("SELECT COALESCE(SUM(total_paid),0) as v FROM savings_plans WHERE status='active'"),
      db.query("SELECT COUNT(*) FROM payments WHERE status='approved' AND created_at > NOW()-INTERVAL '7 days'"),
    ]);
    res.json({
      totalUsers:         parseInt(users.rows[0].count),
      activeUsers:        parseInt(active.rows[0].count),
      pendingUsers:       parseInt(users.rows[0].count)-parseInt(active.rows[0].count),
      totalRevenue:       parseFloat(revenue.rows[0].v),
      pendingPayments:    parseInt(pendingPays.rows[0].count)+parseInt(pendingReg.rows[0].count),
      pendingWithdrawals: parseInt(pendingWR.rows[0].count),
      totalSaved:         parseFloat(totalSaved.rows[0].v),
      weeklyPayments:     parseInt(thisWeek.rows[0].count),
    });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// ── ALL USERS ──
router.get("/users", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.account_status,
        u.reg_fee_paid, u.reg_fee_submitted, u.kyc_status, u.created_at,
        COALESCE(wb.usdt_balance,0) as wallet_balance,
        COALESCE(sp.total_paid,0)   as total_saved,
        COALESCE((SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='paid'),0) as weeks_paid,
        COALESCE((SELECT COUNT(*) FROM referrals r WHERE r.referrer_id=u.id),0) as referrals
      FROM users u
      LEFT JOIN savings_plans sp ON sp.user_id=u.id AND sp.status='active'
      LEFT JOIN wallet_balances wb ON wb.user_id=u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ users:result.rows, total:result.rows.length });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// ── ALL PENDING ACTIONS (single endpoint for admin) ──
router.get("/pending-all", async (req, res) => {
  try {
    // Registration fee payments pending
    const regFees = await db.query(`
      SELECT rp.id, rp.user_id, rp.amount, rp.currency, rp.screenshot_url,
        rp.tx_hash, rp.status, rp.created_at,
        u.name, u.email, u.phone,
        'registration_fee' as payment_type
      FROM registration_payments rp
      JOIN users u ON rp.user_id=u.id
      WHERE rp.status='pending'
      ORDER BY rp.created_at DESC
    `);

    // Savings/deposit payments pending
    const payments = await db.query(`
      SELECT p.id, p.user_id, p.amount, p.currency, p.screenshot_url,
        p.tx_hash, p.status, p.created_at, p.type as payment_type, p.week_number,
        u.name, u.email, u.phone
      FROM payments p
      JOIN users u ON p.user_id=u.id
      WHERE p.status='pending'
      ORDER BY p.created_at DESC
    `);

    // Withdrawal requests pending
    const withdrawals = await db.query(`
      SELECT wr.id, wr.user_id, wr.amount, wr.currency, wr.wallet_address,
        wr.network, wr.clearance_form_url, wr.payment_receipt_url,
        wr.status, wr.created_at,
        u.name, u.email, u.phone,
        'withdrawal' as payment_type
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id=u.id
      WHERE wr.status='pending'
      ORDER BY wr.created_at DESC
    `);

    res.json({
      registrations: regFees.rows,
      payments:      payments.rows,
      withdrawals:   withdrawals.rows,
      total:         regFees.rows.length + payments.rows.length + withdrawals.rows.length,
    });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// ── ALL PAYMENTS HISTORY ──
router.get("/payments", async (req, res) => {
  try {
    const [pays, regFees] = await Promise.all([
      db.query(`SELECT p.*,u.name,u.email FROM payments p JOIN users u ON p.user_id=u.id ORDER BY p.created_at DESC LIMIT 100`),
      db.query(`SELECT rp.*,u.name,u.email,'registration_fee' as type FROM registration_payments rp JOIN users u ON rp.user_id=u.id ORDER BY rp.created_at DESC LIMIT 50`),
    ]);
    const all = [...pays.rows, ...regFees.rows].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
    res.json({ payments: all });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// ── SAVINGS TRACKER ──
router.get("/savings", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id as user_id, u.name, u.email,
        sp.id as plan_id, sp.total_paid, sp.start_date, sp.end_date, sp.status as plan_status,
        sp.current_week,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='paid') as weeks_paid,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id) as total_weeks,
        (SELECT COUNT(*) FROM savings_weeks sw WHERE sw.plan_id=sp.id AND sw.status='penalty') as penalty_weeks
      FROM savings_plans sp
      JOIN users u ON sp.user_id=u.id
      ORDER BY weeks_paid DESC
    `);
    res.json({ savings: result.rows });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// ══════════════════════════════════
// APPROVE REGISTRATION FEE
// ══════════════════════════════════
router.post("/approve-registration/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Activate user account
    await db.query(
      "UPDATE users SET reg_fee_paid=true, account_status='active' WHERE id=$1",
      [userId]
    );

    // 2. Mark registration payment approved
    await db.query(
      "UPDATE registration_payments SET status='approved',reviewed_at=NOW(),reviewed_by='Admin' WHERE user_id=$1 AND status='pending'",
      [userId]
    );

    // 3. Also approve any pending registration payment in payments table
    await db.query(
      "UPDATE payments SET status='approved',reviewed_at=NOW() WHERE user_id=$1 AND type='registration' AND status='pending'",
      [userId]
    );

    // 4. Create savings plan for user (52 weeks)
    const existing = await db.query("SELECT id FROM savings_plans WHERE user_id=$1",[userId]);
    if (!existing.rows.length) {
      const plan = await db.query(
        `INSERT INTO savings_plans(user_id,status,total_paid,current_week,start_date,end_date)
         VALUES($1,'active',0,1,NOW(),NOW()+INTERVAL '52 weeks') RETURNING id`,
        [userId]
      );
      // Create all 52 week slots
      const planId = plan.rows[0].id;
      const weeks = [];
      for (let w=1; w<=52; w++) {
        weeks.push(`('${planId}','${userId}',${w},'pending',NOW()+INTERVAL '${(w-1)*7} days')`);
      }
      await db.query(
        `INSERT INTO savings_weeks(plan_id,user_id,week_number,status,due_date) VALUES ${weeks.join(",")}`
      );
    }

    // 5. Initialize wallet balance
    await db.query(
      `INSERT INTO wallet_balances(user_id,usdt_balance,total_deposited)
       VALUES($1,0,0) ON CONFLICT(user_id) DO NOTHING`,
      [userId]
    );

    // 6. Send in-app notification to user
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','🎉 Account Activated!',
       'Your $4 USDT registration fee has been confirmed! Your NEXORA account is now fully active. Your 52-week savings plan has started. Make your first weekly payment to begin!',
       '✅','/dashboard')`,
      [userId]
    );

    // 7. Telegram alert to admin
    const user = await db.query("SELECT name,email FROM users WHERE id=$1",[userId]);
    if (user.rows[0]) {
      await tg(`✅ <b>Registration Approved!</b>\n\n👤 ${user.rows[0].name}\n📧 ${user.rows[0].email}\n\n🎯 52-week savings plan created & activated!`);
    }

    res.json({ success:true, message:"Account activated and savings plan created!" });
  } catch(err) {
    console.error("Approve reg error:", err.message);
    res.status(500).json({ error:err.message });
  }
});

// ══════════════════════════════════
// REJECT REGISTRATION FEE
// ══════════════════════════════════
router.post("/reject-registration/:userId", async (req, res) => {
  try {
    const { reason } = req.body;
    const { userId } = req.params;

    await db.query(
      "UPDATE registration_payments SET status='rejected',reviewed_at=NOW() WHERE user_id=$1 AND status='pending'",
      [userId]
    );
    await db.query(
      "UPDATE users SET reg_fee_submitted=false WHERE id=$1",
      [userId]
    );
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'penalty','❌ Payment Rejected',
       $2,'❌','/regfee')`,
      [userId, `Your registration payment was rejected. Reason: ${reason||"Screenshot unclear or wrong amount"}. Please resubmit with the correct $4 USDT screenshot.`]
    );

    res.json({ success:true });
  } catch(err) { res.status(500).json({ error:err.message }); }
});

// ══════════════════════════════════
// APPROVE SAVINGS/DEPOSIT PAYMENT
// ══════════════════════════════════
router.post("/approve-payment/:paymentId", async (req, res) => {
  try {
    const pay = await db.query("SELECT * FROM payments WHERE id=$1",[req.params.paymentId]);
    if (!pay.rows[0]) return res.status(404).json({error:"Payment not found"});
    const p = pay.rows[0];

    // 1. Mark payment approved
    await db.query(
      "UPDATE payments SET status='approved',reviewed_at=NOW(),reviewed_by='Admin' WHERE id=$1",
      [req.params.paymentId]
    );

    // 2. Credit user wallet balance
    await db.query(
      `INSERT INTO wallet_balances(user_id,usdt_balance,total_deposited)
       VALUES($1,$2,$2)
       ON CONFLICT(user_id) DO UPDATE
       SET usdt_balance=wallet_balances.usdt_balance+$2,
           total_deposited=wallet_balances.total_deposited+$2,
           updated_at=NOW()`,
      [p.user_id, parseFloat(p.amount||3)]
    );

    // 3. Mark savings week as paid
    if (p.type==="savings_payment"||p.type==="savings") {
      const plan = await db.query(
        "SELECT id,current_week FROM savings_plans WHERE user_id=$1 AND status='active' LIMIT 1",
        [p.user_id]
      );
      if (plan.rows[0]) {
        const weekNum = p.week_number || plan.rows[0].current_week || 1;
        await db.query(
          `UPDATE savings_weeks SET status='paid',paid_amount=$1,paid_at=NOW(),payment_id=$2
           WHERE plan_id=$3 AND week_number=$4 AND status!='paid'`,
          [p.amount, req.params.paymentId, plan.rows[0].id, weekNum]
        );
        await db.query(
          `UPDATE savings_plans SET total_paid=total_paid+$1,
           current_week=GREATEST(current_week,$2+1)
           WHERE id=$3`,
          [p.amount, weekNum, plan.rows[0].id]
        );
      }
    }

    // 4. Notify user
    const user = await db.query("SELECT name FROM users WHERE id=$1",[p.user_id]);
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','✅ Payment Confirmed!',
       $2,'💰','/savings')`,
      [p.user_id, `Your payment of $${parseFloat(p.amount||3).toFixed(2)} USDT has been confirmed and credited to your account! ${p.type==="savings_payment"?"Your savings for Week "+(p.week_number||"")+" have been updated.":""}`]
    );

    // 5. Telegram
    await tg(`✅ <b>Payment Approved!</b>\n\n👤 ${user.rows[0]?.name||"User"}\n💰 $${p.amount} USDT\n📋 Type: ${p.type}\n\nWallet updated immediately!`);

    res.json({ success:true, message:"Payment approved and wallet credited!" });
  } catch(err) {
    console.error("Approve payment error:", err.message);
    res.status(500).json({ error:err.message });
  }
});

// ══════════════════════════════════
// REJECT PAYMENT
// ══════════════════════════════════
router.post("/reject-payment/:paymentId", async (req, res) => {
  try {
    const { reason } = req.body;
    const pay = await db.query("SELECT * FROM payments WHERE id=$1",[req.params.paymentId]);
    if (!pay.rows[0]) return res.status(404).json({error:"Not found"});
    const p = pay.rows[0];

    await db.query(
      "UPDATE payments SET status='rejected',reviewed_at=NOW(),review_note=$1 WHERE id=$2",
      [reason||"", req.params.paymentId]
    );
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'penalty','❌ Payment Rejected',$2,'❌','/deposit')`,
      [p.user_id, `Your payment of $${p.amount} USDT was rejected. Reason: ${reason||"Screenshot unclear or wrong amount"}. Please resubmit.`]
    );
    res.json({ success:true });
  } catch(err) { res.status(500).json({ error:err.message }); }
});

// ══════════════════════════════════
// CREDIT SAVINGS MANUALLY
// ══════════════════════════════════
router.post("/credit-savings/:userId", async (req, res) => {
  try {
    const { weekNumber, amount } = req.body;
    const { userId } = req.params;
    const amt = parseFloat(amount||3);

    const plan = await db.query(
      "SELECT id FROM savings_plans WHERE user_id=$1 AND status='active' LIMIT 1",
      [userId]
    );
    if (!plan.rows[0]) return res.status(404).json({error:"No active savings plan"});

    await db.query(
      `UPDATE savings_weeks SET status='paid',paid_amount=$1,paid_at=NOW()
       WHERE plan_id=$2 AND week_number=$3`,
      [amt, plan.rows[0].id, weekNumber]
    );
    await db.query(
      "UPDATE savings_plans SET total_paid=total_paid+$1,current_week=GREATEST(current_week,$2+1) WHERE id=$3",
      [amt, weekNumber, plan.rows[0].id]
    );
    // Credit wallet
    await db.query(
      `INSERT INTO wallet_balances(user_id,usdt_balance,total_deposited) VALUES($1,$2,$2)
       ON CONFLICT(user_id) DO UPDATE SET usdt_balance=wallet_balances.usdt_balance+$2,total_deposited=wallet_balances.total_deposited+$2,updated_at=NOW()`,
      [userId, amt]
    );
    // Notify
    await db.query(
      `INSERT INTO notifications(user_id,type,title,body,icon,action)
       VALUES($1,'deposit','💰 Week ${weekNumber} Credited','Admin has credited your Week ${weekNumber} savings payment of $${amt} USDT!','✅','/savings')`,
      [userId]
    );
    const user = await db.query("SELECT name FROM users WHERE id=$1",[userId]);
    await tg(`💰 <b>Savings Credited</b>\n\n👤 ${user.rows[0]?.name||userId}\nWeek ${weekNumber} — $${amt} USDT`);

    res.json({ success:true });
  } catch(err) { res.status(500).json({ error:err.message }); }
});

module.exports = router;
