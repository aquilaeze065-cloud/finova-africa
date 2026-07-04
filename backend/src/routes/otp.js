const router = require("express").Router();

// In-memory OTP store (simpler than DB for this use case)
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhone(phone) {
  // Remove all non-digits
  return phone.replace(/\D/g, "");
}

// SEND OTP
router.post("/send", async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "WhatsApp number required" });

    const clean = cleanPhone(phone);
    if (clean.length < 7) {
      return res.status(400).json({ error: "Please enter a valid phone number with country code" });
    }

    const code    = generateOTP();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP (multiple keys for flexibility)
    otpStore.set(clean, { code, expires, name });
    // Also store with common variations
    if (clean.startsWith("0")) {
      otpStore.set("234" + clean.slice(1), { code, expires, name });
    }
    if (!clean.startsWith("234") && clean.length === 10) {
      otpStore.set("234" + clean, { code, expires, name });
    }

    console.log(`✅ OTP generated for ${clean}: ${code}`);

    // Build WhatsApp URL
    const text = `👑 *NEXORA Verification Code*\n\nHi ${name || "there"}!\n\nYour code is:\n\n*${code}*\n\n⏱ Valid for 15 minutes.\n🔒 Never share this code.`;
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;

    res.json({
      success: true,
      code,      // Always return so user sees it on screen
      waUrl,
      phone: clean,
      message: `Code generated for +${clean}`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code required" });
    }

    const clean = cleanPhone(phone);
    const trimCode = code.toString().trim();

    // Try multiple phone variations
    const variations = [
      clean,
      clean.startsWith("0") ? "234" + clean.slice(1) : null,
      clean.startsWith("234") ? "0" + clean.slice(3) : null,
      clean.length === 10 ? "234" + clean : null,
    ].filter(Boolean);

    let stored = null;
    let matchedKey = null;

    for (const v of variations) {
      if (otpStore.has(v)) {
        stored = otpStore.get(v);
        matchedKey = v;
        break;
      }
    }

    if (!stored) {
      console.log(`OTP not found for ${clean}. Store keys:`, [...otpStore.keys()]);
      return res.status(400).json({
        error: "Code not found. Please request a new code.",
      });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(matchedKey);
      return res.status(400).json({ error: "Code expired. Please request a new one." });
    }

    if (stored.code !== trimCode) {
      return res.status(400).json({ error: "Wrong code. Please check and try again." });
    }

    // Success - clear OTP
    variations.forEach(v => otpStore.delete(v));
    console.log(`✅ OTP verified for ${clean}`);

    res.json({ success: true, verified: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
