"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";
import { getUserReferralCode } from "../utils/referral";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [refCode, setRefCode] = useState("");

  useEffect(()=>{
    const token    = localStorage.getItem("nexora_token") || localStorage.getItem("finova_token");
    const loggedin = localStorage.getItem("nexora_loggedin") || localStorage.getItem("finova_loggedin");
    if (!token || loggedin !== "true") { window.location.replace("/login"); return; }

    const userRaw = localStorage.getItem("nexora_user") || localStorage.getItem("finova_user");
    if (!userRaw) { window.location.replace("/login"); return; }

    try {
      const u = JSON.parse(userRaw);
      setUser(u);

      // Get referral code - from user object or generate
      const code = u.referral_code || getUserReferralCode();
      setRefCode(code);

      // If no referral code on user, update localStorage
      if (!u.referral_code && code) {
        u.referral_code = code;
        localStorage.setItem("nexora_user", JSON.stringify(u));
        localStorage.setItem("finova_user", JSON.stringify(u));
      }

      const s = localStorage.getItem("nexora_savings") || localStorage.getItem("finova_savings");
      if (s) setSavings(JSON.parse(s));
      setLoading(false);

      // Fetch fresh user data from backend (gets latest referral_code, bonus, etc.)
      if (token) {
        fetch(`${API}/api/auth/me`,{headers:{"Authorization":`Bearer ${token}`}})
          .then(r=>r.json())
          .then(data=>{
            if (data.id) {
              const updated = {...u, ...data, balances:{btc:0,eth:0,usdt:0,bnb:0,ngn:0}};
              localStorage.setItem("nexora_user", JSON.stringify(updated));
              localStorage.setItem("finova_user", JSON.stringify(updated));
              setUser(updated);
              if (data.referral_code) setRefCode(data.referral_code);
            }
          })
          .catch(()=>{});
      }
    } catch { window.location.replace("/login"); }
  },[]);

  function logout() {
    ["nexora_token","nexora_loggedin","nexora_user","nexora_savings",
     "nexora_notifications","nexora_payments","finova_token","finova_loggedin",
     "finova_user","finova_savings"].forEach(k=>{ try{localStorage.removeItem(k);}catch{} });
    window.location.replace("/login");
  }

  function copyCode() {
    navigator.clipboard.writeText(refCode).catch(()=>{});
    setCopied(true);
    setTimeout(()=>setCopied(false), 2500);
  }

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#050f0c",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"32px",height:"32px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!user) return null;

  const paidWeeks = savings?.weeks?.filter((w:any)=>w.status==="paid").length||0;
  const totalPaid = savings?.totalPaid||0;
  const progress  = Math.round((paidWeeks/52)*100);
  const weeksLeft = 52-paidWeeks;
  const interest  = +(totalPaid*0.35).toFixed(2);
  const initials  = (user.name||"U").split(" ").map((w:string)=>w[0]).join("").toUpperCase().slice(0,2);
  const firstName = (user.name||"User").split(" ")[0];
  const refBonus  = user.referral_bonus||0;

  const actions = [
    {icon:"⬆️",label:"Deposit",    path:"/deposit"},
    {icon:"⬇️",label:"Withdraw",   path:"/withdraw"},
    {icon:"💰",label:"Savings",    path:"/savings"},
    {icon:"🪪", label:"Verify ID",  path:"/verify"},
    {icon:"👛", label:"Wallet",     path:"/wallet"},
    {icon:"🕐",label:"History",    path:"/transactions"},
    {icon:"📊",label:"Progress",   path:"/my-progress"},
    {icon:"⚙️",label:"Settings",  path:"/settings"},
  ];

  return (
    <MobileLayout activePage="Dashboard">
      <style>{`
        .db-card{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:16px;padding:1.1rem;margin-bottom:0.85rem;}
        .db-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:0.85rem;}
        .db-action{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:12px;padding:0.75rem 0.4rem;cursor:pointer;transition:all 0.18s;display:flex;flex-direction:column;align-items:center;gap:0.3rem;}
        .db-action:hover,.db-action:active{border-color:rgba(0,200,150,0.3);background:rgba(0,200,150,0.06);}
        .db-prog-track{height:5px;background:rgba(0,200,150,0.1);border-radius:5px;overflow:hidden;margin:0.4rem 0;}
        .db-prog-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,#00a87a,#00c896);transition:width 0.5s;}
        .ref-box{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.18);border-radius:11px;padding:0.65rem 0.85rem;display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem;}
        .ref-code{flex:1;font-family:monospace;font-size:1.15rem;font-weight:800;color:#00c896;letter-spacing:0.1em;}
        .copy-btn{padding:0.32rem 0.75rem;border:1px solid rgba(0,200,150,0.25);border-radius:7px;background:rgba(0,200,150,0.08);color:#00c896;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.18s;white-space:nowrap;}
        .copy-btn.done{background:rgba(0,200,150,0.15);border-color:rgba(0,200,150,0.4);}
        .db-modal{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:500;display:flex;align-items:flex-end;justify-content:center;padding:1rem;}
        .db-modal-card{background:#081a14;border:1px solid rgba(0,200,150,0.2);border-radius:20px 20px 16px 16px;padding:1.5rem;width:100%;max-width:400px;}
      `}</style>

      {/* LOGOUT MODAL */}
      {showLogout&&(
        <div className="db-modal" onClick={()=>setShowLogout(false)}>
          <div className="db-modal-card" onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:"1.2rem"}}>
              <div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>👋</div>
              <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.2rem"}}>Sign out of NEXORA?</div>
              <div style={{fontSize:"0.76rem",color:"#5a8a7a"}}>Your data is saved. Sign back in anytime.</div>
            </div>
            <button onClick={logout} style={{width:"100%",padding:"0.85rem",border:"none",borderRadius:"11px",background:"linear-gradient(135deg,#c0392b,#ff4757)",fontWeight:700,fontSize:"0.9rem",color:"#fff",cursor:"pointer",marginBottom:"0.5rem",fontFamily:"Inter,sans-serif"}}>Yes, Sign Out</button>
            <button onClick={()=>setShowLogout(false)} style={{width:"100%",padding:"0.75rem",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"11px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"Inter,sans-serif"}}>Cancel</button>
          </div>
        </div>
      )}

      {/* GREETING */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.85rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
          <div style={{width:"42px",height:"42px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:"#050f0c",border:"2px solid rgba(0,200,150,0.3)",flexShrink:0}}>
            {initials}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:"0.95rem"}}>Hi, {firstName}! 👋</div>
            <div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>{user.email}</div>
          </div>
        </div>
        <button onClick={()=>setShowLogout(true)} style={{padding:"0.35rem 0.75rem",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"8px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.72rem",fontFamily:"Inter,sans-serif"}}>Sign Out</button>
      </div>

      {/* BALANCE CARD */}
      <div className="db-card" style={{background:"linear-gradient(135deg,rgba(0,200,150,0.07),#081a14)"}}>
        <div style={{fontSize:"0.68rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.2rem"}}>Portfolio Balance</div>
        <div style={{fontWeight:800,fontSize:"1.5rem",color:"#e8f8f4"}}>$0.00</div>
        <div style={{fontSize:"0.7rem",color:"#3a6a5a",marginTop:"0.15rem"}}>Grows when you deposit</div>
        <div style={{display:"flex",gap:"1rem",marginTop:"0.85rem",paddingTop:"0.85rem",borderTop:"1px solid rgba(0,200,150,0.08)"}}>
          {[
            {v:"$"+totalPaid.toFixed(2), l:"Saved"},
            {v:paidWeeks+"/52",          l:"Weeks Paid"},
            {v:"$"+interest.toFixed(2), l:"Interest"},
          ].map(s=>(
            <div key={s.l}>
              <div style={{fontWeight:700,fontSize:"0.82rem",color:"#00c896"}}>{s.v}</div>
              <div style={{fontSize:"0.62rem",color:"#4a7a6a"}}>{s.l}</div>
            </div>
          ))}
        </div>
        {savings&&(
          <div style={{marginTop:"0.75rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.68rem",color:"#4a7a6a"}}>
              <span>Progress</span><span style={{color:"#00c896",fontWeight:600}}>{progress}%</span>
            </div>
            <div className="db-prog-track"><div className="db-prog-fill" style={{width:progress+"%"}}/></div>
          </div>
        )}
      </div>

      {/* KYC NOTICE */}
      {(!user.kyc_status||user.kyc_status==="unverified")&&(
        <div onClick={()=>router.push("/verify")} style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"11px",padding:"0.75rem",marginBottom:"0.85rem",display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer"}}>
          <span style={{fontSize:"1rem"}}>🪪</span>
          <div style={{flex:1,fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.4}}><b style={{color:"#00c896"}}>Complete verification</b> to unlock full access.</div>
          <span style={{color:"#00c896",fontSize:"0.8rem"}}>→</span>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div style={{marginBottom:"0.85rem"}}>
        <div style={{fontWeight:600,fontSize:"0.72rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.6rem"}}>Quick Actions</div>
        <div className="db-actions">
          {actions.map(a=>(
            <div key={a.label} className="db-action" onClick={()=>router.push(a.path)}>
              <div style={{fontSize:"1.1rem",lineHeight:1}}>{a.icon}</div>
              <div style={{fontSize:"0.6rem",fontWeight:600,color:"#e8f8f4",textAlign:"center",lineHeight:1.2}}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REFERRAL CARD */}
      <div className="db-card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.25rem"}}>
          <div style={{fontWeight:600,fontSize:"0.72rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.06em"}}>My Referral Code</div>
          <span style={{fontSize:"0.7rem",color:"#00c896",fontWeight:600}}>+$5 per referral</span>
        </div>
        {refCode ? (
          <div className="ref-box">
            <div className="ref-code">{refCode}</div>
            <button className={"copy-btn"+(copied?" done":"")} onClick={copyCode}>
              {copied?"✓ Copied!":"Copy"}
            </button>
          </div>
        ) : (
          <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"9px",padding:"0.65rem",marginTop:"0.5rem",textAlign:"center"}}>
            <div style={{width:"20px",height:"20px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/>
          </div>
        )}
        <div style={{fontSize:"0.68rem",color:"#4a7a6a",marginTop:"0.45rem",lineHeight:1.5}}>
          Share your code with friends. They get instant access, you earn <b style={{color:"#00c896"}}>$5 USDT</b>!
          {refBonus>0&&<span style={{display:"block",marginTop:"0.2rem",color:"#00c896",fontWeight:600}}>💰 Total earned: ${refBonus.toFixed(2)} USDT</span>}
        </div>
      </div>

      {/* SAVINGS */}
      <div className="db-card">
        <div style={{fontWeight:600,fontSize:"0.72rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.6rem"}}>Savings Plan</div>
        {savings ? (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:"#00c896"}}>${totalPaid.toFixed(2)} saved</div>
              <div style={{fontSize:"0.7rem",color:"#4a7a6a",marginTop:"0.1rem"}}>{paidWeeks} of 52 weeks · $3 USDT/week</div>
            </div>
            <button onClick={()=>router.push("/savings")} style={{padding:"0.42rem 0.85rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"9px",background:"rgba(0,200,150,0.06)",color:"#00c896",cursor:"pointer",fontSize:"0.74rem",fontWeight:600,fontFamily:"Inter,sans-serif"}}>View →</button>
          </div>
        ) : (
          <div style={{textAlign:"center",padding:"0.85rem",color:"#4a7a6a",fontSize:"0.78rem"}}>
            <div style={{fontSize:"1.4rem",marginBottom:"0.4rem"}}>💰</div>
            No active savings yet.
            <br/>
            <span style={{color:"#00c896",cursor:"pointer",fontWeight:600}} onClick={()=>router.push("/savings")}>Start saving $3 USDT/week →</span>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
