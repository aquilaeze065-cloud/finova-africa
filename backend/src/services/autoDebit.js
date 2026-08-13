const cron = require("node-cron");
const db   = require("../db");

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

// ── CHECK DUE WEEKS EVERY DAY AT 8AM ──
async function checkDueWeeks() {
  try {
    console.log("⏰ Checking due savings weeks...");

    // Find weeks that are due today and still pending
    const dueWeeks = await db.query(`
      SELECT sw.*, u.id as uid, u.name, u.email,
             sp.id as plan_id, wb.usdt
      FROM savings_weeks sw
      JOIN savings_plans sp ON sw.plan_id=sp.id
      JOIN users u ON sw.user_id=u.id
      LEFT JOIN wallet_balances wb ON wb.user_id=u.id
      WHERE sw.status='pending'
        AND sw.due_date <= NOW()
        AND sp.status='active'
        AND u.account_status='active'
      ORDER BY sw.due_date ASC
    `);

    console.log(`Found ${dueWeeks.rows.length} due weeks`);

    for (const week of dueWeeks.rows) {
      const balance = parseFloat(week.usdt||0);
      const needed  = 3.00;

      if (balance >= needed) {
        // ✅ AUTO-DEBIT: User has enough balance — deduct and mark paid
        await db.query(
          `UPDATE wallet_balances SET usdt=usdt-$1,updated_at=NOW()
           WHERE user_id=$2`,
          [needed, week.uid]
        );
        await db.query(
          `UPDATE savings_weeks SET status='paid',paid_amount=$1,paid_at=NOW()
           WHERE id=$2`,
          [needed, week.id]
        );
        await db.query(
          `UPDATE savings_plans SET total_paid=total_paid+$1,
           current_week=GREATEST(current_week,week_number+1)
           WHERE id=$2`,
          [needed, week.plan_id]
        );
        // Create payment record
        await db.query(
          `INSERT INTO payments(user_id,type,amount,currency,status,week_number,reviewed_by,reviewed_at)
           VALUES($1,'savings_payment',$2,'USDT','approved',$3,'AUTO_DEBIT',NOW())`,
          [week.uid, needed, week.week_number]
        );
        // Notify user
        await db.query(
          `INSERT INTO notifications(user_id,type,title,body,icon,action)
           VALUES($1,'deposit','💰 Week ${week.week_number} Auto-Paid!',
           'Your Week ${week.week_number} savings of $3 USDT has been automatically deducted from your wallet balance and credited to your savings!',
           '✅','/savings')`,
          [week.uid]
        );
        console.log(`✅ Auto-debited $3 from ${week.name} for Week ${week.week_number}`);
        await tg(`✅ <b>Auto-Debit Successful</b>\n\n👤 ${week.name}\n📅 Week ${week.week_number}\n💰 $3 USDT deducted automatically`);

      } else {
        // ❌ Insufficient balance — mark as penalty pending
        const alreadyPenalty = await db.query(
          "SELECT id FROM savings_weeks WHERE id=$1 AND status='penalty'",
          [week.id]
        );
        if (!alreadyPenalty.rows.length) {
          await db.query(
            "UPDATE savings_weeks SET status='penalty' WHERE id=$1",
            [week.id]
          );
          // Notify user of missed payment
          await db.query(
            `INSERT INTO notifications(user_id,type,title,body,icon,action)
             VALUES($1,'penalty','⚠️ Missed Payment — Week ${week.week_number}',
             'Your Week ${week.week_number} savings payment of $3 USDT was due today but your wallet balance is insufficient ($${balance.toFixed(2)} available). A $4 USDT penalty will apply. Please deposit immediately to avoid contract termination.',
             '⚠️','/deposit')`,
            [week.uid]
          );
          console.log(`⚠️ Penalty applied to ${week.name} Week ${week.week_number} - insufficient balance`);
          await tg(`⚠️ <b>Missed Payment</b>\n\n👤 ${week.name}\n📧 ${week.email}\n📅 Week ${week.week_number}\n💵 Balance: $${balance.toFixed(2)} (needed $3)\n\nPenalty of $4 USDT applied.`);
        }
      }
    }

    // Check for 5+ consecutive missed weeks → terminate contract
    const overdueUsers = await db.query(`
      SELECT user_id, COUNT(*) as missed_count
      FROM savings_weeks
      WHERE status='penalty'
        AND plan_id IN (SELECT id FROM savings_plans WHERE status='active')
      GROUP BY user_id
      HAVING COUNT(*) >= 5
    `);

    for (const u of overdueUsers.rows) {
      await db.query(
        "UPDATE savings_plans SET status='terminated' WHERE user_id=$1 AND status='active'",
        [u.user_id]
      );
      await db.query(
        `INSERT INTO notifications(user_id,type,title,body,icon,action)
         VALUES($1,'penalty','⛔ Savings Contract Terminated',
         'Your savings contract has been terminated due to 5 or more consecutive missed payments. Interest earned has been forfeited. Contact support to discuss options.',
         '⛔','/savings')`,
        [u.user_id]
      );
      const user = await db.query("SELECT name,email FROM users WHERE id=$1",[u.user_id]);
      await tg(`⛔ <b>Contract Terminated</b>\n\n👤 ${user.rows[0]?.name||u.user_id}\n📧 ${user.rows[0]?.email}\n\n5+ consecutive missed payments.`);
    }

    console.log("✅ Auto-debit check complete");
  } catch(err) {
    console.error("Auto-debit error:", err.message);
  }
}

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", ()=>{
  console.log("🕗 Running daily auto-debit check...");
  checkDueWeeks();
});

// Also run every hour to catch any missed ones
cron.schedule("0 * * * *", ()=>{
  checkDueWeeks();
});

// Run on startup after 15 seconds
setTimeout(checkDueWeeks, 15000);

console.log("✅ Auto-debit scheduler started");
module.exports = { checkDueWeeks };
