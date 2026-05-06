"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
    if (!u.userId && !u.id) { router.replace("/login"); return; }
    if (!u.reg_fee_paid && !u.regFeePaid) { router.replace("/regfee"); return; }
    setUser(u);

    // Load savings
    const s = localStorage.getItem("finova_savings");
    if (s) setSavings(JSON.parse(s));
    setLoading(false);
  },[]);

  if (loading || !user) return (
    <div style={{minHeight:"100vh",background:"#0a0800",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"36px",height:"36px",border:"2px solid rgba(212,175,55,0.2)",borderTop:"2px solid #d4af37",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const paidWeeks  = savings?.weeks?.filter((w:any)=>w.status==="paid").length||0;
  const totalPaid  = savings?.totalPaid||0;
  const interest   = +(totalPaid*0.45).toFixed(2);
  const progress   = Math.round((paidWeeks/52)*100);
  const bal        = user.balances||{btc:0,eth:0,usdt:0,bnb:0,ngn:0};
  const totalUSD   = 0; // starts at zero

  const actions = [
    {icon:"⬆",  label:"Deposit",      sub:"Add funds",        path:"/deposit"},
    {icon:"⬇",  label:"Withdraw",     sub:"Cash out",         path:"/withdraw"},
    {icon:"💰", label:"Savings",      sub:"Weekly plan",      path:"/savings"},
    {icon:"🪪", label:"Verify ID",    sub:"Complete KYC",     path:"/verify"},
    {icon:"👛", label:"Wallet",       sub:"My assets",        path:"/wallet"},
    {icon:"🕐", label:"Transactions", sub:"History",          path:"/transactions"},
    {icon:"📊", label:"My Progress",  sub:"Track savings",    path:"/my-progress"},
    {icon:"⚙",  label:"Settings",     sub:"Preferences",      path:"/settings"},
  ];

  return (
    <MobileLayout activePage="Dashboard">
      <style>{`
        .db-card{background:rgba(20,15,0,0.9);border:1px solid rgba(212,175,55,0.2);border-radius:16px;padding:1.2rem;margin-bottom:1rem;}
        .db-bal-label{font-size:0.72rem;color:#8a7040;margin-bottom:0.25rem;letter-spacing:0.05em;text-transform:uppercase;}
        .db-bal-amount{font-family:"Playfair Display",serif;font-weight:700;font-size:1.6rem;color:#f5e6c8;letter-spacing:-0.01em;}
        .db-bal-sub{font-size:0.75rem;color:#6a5a2a;margin-top:0.2rem;}
        .db-stat-row{display:flex;gap:1.2rem;margin-top:0.9rem;padding-top:0.9rem;border-top:1px solid rgba(212,175,55,0.08);}
        .db-stat{display:flex;flex-direction:column;gap:0.1rem;}
        .db-stat-val{font-size:0.82rem;font-weight:600;color:#d4af37;}
        .db-stat-label{font-size:0.67rem;color:#6a5a2a;}
        .db-prog-wrap{margin-top:0.9rem;padding-top:0.9rem;border-top:1px solid rgba(212,175,55,0.08);}
        .db-prog-label{display:flex;justify-content:space-between;font-size:0.7rem;color:#6a5a2a;margin-bottom:0.3rem;}
        .db-prog-track{height:5px;background:rgba(212,175,55,0.1);border-radius:5px;overflow:hidden;}
        .db-prog-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,#b8960c,#d4af37);transition:width 0.5s;}
        .db-actions{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:1rem;}
        .db-action{background:rgba(20,15,0,0.8);border:1px solid rgba(212,175,55,0.12);border-radius:12px;padding:0.85rem;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:0.65rem;}
        .db-action:hover,.db-action:active{border-color:rgba(212,175,55,0.3);background:rgba(212,175,55,0.05);}
        .db-action-icon{width:34px;height:34px;border-radius:9px;background:rgba(212,175,55,0.08);display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
        .db-action-label{font-size:0.82rem;font-weight:600;color:#f5e6c8;margin-bottom:0.1rem;}
        .db-action-sub{font-size:0.68rem;color:#6a5a2a;}
        .db-section-title{font-size:0.78rem;font-weight:600;color:#8a7040;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;}
        .db-asset-row{display:flex;align-items:center;gap:0.7rem;padding:0.65rem 0;border-bottom:1px solid rgba(212,175,55,0.06);}
        .db-asset-row:last-child{border-bottom:none;}
        .db-empty{text-align:center;padding:1.5rem;color:#6a5a2a;font-size:0.82rem;}
        .db-notice{background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:12px;padding:0.85rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:0.65rem;}
        .db-notice-icon{font-size:1rem;flex-shrink:0;margin-top:0.1rem;}
        .db-notice-text{font-size:0.78rem;color:#8a7040;line-height:1.5;}
        .db-notice-text b{color:#d4af37;}
        @media(max-width:380px){.db-bal-amount{font-size:1.4rem;}.db-actions{gap:0.5rem;}.db-action{padding:0.75rem;}}
      `}</style>

      {/* GREETING */}
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.78rem",color:"#6a5a2a"}}>Good day,</div>
        <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"1.1rem",color:"#d4af37"}}>{user.name||user.name}</div>
      </div>

      {/* BALANCE CARD */}
      <div className="db-card" style={{background:"linear-gradient(135deg,rgba(30,22,0,0.95),rgba(20,15,0,0.98))"}}>
        <div className="db-bal-label">Portfolio Balance</div>
        <div className="db-bal-amount">$0.00</div>
        <div className="db-bal-sub">₦0.00 · Balance starts when you deposit</div>
        <div className="db-stat-row">
          <div className="db-stat">
            <span className="db-stat-val">$0.00</span>
            <span className="db-stat-label">Total Saved</span>
          </div>
          <div className="db-stat">
            <span className="db-stat-val">$0.00</span>
            <span className="db-stat-label">Interest</span>
          </div>
          <div className="db-stat">
            <span className="db-stat-val">{paidWeeks}/52</span>
            <span className="db-stat-label">Weeks Paid</span>
          </div>
        </div>
        {savings && (
          <div className="db-prog-wrap">
            <div className="db-prog-label">
              <span>Savings Progress</span>
              <span style={{color:"#d4af37"}}>{progress}%</span>
            </div>
            <div className="db-prog-track">
              <div className="db-prog-fill" style={{width:`${progress}%`}}/>
            </div>
          </div>
        )}
      </div>

      {/* KYC NOTICE */}
      {!user.kyc_status || user.kyc_status === "unverified" ? (
        <div className="db-notice" onClick={()=>router.push("/verify")} style={{cursor:"pointer"}}>
          <div className="db-notice-icon">🪪</div>
          <div className="db-notice-text">
            <b>Complete your verification</b><br/>
            Verify your identity to unlock full access and higher limits. Tap to verify.
          </div>
        </div>
      ) : null}

      {/* QUICK ACTIONS */}
      <div style={{marginBottom:"0.5rem"}}>
        <div className="db-section-title">Quick Actions</div>
        <div className="db-actions">
          {actions.map(a=>(
            <div key={a.label} className="db-action" onClick={()=>router.push(a.path)}>
              <div className="db-action-icon">{a.icon}</div>
              <div>
                <div className="db-action-label">{a.label}</div>
                <div className="db-action-sub">{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSETS */}
      <div className="db-card">
        <div className="db-section-title">My Assets</div>
        <div className="db-empty">
          <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>📭</div>
          No assets yet. Make your first deposit to get started.
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="db-card" style={{marginTop:"0.75rem"}}>
        <div className="db-section-title">Recent Transactions</div>
        <div className="db-empty">
          <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>📋</div>
          No transactions yet.
        </div>
      </div>
    </MobileLayout>
  );
}
