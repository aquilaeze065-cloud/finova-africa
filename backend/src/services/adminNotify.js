// Send WhatsApp notification to admin via wa.me
// Since we can't push to WhatsApp directly without business API,
// we store notifications in DB and expose a webhook endpoint
// Admin can also set up UltraMsg/CallMeBot for real WA push

const db = require("../db");

const ADMIN_WA = process.env.ADMIN_WHATSAPP || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nexora.com";

// Store admin notification in DB
async function notifyAdmin(type, title, body, data = {}) {
  try {
    await db.query(
      `INSERT INTO admin_notifications(type,title,body,data,read,created_at)
       VALUES($1,$2,$3,$4,false,NOW())`,
      [type, title, body, JSON.stringify(data)]
    );

    // Send via UltraMsg if configured (WhatsApp Business API)
    if (process.env.ULTRAMSG_TOKEN && process.env.ULTRAMSG_INSTANCE) {
      await sendUltraMsg(body);
    }

    // Send via CallMeBot if configured (free WhatsApp)
    if (process.env.CALLMEBOT_APIKEY && ADMIN_WA) {
      await sendCallMeBot(title + "\n\n" + body);
    }

    // Send via MailerSend email as fallback
    await sendEmailAlert(title, body, data);

    console.log(`📢 Admin notified: ${title}`);
  } catch (err) {
    console.error("Admin notify error:", err.message);
  }
}

// CallMeBot - Free WhatsApp notifications
async function sendCallMeBot(message) {
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_WA}&text=${encodeURIComponent(message)}&apikey=${process.env.CALLMEBOT_APIKEY}`;
    await fetch(url, { signal: AbortSignal.timeout(8000) });
    console.log("✅ CallMeBot WA sent");
  } catch (err) {
    console.error("CallMeBot error:", err.message);
  }
}

// UltraMsg - WhatsApp Business
async function sendUltraMsg(message) {
  try {
    await fetch(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE}/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.ULTRAMSG_TOKEN,
        to: ADMIN_WA,
        body: message,
      }),
      signal: AbortSignal.timeout(8000),
    });
    console.log("✅ UltraMsg WA sent");
  } catch (err) {
    console.error("UltraMsg error:", err.message);
  }
}

// Email fallback via MailerSend
async function sendEmailAlert(title, body, data) {
  try {
    if (!process.env.MAILERSEND_API_KEY) return;
    await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: { email: process.env.FROM_EMAIL || "noreply@nexora.com", name: "NEXORA System" },
        to:   [{ email: ADMIN_EMAIL, name: "NEXORA Admin" }],
        subject: `🔔 NEXORA Admin Alert: ${title}`,
        html: `
<div style="background:#050f0c;padding:24px;font-family:Arial,sans-serif;color:#e8f8f4;border-radius:12px">
  <h2 style="color:#00c896;margin:0 0 8px">🔔 ${title}</h2>
  <p style="color:#5a8a7a;margin:0 0 16px;line-height:1.6">${body.replace(/\n/g,"<br/>")}</p>
  ${Object.keys(data).length>0?`<div style="background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:8px;padding:12px;font-size:13px;color:#5a8a7a">${Object.entries(data).map(([k,v])=>`<div><b style="color:#00c896">${k}:</b> ${v}</div>`).join("")}</div>`:""}
  <a href="${process.env.FRONTEND_URL}/admin" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;text-decoration:none;border-radius:8px;font-weight:700">Open Admin Panel →</a>
</div>`,
      }),
    });
  } catch (err) {
    console.error("Email alert error:", err.message);
  }
}

// Specific notification builders
module.exports = {
  notifyAdmin,

  async newRegistration(user) {
    await notifyAdmin("registration", "🆕 New User Registered",
      `New user just registered on NEXORA!\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone||"Not provided"}\n\nThey are waiting for your approval of their $4 USDT registration fee.\n\n👉 Open admin panel to approve.`,
      { Name:user.name, Email:user.email, "Registration Fee":"$4 USDT - PENDING APPROVAL" }
    );
  },

  async regFeeSubmitted(user, amount) {
    await notifyAdmin("payment", "💳 Registration Fee Payment Submitted",
      `${user.name} has submitted their $${amount} USDT registration fee payment!\n\nThey are waiting for your approval before their dashboard opens.\n\nEmail: ${user.email}\n\n⚡ Approve now to activate their account.`,
      { User:user.name, Email:user.email, Amount:`$${amount} USDT`, Status:"WAITING FOR APPROVAL" }
    );
  },

  async savingsPaymentSubmitted(user, week, amount) {
    await notifyAdmin("savings", "💰 Weekly Savings Payment Submitted",
      `${user.name} submitted their Week ${week} savings payment of $${amount} USDT.\n\nEmail: ${user.email}\n\n⚡ Verify screenshot and approve in admin panel.`,
      { User:user.name, Email:user.email, Week:`Week ${week}`, Amount:`$${amount} USDT`, Status:"PENDING APPROVAL" }
    );
  },

  async withdrawalRequested(user, amount, wallet) {
    await notifyAdmin("withdrawal", "⬇️ Withdrawal Request Submitted",
      `${user.name} is requesting a withdrawal of $${amount} USDT!\n\nEmail: ${user.email}\nWallet: ${wallet}\n\nThey have uploaded clearance form and payment receipt.\n\n⚡ Review documents and approve in admin panel.`,
      { User:user.name, Email:user.email, Amount:`$${amount} USDT`, Wallet:wallet, Status:"PENDING REVIEW" }
    );
  },

  async newReferral(referrer, newUser) {
    await notifyAdmin("referral", "🎁 New Referral Registered",
      `${referrer.name} referred ${newUser.name} to NEXORA!\n\nReferrer: ${referrer.name} (${referrer.email})\nNew User: ${newUser.name} (${newUser.email})\n\nReferral bonus of $1 USDT has been credited to ${referrer.name}.`,
      { Referrer:referrer.name, "New User":newUser.name, Bonus:"$1 USDT auto-credited" }
    );
  },

  async kycSubmitted(user) {
    await notifyAdmin("kyc", "🪪 KYC Documents Submitted",
      `${user.name} has submitted their KYC verification documents.\n\nEmail: ${user.email}\n\n⚡ Review and approve in admin panel.`,
      { User:user.name, Email:user.email, Status:"PENDING REVIEW" }
    );
  },

  async penaltyPaymentSubmitted(user, week, amount) {
    await notifyAdmin("penalty", "⚠️ Penalty Payment Submitted",
      `${user.name} paid the $${amount} USDT penalty for Week ${week}.\n\nEmail: ${user.email}\n\n⚡ Verify and approve to unlock their savings.`,
      { User:user.name, Week:`Week ${week}`, Amount:`$${amount} USDT`, Status:"PENDING APPROVAL" }
    );
  },
};
