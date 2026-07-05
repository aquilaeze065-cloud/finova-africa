"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PW = "nexora2024admin";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminPage() {
  const router = useRouter();
  const [authed,      setAuthed]     = useState(false);
  const [pw,          setPw]         = useState("");
  const [showPw,      setShowPw]     = useState(false);
  const [pwErr,       setPwErr]      = useState(false);
  const [tab,         setTab]        = useState("payments");
  const [payments,    setPayments]   = useState<any[]>([]);
  const [kyc,         setKyc]        = useState<any>({});
  const [exchangers,  setExchangers] = useState<any[]>([]);
  const [supportTeam, setSupportTeam]= useState<any[]>([]);
  const [selPay,      setSelPay]     = useState<any>(null);
  const [selKyc,      setSelKyc]     = useState<any>(null);
  const [note,        setNote]       = useState("");
  const [toast,       setToast]      = useState("");
  const [newEx,       setNewEx]      = useState({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
  const [showAddEx,   setShowAddEx]  = useState(false);
  const [newAgent,    setNewAgent]   = useState({name:"",whatsapp:"",role:"Support Agent"});
  const [wallets,     setWallets]    = useState<any[]>([]);
  const [users,       setUsers]      = useState<any[]>([]);
  const [creditModal, setCreditModal]= useState<any>(null);
  const [creditWeek,  setCreditWeek] = useState("1");
  const [creditAmt,   setCreditAmt]  = useState("3");
  const [creditNote,  setCreditNote] = useState("");
  const [editWallet,  setEditWallet] = useState<any>(null);
  const [newWallet,   setNewWallet]  = useState({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
  const [showAddWallet,setShowAddWallet]=useState(false);
  const [showAddAgent,setShowAddAgent]=useState(false);

  useEffect(()=>{ if(authed) loadAll(); },[authed]);

  function loadAll() {
    try { setPayments(JSON.parse(localStorage.getItem("nexora_payments")||"[]")); } catch {}
    try { setKyc(JSON.parse(localStorage.getItem("nexora_kyc")||"{}")); } catch {}
    try { setExchangers(JSON.parse(localStorage.getItem("nexora_exchangers")||"[]")); } catch {}
    try { setSupportTeam(JSON.parse(localStorage.getItem("nexora_support_team")||"[]")); } catch {}
    // Load wallets from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]");
      setWallets(saved);
    } catch {}
    // Load users from localStorage payments
    try {
      const pays = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
      const uniqueUsers = Array.from(
        new Map(pays.map((p:any)=>[p.userId||p.user_id, {
          id: p.userId||p.user_id,
          name: p.userName||p.user_name||"Unknown",
          email: p.userEmail||p.user_email||"",
        }])).values()
      );
      setUsers(uniqueUsers as any[]);
    } catch {}
  }

  function login() {
    if (pw === ADMIN_PW) { setAuthed(true); setPwErr(false); }
    else setPwErr(true);
  }

  function showMsg(msg: string) { setToast(msg); setTimeout(()=>setToast(""),3500); }

  function approvePayment(id: string) {
    const updated = payments.map(p=>p.id===id?{...p,status:"approved",reviewNote:note,reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments", JSON.stringify(updated));
    setPayments(updated);
    try {
      const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
      const pay = payments.find(p=>p.id===id);
      if (pay && (u.id===pay.userId||u.email===pay.userEmail)) {
        u.reg_fee_paid=true; u.account_status="active";
        localStorage.setItem("nexora_user", JSON.stringify(u));
      }
    } catch {}
    showMsg("✅ Approved! Account activated."); setSelPay(null); setNote("");
  }

  function rejectPayment(id: string) {
    const updated = payments.map(p=>p.id===id?{...p,status:"rejected",reviewNote:note,reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments", JSON.stringify(updated));
    setPayments(updated);
    showMsg("❌ Payment rejected."); setSelPay(null); setNote("");
  }

  function approveKyc(id: string) {
    const updated = {...kyc,[id]:{...kyc[id],status:"approved",reviewedAt:new Date().toISOString()}};
    localStorage.setItem("nexora_kyc", JSON.stringify(updated));
    setKyc(updated);
    showMsg("✅ KYC Approved!"); setSelKyc(null); setNote("");
  }

  function rejectKyc(id: string) {
    const updated = {...kyc,[id]:{...kyc[id],status:"rejected",reviewedAt:new Date().toISOString()}};
    localStorage.setItem("nexora_kyc", JSON.stringify(updated));
    setKyc(updated); showMsg("❌ KYC Rejected."); setSelKyc(null); setNote("");
  }

  function saveExchanger() {
    if (!newEx.name||!newEx.walletAddress) { showMsg("Name and wallet address required"); return; }
    const ex = {...newEx, id:"ex_"+Date.now(), active:true, createdAt:new Date().toISOString()};
    const updated = [...exchangers, ex];
    localStorage.setItem("nexora_exchangers", JSON.stringify(updated));
    setExchangers(updated); setShowAddEx(false);
    setNewEx({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
    showMsg("✅ Exchanger added!");
  }

  function deleteExchanger(id: string) {
    if (!confirm("Delete exchanger?")) return;
    const updated = exchangers.filter(e=>e.id!==id);
    localStorage.setItem("nexora_exchangers", JSON.stringify(updated));
    setExchangers(updated);
  }

  async function creditWallet() {
    if (!creditModal||!creditWeek||!creditAmt) return;
    const userId = creditModal.id||creditModal.userId;

    // Update in localStorage
    const payments = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
    const credit = {
      id:"credit_"+Date.now(),
      userId, userName:creditModal.name, userEmail:creditModal.email,
      type:"savings_credit", weekNumber:creditWeek, amount:creditAmt,
      currency:"USDT", status:"completed", note:creditNote,
      creditedAt:new Date().toISOString(), creditedBy:"Admin",
    };
    payments.push(credit);
    localStorage.setItem("nexora_payments", JSON.stringify(payments));

    // Update user's savings in localStorage
    const userKey = "nexora_savings_"+userId;
    const savings = JSON.parse(localStorage.getItem(userKey)||localStorage.getItem("nexora_savings")||"null");
    if (savings && savings.weeks) {
      const week = savings.weeks.find((w:any)=>w.week===parseInt(creditWeek)||w.week_number===parseInt(creditWeek));
      if (week) {
        week.status = "paid";
        week.paid_amount = parseFloat(creditAmt);
        week.paidAt = new Date().toISOString();
        savings.totalPaid = (savings.totalPaid||0) + parseFloat(creditAmt);
        localStorage.setItem("nexora_savings", JSON.stringify(savings));
      }
    }

    // Add notification
    const notifs = JSON.parse(localStorage.getItem("nexora_notifications")||"[]");
    notifs.unshift({
      id:Date.now().toString(), type:"deposit", icon:"💰",
      title:`Week ${creditWeek} Payment Confirmed`,
      body:`Your payment of $${creditAmt} USDT for week ${creditWeek} has been confirmed!`,
      read:false, time:new Date(), action:"/savings"
    });
    localStorage.setItem("nexora_notifications", JSON.stringify(notifs));

    showMsg(`✅ Week ${creditWeek} credited ($${creditAmt} USDT) to ${creditModal.name}!`);
    setCreditModal(null); setCreditWeek("1"); setCreditAmt("3"); setCreditNote("");
  }

  async function saveWallet() {
    if (!newWallet.address) { showMsg("Wallet address required"); return; }
    // Save to localStorage (works without backend auth)
    const id = "wal_"+Date.now();
    const wallet = {...newWallet, id, is_active:true, created_at:new Date().toISOString()};
    const updated = [...wallets, wallet];
    localStorage.setItem("nexora_platform_wallets", JSON.stringify(updated));
    setWallets(updated);
    setNewWallet({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
    setShowAddWallet(false);
    showMsg("✅ Wallet added! Users will see this on the deposit page.");
  }

  async function updateWallet(id:string, address:string) {
    const updated = wallets.map((x:any)=>x.id===id?{...x,address}:x);
    localStorage.setItem("nexora_platform_wallets", JSON.stringify(updated));
    setWallets(updated);
    setEditWallet(null);
    showMsg("✅ Wallet address updated!");
  }

  async function deleteWallet(id:string) {
    if (!confirm("Delete this wallet?")) return;
    const updated = wallets.filter((x:any)=>x.id!==id);
    localStorage.setItem("nexora_platform_wallets", JSON.stringify(updated));
    setWallets(updated);
    showMsg("✅ Wallet deleted!");
  }

  function saveAgent() {
    if (!newAgent.name||!newAgent.whatsapp) { showMsg("Name and WhatsApp required"); return; }
    const clean = newAgent.whatsapp.replace(/\D/g,"");
    const agent = {...newAgent, whatsapp:clean, id:"ag_"+Date.now(), active:true, createdAt:new Date().toISOString()};
    const updated = [...supportTeam, agent];
    localStorage.setItem("nexora_support_team", JSON.stringify(updated));
    setSupportTeam(updated); setShowAddAgent(false);
    setNewAgent({name:"",whatsapp:"",role:"Support Agent"});
    showMsg("✅ Support agent added!");
  }

  function toggleAgent(id: string) {
    const updated = supportTeam.map(a=>a.id===id?{...a,active:!a.active}:a);
    localStorage.setItem("nexora_support_team", JSON.stringify(updated));
    setSupportTeam(updated);
  }

  function deleteAgent(id: string) {
    if (!confirm("Remove agent?")) return;
    const updated = supportTeam.filter(a=>a.id!==id);
    localStorage.setItem("nexora_support_team", JSON.stringify(updated));
    setSupportTeam(updated);
  }

  const G = "#00c896"; const DG = "#00a87a"; const BG = "#050f0c";
  const CARD = "#081a14"; const BORDER = "rgba(0,200,150,0.15)";
  const MUTED = "#5a8a7a"; const TEXT = "#e8f8f4"; const RED = "#ff4757";

  const pending    = payments.filter(p=>p.status==="pending");
  const pendingKyc = Object.values(kyc).filter((k:any)=>k.status==="pending");

  const sc = (s:string) => s==="approved"?G:s==="rejected"?RED:"#f39c12";
  const sl = (s:string) => s==="approved"?"✓ Approved":s==="rejected"?"✗ Rejected":"⏳ Pending";

  const inp: React.CSSProperties = {
    width:"100%", background:"rgba(0,200,150,0.04)", border:`1px solid rgba(0,200,150,0.12)`,
    borderRadius:"9px", padding:"0.62rem 0.85rem", fontSize:"0.84rem",
    color:TEXT, outline:"none", fontFamily:"Inter,sans-serif"
  };

  const navTabs = [
    {id:"payments", icon:"💳", label:"Payments",    badge:pending.length},
    {id:"kyc",      icon:"🪪", label:"KYC",         badge:pendingKyc.length},
    {id:"exchangers",icon:"💱",label:"Exchangers",  badge:0},
    {id:"support",  icon:"💬", label:"Support",     badge:0},
  ];

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}
      `}</style>
      <div style={{width:"100%",maxWidth:"360px",padding:"1rem"}}>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"20px",padding:"2rem 1.75rem",boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
          <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`linear-gradient(135deg,${G},#0066ff)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem"}}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{fontWeight:800,fontSize:"1.1rem",background:`linear-gradient(135deg,${G},#4dffc3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</div>
            <div style={{fontSize:"0.72rem",color:MUTED,marginTop:"0.15rem"}}>Admin Control Panel</div>
          </div>
          <div style={{background:"rgba(0,200,150,0.05)",border:`1px solid rgba(0,200,150,0.12)`,borderRadius:"10px",padding:"0.55rem",textAlign:"center",fontSize:"0.72rem",color:G,marginBottom:"1.2rem",fontWeight:600}}>
            🔐 Restricted Access
          </div>
          <div style={{position:"relative",marginBottom:"0.85rem"}}>
            <input
              style={{...inp,paddingRight:"2.8rem"}}
              type={showPw?"text":"password"}
              placeholder="Admin password"
              value={pw}
              onChange={e=>setPw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&login()}
            />
            <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:"0",top:"0",bottom:"0",width:"2.5rem",background:"none",border:"none",cursor:"pointer",color:MUTED,fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {showPw?"🙈":"👁"}
            </button>
          </div>
          {pwErr&&<div style={{fontSize:"0.75rem",color:RED,marginBottom:"0.75rem",textAlign:"center"}}>⚠️ Incorrect password</div>}
          <button onClick={login} style={{width:"100%",padding:"0.88rem",border:"none",borderRadius:"11px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.95rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            Enter Dashboard
          </button>
        </div>
      </div>
    </>
  );

  // ── MAIN ADMIN ──
  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;}
        .adm{display:flex;min-height:100vh;}
        .adm-side{width:200px;background:#060f0c;border-right:1px solid rgba(0,200,150,0.08);padding:1.2rem 0.8rem;display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;}
        .adm-logo{font-weight:800;font-size:0.95rem;color:#00c896;margin-bottom:0.15rem;}
        .adm-logo-sub{font-size:0.62rem;color:#3a6a5a;margin-bottom:1.5rem;}
        .adm-nav{display:flex;align-items:center;gap:0.35rem;padding:0.55rem 0.7rem;border-radius:9px;border:none;cursor:pointer;font-size:0.82rem;color:#5a8a7a;background:none;text-align:left;margin-bottom:2px;transition:all 0.15s;width:100%;}
        .adm-nav:hover{background:rgba(0,200,150,0.06);color:#e8f8f4;}
        .adm-nav.on{background:#00c896;color:#050f0c;font-weight:700;}
        .adm-badge{margin-left:auto;background:#ff4757;color:#fff;border-radius:10px;padding:0.06rem 0.4rem;font-size:0.6rem;font-weight:700;}
        .adm-main{flex:1;padding:1.5rem;overflow-y:auto;max-width:100%;}
        .adm-head{margin-bottom:1.3rem;}
        .adm-title{font-weight:800;font-size:1.2rem;color:#00c896;}
        .adm-sub{font-size:0.74rem;color:#5a8a7a;margin-top:0.15rem;}
        .adm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0.65rem;margin-bottom:1.3rem;}
        .adm-stat{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:12px;padding:0.85rem;text-align:center;}
        .adm-stat-val{font-weight:800;font-size:1.3rem;margin-bottom:0.1rem;}
        .adm-stat-label{font-size:0.66rem;color:#5a8a7a;}
        .adm-sec{font-weight:700;font-size:0.85rem;color:#00c896;margin-bottom:0.65rem;margin-top:0.5rem;}
        .adm-table-wrap{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:14px;overflow:hidden;margin-bottom:1rem;overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:420px;}
        th{text-align:left;padding:0.55rem 0.8rem;font-size:0.65rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid rgba(0,200,150,0.07);}
        td{padding:0.65rem 0.8rem;font-size:0.8rem;border-bottom:1px solid rgba(0,200,150,0.04);}
        tr.clickable{cursor:pointer;transition:background 0.15s;}
        tr.clickable:hover{background:rgba(0,200,150,0.03);}
        tr.selected{background:rgba(0,200,150,0.06)!important;}
        .pill{display:inline-block;padding:0.16rem 0.5rem;border-radius:20px;font-weight:600;font-size:0.66rem;border:1px solid;}
        .adm-detail{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:14px;padding:1.1rem;margin-top:1rem;}
        .adm-proof{width:100%;max-height:160px;object-fit:contain;border-radius:9px;margin-bottom:0.8rem;border:1px solid rgba(0,200,150,0.08);background:#060f0c;}
        .adm-no-proof{height:80px;background:#060f0c;border:1px solid rgba(0,200,150,0.07);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#5a8a7a;font-size:0.78rem;margin-bottom:0.8rem;}
        .info-row{display:flex;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid rgba(0,200,150,0.05);font-size:0.76rem;}
        .info-row:last-child{border-bottom:none;}
        textarea{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:9px;padding:0.6rem 0.8rem;font-size:0.83rem;color:#e8f8f4;outline:none;resize:vertical;min-height:60px;margin-bottom:0.8rem;font-family:"Inter",sans-serif;}
        .btn-approve{flex:1;padding:0.72rem;border:none;border-radius:10px;background:linear-gradient(135deg,#00a87a,#00c896);font-weight:700;font-size:0.86rem;color:#050f0c;cursor:pointer;transition:all 0.18s;font-family:"Inter",sans-serif;}
        .btn-reject{flex:1;padding:0.72rem;border:none;border-radius:10px;background:linear-gradient(135deg,#c0392b,#ff4757);font-weight:700;font-size:0.86rem;color:#fff;cursor:pointer;transition:all 0.18s;font-family:"Inter",sans-serif;}
        .btn-approve:hover,.btn-reject:hover{transform:translateY(-1px);}
        .empty{text-align:center;padding:2.5rem 1rem;color:#5a8a7a;font-size:0.83rem;}
        .toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.62rem 1.2rem;font-weight:700;font-size:0.83rem;z-index:999;animation:tIn 0.3s ease;white-space:nowrap;color:#00c896;box-shadow:0 8px 32px rgba(0,0,0,0.6);}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .adm-form{background:#060f0c;border:1px solid rgba(0,200,150,0.12);border-radius:14px;padding:1.1rem;margin-bottom:1.1rem;}
        .adm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;}
        .adm-form-field{display:flex;flex-direction:column;gap:0.28rem;}
        .adm-form-lbl{font-size:0.63rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
        .adm-form-inp{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.58rem 0.75rem;font-size:0.82rem;color:#e8f8f4;outline:none;width:100%;font-family:"Inter",sans-serif;}
        .adm-agent-card{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:14px;padding:1rem;margin-bottom:0.6rem;}
        @media(max-width:768px){.adm{flex-direction:column;}.adm-side{width:100%;height:auto;flex-direction:row;flex-wrap:wrap;gap:0.25rem;padding:0.6rem;position:relative;}.adm-logo-sub{display:none;}.adm-stats{grid-template-columns:1fr 1fr;}.adm-main{padding:0.85rem;}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <div className="adm">
        {/* SIDEBAR */}
        <aside className="adm-side">
          <div style={{marginBottom:"1.2rem"}}>
            <div className="adm-logo">◈ NEXORA</div>
            <div className="adm-logo-sub">Admin Panel</div>
          </div>
          {navTabs.map(t=>(
            <button key={t.id} className={`adm-nav ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
              {t.icon} {t.label}
              {t.badge>0&&<span className="adm-badge">{t.badge}</span>}
            </button>
          ))}
          <div style={{marginTop:"auto",paddingTop:"0.75rem",borderTop:"1px solid rgba(0,200,150,0.07)"}}>
            <button className="adm-nav" onClick={()=>loadAll()} style={{color:"#00c896"}}>🔄 Refresh</button>
            <button className="adm-nav" onClick={()=>router.push("/dashboard")} style={{color:"#5a8a7a"}}>🏠 View Site</button>
            <button className="adm-nav" style={{color:"#ff4757"}} onClick={()=>setAuthed(false)}>🚪 Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="adm-main">

          {/* ── PAYMENTS ── */}
          {tab==="payments"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Payment Approvals</div>
                <div className="adm-sub">Review and approve registration fee payments</div>
              </div>
              <div className="adm-stats">
                <div className="adm-stat"><div className="adm-stat-val" style={{color:"#f39c12"}}>{pending.length}</div><div className="adm-stat-label">Pending</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:G}}>{payments.filter(p=>p.status==="approved").length}</div><div className="adm-stat-label">Approved</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:RED}}>{payments.filter(p=>p.status==="rejected").length}</div><div className="adm-stat-label">Rejected</div></div>
              </div>

              <div className="adm-sec">⏳ Pending ({pending.length})</div>
              {pending.length===0
                ?<div className="empty">📭 No pending payments yet.<br/>Payments appear here when users submit proof.</div>
                :<div className="adm-table-wrap">
                  <table>
                    <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>{pending.map((p:any)=>(
                      <tr key={p.id} className={`clickable ${selPay?.id===p.id?"selected":""}`} onClick={()=>setSelPay(selPay?.id===p.id?null:p)}>
                        <td><div style={{fontWeight:600}}>{p.userName||p.user_name||"Unknown"}</div><div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>{p.userEmail||p.user_email||""}</div></td>
                        <td style={{fontWeight:700,color:G}}>{p.amount} {p.currency}</td>
                        <td style={{fontSize:"0.76rem"}}>{p.network}</td>
                        <td style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{new Date(p.submittedAt||p.submitted_at||Date.now()).toLocaleDateString()}</td>
                        <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              }

              {selPay&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.92rem",color:G,marginBottom:"0.85rem"}}>Review Payment</div>
                  <div style={{display:"flex",alignItems:"center",gap:"0.7rem",padding:"0.8rem",background:"rgba(0,200,150,0.04)",borderRadius:"10px",marginBottom:"0.85rem"}}>
                    <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.88rem",color:BG,flexShrink:0}}>
                      {(selPay.userName||selPay.user_name||"U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.88rem"}}>{selPay.userName||selPay.user_name||"Unknown"}</div>
                      <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{selPay.userEmail||selPay.user_email||""}</div>
                    </div>
                  </div>
                  {[
                    ["Amount",    `${selPay.amount} ${selPay.currency}`],
                    ["Network",   selPay.network],
                    ["TX Hash",   selPay.txHash||selPay.tx_hash||"Not provided"],
                    ["File",      selPay.fileName||"Screenshot uploaded"],
                    ["Submitted", new Date(selPay.submittedAt||Date.now()).toLocaleString()],
                  ].map(([l,v])=>(
                    <div key={l} className="info-row">
                      <span style={{color:"#5a8a7a"}}>{l}</span>
                      <span style={{fontWeight:600,maxWidth:"60%",textAlign:"right",fontSize:"0.74rem",wordBreak:"break-all"}}>{v}</span>
                    </div>
                  ))}
                  <div style={{fontSize:"0.65rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0.75rem 0 0.4rem"}}>Payment Screenshot</div>
                  {selPay.screenshot||selPay.screenshot_url
                    ?<img src={selPay.screenshot||selPay.screenshot_url} className="adm-proof" alt="proof"/>
                    :<div className="adm-no-proof">📄 No image — file: {selPay.fileName||"N/A"}</div>
                  }
                  <div style={{fontSize:"0.65rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.4rem"}}>Note (optional)</div>
                  <textarea placeholder="e.g. Payment confirmed..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div style={{display:"flex",gap:"0.6rem"}}>
                    <button className="btn-approve" onClick={()=>approvePayment(selPay.id)}>✓ Approve & Activate</button>
                    <button className="btn-reject"  onClick={()=>rejectPayment(selPay.id)}>✗ Reject</button>
                  </div>
                </div>
              )}

              {payments.filter(p=>p.status!=="pending").length>0&&(
                <>
                  <div className="adm-sec" style={{marginTop:"1.2rem"}}>📁 Reviewed ({payments.filter(p=>p.status!=="pending").length})</div>
                  <div className="adm-table-wrap">
                    <table>
                      <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>{payments.filter(p=>p.status!=="pending").map((p:any)=>(
                        <tr key={p.id}>
                          <td><div style={{fontWeight:600}}>{p.userName||"Unknown"}</div><div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>{p.userEmail||""}</div></td>
                          <td style={{fontWeight:700,color:G}}>{p.amount} {p.currency}</td>
                          <td style={{fontSize:"0.76rem"}}>{p.network}</td>
                          <td style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{new Date(p.submittedAt||Date.now()).toLocaleDateString()}</td>
                          <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── KYC ── */}
          {tab==="kyc"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">KYC Reviews</div>
                <div className="adm-sub">Review identity verification documents</div>
              </div>
              <div className="adm-stats">
                <div className="adm-stat"><div className="adm-stat-val" style={{color:"#f39c12"}}>{pendingKyc.length}</div><div className="adm-stat-label">Pending</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:G}}>{Object.values(kyc).filter((k:any)=>k.status==="approved").length}</div><div className="adm-stat-label">Approved</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:RED}}>{Object.values(kyc).filter((k:any)=>k.status==="rejected").length}</div><div className="adm-stat-label">Rejected</div></div>
              </div>

              {pendingKyc.length===0
                ?<div className="empty">📭 No pending KYC submissions.</div>
                :<div className="adm-table-wrap">
                  <table>
                    <thead><tr><th>User</th><th>Document</th><th>Submitted</th><th>Status</th></tr></thead>
                    <tbody>{(pendingKyc as any[]).map((k:any)=>(
                      <tr key={k.stepId||k.id} className={`clickable ${selKyc?.stepId===k.stepId?"selected":""}`} onClick={()=>setSelKyc(selKyc?.stepId===k.stepId?null:k)}>
                        <td><div style={{fontWeight:600}}>{k.userName||"Unknown"}</div><div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>{k.userEmail||""}</div></td>
                        <td style={{fontWeight:600}}>{k.title||"KYC Documents"}</td>
                        <td style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{new Date(k.submittedAt||Date.now()).toLocaleDateString()}</td>
                        <td><span className="pill" style={{color:sc(k.status),borderColor:sc(k.status),background:`${sc(k.status)}18`}}>{sl(k.status)}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              }

              {selKyc&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.92rem",color:G,marginBottom:"0.75rem"}}>Review: {selKyc.title||"KYC"}</div>
                  {(selKyc.files||[]).length>0&&(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"0.5rem",marginBottom:"0.85rem"}}>
                      {(selKyc.files||[]).map((f:any)=>(
                        <div key={f.key} style={{background:"#060f0c",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"9px",overflow:"hidden"}}>
                          {f.preview?<img src={f.preview} style={{width:"100%",height:"80px",objectFit:"cover"}} alt={f.label}/>:<div style={{width:"100%",height:"80px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem"}}>📄</div>}
                          <div style={{padding:"0.3rem 0.5rem",fontSize:"0.65rem",color:"#5a8a7a"}}>{f.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea placeholder="Review note..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div style={{display:"flex",gap:"0.6rem"}}>
                    <button className="btn-approve" onClick={()=>approveKyc(selKyc.stepId||selKyc.id)}>✓ Approve</button>
                    <button className="btn-reject"  onClick={()=>rejectKyc(selKyc.stepId||selKyc.id)}>✗ Reject</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── EXCHANGERS ── */}
          {tab==="exchangers"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Exchanger Management</div>
                <div className="adm-sub">Add trusted exchangers to help users deposit</div>
              </div>
              <button onClick={()=>setShowAddEx(!showAddEx)} style={{padding:"0.65rem 1.2rem",border:"none",borderRadius:"10px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",marginBottom:"1rem",fontFamily:"Inter,sans-serif"}}>
                {showAddEx?"Cancel":"+ Add Exchanger"}
              </button>
              {showAddEx&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.88rem",color:G,marginBottom:"0.85rem"}}>New Exchanger</div>
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"e.g. John Doe"},{k:"phone",l:"Phone",p:"+234..."},{k:"whatsapp",l:"WhatsApp",p:"+234..."},{k:"bank",l:"Bank Name",p:"e.g. GTBank"},{k:"accountNo",l:"Account No",p:"10 digits"},{k:"accountName",l:"Account Name",p:"Name"},{k:"network",l:"Crypto Network",p:"TRC-20"},{k:"country",l:"Country",p:"Nigeria"}].map(f=>(
                      <div key={f.k} className="adm-form-field">
                        <label className="adm-form-lbl">{f.l}</label>
                        <input className="adm-form-inp" placeholder={f.p} value={(newEx as any)[f.k]} onChange={e=>setNewEx((p:any)=>({...p,[f.k]:e.target.value}))}/>
                      </div>
                    ))}
                    <div className="adm-form-field" style={{gridColumn:"1/-1"}}>
                      <label className="adm-form-lbl">Wallet Address *</label>
                      <input className="adm-form-inp" placeholder="Crypto wallet address" value={newEx.walletAddress} onChange={e=>setNewEx(p=>({...p,walletAddress:e.target.value}))}/>
                    </div>
                  </div>
                  <button onClick={saveExchanger} style={{width:"100%",marginTop:"0.85rem",padding:"0.75rem",border:"none",borderRadius:"10px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.88rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    Save Exchanger
                  </button>
                </div>
              )}
              {exchangers.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💱</div>No exchangers added yet.</div>
                :exchangers.map((ex:any)=>(
                  <div key={ex.id} className="adm-agent-card">
                    <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.65rem"}}>
                      <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:BG,fontSize:"0.9rem",flexShrink:0}}>
                        {ex.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:"0.88rem"}}>{ex.name}</div>
                        <div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>{ex.network} · {ex.country}</div>
                      </div>
                      <button onClick={()=>deleteExchanger(ex.id)} style={{padding:"0.28rem 0.6rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer"}}>Remove</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.3rem",fontSize:"0.72rem"}}>
                      {[["📱",ex.phone],["💬",ex.whatsapp],["🏦",ex.bank],["💳",ex.accountNo]].filter(([,v])=>v).map(([icon,v],i)=>(
                        <div key={i} style={{color:"#5a8a7a"}}>{icon} <span style={{color:TEXT,fontWeight:500}}>{v}</span></div>
                      ))}
                    </div>
                    <div style={{marginTop:"0.5rem",fontSize:"0.68rem",color:"#5a8a7a"}}>
                      💼 <span style={{fontFamily:"monospace",color:G,wordBreak:"break-all"}}>{ex.walletAddress}</span>
                    </div>
                  </div>
                ))
              }
            </>
          )}

          {/* ── SUPPORT TEAM ── */}
          {tab==="support"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Support Team</div>
                <div className="adm-sub">Manage WhatsApp agents for NEXORA live chat</div>
              </div>
              <div style={{background:"rgba(0,200,150,0.04)",border:`1px solid rgba(0,200,150,0.1)`,borderRadius:"11px",padding:"0.85rem",marginBottom:"1rem",fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
                💡 <b style={{color:G}}>How it works:</b> Add agents below. When users tap the chat bubble on the site, they're taken straight to your agent's WhatsApp with their message pre-filled.
              </div>
              <button onClick={()=>setShowAddAgent(!showAddAgent)} style={{padding:"0.65rem 1.2rem",border:"none",borderRadius:"10px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",marginBottom:"1rem",fontFamily:"Inter,sans-serif"}}>
                {showAddAgent?"Cancel":"+ Add Support Agent"}
              </button>
              {showAddAgent&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.88rem",color:G,marginBottom:"0.85rem"}}>New Agent</div>
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"e.g. Sarah Okafor"},{k:"whatsapp",l:"WhatsApp * (no + or spaces)",p:"2348012345678"},{k:"role",l:"Role",p:"Support Agent"}].map(f=>(
                      <div key={f.k} className="adm-form-field" style={{gridColumn:f.k==="role"?"1/-1":"auto"}}>
                        <label className="adm-form-lbl">{f.l}</label>
                        <input className="adm-form-inp" placeholder={f.p} value={(newAgent as any)[f.k]} onChange={e=>setNewAgent((p:any)=>({...p,[f.k]:e.target.value}))}/>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:"0.65rem",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"8px",padding:"0.6rem",fontSize:"0.72rem",color:"#5a8a7a",lineHeight:1.5}}>
                    📱 Format: country code + number, no spaces.<br/>
                    Example: <b style={{color:TEXT}}>2348012345678</b> = +234 801 234 5678
                  </div>
                  <button onClick={saveAgent} style={{width:"100%",marginTop:"0.85rem",padding:"0.75rem",border:"none",borderRadius:"10px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.88rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    Add Agent
                  </button>
                </div>
              )}
              {supportTeam.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💬</div>No agents yet. Add agents so users can reach you on WhatsApp.</div>
                :supportTeam.map((a:any)=>(
                  <div key={a.id} className="adm-agent-card" style={{opacity:a.active?1:0.6}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                      <div style={{width:"44px",height:"44px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.95rem",color:BG,flexShrink:0}}>
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:"0.9rem"}}>{a.name}</div>
                        <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{a.role}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.3rem",marginTop:"0.2rem",fontSize:"0.7rem",color:"#25d366",fontWeight:600}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          +{a.whatsapp}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                        <button onClick={()=>toggleAgent(a.id)} style={{padding:"0.28rem 0.6rem",border:`1px solid ${a.active?"rgba(0,200,150,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:"7px",background:a.active?"rgba(0,200,150,0.08)":"rgba(255,255,255,0.04)",color:a.active?G:"#5a8a7a",fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>
                          {a.active?"Active":"Inactive"}
                        </button>
                        <button onClick={()=>deleteAgent(a.id)} style={{padding:"0.28rem 0.6rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer"}}>
                          Remove
                        </button>
                      </div>
                    </div>
                    {a.active&&(
                      <a href={`https://wa.me/${a.whatsapp}?text=Hello%20NEXORA%20Support`} target="_blank" rel="noreferrer"
                        style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",marginTop:"0.65rem",padding:"0.32rem 0.75rem",background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.2)",borderRadius:"8px",color:"#25d366",fontSize:"0.7rem",fontWeight:600,textDecoration:"none"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Test WhatsApp
                      </a>
                    )}
                  </div>
                ))
              }
            </>
          )}


          {tab==="wallets"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Platform Wallets</div>
                <div className="adm-sub">Manage deposit wallet addresses shown to users</div>
              </div>

              <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"11px",padding:"0.85rem",marginBottom:"1rem",fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
                💡 These wallet addresses are shown to users on the <b style={{color:"#00c896"}}>Deposit</b> page. Update them anytime from here.
              </div>

              <button onClick={()=>setShowAddWallet(!showAddWallet)} style={{padding:"0.65rem 1.2rem",border:"none",borderRadius:"10px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.86rem",color:"#050f0c",cursor:"pointer",marginBottom:"1rem",fontFamily:"Inter,sans-serif"}}>
                {showAddWallet?"Cancel":"+ Add New Wallet"}
              </button>

              {showAddWallet&&(
                <div className="adm-form" style={{marginBottom:"1rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.88rem",color:"#00c896",marginBottom:"0.85rem"}}>New Wallet</div>
                  <div className="adm-form-grid">
                    {[
                      {k:"coin",    l:"Coin Name",  p:"e.g. USDT, Bitcoin, BNB"},
                      {k:"symbol",  l:"Symbol",      p:"e.g. USDT, BTC, BNB"},
                      {k:"network", l:"Network",     p:"e.g. TRC-20, ERC-20, BEP-20"},
                    ].map(f=>(
                      <div key={f.k} className="adm-form-field">
                        <label className="adm-form-lbl">{f.l}</label>
                        <input className="adm-form-inp" placeholder={f.p} value={(newWallet as any)[f.k]} onChange={e=>setNewWallet((p:any)=>({...p,[f.k]:e.target.value}))}/>
                      </div>
                    ))}
                    <div className="adm-form-field" style={{gridColumn:"1/-1"}}>
                      <label className="adm-form-lbl">Wallet Address *</label>
                      <input className="adm-form-inp" placeholder="Full wallet address" value={newWallet.address} onChange={e=>setNewWallet(p=>({...p,address:e.target.value}))}/>
                    </div>
                  </div>
                  <button onClick={saveWallet} style={{width:"100%",marginTop:"0.85rem",padding:"0.75rem",border:"none",borderRadius:"10px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.88rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    Save Wallet
                  </button>
                </div>
              )}

              {wallets.length===0?(
                <div style={{textAlign:"center",padding:"2.5rem",color:"#5a8a7a",background:"#0e1a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"14px"}}>
                  <div style={{fontSize:"2rem",marginBottom:"0.6rem"}}>💼</div>
                  No wallets yet. Add your deposit wallet addresses above.
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                  {wallets.map((w:any)=>(
                    <div key={w.id} style={{background:"#0e1a14",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"14px",padding:"1rem"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.65rem"}}>
                        <div style={{width:"38px",height:"38px",borderRadius:"9px",background:"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",color:"#00c896",flexShrink:0}}>
                          {w.symbol?.charAt(0)||"₮"}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:"0.9rem"}}>{w.coin}</div>
                          <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{w.network}</div>
                        </div>
                        <div style={{display:"flex",gap:"0.4rem"}}>
                          <button onClick={()=>setEditWallet(editWallet?.id===w.id?null:{...w,newAddr:w.address})}
                            style={{padding:"0.28rem 0.65rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"7px",background:"rgba(0,200,150,0.06)",color:"#00c896",fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>
                            ✏️ Edit
                          </button>
                          <button onClick={()=>deleteWallet(w.id)}
                            style={{padding:"0.28rem 0.65rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:"#ff4757",fontSize:"0.68rem",cursor:"pointer"}}>
                            Delete
                          </button>
                        </div>
                      </div>

                      {editWallet?.id===w.id ? (
                        <div>
                          <input
                            style={{width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.25)",borderRadius:"9px",padding:"0.65rem 0.85rem",fontSize:"0.82rem",color:"#e8f8f4",outline:"none",fontFamily:"monospace",marginBottom:"0.5rem"}}
                            value={editWallet.newAddr}
                            onChange={e=>setEditWallet((p:any)=>({...p,newAddr:e.target.value}))}
                            placeholder="New wallet address"
                          />
                          <div style={{display:"flex",gap:"0.5rem"}}>
                            <button onClick={()=>updateWallet(w.id, editWallet.newAddr)}
                              style={{flex:1,padding:"0.55rem",border:"none",borderRadius:"8px",background:"linear-gradient(135deg,#00a87a,#00c896)",color:"#050f0c",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                              ✓ Save Address
                            </button>
                            <button onClick={()=>setEditWallet(null)}
                              style={{padding:"0.55rem 0.9rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"8px",background:"none",color:"#5a8a7a",fontSize:"0.82rem",cursor:"pointer"}}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"8px",padding:"0.6rem 0.75rem"}}>
                          <div style={{fontSize:"0.62rem",color:"#3a6a5a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.25rem"}}>Deposit Address</div>
                          <div style={{fontFamily:"monospace",fontSize:"0.72rem",color:"#00c896",wordBreak:"break-all",lineHeight:1.4}}>{w.address}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}


          {/* CREDIT MODAL */}
          {creditModal&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
              <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"18px",padding:"1.5rem",width:"100%",maxWidth:"380px"}}>
                <div style={{fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.4rem"}}>💰 Credit Savings Payment</div>
                <div style={{fontSize:"0.78rem",color:"#5a8a7a",marginBottom:"1.1rem"}}>
                  Crediting: <b style={{color:"#e8f8f4"}}>{creditModal.name}</b>
                </div>
                {[
                  {l:"Week Number",   v:creditWeek,  set:setCreditWeek, ph:"e.g. 1",   type:"number"},
                  {l:"Amount (USDT)", v:creditAmt,   set:setCreditAmt,  ph:"e.g. 3",   type:"number"},
                  {l:"Note (optional)",v:creditNote, set:setCreditNote, ph:"Payment confirmed", type:"text"},
                ].map(f=>(
                  <div key={f.l} style={{marginBottom:"0.75rem"}}>
                    <label style={{fontSize:"0.65rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:"0.3rem"}}>{f.l}</label>
                    <input
                      type={f.type}
                      style={{width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"9px",padding:"0.65rem 0.85rem",fontSize:"0.88rem",color:"#e8f8f4",outline:"none",fontFamily:"Inter,sans-serif"}}
                      placeholder={f.ph}
                      value={f.v}
                      onChange={e=>f.set(e.target.value)}
                    />
                  </div>
                ))}
                <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"9px",padding:"0.7rem",marginBottom:"1rem",fontSize:"0.75rem",color:"#5a8a7a",lineHeight:1.5}}>
                  ✅ This will mark Week {creditWeek} as <b style={{color:"#00c896"}}>PAID</b> and add <b style={{color:"#00c896"}}>${creditAmt} USDT</b> to their savings total.
                </div>
                <div style={{display:"flex",gap:"0.6rem"}}>
                  <button onClick={creditWallet} style={{flex:1,padding:"0.8rem",border:"none",borderRadius:"10px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.88rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    ✓ Confirm Credit
                  </button>
                  <button onClick={()=>setCreditModal(null)} style={{padding:"0.8rem 1rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.85rem"}}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab==="users"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Users & Wallet Credits</div>
                <div className="adm-sub">View users and credit their weekly savings</div>
              </div>

              <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"11px",padding:"0.85rem",marginBottom:"1rem",fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
                💡 Once a user makes payment and you verify it, click <b style={{color:"#00c896"}}>Credit Wallet</b> to mark their weekly savings as paid and send them a notification.
              </div>

              {/* Users from payments */}
              {payments.length===0?(
                <div className="empty">
                  <div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>👥</div>
                  No users yet. Users appear here after they submit payments.
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                  {/* Group payments by user */}
                  {Array.from(new Map(payments.map((p:any)=>[
                    p.userId||p.user_id,
                    {id:p.userId||p.user_id, name:p.userName||p.user_name||"Unknown", email:p.userEmail||p.user_email||""}
                  ])).values()).map((u:any)=>{
                    const userPays = payments.filter((p:any)=>(p.userId||p.user_id)===u.id);
                    const approved = userPays.filter((p:any)=>p.status==="approved").length;
                    const credits  = userPays.filter((p:any)=>p.type==="savings_credit").length;
                    return (
                      <div key={u.id} style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"14px",padding:"1rem"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"0.7rem",marginBottom:"0.75rem"}}>
                          <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:"#050f0c",flexShrink:0}}>
                            {(u.name||"U").charAt(0).toUpperCase()}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:"0.88rem"}}>{u.name}</div>
                            <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{u.email}</div>
                          </div>
                          <div style={{textAlign:"right",fontSize:"0.7rem",color:"#5a8a7a"}}>
                            <div style={{color:"#00c896",fontWeight:700}}>{credits} weeks credited</div>
                            <div>{approved} payments approved</div>
                          </div>
                        </div>
                        <button
                          onClick={()=>setCreditModal(u)}
                          style={{width:"100%",padding:"0.65rem",border:"none",borderRadius:"10px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.84rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                          💰 Credit Weekly Savings
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </>
  );
}
