const router = require("express").Router();
const bcrypt = require("bcryptjs");
const db     = require("../db");
const { signUser } = require("../utils/jwt");
const { generateWalletAddresses } = require("../utils/walletGen");
const { authUser } = require("../middleware/auth");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name||!email||!password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 8) return res.status(400).json({ error: "Password too short" });
    const exists = await db.query("SELECT id FROM users WHERE email=$1",[email]);
    if (exists.rows.length) return res.status(409).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(password, 12);
    const u    = await db.query(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,account_status,created_at",
      [name,email,hash]
    );
    const user  = u.rows[0];
    const addrs = generateWalletAddresses();
    await db.query(
      "INSERT INTO wallet_addresses(user_id,btc_address,eth_address,usdt_trc20_address,bnb_address) VALUES($1,$2,$3,$4,$5)",
      [user.id,addrs.btc,addrs.eth,addrs.usdt,addrs.bnb]
    );
    await db.query("INSERT INTO wallet_balances(user_id) VALUES($1)",[user.id]);
    await db.query("INSERT INTO user_settings(user_id) VALUES($1)",[user.id]);
    const token = signUser({ id:user.id, email:user.email });
    res.status(201).json({ token, user:{ ...user, addresses:addrs } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ error: "All fields required" });
    const result = await db.query(
      "SELECT id,name,email,password_hash,account_status,reg_fee_paid,reg_fee_submitted,contract_signed,kyc_status,photo_url,created_at FROM users WHERE email=$1",
      [email]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "No account found with this email" });
    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });
    const addrRes = await db.query("SELECT btc_address,eth_address,usdt_trc20_address,bnb_address FROM wallet_addresses WHERE user_id=$1",[user.id]);
    const balRes  = await db.query("SELECT btc,eth,usdt,bnb,ngn FROM wallet_balances WHERE user_id=$1",[user.id]);
    delete user.password_hash;
    const token = signUser({ id:user.id, email:user.email });
    res.json({ token, user:{ ...user, addresses:addrRes.rows[0]||{}, balances:balRes.rows[0]||{} } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error during signin" });
  }
});

router.get("/me", authUser, async (req, res) => {
  try {
    const result  = await db.query("SELECT id,name,email,account_status,reg_fee_paid,reg_fee_submitted,contract_signed,kyc_status,photo_url,created_at FROM users WHERE id=$1",[req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
    const user    = result.rows[0];
    const addrRes = await db.query("SELECT * FROM wallet_addresses WHERE user_id=$1",[user.id]);
    const balRes  = await db.query("SELECT * FROM wallet_balances WHERE user_id=$1",[user.id]);
    const profRes = await db.query("SELECT * FROM user_profiles WHERE user_id=$1",[user.id]);
    res.json({ ...user, addresses:addrRes.rows[0]||{}, balances:balRes.rows[0]||{}, profile:profRes.rows[0]||{} });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/contract", authUser, async (req, res) => {
  try {
    const { signature } = req.body;
    await db.query("UPDATE users SET contract_signed=true,contract_signed_at=NOW(),contract_signature=$1 WHERE id=$2",[signature,req.user.id]);
    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
