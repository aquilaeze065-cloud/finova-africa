"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PW = "nexora2024admin";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const G="#00c896",DG="#00a87a",BG="#050f0c",CARD="#081a14",BORDER="rgba(0,200,150,0.15)",MUTED="#5a8a7a",TEXT="#e8f8f4",RED="#ff4757";

export default function AdminPage() {
  const router = useRouter();
  const [authed,       setAuthed]      = useState(false);
  const [pw,           setPw]          = useState("");
  const [showPw,       setShowPw]      = useState(false);
  const [pwErr,        setPwErr]       = useState(false);
  const [tab,          setTab]         = useState("payments");
  const [payments,     setPayments]    = useState<any[]>([]);
  const [kyc,          setKyc]         = useState<any>({});
  const [exchangers,   setExchangers]  = useState<any[]>([]);
  const [supportTeam,  setSupportTeam] = useState<any[]>([]);
  const [wallets,      setWallets]     = useState<any[]>([]);
  const [referrals,    setReferrals]   = useState<any[]>([]);
  const [selPay,       setSelPay]      = useState<any>(null);
  const [selKyc,       setSelKyc]      = useState<any>(null);
  const [note,         setNote]        = useState("");
  const [toast,        setToast]       = useState("");
  const [newEx,        setNewEx]       = useState({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
  const [showAddEx,    setShowAddEx]   = useState(false);
  const [newAgent,     setNewAgent]    = useState({name:"",whatsapp:"",role:"Support Agent"});
  const [showAddAgent, setShowAddAgent]= useState(false);
  const [newWallet,    setNewWallet]   = useState({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
  const [showAddWallet,setShowAddWallet]=useState(false);
  const [editWallet,   setEditWallet]  = useState<any>(null);
  const [creditModal,  setCreditModal] = useState<any>(null);
  const [creditWeek,   setCreditWeek]  = useState("1");
  const [creditAmt,    setCreditAmt]   = useState("3");

  useEffect(()=>{ if(authed) loadAll(); },[authed]);

  function loadAll() {
    try { setPayments(JSON.parse(localStorage.getItem("nexora_payments")||"[]")); } catch {}
    try { setKyc(JSON.parse(localStorage.getItem("nexora_kyc")||"{}")); } catch {}
    try { setExchangers(JSON.parse(localStorage.getItem("nexora_exchangers")||"[]")); } catch {}
    try { setSupportTeam(JSON.parse(localStorage.getItem("nexora_support_team")||"[]")); } catch {}
    try { setWallets(JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]")); } catch {}
    try { setReferrals(JSON.parse(localStorage.getItem("nexora_referrals")||"[]")); } catch {}
  }

  function login() {
    if (pw===ADMIN_PW) { setAuthed(true); setPwErr(false); }
    else setPwErr(true);
  }

  function showMsg(msg:string) { setToast(msg); setTimeout(()=>setToast(""),3500); }

  function approvePayment(id:string) {
    const updated = payments.map(p=>p.id===id?{...p,status:"approved",reviewNote:note,reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments",JSON.stringify(updated));
    setPayments(updated);
    try {
      const u=JSON.parse(localStorage.getItem("nexora_user")||"{}");
      const pay=payments.find(p=>p.id===id);
      if(pay&&(u.id===pay.userId||u.email===pay.userEmail)){
        u.reg_fee_paid=true;u.account_status="active";
        localStorage.setItem("nexora_user",JSON.stringify(u));
        localStorage.setItem("finova_user",JSON.stringify(u));
      }
    } catch {}
    showMsg("✅ Payment approved!"); setSelPay(null); setNote("");
  }

  function approvePenalty(id:string) {
    const updated=payments.map(p=>p.id===id?{...p,status:"approved",reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments",JSON.stringify(updated));
    setPayments(updated);
    const pay=payments.find(p=>p.id===id);
    if(pay) {
      const savings=JSON.parse(localStorage.getItem("nexora_savings")||"null");
      if(savings?.weeks) {
        savings.weeks=savings.weeks.map((w:any)=>
          (w.week===pay.weekNumber||w.week_number===pay.weekNumber)&&w.status==="penalty_pending"
            ?{...w,status:"paid",paid_amount:4,paidAt:new Date().toISOString(),is_penalty:true}:w
        );
        savings.totalPaid=(savings.totalPaid||0)+4;
        localStorage.setItem("nexora_savings",JSON.stringify(savings));
      }
    }
    showMsg("✅ Penalty approved & week unlocked!"); setSelPay(null); setNote("");
  }

  function rejectPayment(id:string) {
    const updated=payments.map(p=>p.id===id?{...p,status:"rejected",reviewNote:note,reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments",JSON.stringify(updated));
    setPayments(updated);
    showMsg("❌ Rejected."); setSelPay(null); setNote("");
  }

  function approveKyc(id:string) {
    const updated={...kyc,[id]:{...kyc[id],status:"approved",reviewedAt:new Date().toISOString()}};
    localStorage.setItem("nexora_kyc",JSON.stringify(updated));
    setKyc(updated); showMsg("✅ KYC Approved!"); setSelKyc(null);
  }

  function rejectKyc(id:string) {
    const updated={...kyc,[id]:{...kyc[id],status:"rejected",reviewedAt:new Date().toISOString()}};
    localStorage.setItem("nexora_kyc",JSON.stringify(updated));
    setKyc(updated); showMsg("❌ KYC Rejected."); setSelKyc(null);
  }

  function saveExchanger() {
    if(!newEx.name||!newEx.walletAddress){showMsg("Name and wallet address required");return;}
    const ex={...newEx,id:"ex_"+Date.now(),active:true,createdAt:new Date().toISOString()};
    const updated=[...exchangers,ex];
    localStorage.setItem("nexora_exchangers",JSON.stringify(updated));
    setExchangers(updated); setShowAddEx(false);
    setNewEx({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
    showMsg("✅ Exchanger added!");
  }

  function deleteExchanger(id:string) {
    if(!confirm("Delete exchanger?"))return;
    const updated=exchangers.filter(e=>e.id!==id);
    localStorage.setItem("nexora_exchangers",JSON.stringify(updated));
    setExchangers(updated);
  }

  function saveAgent() {
    if(!newAgent.name||!newAgent.whatsapp){showMsg("Name and WhatsApp required");return;}
    const clean=newAgent.whatsapp.replace(/\D/g,"");
    const agent={...newAgent,whatsapp:clean,id:"ag_"+Date.now(),active:true,createdAt:new Date().toISOString()};
    const updated=[...supportTeam,agent];
    localStorage.setItem("nexora_support_team",JSON.stringify(updated));
    setSupportTeam(updated); setShowAddAgent(false);
    setNewAgent({name:"",whatsapp:"",role:"Support Agent"});
    showMsg("✅ Agent added!");
  }

  function toggleAgent(id:string) {
    const updated=supportTeam.map(a=>a.id===id?{...a,active:!a.active}:a);
    localStorage.setItem("nexora_support_team",JSON.stringify(updated));
    setSupportTeam(updated);
  }

  function deleteAgent(id:string) {
    if(!confirm("Remove agent?"))return;
    const updated=supportTeam.filter(a=>a.id!==id);
    localStorage.setItem("nexora_support_team",JSON.stringify(updated));
    setSupportTeam(updated);
  }

  function saveWallet() {
    if(!newWallet.address){showMsg("Wallet address required");return;}
    const w={...newWallet,id:"wal_"+Date.now(),is_active:true,createdAt:new Date().toISOString()};
    const updated=[...wallets,w];
    localStorage.setItem("nexora_platform_wallets",JSON.stringify(updated));
    setWallets(updated); setShowAddWallet(false);
    setNewWallet({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
    showMsg("✅ Wallet added!");
  }

  function updateWallet(id:string,address:string) {
    const updated=wallets.map(w=>w.id===id?{...w,address}:w);
    localStorage.setItem("nexora_platform_wallets",JSON.stringify(updated));
    setWallets(updated); setEditWallet(null);
    showMsg("✅ Wallet address updated!");
  }

  function deleteWallet(id:string) {
    if(!confirm("Delete wallet?"))return;
    const updated=wallets.filter(w=>w.id!==id);
    localStorage.setItem("nexora_platform_wallets",JSON.stringify(updated));
    setWallets(updated);
  }

  function creditWallet() {
    if(!creditModal||!creditWeek||!creditAmt)return;
    const savings=JSON.parse(localStorage.getItem("nexora_savings")||"null");
    if(savings?.weeks){
      const wk=savings.weeks.find((w:any)=>w.week===parseInt(creditWeek)||w.week_number===parseInt(creditWeek));
      if(wk){wk.status="paid";wk.paid_amount=parseFloat(creditAmt);wk.paidAt=new Date().toISOString();}
      savings.totalPaid=(savings.totalPaid||0)+parseFloat(creditAmt);
      localStorage.setItem("nexora_savings",JSON.stringify(savings));
    }
    const pays=JSON.parse(localStorage.getItem("nexora_payments")||"[]");
    pays.unshift({id:"cr_"+Date.now(),userId:creditModal.id,userName:creditModal.name,type:"savings_credit",weekNumber:creditWeek,amount:creditAmt,currency:"USDT",status:"completed",creditedAt:new Date().toISOString()});
    localStorage.setItem("nexora_payments",JSON.stringify(pays));
    showMsg(`✅ Week ${creditWeek} credited ($${creditAmt} USDT) to ${creditModal.name}!`);
    setCreditModal(null);setCreditWeek("1");setCreditAmt("3");
  }

  function exportCSV() {
    const pays=JSON.parse(localStorage.getItem("nexora_payments")||"[]");
    const map=new Map();
    pays.forEach((p:any)=>{
      if(p.userId&&!map.has(p.userId)){
        map.set(p.userId,{name:p.userName||"",email:p.userEmail||"",phone:p.phone||"",date:p.submittedAt?new Date(p.submittedAt).toLocaleDateString("en-GB"):"",status:p.status||""});
      }
    });
    const rows=Array.from(map.values());
    if(!rows.length){showMsg("No data to export yet");return;}
    const headers=["Name","Email","Phone","Registration Date","Status","Contract Expiry","Amount Due","Referrals"];
    const csv=[headers.join(","),...rows.map(r=>[r.name,r.email,r.phone||"N/A",r.date||"N/A",r.status||"pending","Not started","$156 USDT","0"].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download=`nexora-users-${new Date().toISOString().split("T")[0]}.csv`;a.click();
    showMsg("✅ CSV exported!");
  }

  const pending=payments.filter(p=>p.status==="pending");
  const pendingKyc=Object.values(kyc).filter((k:any)=>k.status==="pending");
  const sc=(s:string)=>s==="approved"?G:s==="rejected"?RED:"#f39c12";
  const sl=(s:string)=>s==="approved"?"✓ Approved":s==="rejected"?"✗ Rejected":"⏳ Pending";

  const inp:React.CSSProperties={width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",padding:"0.62rem 0.85rem",fontSize:"0.84rem",color:TEXT,outline:"none",fontFamily:"Inter,sans-serif"};

  const tabs=[
    {id:"payments",icon:"💳",label:"Payments",  badge:pending.length},
    {id:"kyc",     icon:"🪪",label:"KYC",        badge:pendingKyc.length},
    {id:"users",   icon:"👥",label:"Users",       badge:0},
    {id:"referrals",icon:"🎁",label:"Referrals",  badge:0},
    {id:"exchangers",icon:"💱",label:"Exchangers", badge:0},
    {id:"support", icon:"💬",label:"Support",     badge:0},
    {id:"wallets", icon:"💼",label:"Wallets",     badge:0},
  ];

  if(!authed) return (
    <>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}`}</style>
      <div style={{width:"100%",maxWidth:"360px",padding:"1rem"}}>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"20px",padding:"2rem 1.75rem",boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
          <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`linear-gradient(135deg,${G},#0066ff)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem"}}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{fontWeight:800,fontSize:"1.1rem",background:`linear-gradient(135deg,${G},#4dffc3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</div>
            <div style={{fontSize:"0.72rem",color:MUTED,marginTop:"0.15rem"}}>Admin Control Panel</div>
          </div>
          <div style={{background:"rgba(0,200,150,0.05)",border:`1px solid rgba(0,200,150,0.12)`,borderRadius:"10px",padding:"0.55rem",textAlign:"center",fontSize:"0.72rem",color:G,marginBottom:"1.2rem",fontWeight:600}}>🔐 Restricted Access</div>
          <div style={{position:"relative",marginBottom:"0.85rem"}}>
            <input style={{...inp,paddingRight:"2.8rem"}} type={showPw?"text":"password"} placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
            <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:0,top:0,bottom:0,width:"2.5rem",background:"none",border:"none",cursor:"pointer",color:MUTED}}>{showPw?"🙈":"👁"}</button>
          </div>
          {pwErr&&<div style={{fontSize:"0.75rem",color:RED,marginBottom:"0.75rem",textAlign:"center"}}>⚠️ Incorrect password</div>}
          <button onClick={login} style={{width:"100%",padding:"0.88rem",border:"none",borderRadius:"11px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.95rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Enter Dashboard</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;}
        .adm{display:flex;min-height:100vh;}
        .adm-side{width:190px;background:#060f0c;border-right:1px solid rgba(0,200,150,0.08);padding:1.1rem 0.75rem;display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;}
        .adm-logo{font-weight:800;font-size:0.9rem;color:#00c896;margin-bottom:0.1rem;}
        .adm-logo-sub{font-size:0.6rem;color:#3a6a5a;margin-bottom:1.3rem;}
        .adm-nav{display:flex;align-items:center;gap:0.4rem;padding:0.52rem 0.65rem;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;color:#5a8a7a;background:none;text-align:left;margin-bottom:2px;transition:all 0.15s;width:100%;}
        .adm-nav:hover{background:rgba(0,200,150,0.06);color:#e8f8f4;}
        .adm-nav.on{background:#00c896;color:#050f0c;font-weight:700;}
        .adm-badge{margin-left:auto;background:#ff4757;color:#fff;border-radius:10px;padding:0.05rem 0.38rem;font-size:0.58rem;font-weight:700;}
        .adm-main{flex:1;padding:1.4rem;overflow-y:auto;}
        .adm-head{margin-bottom:1.2rem;}
        .adm-title{font-weight:800;font-size:1.15rem;color:#00c896;}
        .adm-sub{font-size:0.72rem;color:#5a8a7a;margin-top:0.12rem;}
        .adm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0.6rem;margin-bottom:1.2rem;}
        .adm-stat{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:11px;padding:0.8rem;text-align:center;}
        .adm-stat-val{font-weight:800;font-size:1.25rem;margin-bottom:0.1rem;}
        .adm-stat-label{font-size:0.64rem;color:#5a8a7a;}
        .adm-sec{font-weight:700;font-size:0.83rem;color:#00c896;margin-bottom:0.6rem;margin-top:0.4rem;}
        .adm-table-wrap{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:13px;overflow:hidden;margin-bottom:0.9rem;overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:400px;}
        th{text-align:left;padding:0.52rem 0.75rem;font-size:0.63rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid rgba(0,200,150,0.07);}
        td{padding:0.62rem 0.75rem;font-size:0.78rem;border-bottom:1px solid rgba(0,200,150,0.04);}
        tr.cr{cursor:pointer;transition:background 0.15s;}tr.cr:hover{background:rgba(0,200,150,0.03);}
        tr.sel{background:rgba(0,200,150,0.06)!important;}
        .pill{display:inline-block;padding:0.15rem 0.48rem;border-radius:20px;font-weight:600;font-size:0.64rem;border:1px solid;}
        .adm-detail{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:13px;padding:1.05rem;margin-top:0.9rem;}
        .adm-proof{width:100%;max-height:150px;object-fit:contain;border-radius:8px;margin-bottom:0.75rem;border:1px solid rgba(0,200,150,0.08);background:#060f0c;}
        .adm-no-proof{height:70px;background:#060f0c;border:1px solid rgba(0,200,150,0.07);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#5a8a7a;font-size:0.75rem;margin-bottom:0.75rem;}
        .info-row{display:flex;justify-content:space-between;padding:0.32rem 0;border-bottom:1px solid rgba(0,200,150,0.05);font-size:0.74rem;}
        .info-row:last-child{border-bottom:none;}
        textarea{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.58rem 0.75rem;font-size:0.82rem;color:#e8f8f4;outline:none;resize:vertical;min-height:55px;margin-bottom:0.75rem;font-family:"Inter",sans-serif;}
        .btn-approve{flex:1;padding:0.7rem;border:none;border-radius:9px;background:linear-gradient(135deg,#00a87a,#00c896);font-weight:700;font-size:0.84rem;color:#050f0c;cursor:pointer;font-family:"Inter",sans-serif;}
        .btn-reject{flex:1;padding:0.7rem;border:none;border-radius:9px;background:linear-gradient(135deg,#c0392b,#ff4757);font-weight:700;font-size:0.84rem;color:#fff;cursor:pointer;font-family:"Inter",sans-serif;}
        .empty{text-align:center;padding:2.2rem 1rem;color:#5a8a7a;font-size:0.8rem;}
        .toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.6rem 1.2rem;font-weight:700;font-size:0.82rem;z-index:999;animation:tIn 0.3s ease;white-space:nowrap;color:#00c896;box-shadow:0 8px 32px rgba(0,0,0,0.6);}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .adm-form{background:#060f0c;border:1px solid rgba(0,200,150,0.12);border-radius:13px;padding:1.05rem;margin-bottom:1rem;}
        .adm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;}
        .adm-form-field{display:flex;flex-direction:column;gap:0.25rem;}
        .adm-form-lbl{font-size:0.61rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
        .adm-form-inp{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.56rem 0.72rem;font-size:0.8rem;color:#e8f8f4;outline:none;width:100%;font-family:"Inter",sans-serif;}
        .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal-card{background:#081a14;border:1px solid rgba(0,200,150,0.2);border-radius:18px;padding:1.4rem;width:100%;max-width:380px;}
        @media(max-width:768px){.adm{flex-direction:column;}.adm-side{width:100%;height:auto;flex-direction:row;flex-wrap:wrap;gap:0.25rem;padding:0.6rem;position:relative;}.adm-logo-sub{display:none;}.adm-stats{grid-template-columns:1fr 1fr;}.adm-main{padding:0.85rem;}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      {/* CREDIT MODAL */}
      {creditModal&&(
        <div className="modal-ov" onClick={()=>setCreditModal(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:"0.95rem",color:G,marginBottom:"0.4rem"}}>💰 Credit Savings Payment</div>
            <div style={{fontSize:"0.76rem",color:MUTED,marginBottom:"1rem"}}>Crediting: <b style={{color:TEXT}}>{creditModal.name}</b></div>
            {[{l:"Week Number",v:creditWeek,s:setCreditWeek,p:"e.g. 1"},{l:"Amount (USDT)",v:creditAmt,s:setCreditAmt,p:"e.g. 3"}].map(f=>(
              <div key={f.l} style={{marginBottom:"0.7rem"}}>
                <label style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:"0.28rem"}}>{f.l}</label>
                <input type="number" style={{...inp}} placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)}/>
              </div>
            ))}
            <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.65rem",marginBottom:"0.9rem",fontSize:"0.73rem",color:MUTED,lineHeight:1.5}}>
              This marks Week {creditWeek} as <b style={{color:G}}>PAID</b> and adds <b style={{color:G}}>${creditAmt} USDT</b> to their savings.
            </div>
            <div style={{display:"flex",gap:"0.6rem"}}>
              <button onClick={creditWallet} className="btn-approve">✓ Confirm Credit</button>
              <button onClick={()=>setCreditModal(null)} style={{padding:"0.7rem 0.9rem",border:`1px solid rgba(0,200,150,0.12)`,borderRadius:"9px",background:"none",color:MUTED,cursor:"pointer",fontSize:"0.84rem"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="adm">
        {/* SIDEBAR */}
        <aside className="adm-side">
          <div style={{marginBottom:"1rem"}}>
            <div className="adm-logo">◈ NEXORA</div>
            <div className="adm-logo-sub">Admin Panel</div>
          </div>
          {tabs.map(t=>(
            <button key={t.id} className={`adm-nav ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
              {t.icon} {t.label}
              {t.badge>0&&<span className="adm-badge">{t.badge}</span>}
            </button>
          ))}
          <div style={{marginTop:"auto",paddingTop:"0.7rem",borderTop:"1px solid rgba(0,200,150,0.07)"}}>
            <button className="adm-nav" onClick={loadAll} style={{color:G}}>🔄 Refresh</button>
            <button className="adm-nav" onClick={()=>router.push("/dashboard")} style={{color:MUTED}}>🏠 View Site</button>
            <button className="adm-nav" style={{color:RED}} onClick={()=>setAuthed(false)}>🚪 Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="adm-main">

          {/* PAYMENTS */}
          {tab==="payments"&&(
            <>
              <div className="adm-head"><div className="adm-title">Payment Approvals</div><div className="adm-sub">Review registration and penalty payments</div></div>
              <div className="adm-stats">
                <div className="adm-stat"><div className="adm-stat-val" style={{color:"#f39c12"}}>{pending.length}</div><div className="adm-stat-label">Pending</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:G}}>{payments.filter(p=>p.status==="approved").length}</div><div className="adm-stat-label">Approved</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:RED}}>{payments.filter(p=>p.status==="rejected").length}</div><div className="adm-stat-label">Rejected</div></div>
              </div>
              <div className="adm-sec">⏳ Pending ({pending.length})</div>
              {pending.length===0
                ?<div className="empty">📭 No pending payments yet.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>{pending.map((p:any)=>(
                    <tr key={p.id} className={`cr ${selPay?.id===p.id?"sel":""}`} onClick={()=>setSelPay(selPay?.id===p.id?null:p)}>
                      <td><div style={{fontWeight:600}}>{p.userName||"Unknown"}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{p.userEmail||""}</div></td>
                      <td><span style={{fontSize:"0.72rem",color:p.type==="penalty"?RED:G,fontWeight:600}}>{p.type==="penalty"?"⚠️ PENALTY":"Registration"}</span></td>
                      <td style={{fontWeight:700,color:G}}>{p.amount} {p.currency}</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(p.submittedAt||Date.now()).toLocaleDateString()}</td>
                      <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selPay&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.8rem"}}>Review Payment</div>
                  {selPay.type==="penalty"&&<div style={{background:"rgba(255,71,87,0.08)",border:`1px solid rgba(255,71,87,0.2)`,borderRadius:"9px",padding:"0.65rem",marginBottom:"0.75rem",fontSize:"0.76rem",color:RED}}>⚠️ This is a LATE PENALTY payment ($4 USDT). Approve to unlock Week {selPay.weekNumber}.</div>}
                  <div style={{display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.75rem",background:"rgba(0,200,150,0.04)",borderRadius:"9px",marginBottom:"0.8rem"}}>
                    <div style={{width:"36px",height:"36px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:BG,fontSize:"0.85rem",flexShrink:0}}>{(selPay.userName||"U").charAt(0).toUpperCase()}</div>
                    <div><div style={{fontWeight:700,fontSize:"0.86rem"}}>{selPay.userName||"Unknown"}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{selPay.userEmail||""}</div></div>
                  </div>
                  {[["Amount",`${selPay.amount} ${selPay.currency}`],["Network",selPay.network||"N/A"],["TX Hash",selPay.txHash||"Not provided"],["Submitted",new Date(selPay.submittedAt||Date.now()).toLocaleString()]].map(([l,v])=>(
                    <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,maxWidth:"60%",textAlign:"right",fontSize:"0.72rem",wordBreak:"break-all"}}>{v}</span></div>
                  ))}
                  <div style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0.7rem 0 0.35rem"}}>Screenshot</div>
                  {selPay.screenshot||selPay.screenshot_url
                    ?<img src={selPay.screenshot||selPay.screenshot_url} className="adm-proof" alt="proof"/>
                    :<div className="adm-no-proof">📄 No image uploaded</div>
                  }
                  <textarea placeholder="Review note (optional)..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div style={{display:"flex",gap:"0.6rem"}}>
                    <button className="btn-approve" onClick={()=>selPay.type==="penalty"?approvePenalty(selPay.id):approvePayment(selPay.id)}>
                      ✓ {selPay.type==="penalty"?"Approve & Unlock Week":"Approve & Activate"}
                    </button>
                    <button className="btn-reject" onClick={()=>rejectPayment(selPay.id)}>✗ Reject</button>
                  </div>
                </div>
              )}
              {payments.filter(p=>p.status!=="pending").length>0&&(
                <>
                  <div className="adm-sec" style={{marginTop:"1.1rem"}}>📁 Reviewed ({payments.filter(p=>p.status!=="pending").length})</div>
                  <div className="adm-table-wrap"><table>
                    <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>{payments.filter(p=>p.status!=="pending").map((p:any)=>(
                      <tr key={p.id}>
                        <td><div style={{fontWeight:600}}>{p.userName||"Unknown"}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{p.userEmail||""}</div></td>
                        <td style={{fontSize:"0.72rem"}}>{p.type==="penalty"?"⚠️ Penalty":"Registration"}</td>
                        <td style={{fontWeight:700,color:G}}>{p.amount} {p.currency}</td>
                        <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(p.submittedAt||Date.now()).toLocaleDateString()}</td>
                        <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </>
              )}
            </>
          )}

          {/* KYC */}
          {tab==="kyc"&&(
            <>
              <div className="adm-head"><div className="adm-title">KYC Reviews</div><div className="adm-sub">Review identity verification documents</div></div>
              {pendingKyc.length===0
                ?<div className="empty">📭 No pending KYC submissions.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Document</th><th>Submitted</th><th>Status</th></tr></thead>
                  <tbody>{(pendingKyc as any[]).map((k:any)=>(
                    <tr key={k.stepId||k.id} className={`cr ${selKyc?.stepId===k.stepId?"sel":""}`} onClick={()=>setSelKyc(selKyc?.stepId===k.stepId?null:k)}>
                      <td><div style={{fontWeight:600}}>{k.userName||"Unknown"}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{k.userEmail||""}</div></td>
                      <td style={{fontWeight:600}}>{k.title||"KYC Documents"}</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(k.submittedAt||Date.now()).toLocaleDateString()}</td>
                      <td><span className="pill" style={{color:sc(k.status),borderColor:sc(k.status),background:`${sc(k.status)}18`}}>{sl(k.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selKyc&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.7rem"}}>Review: {selKyc.title||"KYC"}</div>
                  {(selKyc.files||[]).length>0&&(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:"0.5rem",marginBottom:"0.8rem"}}>
                      {(selKyc.files||[]).map((f:any)=>(
                        <div key={f.key} style={{background:"#060f0c",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"8px",overflow:"hidden"}}>
                          {f.preview?<img src={f.preview} style={{width:"100%",height:"75px",objectFit:"cover"}} alt={f.label}/>:<div style={{width:"100%",height:"75px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>📄</div>}
                          <div style={{padding:"0.28rem 0.45rem",fontSize:"0.63rem",color:MUTED}}>{f.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea placeholder="Review note..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div style={{display:"flex",gap:"0.6rem"}}>
                    <button className="btn-approve" onClick={()=>approveKyc(selKyc.stepId||selKyc.id)}>✓ Approve</button>
                    <button className="btn-reject" onClick={()=>rejectKyc(selKyc.stepId||selKyc.id)}>✗ Reject</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* USERS */}
          {tab==="users"&&(
            <>
              <div className="adm-head"><div className="adm-title">Users & Credits</div><div className="adm-sub">View users and credit their weekly savings</div></div>
              <div style={{display:"flex",gap:"0.6rem",marginBottom:"1rem"}}>
                <button onClick={exportCSV} style={{padding:"0.65rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                  📥 Export CSV / Excel
                </button>
              </div>
              <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"10px",padding:"0.8rem",marginBottom:"1rem",fontSize:"0.74rem",color:MUTED,lineHeight:1.6}}>
                💡 Once a user pays, click <b style={{color:G}}>Credit</b> to mark their week as paid and notify them.
              </div>
              {payments.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>👥</div>No users yet. Users appear after they submit payments.</div>
                :<div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                  {Array.from(new Map(payments.map((p:any)=>[p.userId||p.user_id,{id:p.userId||p.user_id,name:p.userName||p.user_name||"Unknown",email:p.userEmail||p.user_email||""}])).values()).map((u:any)=>(
                    <div key={u.id} style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"13px",padding:"0.95rem"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.7rem"}}>
                        <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.88rem",color:BG,flexShrink:0}}>{(u.name||"U").charAt(0).toUpperCase()}</div>
                        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.86rem"}}>{u.name}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{u.email}</div></div>
                        <div style={{fontSize:"0.7rem",color:MUTED,textAlign:"right"}}>{payments.filter((p:any)=>(p.userId||p.user_id)===u.id&&p.type==="savings_credit").length} weeks credited</div>
                      </div>
                      <button onClick={()=>setCreditModal(u)} style={{width:"100%",padding:"0.6rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                        💰 Credit Weekly Savings
                      </button>
                    </div>
                  ))}
                </div>
              }
            </>
          )}

          {/* REFERRALS */}
          {tab==="referrals"&&(
            <>
              <div className="adm-head"><div className="adm-title">Referral Program</div><div className="adm-sub">$5 USDT bonus per successful referral</div></div>
              <div className="adm-stats">
                <div className="adm-stat"><div className="adm-stat-val" style={{color:G}}>{referrals.length}</div><div className="adm-stat-label">Total</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:"#f39c12"}}>${referrals.length*5}</div><div className="adm-stat-label">Bonuses Paid</div></div>
                <div className="adm-stat"><div className="adm-stat-val" style={{color:G}}>$5</div><div className="adm-stat-label">Per Referral</div></div>
              </div>
              <button onClick={exportCSV} style={{padding:"0.65rem 1.2rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.84rem",color:BG,cursor:"pointer",marginBottom:"1rem",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                📊 Export All Users to Excel/CSV
              </button>
              {referrals.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🎁</div>No referrals yet. Users share their codes to earn $5 USDT per referral.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>Referrer</th><th>New User</th><th>Bonus</th><th>Date</th></tr></thead>
                  <tbody>{referrals.map((r:any,i:number)=>(
                    <tr key={i}>
                      <td><div style={{fontWeight:600}}>{r.referrerName}</div><div style={{fontSize:"0.67rem",color:MUTED,fontFamily:"monospace"}}>{r.referralCode}</div></td>
                      <td style={{fontSize:"0.78rem"}}>{r.referredName}</td>
                      <td style={{color:G,fontWeight:700}}>$5 USDT</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(r.createdAt||Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
            </>
          )}

          {/* EXCHANGERS */}
          {tab==="exchangers"&&(
            <>
              <div className="adm-head"><div className="adm-title">Exchanger Management</div><div className="adm-sub">Add trusted exchangers for users</div></div>
              <button onClick={()=>setShowAddEx(!showAddEx)} style={{padding:"0.62rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddEx?"Cancel":"+ Add Exchanger"}
              </button>
              {showAddEx&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.8rem"}}>New Exchanger</div>
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"e.g. John Doe"},{k:"phone",l:"Phone",p:"+234..."},{k:"whatsapp",l:"WhatsApp",p:"+234..."},{k:"bank",l:"Bank Name",p:"GTBank"},{k:"accountNo",l:"Account No",p:"10 digits"},{k:"accountName",l:"Account Name",p:"Name"},{k:"network",l:"Crypto Network",p:"TRC-20"}].map(f=>(
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
                  <button onClick={saveExchanger} style={{width:"100%",marginTop:"0.8rem",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Save Exchanger</button>
                </div>
              )}
              {exchangers.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💱</div>No exchangers added yet.</div>
                :exchangers.map((ex:any)=>(
                  <div key={ex.id} style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:BG,fontSize:"0.88rem",flexShrink:0}}>{ex.name.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.86rem"}}>{ex.name}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{ex.network} · {ex.country}</div></div>
                      <button onClick={()=>deleteExchanger(ex.id)} style={{padding:"0.26rem 0.58rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.66rem",cursor:"pointer"}}>Remove</button>
                    </div>
                    <div style={{marginTop:"0.55rem",fontSize:"0.68rem",color:MUTED,fontFamily:"monospace",wordBreak:"break-all"}}>{ex.walletAddress}</div>
                  </div>
                ))
              }
            </>
          )}

          {/* SUPPORT */}
          {tab==="support"&&(
            <>
              <div className="adm-head"><div className="adm-title">Support Team</div><div className="adm-sub">Manage WhatsApp agents for live chat</div></div>
              <button onClick={()=>setShowAddAgent(!showAddAgent)} style={{padding:"0.62rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddAgent?"Cancel":"+ Add Support Agent"}
              </button>
              {showAddAgent&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.8rem"}}>New Agent</div>
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"e.g. Sarah Okafor"},{k:"whatsapp",l:"WhatsApp * (no + or spaces)",p:"2348012345678"},{k:"role",l:"Role",p:"Support Agent"}].map(f=>(
                      <div key={f.k} className="adm-form-field" style={{gridColumn:f.k==="role"?"1/-1":"auto"}}>
                        <label className="adm-form-lbl">{f.l}</label>
                        <input className="adm-form-inp" placeholder={f.p} value={(newAgent as any)[f.k]} onChange={e=>setNewAgent((p:any)=>({...p,[f.k]:e.target.value}))}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveAgent} style={{width:"100%",marginTop:"0.8rem",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Add Agent</button>
                </div>
              )}
              {supportTeam.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💬</div>No agents yet.</div>
                :supportTeam.map((a:any)=>(
                  <div key={a.id} style={{background:"#081a14",border:`1px solid ${a.active?"rgba(0,200,150,0.18)":"rgba(255,255,255,0.05)"}`,borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem",opacity:a.active?1:0.6}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                      <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:BG,flexShrink:0}}>{a.name.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.88rem"}}>{a.name}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{a.role} · +{a.whatsapp}</div></div>
                      <div style={{display:"flex",gap:"0.35rem"}}>
                        <button onClick={()=>toggleAgent(a.id)} style={{padding:"0.26rem 0.58rem",border:`1px solid ${a.active?"rgba(0,200,150,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:"7px",background:a.active?"rgba(0,200,150,0.08)":"rgba(255,255,255,0.04)",color:a.active?G:MUTED,fontSize:"0.66rem",cursor:"pointer",fontWeight:600}}>{a.active?"Active":"Inactive"}</button>
                        <button onClick={()=>deleteAgent(a.id)} style={{padding:"0.26rem 0.58rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.66rem",cursor:"pointer"}}>Remove</button>
                      </div>
                    </div>
                    {a.active&&<a href={`https://wa.me/${a.whatsapp}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"0.3rem",marginTop:"0.6rem",padding:"0.28rem 0.7rem",background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.2)",borderRadius:"7px",color:"#25d366",fontSize:"0.68rem",fontWeight:600,textDecoration:"none"}}>Test WhatsApp Link</a>}
                  </div>
                ))
              }
            </>
          )}

          {/* WALLETS */}
          {tab==="wallets"&&(
            <>
              <div className="adm-head"><div className="adm-title">Platform Wallets</div><div className="adm-sub">Manage deposit wallet addresses shown to users</div></div>
              <button onClick={()=>setShowAddWallet(!showAddWallet)} style={{padding:"0.62rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddWallet?"Cancel":"+ Add Wallet"}
              </button>
              {showAddWallet&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.8rem"}}>New Wallet</div>
                  <div className="adm-form-grid">
                    {[{k:"coin",l:"Coin Name",p:"e.g. USDT"},{k:"symbol",l:"Symbol",p:"USDT"},{k:"network",l:"Network",p:"TRC-20"}].map(f=>(
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
                  <button onClick={saveWallet} style={{width:"100%",marginTop:"0.8rem",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Save Wallet</button>
                </div>
              )}
              {wallets.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💼</div>No wallets added yet.</div>
                :wallets.map((w:any)=>(
                  <div key={w.id} style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.6rem"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.84rem",color:G,flexShrink:0}}>{w.symbol?.charAt(0)||"₮"}</div>
                      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.88rem"}}>{w.coin}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{w.network}</div></div>
                      <div style={{display:"flex",gap:"0.35rem"}}>
                        <button onClick={()=>setEditWallet(editWallet?.id===w.id?null:{...w,newAddr:w.address})} style={{padding:"0.26rem 0.58rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"7px",background:"rgba(0,200,150,0.06)",color:G,fontSize:"0.66rem",cursor:"pointer",fontWeight:600}}>✏️ Edit</button>
                        <button onClick={()=>deleteWallet(w.id)} style={{padding:"0.26rem 0.58rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.66rem",cursor:"pointer"}}>Delete</button>
                      </div>
                    </div>
                    {editWallet?.id===w.id?(
                      <div>
                        <input style={{...inp,marginBottom:"0.45rem",fontFamily:"monospace"}} value={editWallet.newAddr} onChange={e=>setEditWallet((p:any)=>({...p,newAddr:e.target.value}))} placeholder="New wallet address"/>
                        <div style={{display:"flex",gap:"0.45rem"}}>
                          <button onClick={()=>updateWallet(w.id,editWallet.newAddr)} style={{flex:1,padding:"0.52rem",border:"none",borderRadius:"8px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>✓ Save</button>
                          <button onClick={()=>setEditWallet(null)} style={{padding:"0.52rem 0.85rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"8px",background:"none",color:MUTED,fontSize:"0.8rem",cursor:"pointer"}}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"7px",padding:"0.55rem 0.7rem",fontFamily:"monospace",fontSize:"0.7rem",color:G,wordBreak:"break-all"}}>{w.address}</div>
                    )}
                  </div>
                ))
              }
            </>
          )}

        </main>
      </div>
    </>
  );
}
