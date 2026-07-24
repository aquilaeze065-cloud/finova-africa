const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const crypto  = require("crypto");
const db      = require("../db");
const { signUser } = require("../utils/jwt");
const { generateWalletAddresses } = require("../utils/walletGen");
const { authUser } = require("../middleware/auth");

// SIGNUP - sends email verification
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, referredBy, phone, regFeeScreenshot, regFeeTxHash } = req.body;
    if (!name||!email||!password) return res.status(400).json({ error:"All fields required" });
    if (password.length<8) return res.status(400).json({ error:"Password too short" });

    const exists = await db.query("SELECT id FROM users WHERE email=$1",[email]);
    if (exists.rows.length) return res.status(409).json({ error:"Email already registered" });

    const hash  = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24*60*60*1000); // 24 hours

    const u = await db.query(
      "INSERT INTO users(name,email,password_hash,email_verify_token,email_verify_expiry,account_status,reg_fee_paid) VALUES($1,$2,$3,$4,$5,'active',true) RETURNING id,name,email,account_status,created_at",
      [name, email, hash, token, expiry]
    );
    const user  = u.rows[0];
    const addrs = generateWalletAddresses();
    await db.query(
      "INSERT INTO wallet_addresses(user_id,btc_address,eth_address,usdt_trc20_address,bnb_address) VALUES($1,$2,$3,$4,$5)",
      [user.id, addrs.btc, addrs.eth, addrs.usdt, addrs.bnb]
    );
    await db.query("INSERT INTO wallet_balances(user_id) VALUES($1)",[user.id]);
    await db.query("INSERT INTO user_settings(user_id) VALUES($1)",[user.id]);

    // Send verification email via simple link
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Try sending email if nodemailer configured
    try {
      if (process.env.SMTP_USER) {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        await transporter.sendMail({
          from: `"NEXORA" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Verify your NEXORA account",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#050f0c;color:#e8f8f4;padding:2rem;border-radius:16px;">
              <h2 style="color:#00c896;margin-bottom:1rem;">👋 Welcome to NEXORA, ${name}!</h2>
              <p style="color:#5a8a7a;margin-bottom:1.5rem;">Please verify your email address to activate your account.</p>
              <a href="${verifyUrl}" style="display:inline-block;padding:0.9rem 2rem;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;text-decoration:none;border-radius:12px;font-weight:700;font-size:1rem;">
                Verify My Email
              </a>
              <p style="color:#3a6a5a;font-size:0.8rem;margin-top:1.5rem;">Link expires in 24 hours. If you didn't sign up, ignore this email.</p>
              <p style="color:#3a6a5a;font-size:0.75rem;">Or copy this link: ${verifyUrl}</p>
            </div>
          `
        });
      }
    } catch(mailErr) {
      console.log("Email send failed (non-critical):", mailErr.message);
    }

    // Process referral bonus
    if (referredBy) {
      try {
        const referrer = await db.query("SELECT id FROM users WHERE referral_code=$1",[referredBy]);
        if (referrer.rows[0]) {
          // Credit $5 bonus to referrer
          await db.query(
            "INSERT INTO referrals(referrer_id,referred_id,bonus_amount,status) VALUES($1,$2,5.00,'active')",
            [referrer.rows[0].id, user.id]
          );
          await db.query(
            "UPDATE users SET referral_bonus=referral_bonus+1 WHERE id=$1",
            [referrer.rows[0].id]
          );
          // Notify referrer
          await db.query(
            `INSERT INTO notifications(user_id,type,title,body,icon,action)
             VALUES($1,'bonus','🎉 Referral Bonus!','You earned $5 USDT referral bonus! Someone signed up using your referral code.','🎁','/my-progress')`,
            [referrer.rows[0].id]
          );
          console.log("✅ Referral bonus credited to", referrer.rows[0].id);
        }
      } catch(refErr) {
        console.error("Referral error:", refErr.message);
      }
    }

    const authToken = signUser({ id:user.id, email:user.email });
    res.status(201).json({
      token: authToken,
      user: { ...user, addresses:addrs, email_verified:false },
      verifyUrl, // also return URL for dev/fallback
      message: "Account created! Please check your email to verify your account."
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error:"Server error during signup" });
  }
});

// VERIFY EMAIL
router.get("/verify-email", async (req, res) => {
  try {
    const { token, email } = req.query;
    const result = await db.query(
      "SELECT id FROM users WHERE email=$1 AND email_verify_token=$2 AND email_verify_expiry>NOW()",
      [email, token]
    );
    if (!result.rows[0]) {
      return res.status(400).send(`
        <html><body style="background:#050f0c;color:#e8f8f4;font-family:Arial;text-align:center;padding:3rem;">
          <h2 style="color:#ff4757;">❌ Invalid or expired link</h2>
          <p style="color:#5a8a7a;">Please request a new verification email.</p>
          <a href="${process.env.FRONTEND_URL}/login" style="color:#00c896;">Go to Login</a>
        </body></html>
      `);
    }
    await db.query(
      "UPDATE users SET email_verified=true,email_verify_token=null,email_verify_expiry=null WHERE id=$1",
      [result.rows[0].id]
    );
    res.send(`
      <html><body style="background:#050f0c;color:#e8f8f4;font-family:Arial;text-align:center;padding:3rem;">
        <h2 style="color:#00c896;">✅ Email Verified!</h2>
        <p style="color:#5a8a7a;margin-bottom:1.5rem;">Your NEXORA account is now active.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;padding:0.9rem 2rem;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;text-decoration:none;border-radius:12px;font-weight:700;">Sign In Now</a>
      </body></html>
    `);
  } catch(err) {
    res.status(500).send("Server error");
  }
});

// RESEND VERIFICATION
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24*60*60*1000);
    await db.query(
      "UPDATE users SET email_verify_token=$1,email_verify_expiry=$2 WHERE email=$3",
      [token, expiry, email]
    );
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    res.json({ success:true, verifyUrl, message:"Verification email resent!" });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// SIGNIN
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ error:"All fields required" });
    const result = await db.query(
      "SELECT id,name,email,password_hash,account_status,reg_fee_paid,contract_signed,kyc_status,email_verified,photo_url,created_at,referral_code,referral_bonus,phone FROM users WHERE email=$1",
      [email]
    );
    if (!result.rows[0]) return res.status(404).json({ error:"No account found with this email" });
    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error:"Incorrect password" });
    const addrRes = await db.query("SELECT btc_address,eth_address,usdt_trc20_address,bnb_address FROM wallet_addresses WHERE user_id=$1",[user.id]);
    const balRes  = await db.query("SELECT btc,eth,usdt,bnb,ngn FROM wallet_balances WHERE user_id=$1",[user.id]);
    delete user.password_hash;
    const token = signUser({ id:user.id, email:user.email });
    res.json({ token, user:{
      ...user,
      account_status: "active",
      reg_fee_paid: true,
      addresses: addrRes.rows[0]||{},
      balances: {btc:0,eth:0,usdt:0,bnb:0,ngn:0}
    }});
  } catch(err) {
    console.error(err);
    res.status(500).json({ error:"Server error" });
  }
});

// GET ME
router.get("/me", authUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id,name,email,account_status,reg_fee_paid,contract_signed,kyc_status,email_verified,photo_url,created_at FROM users WHERE id=$1",
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error:"User not found" });
    const user    = result.rows[0];
    const addrRes = await db.query("SELECT * FROM wallet_addresses WHERE user_id=$1",[user.id]);
    res.json({ ...user, addresses:addrRes.rows[0]||{}, balances:{btc:0,eth:0,usdt:0,bnb:0,ngn:0} });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

// CONTRACT
router.post("/contract", authUser, async (req, res) => {
  try {
    const { signature } = req.body;
    await db.query(
      "UPDATE users SET contract_signed=true,contract_signed_at=NOW(),contract_signature=$1 WHERE id=$2",
      [signature, req.user.id]
    );
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error:"Server error" });
  }
});

module.exports = router;
