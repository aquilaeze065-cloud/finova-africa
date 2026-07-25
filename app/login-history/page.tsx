"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function timeAgo(date:string) {
  const diff=Date.now()-new Date(date).getTime();
  const m=Math.floor(diff/60000),h=Math.floor(diff/3600000),d=Math.floor(diff/86400000);
  if(m<2)return "Just now"; if(m<60)return `${m}m ago`;
  if(h<24)return `${h}h ago`; if(d<7)return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
}

export default function LoginHistoryPage() {
  const router = useRouter();
  const [history,setHistory]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const token=localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    if(!token){window.location.replace("/login");return;}
    fetch(`${API}/api/login-history`,{headers:{"Authorization":`Bearer ${token}`}})
      .then(r=>r.json())
      .then(d=>{ if(d.history) setHistory(d.history); setLoading(false); })
      .catch(()=>{
        // Fallback - show current session from localStorage
        try {
          const u=JSON.parse(localStorage.getItem("nexora_user")||"{}");
          setHistory([{
            id:"current",device:/Mobile|Android|iPhone/i.test(navigator.userAgent)?"Mobile":"Desktop",
            browser:navigator.userAgent.substring(0,120),ip_address:"This device",
            status:"success",created_at:u.last_login||new Date().toISOString(),isCurrent:true
          }]);
        } catch {}
        setLoading(false);
      });
  },[]);

  const G="#00c896",RED="#ff4757";

  return (
    <MobileLayout activePage="Settings">
      <style>{`
        .lh-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:16px;overflow:hidden;margin-bottom:0.85rem;}
        .lh-item{padding:0.9rem 1rem;border-bottom:1px solid rgba(0,200,150,0.06);display:flex;gap:0.75rem;align-items:flex-start;}
        .lh-item:last-child{border-bottom:none;}
        .lh-ic{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .badge{display:inline-flex;align-items:center;gap:0.25rem;padding:0.15rem 0.5rem;border-radius:20px;font-size:0.62rem;font-weight:700;margin-top:0.25rem;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{marginBottom:"1.2rem"}}>
        <button onClick={()=>router.back()} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"Inter,sans-serif",marginBottom:"0.5rem",padding:0}}>← Back</button>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:G}}>🔐 Login History</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>All recent account access</div>
      </div>

      <div style={{background:"rgba(255,165,0,0.06)",border:"1px solid rgba(255,165,0,0.18)",borderRadius:"13px",padding:"0.85rem 1rem",marginBottom:"0.85rem",display:"flex",gap:"0.6rem"}}>
        <span style={{fontSize:"1rem",flexShrink:0}}>🛡️</span>
        <div style={{fontSize:"0.74rem",color:"#a08030",lineHeight:1.6}}>
          <b style={{color:"#ffa500"}}>Security tip:</b> If you see a login you don't recognize, change your password immediately and enable 2FA.
        </div>
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"3rem",color:"#5a8a7a"}}>
          <div style={{width:"28px",height:"28px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 0.75rem"}}/>
          Loading...
        </div>
      ):history.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#5a8a7a",background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"14px"}}>
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📋</div>
          No login history yet.
        </div>
      ):(
        <div className="lh-card">
          {history.map((h:any,i:number)=>{
            const isFirst=i===0||h.isCurrent;
            const isFailed=h.status==="failed";
            const ua=h.browser||"";
            const browser=ua.includes("Chrome")?"Chrome":ua.includes("Firefox")?"Firefox":ua.includes("Safari")?"Safari":"Browser";
            return (
              <div key={h.id||i} className="lh-item">
                <div className="lh-ic" style={{background:isFirst?"rgba(0,200,150,0.12)":isFailed?"rgba(255,71,87,0.08)":"rgba(0,200,150,0.06)",border:`1px solid ${isFirst?"rgba(0,200,150,0.3)":isFailed?"rgba(255,71,87,0.15)":"rgba(0,200,150,0.1)"}`}}>
                  {/Mobile|Android|iPhone/i.test(h.device||"")?"📱":"🖥️"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.4rem",flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,fontSize:"0.84rem"}}>{h.device||"Unknown"}</span>
                    {isFirst&&<span className="badge" style={{background:"rgba(0,200,150,0.1)",color:G,border:"1px solid rgba(0,200,150,0.2)"}}>● Current</span>}
                    {isFailed&&<span className="badge" style={{background:"rgba(255,71,87,0.08)",color:RED,border:"1px solid rgba(255,71,87,0.15)"}}>⚠️ Failed</span>}
                    {!isFirst&&!isFailed&&<span className="badge" style={{background:"rgba(0,200,150,0.06)",color:"#3a8a6a",border:"1px solid rgba(0,200,150,0.1)"}}>✓ Success</span>}
                  </div>
                  <div style={{fontSize:"0.72rem",color:"#5a8a7a",marginTop:"0.1rem"}}>🌐 {browser} · 📍 {h.ip_address||"Unknown"}</div>
                  <div style={{fontSize:"0.68rem",color:"#3a5a4a",marginTop:"0.1rem"}}>{timeAgo(h.created_at)} · {new Date(h.created_at).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"13px",padding:"1rem",fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.7}}>
        <b style={{color:G,display:"block",marginBottom:"0.3rem"}}>🔒 Stay Secure</b>
        Always log out on shared devices. Enable 2FA for maximum protection. Never share your password or OTP codes with anyone.
      </div>
    </MobileLayout>
  );
}
