const FRONTEND = process.env.FRONTEND_URL || "https://finova-africa.vercel.app";

async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `${FRONTEND}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "noreply@trial-z0vklo4xpjdg5r86.mlsender.net";

    if (!apiKey) {
      console.log("⚠️  No MAILERSEND_API_KEY set");
      console.log("🔗 Verify URL:", verifyUrl);
      return { sent: false, verifyUrl };
    }

    // Use fetch (built into Node 18+) - no package needed
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: { email: fromEmail, name: "NEXORA" },
        to:   [{ email: email, name: name }],
        subject: "✅ Verify your NEXORA account",
        html: buildEmailHTML(name, verifyUrl),
        text: `Hi ${name}, verify your NEXORA account here: ${verifyUrl} (link expires in 24 hours)`,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`✅ Verification email sent to ${email}`);
      return { sent: true, verifyUrl };
    } else {
      const err = await response.text();
      console.error("❌ MailerSend error:", response.status, err);
      return { sent: false, verifyUrl };
    }

  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    return { sent: false, verifyUrl };
  }
}

async function sendWelcomeEmail(email, name) {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "noreply@trial-z0vklo4xpjdg5r86.mlsender.net";
    if (!apiKey) return;

    await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: { email: fromEmail, name: "NEXORA" },
        to:   [{ email: email, name: name }],
        subject: "🎉 Welcome to NEXORA!",
        html: `<body style="margin:0;background:#050f0c;font-family:Arial,sans-serif;padding:32px 16px;">
<table style="max-width:500px;margin:0 auto;background:#081a14;border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:32px;">
<tr><td style="text-align:center;padding-bottom:20px;">
  <h1 style="color:#00c896;margin:0;">🎉 Welcome to NEXORA!</h1>
</td></tr>
<tr><td>
  <p style="color:#5a8a7a;font-size:14px;line-height:1.7;">Hi <strong style="color:#e8f8f4;">${name}</strong>,</p>
  <p style="color:#5a8a7a;font-size:14px;line-height:1.7;">Your NEXORA account is now active! Start your 52-week savings journey and earn 45% APY.</p>
  <div style="text-align:center;margin:24px 0;">
    <a href="${FRONTEND}/dashboard" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">Go to Dashboard →</a>
  </div>
  <p style="color:#3a5a4a;font-size:12px;">Need help? Use the support chat on the site.</p>
</td></tr>
</table></body>`,
      }),
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error("Welcome email failed:", err.message);
  }
}

function buildEmailHTML(name, verifyUrl) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#050f0c;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table style="max-width:500px;width:100%;background:#081a14;border:1px solid rgba(0,200,150,0.2);border-radius:20px;overflow:hidden;">
  <tr>
    <td style="background:rgba(0,200,150,0.08);padding:28px 32px 20px;text-align:center;border-bottom:1px solid rgba(0,200,150,0.1);">
      <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#00c896,#0066ff);margin:0 auto 14px;text-align:center;line-height:56px;">
        <span style="color:white;font-size:28px;font-weight:900;">N</span>
      </div>
      <h1 style="margin:0;color:#00c896;font-size:22px;font-weight:800;letter-spacing:0.05em;">NEXORA</h1>
      <p style="margin:5px 0 0;color:#3a6a5a;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;">Smart Finance. Borderless Future.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px;">
      <h2 style="margin:0 0 14px;color:#e8f8f4;font-size:19px;font-weight:700;">👋 Welcome, ${name}!</h2>
      <p style="margin:0 0 22px;color:#5a8a7a;font-size:14px;line-height:1.75;">
        Thanks for joining NEXORA! Please verify your email to activate your account and start saving.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${verifyUrl}" style="display:inline-block;padding:15px 42px;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
          ✅ Verify My Email
        </a>
      </div>
      <div style="background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:14px;margin:20px 0;">
        <p style="margin:0;color:#5a8a7a;font-size:12px;line-height:1.65;">
          ⏱ <strong style="color:#00c896;">Link expires in 24 hours.</strong><br/>
          Didn't sign up? Just ignore this email.
        </p>
      </div>
      <p style="margin:16px 0 0;color:#3a5a4a;font-size:11px;line-height:1.7;">
        Button not working? Copy this into your browser:<br/>
        <a href="${verifyUrl}" style="color:#00c896;word-break:break-all;">${verifyUrl}</a>
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#060f0c;padding:18px 32px;border-top:1px solid rgba(0,200,150,0.06);text-align:center;">
      <p style="margin:0;color:#2a4a3a;font-size:10px;line-height:1.65;">
        © 2026 NEXORA · support@nexora.com<br/>
        EU MiCA &amp; FSCA compliance in progress
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

module.exports = { sendVerificationEmail, sendWelcomeEmail };
