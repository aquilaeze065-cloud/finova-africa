const db = require("../db");

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT  = process.env.TELEGRAM_CHAT_ID   || "";
const FRONTEND       = process.env.FRONTEND_URL || "https://finova-africa.vercel.app";
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL  || "";

// ── SEND TELEGRAM MESSAGE ──
async function sendTelegram(message) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) {
    console.log("⚠️  Telegram not configured. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to Railway.");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    TELEGRAM_CHAT,
          text:       message,
          parse_mode: "HTML",
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    const data = await res.json();
    if (data.ok) {
      console.log("✅ Telegram notification sent!");
      return true;
    } else {
      console.error("❌ Telegram error:", data.description);
      return false;
    }
  } catch (err) {
    console.error("❌ Telegram send failed:", err.message);
    return false;
  }
}

// ── SEND EMAIL VIA MAILERSEND ──
async function sendEmail(title, body) {
  if (!process.env.MAILERSEND_API_KEY || !ADMIN_EMAIL) return;
  try {
    await fetch("https://api.mailersend.com/v1/email", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: { email: process.env.FROM_EMAIL || "noreply@nexora.com", name: "NEXORA Admin" },
        to:   [{ email: ADMIN_EMAIL, name: "NEXORA Admin" }],
        subject: `🔔 ${title}`,
        html: `
<div style="background:#050f0c;padding:28px;font-family:Arial,sans-serif;border-radius:12px;max-width:500px">
  <div style="background:linear-gradient(135deg,#00c896,#0066ff);border-radius:10px;padding:16px;text-align:center;margin-bottom:20px">
    <h2 style="color:white;margin:0;font-size:18px">◈ NEXORA Admin Alert</h2>
  </div>
  <h3 style="color:#00c896;margin:0 0 12px">${title}</h3>
  <div style="color:#5a8a7a;font-size:14px;line-height:1.7;white-space:pre-line">${body}</div>
  <div style="margin-top:20px;text-align:center">
    <a href="${FRONTEND}/admin" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">
      Open Admin Panel →
    </a>
  </div>
  <div style="color:#2a4a3a;font-size:11px;text-align:center;margin-top:16px">
    © 2026 NEXORA · Automated Admin Alert
  </div>
</div>`,
      }),
    });
    console.log("✅ Email alert sent to", ADMIN_EMAIL);
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

// ── SAVE TO DB ──
async function saveToDb(type, title, body, data = {}) {
  try {
    await db.query(
      `INSERT INTO admin_notifications(type,title,body,data,read,created_at)
       VALUES($1,$2,$3,$4,false,NOW())`,
      [type, title, body, JSON.stringify(data)]
    );
  } catch (err) {
    console.error("DB save error:", err.message);
  }
}

// ── MAIN NOTIFY FUNCTION ──
async function notifyAdmin(type, title, body, data = {}) {
  // 1. Save to DB (shows in admin panel)
  await saveToDb(type, title, body, data);

  // 2. Send Telegram (instant notification)
  await sendTelegram(
    `🔔 <b>${title}</b>\n\n${body}\n\n<a href="${FRONTEND}/admin">👉 Open Admin Panel</a>`
  );

  // 3. Send Email (backup)
  sendEmail(title, body).catch(() => {});
}

// ════════════════════════════════════
// SPECIFIC NOTIFICATION BUILDERS
// ════════════════════════════════════

// New user registered
async function newRegistration(user) {
  await notifyAdmin(
    "registration",
    "🆕 New User Registered!",
    `A new client just signed up on NEXORA!\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n📱 Phone: ${user.phone || "Not provided"}\n\n💳 They are waiting for you to approve their <b>$4 USDT registration fee</b> before their dashboard opens.\n\n⚡ Go to Admin → Payments to approve now.`,
    { Name: user.name, Email: user.email, Status: "WAITING FOR FEE APPROVAL" }
  );
}

// Registration fee submitted
async function regFeeSubmitted(user, amount) {
  await notifyAdmin(
    "payment",
    "💳 Registration Fee Payment Submitted!",
    `${user.name} has paid their $${amount} USDT registration fee!\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n💰 Amount: $${amount} USDT\n\n📸 Payment screenshot has been uploaded.\n\n⚡ Approve now → their dashboard will unlock immediately.`,
    { User: user.name, Amount: `$${amount} USDT`, Action: "APPROVE IN ADMIN PANEL" }
  );
}

// Weekly savings payment submitted
async function savingsPaymentSubmitted(user, week, amount) {
  await notifyAdmin(
    "savings",
    `💰 Week ${week} Savings Payment Submitted!`,
    `${user.name} has submitted their weekly savings payment!\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n📅 Week: ${week} of 52\n💰 Amount: $${amount} USDT\n\n📸 Payment screenshot uploaded and waiting.\n\n⚡ Verify and approve in Admin → Payments.`,
    { User: user.name, Week: `Week ${week}`, Amount: `$${amount} USDT` }
  );
}

// Penalty payment submitted
async function penaltyPaymentSubmitted(user, week, amount) {
  await notifyAdmin(
    "penalty",
    `⚠️ Penalty Payment Submitted — Week ${week}`,
    `${user.name} paid the late penalty for Week ${week}!\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n💸 Penalty: $${amount} USDT\n📅 Week: ${week}\n\n📸 Screenshot uploaded.\n\n⚡ Approve to unlock their savings plan in Admin → Payments.`,
    { User: user.name, Week: `Week ${week}`, Penalty: `$${amount} USDT` }
  );
}

// Withdrawal requested
async function withdrawalRequested(user, amount, wallet) {
  await notifyAdmin(
    "withdrawal",
    "⬇️ Withdrawal Request Submitted!",
    `${user.name} is requesting a withdrawal!\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n💰 Amount: $${amount} USDT\n👛 Wallet: ${wallet}\n\n📋 Clearance form and payment receipt have been uploaded.\n\n⚡ Review documents in Admin → Withdrawals and approve to process payment.`,
    { User: user.name, Amount: `$${amount} USDT`, Wallet: wallet }
  );
}

// Referral registered
async function newReferral(referrer, newUser) {
  await notifyAdmin(
    "referral",
    "🎁 New Referral Registered!",
    `${referrer.name} successfully referred a new user!\n\n🎯 Referrer: ${referrer.name} (${referrer.email})\n🆕 New User: ${newUser.name} (${newUser.email})\n💰 Bonus: $1 USDT auto-credited to ${referrer.name}\n\nReferral program is working! 🚀`,
    { Referrer: referrer.name, "New User": newUser.name, Bonus: "$1 USDT credited" }
  );
}

// KYC submitted
async function kycSubmitted(user) {
  await notifyAdmin(
    "kyc",
    "🪪 KYC Documents Submitted!",
    `${user.name} submitted their identity verification documents!\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n\n📋 Documents are waiting for your review.\n\n⚡ Go to Admin → KYC to approve or reject.`,
    { User: user.name, Email: user.email, Status: "PENDING REVIEW" }
  );
}

module.exports = {
  notifyAdmin,
  newRegistration,
  regFeeSubmitted,
  savingsPaymentSubmitted,
  penaltyPaymentSubmitted,
  withdrawalRequested,
  newReferral,
  kycSubmitted,
  sendTelegram, // Export for testing
};
