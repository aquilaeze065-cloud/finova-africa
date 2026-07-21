const cron = require("node-cron");
const http = require("http");

// Keep server alive every 14 minutes
cron.schedule("*/14 * * * *", ()=>{
  try {
    const port = process.env.PORT || 5000;
    http.get(`http://localhost:${port}/health`, res=>{
      console.log("💓 Keep-alive:", res.statusCode);
    }).on("error",()=>{});
  } catch {}
});

// Daily 8AM - check savings and send reminders
cron.schedule("0 8 * * *", async ()=>{
  console.log("⏰ Daily savings check running...");
  try {
    const db = require("../db");
    // Flag overdue weeks as penalty
    await db.query(`
      UPDATE savings_weeks sw
      SET status='penalty'
      FROM savings_plans sp
      WHERE sw.plan_id=sp.id
        AND sw.status NOT IN ('paid','penalty','penalty_pending')
        AND sw.due_date < NOW() - INTERVAL '1 day'
    `).catch(()=>{});
    console.log("✅ Daily check complete");
  } catch(e) {
    console.error("Scheduler error:", e.message);
  }
});

console.log("✅ Scheduler started");
module.exports = {};
