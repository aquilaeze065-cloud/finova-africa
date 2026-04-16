require("dotenv").config();
const { Pool } = require("pg");
const fs    = require("fs");
const bcrypt= require("bcryptjs");
const path  = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function setup() {
  try {
    console.log("Setting up database...");
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);
    console.log("✅ Tables created");
    const hash = await bcrypt.hash("finova2024admin", 12);
    await pool.query(
      "INSERT INTO admins(email,password_hash,name) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING",
      ["admin@finovaafrica.com", hash, "Finova Admin"]
    );
    console.log("✅ Admin created");
    console.log("📧 Email: admin@finovaafrica.com");
    console.log("🔑 Password: finova2024admin");
    console.log("🎉 Database setup complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exit(1);
  }
}
setup();
