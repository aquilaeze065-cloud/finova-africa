"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "finova2024admin";

export default function AdminPage() {
  const router = useRouter();
  const [authed,   setAuthed]  = useState(false);
  const [pw,       setPw]      = useState("");
  const [pwErr,    setPwErr]   = useState(false);
  const [tab,      setTab]     = useState("payments");
  const [payments, setPayments]= useState<any[]>([]);
  const [kyc,      setKyc]     = useState<any>({});
  const [selPay,   setSelPay]  = useState(null);
  const [selKyc,   setSelKyc]  = useState(null);
  const [note,     setNote]    = useState("");
  const [toast,    setToast]   = useState("");

  useEffect(()=>{ if(authed){ loadData(); } },[authed]);

  function loadData() {
    try { setPayments(JSON.parse(localStorage.getItem("finova_payments")||"[]")); } catch {}
    try { setKyc(JSON.parse(localStorage.getItem("finova_kyc")||"{}")); } catch {}
  }

  function handleLogin() {
    if(pw===ADMIN_PASSWORD){ setAuthed(true); setPwErr(false); }
    else setPwErr(true);
  }

  function approvePayment(payId: string) {
    const updated = payments.map((p: any) => p.id===payId ? {...p, status:"approved", reviewedAt:new Date().toISOString(), note} : p);
    localStorage.setItem("finova_payments", JSON.stringify(updated));
    setPayments(updated);

    // Activate user account
    try {
      const user = JSON.parse(localStorage.getItem("finova_user")||"{}");
      if (user.regFeePaymentId === payId) {
        user.regFeePaid    = true;
        user.accountActive = true;
        user.activatedAt   = new Date().toISOString();
        localStorage.setItem("finova_user", JSON.stringify(user));

        // Add notification for user
        const notifs = JSON.parse(localStorage.getItem("finova_notifications")||"[]");
        notifs.unshift({
          id:     Date.now().toString(),
          type:   "deposit",
          icon:   "👑",
          title:  "Account Activated!",
          body:   "Your registration fee has been confirmed. Your Finova Africa account is now fully active!",
          read:   false,
          time:   new Date(),
          action: "/dashboard",
        });
        localStorage.setItem("finova_notifications", JSON.stringify(notifs));
      }
    } catch {}

    setToast("✅ Payment approved! Account activated.");
    setSelPay(null); setNote("");
    setTimeout(()=>setToast(""),3000);
  }

  function rejectPayment(payId: string) {
    const updated = payments.map((p: any) => p.id===payId ? {...p, status:"rejected", reviewedAt:new Date().toISOString(), note} : p);
    localStorage.setItem("finova_payments", JSON.stringify(updated));
    setPayments(updated);
    setToast("❌ Payment rejected.");
    setSelPay(null); setNote("");
    setTimeout(()=>setToast(""),3000);
  }

  function updateKyc(stepId: string, status) {
    const updated = {...kyc, [stepId]:{...kyc[stepId], status, reviewedAt:new Date().toISOString(), note}};
    localStorage.setItem("finova_kyc", JSON.stringify(updated));
    setKyc(updated);
    try {
      const user = JSON.parse(localStorage.getItem("finova_user")||"{}");
      if(!user.kycStatuses) user.kycStatuses={};
      user.kycStatuses[stepId] = status==="approved"?"verified":"rejected";
      localStorage.setItem("finova_user", JSON.stringify(user));
    } catch {}
    setToast(status==="approved"?"✅ KYC Approved!":"❌ KYC Rejected!");
    setSelKyc(null); setNote("");
    setTimeout(()=>setToast(""),3000);
  }

  const pendingPay = payments.filter((p: any) =>p.status==="pending");
  const pendingKyc = Object.values(kyc).filter((k: any) =>k.status==="pending");
  const sc = (s)=>s==="approved"?"#d4af37":s==="rejected"?"#e74c3c":"#f39c12";
  const sl = (s)=>s==="approved"?"✓ Approved":s==="rejected"?"✗ Rejected":"⏳ Pending";

  if(!authed) return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0a0800;color:#f5e6c8;font-family:"DM Sans",sans-serif;min-height:100vh;}
        .al-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.08),transparent 60%),#0a0800;}
        .al-card{width:100%;max-width:380px;background:rgba(20,15,0,0.98);border:1px solid rgba(212,175,55,0.25);border-radius:22px;padding:2.4rem 2rem;box-shadow:0 32px 80px rgba(0,0,0,0.8);}
        .al-logo{font-family:"Playfair Display",serif;font-weight:900;font-size:1.2rem;text-align:center;margin-bottom:0.3rem;color:#d4af37;}
        .al-sub{text-align:center;font-size:0.8rem;color:#6a5a2a;margin-bottom:2rem;}
        .al-input{width:100%;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:11px;padding:0.8rem 1rem;font-size:0.95rem;color:#f5e6c8;outline:none;margin-bottom:1rem;display:block;font-family:"DM Sans",sans-serif;}
        .al-input:focus{border-color:rgba(212,175,55,0.4);}
        .al-btn{width:100%;padding:0.9rem;border:none;border-radius:12px;background:linear-gradient(135deg,#b8960c,#d4af37);font-family:"Playfair Display",serif;font-weight:700;font-size:1rem;color:#0a0800;cursor:pointer;}
        .al-err{font-size:0.78rem;color:#e74c3c;margin-bottom:0.8rem;}
      `}</style>
      <div className="al-bg"><div className="al-card">
        <div className="al-logo">👑 FINOVA AFRICA</div>
        <div className="al-sub">Admin Dashboard — Restricted Access</div>
        <input className="al-input" type="password" placeholder="Admin password" value={pw}
          onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        {pwErr&&<div className="al-err">⚠️ Incorrect password</div>}
        <button className="al-btn" onClick={handleLogin}>Enter Dashboard</button>
      </div></div>
    </>
  );

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0a0800;color:#f5e6c8;font-family:"DM Sans",sans-serif;}
        .ad-wrap{display:flex;min-height:100vh;}
        .ad-side{width:210px;background:#080600;border-right:1px solid rgba(212,175,55,0.12);padding:1.5rem 1rem;display:flex;flex-direction:column;flex-shrink:0;}
        .ad-logo{font-family:"Playfair Display",serif;font-weight:900;font-size:1rem;color:#d4af37;margin-bottom:0.25rem;}
        .ad-logo-sub{font-size:0.7rem;color:#6a5a2a;margin-bottom:2rem;}
        .ad-btn{display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.65rem 0.8rem;border-radius:9px;border:none;cursor:pointer;font-size:0.85rem;color:#6a5a2a;background:none;text-align:left;margin-bottom:3px;transition:all 0.15s;position:relative;}
        .ad-btn.active{background:rgba(212,175,55,0.1);color:#d4af37;font-weight:700;}
        .ad-btn:hover{background:rgba(212,175,55,0.06);color:#d4af37;}
        .ad-pill{background:#e74c3c;color:#fff;border-radius:10px;padding:0.1rem 0.45rem;font-size:0.62rem;font-weight:700;margin-left:auto;}
        .ad-main{flex:1;padding:2rem;overflow-y:auto;}
        .ad-header{margin-bottom:1.8rem;}
        .ad-title{font-family:"Playfair Display",serif;font-weight:800;font-size:1.5rem;color:#d4af37;}
        .ad-sub{font-size:0.83rem;color:#6a5a2a;}
        .ad-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.8rem;}
        .ad-stat{background:#120d00;border:1px solid rgba(212,175,55,0.1);border-radius:14px;padding:1.1rem;}
        .ad-stat-val{font-family:"Playfair Display",serif;font-weight:800;font-size:1.6rem;margin-bottom:0.2rem;}
        .ad-stat-label{font-size:0.75rem;color:#6a5a2a;}
        .ad-sec{font-family:"Playfair Display",serif;font-weight:700;font-size:1rem;margin-bottom:0.9rem;color:#d4af37;}
        .ad-table-wrap{background:#120d00;border:1px solid rgba(212,175,55,0.1);border-radius:16px;overflow:hidden;margin-bottom:1.5rem;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;padding:0.65rem 0.9rem;font-size:0.72rem;color:#6a5a2a;font-weight:600;text-transform:uppercase;border-bottom:1px solid rgba(212,175,55,0.08);}
        tr.clickable{cursor:pointer;}
        tr.clickable:hover{background:rgba(212,175,55,0.03);}
        tr.sel-row{background:rgba(212,175,55,0.05);}
        td{padding:0.8rem 0.9rem;font-size:0.85rem;border-bottom:1px solid rgba(212,175,55,0.05);}
        .pill{display:inline-block;padding:0.2rem 0.6rem;border-radius:20px;font-weight:700;font-size:0.7rem;border:1px solid;}
        .ad-detail{background:#120d00;border:1px solid rgba(212,175,55,0.15);border-radius:18px;padding:1.5rem;margin-top:1.5rem;}
        .ad-user-row{display:flex;align-items:center;gap:0.85rem;margin-bottom:1.2rem;background:rgba(212,175,55,0.05);border-radius:12px;padding:0.9rem;}
        .ad-av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#b8960c,#d4af37);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#0a0800;flex-shrink:0;}
        .ad-proof{width:100%;max-height:200px;object-fit:contain;border-radius:12px;margin-bottom:1rem;border:1px solid rgba(212,175,55,0.1);}
        textarea{width:100%;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:11px;padding:0.75rem;font-size:0.88rem;color:#f5e6c8;outline:none;resize:vertical;min-height:70px;margin-bottom:1rem;font-family:"DM Sans",sans-serif;}
        .ad-row{display:flex;gap:0.75rem;}
        .ad-approve{flex:1;padding:0.8rem;border:none;border-radius:12px;background:linear-gradient(135deg,#b8960c,#d4af37);font-family:"Playfair Display",serif;font-weight:700;font-size:0.9rem;color:#0a0800;cursor:pointer;transition:all 0.2s;}
        .ad-reject{flex:1;padding:0.8rem;border:none;border-radius:12px;background:linear-gradient(90deg,#c0392b,#e74c3c);font-family:"Playfair Display",serif;font-weight:700;font-size:0.9rem;color:#fff;cursor:pointer;transition:all 0.2s;}
        .ad-approve:hover,.ad-reject:hover{transform:translateY(-2px);}
        .toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#120d00;border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:0.75rem 1.5rem;font-family:"Playfair Display",serif;font-weight:700;font-size:0.9rem;z-index:999;animation:tIn 0.3s ease;white-space:nowrap;box-shadow:0 12px 40px rgba(0,0,0,0.6);}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .empty{text-align:center;padding:3rem;color:#6a5a2a;font-size:0.9rem;}
        @media(max-width:768px){.ad-wrap{flex-direction:column;}.ad-side{width:100%;flex-direction:row;padding:1rem;gap:0.5rem;}.ad-logo-sub{display:none;}.ad-stats{grid-template-columns:1fr 1fr;}.ad-main{padding:1rem;}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <div className="ad-wrap">
        <aside className="ad-side">
          <div><div className="ad-logo">👑 Finova Admin</div><div className="ad-logo-sub">Management Panel</div></div>
          <button className={"ad-btn"+(tab==="payments"?" active":"")} onClick={()=>setTab("payments")}>
            💳 Payments {pendingPay.length>0&&<span className="ad-pill">{pendingPay.length}</span>}
          </button>
          <button className={"ad-btn"+(tab==="kyc"?" active":"")} onClick={()=>setTab("kyc")}>
            🪪 KYC Reviews {pendingKyc.length>0&&<span className="ad-pill">{pendingKyc.length}</span>}
          </button>
          <button className="ad-btn" onClick={()=>router.push("/dashboard")}>🏠 View App</button>
          <div style={{marginTop:"auto"}}>
            <button className="ad-btn" style={{color:"#e74c3c"}} onClick={()=>setAuthed(false)}>🚪 Logout</button>
          </div>
        </aside>

        <main className="ad-main">
          <div className="ad-header">
            <div className="ad-title">{tab==="payments"?"Payment Approvals":"KYC Reviews"}</div>
            <div className="ad-sub">{tab==="payments"?"Review and approve registration fee payments":"Review and approve identity documents"}</div>
          </div>

          {tab==="payments"&&(
            <>
              <div className="ad-stats">
                <div className="ad-stat"><div className="ad-stat-val" style={{color:"#f39c12"}}>{pendingPay.length}</div><div className="ad-stat-label">⏳ Pending</div></div>
                <div className="ad-stat"><div className="ad-stat-val" style={{color:"#d4af37"}}>{payments.filter((p: any) =>p.status==="approved").length}</div><div className="ad-stat-label">✓ Approved</div></div>
                <div className="ad-stat"><div className="ad-stat-val" style={{color:"#e74c3c"}}>{payments.filter((p: any) =>p.status==="rejected").length}</div><div className="ad-stat-label">✗ Rejected</div></div>
              </div>

              <div className="ad-sec">⏳ Pending Payments ({pendingPay.length})</div>
              {pendingPay.length===0
                ?<div className="empty">No pending payments.</div>
                :<div className="ad-table-wrap"><table>
                  <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Submitted</th><th>Status</th></tr></thead>
                  <tbody>{pendingPay.map((p: any) =>(
                    <tr key={p.id} className={"clickable"+(selPay===p.id?" sel-row":"")} onClick={()=>setSelPay(selPay===p.id?null:p.id)}>
                      <td><div style={{fontWeight:600}}>{p.userName}</div><div style={{fontSize:"0.72rem",color:"#6a5a2a"}}>{p.userEmail}</div></td>
                      <td style={{fontFamily:"Playfair Display,serif",fontWeight:700,color:"#d4af37"}}>{p.amount} {p.currency}</td>
                      <td style={{fontSize:"0.8rem"}}>{p.network}</td>
                      <td style={{fontSize:"0.78rem",color:"#6a5a2a"}}>{new Date(p.submittedAt).toLocaleString()}</td>
                      <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }

              {selPay&&payments.find(p=>p.id===selPay)&&(()=>{
                const p = payments.find(x=>x.id===selPay);
                return (
                  <div className="ad-detail">
                    <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:"1.05rem",marginBottom:"1rem",color:"#d4af37"}}>
                      Review Payment — {p.userName}
                    </div>
                    <div className="ad-user-row">
                      <div className="ad-av">{p.userName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{fontFamily:"Playfair Display,serif",fontWeight:700}}>{p.userName}</div>
                        <div style={{fontSize:"0.75rem",color:"#6a5a2a"}}>{p.userEmail}</div>
                        <div style={{fontSize:"0.72rem",color:"#6a5a2a"}}>Network: {p.network} · Amount: {p.amount} {p.currency}</div>
                        <div style={{fontSize:"0.72rem",color:"#6a5a2a"}}>TX Hash: {p.txHash}</div>
                      </div>
                    </div>
                    {p.preview&&<img src={p.preview} className="ad-proof" alt="Payment proof"/>}
                    <div style={{fontSize:"0.75rem",color:"#6a5a2a",fontWeight:600,textTransform:"uppercase",marginBottom:"0.4rem"}}>Review Note (optional)</div>
                    <textarea placeholder="e.g. Payment confirmed, activating account..." value={note} onChange={e=>setNote(e.target.value)}/>
                    <div className="ad-row">
                      <button className="ad-approve" onClick={()=>approvePayment(p.id)}>✓ Approve & Activate</button>
                      <button className="ad-reject"  onClick={()=>rejectPayment(p.id)}>✗ Reject</button>
                    </div>
                  </div>
                );
              })()}

              {payments.filter((p: any) =>p.status!=="pending").length>0&&(
                <>
                  <div className="ad-sec" style={{marginTop:"2rem"}}>📁 Reviewed ({payments.filter((p: any) =>p.status!=="pending").length})</div>
                  <div className="ad-table-wrap"><table>
                    <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Submitted</th><th>Status</th></tr></thead>
                    <tbody>{payments.filter((p: any) =>p.status!=="pending").map((p: any) =>(
                      <tr key={p.id}>
                        <td><div style={{fontWeight:600}}>{p.userName}</div><div style={{fontSize:"0.72rem",color:"#6a5a2a"}}>{p.userEmail}</div></td>
                        <td style={{fontFamily:"Playfair Display,serif",fontWeight:700,color:"#d4af37"}}>{p.amount} {p.currency}</td>
                        <td style={{fontSize:"0.8rem"}}>{p.network}</td>
                        <td style={{fontSize:"0.78rem",color:"#6a5a2a"}}>{new Date(p.submittedAt).toLocaleString()}</td>
                        <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </>
              )}
            </>
          )}

          {tab==="kyc"&&(
            <>
              <div className="ad-stats">
                <div className="ad-stat"><div className="ad-stat-val" style={{color:"#f39c12"}}>{pendingKyc.length}</div><div className="ad-stat-label">⏳ Pending</div></div>
                <div className="ad-stat"><div className="ad-stat-val" style={{color:"#d4af37"}}>{Object.values(kyc).filter((k: any) =>k.status==="approved").length}</div><div className="ad-stat-label">✓ Approved</div></div>
                <div className="ad-stat"><div className="ad-stat-val" style={{color:"#e74c3c"}}>{Object.values(kyc).filter((k: any) =>k.status==="rejected").length}</div><div className="ad-stat-label">✗ Rejected</div></div>
              </div>
              <div className="ad-sec">⏳ Pending KYC ({pendingKyc.length})</div>
              {pendingKyc.length===0
                ?<div className="empty">No pending KYC submissions.</div>
                :<div className="ad-table-wrap"><table>
                  <thead><tr><th>User</th><th>Document</th><th>Submitted</th><th>Status</th></tr></thead>
                  <tbody>{pendingKyc.map((k: any) =>(
                    <tr key={k.stepId} className={"clickable"+(selKyc===k.stepId?" sel-row":"")} onClick={()=>setSelKyc(selKyc===k.stepId?null:k.stepId)}>
                      <td><div style={{fontWeight:600}}>{k.userName}</div><div style={{fontSize:"0.72rem",color:"#6a5a2a"}}>{k.userEmail}</div></td>
                      <td style={{fontFamily:"Playfair Display,serif",fontWeight:700}}>{k.title}</td>
                      <td style={{fontSize:"0.78rem",color:"#6a5a2a"}}>{new Date(k.submittedAt).toLocaleString()}</td>
                      <td><span className="pill" style={{color:sc(k.status),borderColor:sc(k.status),background:`${sc(k.status)}18`}}>{sl(k.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selKyc&&kyc[selKyc]&&(()=>{
                const k = kyc[selKyc];
                return (
                  <div className="ad-detail">
                    <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:"1.05rem",marginBottom:"1rem",color:"#d4af37"}}>Review: {k.title}</div>
                    <div className="ad-user-row">
                      <div className="ad-av">{k.userName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{fontFamily:"Playfair Display,serif",fontWeight:700}}>{k.userName}</div>
                        <div style={{fontSize:"0.75rem",color:"#6a5a2a"}}>{k.userEmail}</div>
                        <div style={{fontSize:"0.72rem",color:"#6a5a2a"}}>Submitted: {new Date(k.submittedAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"0.75rem",marginBottom:"1.2rem"}}>
                      {k.files?.map((f: any) =>(
                        <div key={f.key} style={{background:"rgba(212,175,55,0.03)",border:"1px solid rgba(212,175,55,0.1)",borderRadius:"12px",overflow:"hidden"}}>
                          {f.preview?<img src={f.preview} style={{width:"100%",height:"100px",objectFit:"cover"}} alt={f.label}/>:<div style={{width:"100%",height:"100px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>📄</div>}
                          <div style={{padding:"0.4rem 0.6rem",fontSize:"0.74rem",color:"#6a5a2a"}}>{f.label}</div>
                        </div>
                      ))}
                    </div>
                    <textarea placeholder="Review note..." value={note} onChange={e=>setNote(e.target.value)}/>
                    <div className="ad-row">
                      <button className="ad-approve" onClick={()=>updateKyc(k.stepId,"approved")}>✓ Approve</button>
                      <button className="ad-reject"  onClick={()=>updateKyc(k.stepId,"rejected")}>✗ Reject</button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>
      </div>
    </>
  );
}
