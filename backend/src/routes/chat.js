const router = require("express").Router();

const NEXORA_SYSTEM = `You are NORA, NEXORA's friendly AI support assistant. Always be warm, helpful and concise.

COMPLETE NEXORA KNOWLEDGE:

REGISTRATION:
- One-time $4 USDT registration fee required to activate account
- Send $4 USDT to wallet address shown on signup form
- Upload payment screenshot as proof
- Admin approves within 24-48 hours
- Once approved: dashboard unlocks + 52-week savings plan starts automatically

SAVINGS PLAN:
- Pay $3 USDT every week for 52 weeks
- Total contributions: $156 USDT
- Interest earned: 35% APY = $54.60
- Completion bonus: $15 USDT voucher  
- Total payout: $225.60+ USDT

HOW TO PAY WEEKLY:
- Go to Dashboard then Deposit
- Copy the platform wallet address shown
- Send exactly $3 USDT (TRC-20 network recommended - cheapest fees)
- Take a screenshot of the transaction confirmation
- Upload the screenshot as payment proof
- Admin verifies and approves - your savings week updates immediately

LOCAL EXCHANGERS (no crypto? no problem):
- Use local exchangers who accept Naira bank transfers
- Find them at Dashboard then Deposit then Exchanger tab
- Send Naira - they convert to USDT and pay on your behalf

PENALTIES:
- Miss a payment = $4 USDT late penalty fee
- Pay penalty same way as regular payment (send $4, upload screenshot)
- Admin approves penalty then your plan resumes
- 5 consecutive missed payments = contract TERMINATED
- If terminated: interest forfeited but principal contributions kept
- Set a weekly phone reminder to never miss!

WITHDRAWALS:
- ONLY allowed after completing ALL 52 weekly payments
- Early withdrawal is NOT possible by design
- After 52 weeks: download clearance form, sign it, upload with payment receipt
- Admin processes within 24-48 hours then pays to your wallet

INTEREST CALCULATION:
- $156 total x 35% APY = $54.60 interest
- Plus $15 completion voucher
- Total: $225.60+ USDT payout

REFERRALS:
- Find your referral code on Dashboard
- Share with friends and family
- Earn $1 USDT when referred person account is approved
- No limit on referrals

SECURITY:
- AES-256 encryption
- Optional WhatsApp 2FA
- KYC verification required
- Session timeout after 30 minutes
- Login history tracking
- Never share your password - NEXORA staff never ask for it

KYC VERIFICATION:
- Required for full account access
- Upload: government ID (NIN/passport/drivers license)
- Upload: selfie holding your ID
- Upload: proof of address (utility bill or bank statement)
- Approved within 24-48 hours

GROUP SAVINGS:
- Save with up to 5 friends toward shared goal
- Create group, share invite code, friends join
- Each member saves their own $3/week

RESPONSE RULES:
- Be warm, friendly and concise (under 120 words)
- Use simple language
- Use bullet points for steps
- For urgent account issues always recommend WhatsApp support
- Never ask for or share passwords`;

// Test endpoint to verify API key works
router.get("/test", async function(req, res) {
  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.json({ status: "NO_API_KEY", message: "ANTHROPIC_API_KEY not set in Railway variables" });
  }
  if (apiKey.includes("placeholder")) {
    return res.json({ status: "PLACEHOLDER_KEY", message: "Real API key not set yet" });
  }
  
  try {
    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 50,
        messages:   [{ role: "user", content: "Say OK" }],
      }),
    });
    
    var data = await response.json();
    if (data.content && data.content[0]) {
      return res.json({ status: "WORKING", reply: data.content[0].text });
    }
    return res.json({ status: "API_ERROR", data: data });
  } catch (err) {
    return res.json({ status: "FETCH_ERROR", error: err.message });
  }
});

// Main chat endpoint
router.post("/", async function(req, res) {
  var apiKey = process.env.ANTHROPIC_API_KEY;
  
  // No API key - return helpful fallback
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("⚠️ ANTHROPIC_API_KEY not set - using fallback response");
    return res.json({
      reply: "Hi! I'm NORA 👋\n\nI can help with NEXORA questions! For the best support:\n\n• 📱 WhatsApp: fastest, replies in minutes\n• 📧 Email: support@nexora.com\n• ✈️ Telegram: @NexoraSupport\n\nWhat would you like to know about NEXORA savings?"
    });
  }

  try {
    var messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages required" });
    }

    // Clean messages - only keep role and content
    var cleanMessages = messages.slice(-10).map(function(m) {
      return {
        role:    m.role === "user" ? "user" : "assistant",
        content: String(m.content || "").substring(0, 1000),
      };
    });

    // Ensure alternating roles (Anthropic requirement)
    var filtered = [];
    var lastRole = null;
    for (var i = 0; i < cleanMessages.length; i++) {
      if (cleanMessages[i].role !== lastRole) {
        filtered.push(cleanMessages[i]);
        lastRole = cleanMessages[i].role;
      }
    }
    
    // Must start with user
    while (filtered.length > 0 && filtered[0].role !== "user") {
      filtered.shift();
    }
    
    if (filtered.length === 0) {
      return res.json({ reply: "How can I help you with NEXORA today?" });
    }

    console.log("📤 Sending", filtered.length, "messages to Claude...");

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system:     NEXORA_SYSTEM,
        messages:   filtered,
      }),
    });

    console.log("📥 Anthropic response status:", response.status);

    if (!response.ok) {
      var errText = await response.text();
      console.error("❌ Anthropic error:", response.status, errText.substring(0, 200));
      
      // Return helpful fallback instead of error
      return res.json({
        reply: "I'm having a brief connection issue. Here's how to get help:\n\n• 📱 WhatsApp support (fastest)\n• 📧 support@nexora.com\n• ✈️ @NexoraSupport on Telegram\n\nOr try your question again in a moment!"
      });
    }

    var data = await response.json();
    var reply = "";
    
    if (data.content && data.content[0] && data.content[0].text) {
      reply = data.content[0].text;
    } else {
      console.error("Unexpected response format:", JSON.stringify(data).substring(0, 200));
      reply = "Please contact WhatsApp support for help with your question!";
    }

    console.log("✅ Chat reply sent successfully");
    res.json({ reply: reply });

  } catch (err) {
    console.error("❌ Chat error:", err.message);
    // Always return a helpful response, never a raw error
    res.json({
      reply: "I'm experiencing a brief issue right now. Please:\n\n• 📱 Contact us on WhatsApp for immediate help\n• Try asking your question again\n• Email support@nexora.com\n\nSorry for the inconvenience!"
    });
  }
});

module.exports = router;
