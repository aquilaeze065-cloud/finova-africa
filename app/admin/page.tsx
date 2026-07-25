"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PW = "nexora2024admin";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const G="#00c896",DG="#00a87a",BG="#050f0c",CARD="#081a14",MUTED="#5a8a7a",TEXT="#e8f8f4",RED="#ff4757",ORANGE="#f39c12";

// ── TYPES ──
type Tab = "dashboard"|"users"|"payments"|"contributions"|"referrals"|"announcements"|"exchangers"|"support"|"wallets"|"withdrawals";

export default function AdminPage() {
  const router = useRouter();
  const [authed,        setAuthed]       = useState(false);
  const [pw,            setPw]           = useState("");
  const [showPw,        setShowPw]       = useState(false);
  const [pwErr,         setPwErr]        = useState(false);
  const [tab,           setTab]          = useState<Tab>("dashboard");
  const [toast,         setToast]        = useState("");
  const [note,          setNote]         = useState("");

  // Data states
  const [payments,      setPayments]     = useState<any[]>([]);
  const [users,         setUsers]        = useState<any[]>([]);
  const [kyc,           setKyc]          = useState<any>({});
  const [exchangers,    setExchangers]   = useState<any[]>([]);
  const [supportTeam,   setSupportTeam]  = useState<any[]>([]);
  const [wallets,       setWallets]      = useState<any[]>([]);
  const [referrals,     setReferrals]    = useState<any[]>([]);
  const [withdrawals,   setWithdrawals]  = useState<any[]>([]);
  const [contributions, setContribs]     = useState<any[]>([]);
  const [announcements, setAnnouncements]= useState<any[]>([]);

  // Selection states
  const [selPay,        setSelPay]       = useState<any>(null);
  const [selWR,         setSelWR]        = useState<any>(null);
  const [selUser,       setSelUser]      = useState<any>(null);
  const [selKyc,        setSelKyc]       = useState<any>(null);
  const [creditModal,   setCreditModal]  = useState<any>(null);
  const [creditWeek,    setCreditWeek]   = useState("1");
  const [creditAmt,     setCreditAmt]    = useState("3");

  // Form states
  const [newEx,         setNewEx]        = useState({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
  const [newAgent,      setNewAgent]     = useState({name:"",whatsapp:"",role:"Support Agent"});
  const [newWallet,     setNewWallet]    = useState({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
  const [editWallet,    setEditWallet]   = useState<any>(null);
  const [showAddEx,     setShowAddEx]    = useState(false);
  const [showAddAgent,  setShowAddAgent] = useState(false);
  const [showAddWallet, setShowAddWallet]= useState(false);

  // Announcement
  const [annTitle,      setAnnTitle]     = useState("");
  const [annBody,       setAnnBody]      = useState("");
  const [annType,       setAnnType]      = useState("info");

  useEffect(()=>{ if(authed) loadAll(); },[authed]);

  function loadAll() {
    try { setPayments(JSON.parse(localStorage.getItem("nexora_payments")||"[]")); } catch {}
    try { setKyc(JSON.parse(localStorage.getItem("nexora_kyc")||"{}")); } catch {}
    try { setExchangers(JSON.parse(localStorage.getItem("nexora_exchangers")||"[]")); } catch {}
    try { setSupportTeam(JSON.parse(localStorage.getItem("nexora_support_team")||"[]")); } catch {}
    try { setWallets(JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]")); } catch {}
    try { setReferrals(JSON.parse(localStorage.getItem("nexora_referrals")||"[]")); } catch {}
    try { setWithdrawals(JSON.parse(localStorage.getItem("nexora_withdrawals")||"[]")); } catch {}
    try { setAnnouncements(JSON.parse(localStorage.getItem("nexora_announcements")||"[]")); } catch {}

    // Build users from payments
    try {
      const pays = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
      const map  = new Map<string,any>();
      pays.forEach((p:any)=>{
        if(!p.userId) return;
        if(!map.has(p.userId)) {
          map.set(p.userId,{
            id:p.userId, name:p.userName||"Unknown", email:p.userEmail||"",
            phone:p.phone||"", status:p.status==="approved"?"active":"pending",
            registeredAt:p.submittedAt||new Date().toISOString(),
            totalPaid:0, weeksPaid:0, payments:[],
          });
        }
        const u = map.get(p.userId);
        u.payments.push(p);
        if(p.type==="savings_credit"&&p.status==="completed") {
          u.totalPaid += parseFloat(p.amount||3);
          u.weeksPaid += 1;
        }
        if(p.status==="approved") u.status="active";
      });
      setUsers(Array.from(map.values()));
    } catch {}

    // Build contributions from payments
    try {
      const pays = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
      const credits = pays.filter((p:any)=>p.type==="savings_credit"||p.type==="savings_payment");
      setContribs(credits);
    } catch {}

    // Fetch from backend
    fetch(`${API}/api/withdrawals/admin/all`).then(r=>r.json()).then(d=>{ if(d.requests) setWithdrawals(d.requests); }).catch(()=>{});
  }

  function showMsg(msg:string) { setToast(msg); setTimeout(()=>setToast(""),3500); }
  const sc=(s:string)=>s==="approved"||s==="active"||s==="confirmed"?G:s==="rejected"||s==="cancelled"?RED:ORANGE;
  const sl=(s:string)=>s==="approved"?"✓ Approved":s==="rejected"?"✗ Rejected":s==="active"?"● Active":s==="pending"?"⏳ Pending":s?.toUpperCase()||"PENDING";
  const inp:React.CSSProperties={width:"100%",background:"rgba(0,200,150,0.04)",border:`1px solid rgba(0,200,150,0.12)`,borderRadius:"9px",padding:"0.62rem 0.85rem",fontSize:"0.84rem",color:TEXT,outline:"none",fontFamily:"Inter,sans-serif"};

  // ── ANALYTICS ──
  const totalUsers   = users.length;
  const activeUsers  = users.filter(u=>u.status==="active").length;
  const totalRevenue = payments.filter(p=>p.status==="approved").reduce((s:number,p:any)=>s+parseFloat(p.amount||0),0);
  const totalSaved   = contributions.filter(c=>c.status==="completed").reduce((s:number,c:any)=>s+parseFloat(c.amount||3),0);
  const pendingPays  = payments.filter(p=>p.status==="pending");
  const pendingWR    = withdrawals.filter(w=>w.status==="pending");
  const weeklyTarget = totalUsers * 3;

  // ── ACTIONS ──
  function approvePayment(id:string) {
    const updated=payments.map(p=>p.id===id?{...p,status:"approved",reviewNote:note,reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments",JSON.stringify(updated)); setPayments(updated);
    showMsg("✅ Payment approved!"); setSelPay(null); setNote("");
  }
  function rejectPayment(id:string) {
    const updated=payments.map(p=>p.id===id?{...p,status:"rejected",reviewNote:note,reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments",JSON.stringify(updated)); setPayments(updated);
    showMsg("❌ Rejected."); setSelPay(null); setNote("");
  }
  function approvePenalty(id:string) {
    const updated=payments.map(p=>p.id===id?{...p,status:"approved",reviewedAt:new Date().toISOString()}:p);
    localStorage.setItem("nexora_payments",JSON.stringify(updated)); setPayments(updated);
    showMsg("✅ Penalty approved!"); setSelPay(null); setNote("");
  }
  async function approveWithdrawal(id:string) {
    const updated=withdrawals.map(w=>w.id===id?{...w,status:"approved",reviewedAt:new Date().toISOString()}:w);
    setWithdrawals(updated);
    await fetch(`${API}/api/withdrawals/admin/approve/${id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note})}).catch(()=>{});
    showMsg("✅ Withdrawal approved!"); setSelWR(null); setNote("");
  }
  async function rejectWithdrawal(id:string) {
    const updated=withdrawals.map(w=>w.id===id?{...w,status:"rejected",reviewedAt:new Date().toISOString()}:w);
    setWithdrawals(updated);
    await fetch(`${API}/api/withdrawals/admin/reject/${id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:note})}).catch(()=>{});
    showMsg("❌ Withdrawal rejected."); setSelWR(null); setNote("");
  }
  function creditWallet() {
    if(!creditModal||!creditWeek||!creditAmt) return;
    const credit={id:"cr_"+Date.now(),userId:creditModal.id,userName:creditModal.name,type:"savings_credit",weekNumber:parseInt(creditWeek),amount:parseFloat(creditAmt),currency:"USDT",status:"completed",creditedAt:new Date().toISOString()};
    const pays=[...payments,credit];
    localStorage.setItem("nexora_payments",JSON.stringify(pays)); setPayments(pays);
    // Update user
    const updUsers=users.map(u=>u.id===creditModal.id?{...u,totalPaid:u.totalPaid+parseFloat(creditAmt),weeksPaid:u.weeksPaid+1,status:"active"}:u);
    setUsers(updUsers);
    showMsg(`✅ Week ${creditWeek} credited $${creditAmt} to ${creditModal.name}`);
    setCreditModal(null); setCreditWeek("1"); setCreditAmt("3");
  }
  function approveReferral(id:string) {
    const updated=referrals.map(r=>r.id===id?{...r,status:"paid",paidAt:new Date().toISOString()}:r);
    localStorage.setItem("nexora_referrals",JSON.stringify(updated)); setReferrals(updated);
    showMsg("✅ Referral bonus marked as paid!");
  }
  function sendAnnouncement() {
    if(!annTitle||!annBody) { showMsg("Title and message required"); return; }
    const ann={id:"ann_"+Date.now(),title:annTitle,body:annBody,type:annType,sentAt:new Date().toISOString(),sentBy:"Admin",recipients:totalUsers};
    const updated=[ann,...announcements];
    localStorage.setItem("nexora_announcements",JSON.stringify(updated)); setAnnouncements(updated);
    // Add to all users' notifications
    const notifs=JSON.parse(localStorage.getItem("nexora_notifications")||"[]");
    notifs.unshift({id:Date.now().toString(),type:annType,title:`📢 ${annTitle}`,body:annBody,read:false,time:new Date(),icon:annType==="warning"?"⚠️":annType==="success"?"✅":"📢"});
    localStorage.setItem("nexora_notifications",JSON.stringify(notifs));
    setAnnTitle(""); setAnnBody(""); setAnnType("info");
    showMsg(`✅ Announcement sent to ${totalUsers} users!`);
  }
  function saveExchanger() {
    if(!newEx.name||!newEx.walletAddress){showMsg("Name and wallet address required");return;}
    const ex={...newEx,id:"ex_"+Date.now(),active:true,protected:true,createdAt:new Date().toISOString()};
    const updated=[...exchangers,ex];
    localStorage.setItem("nexora_exchangers",JSON.stringify(updated)); setExchangers(updated);
    setShowAddEx(false); setNewEx({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
    showMsg("✅ Exchanger added!");
  }
  function deleteExchanger(id:string) {
    if(!confirm("Are you sure you want to permanently delete this exchanger? This cannot be undone.")) return;
    const updated=exchangers.filter(e=>e.id!==id);
    localStorage.setItem("nexora_exchangers",JSON.stringify(updated)); setExchangers(updated);
    showMsg("Exchanger deleted.");
  }
  function saveAgent() {
    if(!newAgent.name||!newAgent.whatsapp){showMsg("Name and WhatsApp required");return;}
    const agent={...newAgent,whatsapp:newAgent.whatsapp.replace(/\D/g,""),id:"ag_"+Date.now(),active:true,protected:true,createdAt:new Date().toISOString()};
    const updated=[...supportTeam,agent];
    localStorage.setItem("nexora_support_team",JSON.stringify(updated)); setSupportTeam(updated);
    setShowAddAgent(false); setNewAgent({name:"",whatsapp:"",role:"Support Agent"});
    showMsg("✅ Agent added!");
  }
  function toggleAgent(id:string) {
    const updated=supportTeam.map(a=>a.id===id?{...a,active:!a.active}:a);
    localStorage.setItem("nexora_support_team",JSON.stringify(updated)); setSupportTeam(updated);
  }
  function deleteAgent(id:string) {
    if(!confirm("Are you sure you want to permanently remove this support agent? This cannot be undone.")) return;
    const updated=supportTeam.filter(a=>a.id!==id);
    localStorage.setItem("nexora_support_team",JSON.stringify(updated)); setSupportTeam(updated);
    showMsg("Agent removed.");
  }
  function saveWallet() {
    if(!newWallet.address){showMsg("Wallet address required");return;}
    const w={...newWallet,id:"wal_"+Date.now(),is_active:true,createdAt:new Date().toISOString()};
    const updated=[...wallets,w];
    localStorage.setItem("nexora_platform_wallets",JSON.stringify(updated)); setWallets(updated);
    setShowAddWallet(false); setNewWallet({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
    showMsg("✅ Wallet added!");
  }
  function updateWallet(id:string,addr:string) {
    const updated=wallets.map(w=>w.id===id?{...w,address:addr}:w);
    localStorage.setItem("nexora_platform_wallets",JSON.stringify(updated)); setWallets(updated);
    setEditWallet(null); showMsg("✅ Wallet updated!");
  }
  function deleteWallet(id:string) {
    if(!confirm("Delete this wallet address? Users will no longer see it for deposits.")) return;
    const updated=wallets.filter(w=>w.id!==id);
    localStorage.setItem("nexora_platform_wallets",JSON.stringify(updated)); setWallets(updated);
    showMsg("Wallet deleted.");
  }
  function exportUsers() {
    const headers=["Name","Email","Phone","Registered","Status","Weeks Paid","Total Saved","Referrals"];
    const rows=users.map(u=>[u.name,u.email,u.phone||"N/A",new Date(u.registeredAt||Date.now()).toLocaleDateString("en-GB"),u.status,u.weeksPaid||0,"$"+(u.totalPaid||0).toFixed(2),referrals.filter((r:any)=>r.referrerId===u.id).length].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
    const csv=[headers.join(","),...rows].join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`nexora-users-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    showMsg("✅ Users exported to CSV!");
  }

  const TABS=[
    {id:"dashboard",    icon:"📊",label:"Dashboard",   badge:0},
    {id:"users",        icon:"👥",label:"Users",        badge:totalUsers},
    {id:"payments",     icon:"💳",label:"Payments",     badge:pendingPays.length},
    {id:"contributions",icon:"📈",label:"Savings",      badge:0},
    {id:"referrals",    icon:"🎁",label:"Referrals",    badge:referrals.filter((r:any)=>r.status==="pending").length},
    {id:"announcements",icon:"📢",label:"Announce",     badge:0},
    {id:"withdrawals",  icon:"⬇️", label:"Withdrawals",  badge:pendingWR.length},
    {id:"exchangers",   icon:"💱",label:"Exchangers",   badge:0},
    {id:"support",      icon:"💬",label:"Support",      badge:0},
    {id:"wallets",      icon:"💼",label:"Wallets",      badge:0},
  ];

  if(!authed) return (
    <>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}`}</style>
      <div style={{width:"100%",maxWidth:"360px",padding:"1rem"}}>
        <div style={{background:CARD,border:`1px solid rgba(0,200,150,0.2)`,borderRadius:"20px",padding:"2rem 1.75rem",boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
          <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`linear-gradient(135deg,${G},#0066ff)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem"}}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{fontWeight:800,fontSize:"1.1rem",background:`linear-gradient(135deg,${G},#4dffc3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</div>
            <div style={{fontSize:"0.72rem",color:MUTED,marginTop:"0.15rem"}}>Admin Control Panel</div>
          </div>
          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.55rem",textAlign:"center",fontSize:"0.72rem",color:G,marginBottom:"1.2rem",fontWeight:600}}>🔐 Restricted Access — Authorized Personnel Only</div>
          <div style={{position:"relative",marginBottom:"0.85rem"}}>
            <input style={{...inp,paddingRight:"2.8rem"}} type={showPw?"text":"password"} placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pw===ADMIN_PW?setAuthed(true):setPwErr(true))}/>
            <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:0,top:0,bottom:0,width:"2.5rem",background:"none",border:"none",cursor:"pointer",color:MUTED}}>{showPw?"🙈":"👁"}</button>
          </div>
          {pwErr&&<div style={{fontSize:"0.75rem",color:RED,marginBottom:"0.75rem",textAlign:"center"}}>⚠️ Incorrect password. Try again.</div>}
          <button onClick={()=>pw===ADMIN_PW?setAuthed(true):setPwErr(true)} style={{width:"100%",padding:"0.88rem",border:"none",borderRadius:"11px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.95rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            Enter Admin Dashboard
          </button>
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
        .adm-side{width:195px;background:#060f0c;border-right:1px solid rgba(0,200,150,0.08);padding:1rem 0.75rem;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;flex-shrink:0;}
        .adm-main{flex:1;padding:1.4rem;overflow-y:auto;max-width:calc(100vw - 195px);}
        .adm-nav{display:flex;align-items:center;gap:0.45rem;padding:0.52rem 0.65rem;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;color:#5a8a7a;background:none;text-align:left;margin-bottom:2px;transition:all 0.15s;width:100%;font-family:"Inter",sans-serif;}
        .adm-nav:hover{background:rgba(0,200,150,0.06);color:#e8f8f4;}
        .adm-nav.on{background:#00c896;color:#050f0c;font-weight:700;}
        .adm-badge{margin-left:auto;background:#ff4757;color:#fff;border-radius:10px;padding:0.05rem 0.38rem;font-size:0.58rem;font-weight:700;min-width:18px;text-align:center;}
        .adm-badge.green{background:rgba(0,200,150,0.2);color:#00c896;}
        .adm-head{margin-bottom:1.2rem;}
        .adm-title{font-weight:800;font-size:1.15rem;color:#00c896;}
        .adm-sub{font-size:0.72rem;color:#5a8a7a;margin-top:0.12rem;}
        .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.65rem;margin-bottom:1.2rem;}
        .stat-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:14px;padding:1rem;}
        .stat-val{font-weight:800;font-size:1.4rem;margin-bottom:0.15rem;}
        .stat-lbl{font-size:0.64rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.06em;}
        .stat-sub{font-size:0.68rem;color:#3a6a5a;margin-top:0.2rem;}
        .adm-sec{font-weight:700;font-size:0.82rem;color:#00c896;margin:1rem 0 0.6rem;}
        .adm-table-wrap{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:13px;overflow:hidden;margin-bottom:0.9rem;overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:400px;}
        th{text-align:left;padding:0.52rem 0.75rem;font-size:0.63rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid rgba(0,200,150,0.07);white-space:nowrap;}
        td{padding:0.62rem 0.75rem;font-size:0.78rem;border-bottom:1px solid rgba(0,200,150,0.04);}
        tr.cr{cursor:pointer;transition:background 0.15s;}
        tr.cr:hover{background:rgba(0,200,150,0.03);}
        tr.sel{background:rgba(0,200,150,0.06)!important;}
        .pill{display:inline-block;padding:0.15rem 0.5rem;border-radius:20px;font-weight:600;font-size:0.63rem;border:1px solid;}
        .adm-detail{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:13px;padding:1.05rem;margin-top:0.9rem;}
        .info-row{display:flex;justify-content:space-between;padding:0.32rem 0;border-bottom:1px solid rgba(0,200,150,0.05);font-size:0.74rem;}
        .info-row:last-child{border-bottom:none;}
        textarea{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.58rem 0.75rem;font-size:0.82rem;color:#e8f8f4;outline:none;resize:vertical;min-height:55px;margin-bottom:0.75rem;font-family:"Inter",sans-serif;}
        .btn-approve{flex:1;padding:0.7rem;border:none;border-radius:9px;background:linear-gradient(135deg,#00a87a,#00c896);font-weight:700;font-size:0.82rem;color:#050f0c;cursor:pointer;font-family:"Inter",sans-serif;}
        .btn-reject{flex:1;padding:0.7rem;border:none;border-radius:9px;background:linear-gradient(135deg,#c0392b,#ff4757);font-weight:700;font-size:0.82rem;color:#fff;cursor:pointer;font-family:"Inter",sans-serif;}
        .empty{text-align:center;padding:2.5rem 1rem;color:#5a8a7a;font-size:0.82rem;background:#081a14;border:1px solid rgba(0,200,150,0.07);border-radius:13px;}
        .toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.65rem 1.3rem;font-weight:700;font-size:0.82rem;z-index:9999;animation:tIn 0.3s ease;white-space:nowrap;color:#00c896;box-shadow:0 8px 32px rgba(0,0,0,0.6);}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .adm-form{background:#060f0c;border:1px solid rgba(0,200,150,0.12);border-radius:13px;padding:1.05rem;margin-bottom:1rem;}
        .adm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;}
        .adm-form-field{display:flex;flex-direction:column;gap:0.25rem;}
        .adm-form-lbl{font-size:0.61rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
        .adm-form-inp{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.56rem 0.72rem;font-size:0.8rem;color:#e8f8f4;outline:none;width:100%;font-family:"Inter",sans-serif;}
        .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal-card{background:#081a14;border:1px solid rgba(0,200,150,0.2);border-radius:18px;padding:1.4rem;width:100%;max-width:400px;}
        .protect-badge{display:inline-flex;align-items:center;gap:0.3rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:0.18rem 0.55rem;font-size:0.62rem;color:#00c896;font-weight:600;}
        .user-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:13px;padding:0.95rem;margin-bottom:0.6rem;transition:border-color 0.2s;}
        .user-card:hover{border-color:rgba(0,200,150,0.22);}
        .ann-card{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:12px;padding:0.9rem;margin-bottom:0.6rem;}
        .pbar{height:6px;background:rgba(0,200,150,0.08);border-radius:6px;overflow:hidden;}
        .pbar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#00a87a,#00c896);transition:width 0.5s;}
        .proof-img{width:100%;max-height:130px;object-fit:contain;border-radius:8px;border:1px solid rgba(0,200,150,0.1);background:#060f0c;margin-bottom:0.75rem;}
        .no-proof{height:65px;background:#060f0c;border:1px solid rgba(0,200,150,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#5a8a7a;font-size:0.75rem;margin-bottom:0.75rem;}
        @media(max-width:768px){.adm{flex-direction:column;}.adm-side{width:100%;height:auto;flex-direction:row;flex-wrap:wrap;gap:0.2rem;padding:0.6rem;position:relative;}.adm-main{max-width:100%;padding:0.85rem;}.stat-grid{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      {/* CREDIT MODAL */}
      {creditModal&&(
        <div className="modal-ov" onClick={()=>setCreditModal(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:"1rem",color:G,marginBottom:"0.4rem"}}>💰 Credit Weekly Savings</div>
            <div style={{fontSize:"0.76rem",color:MUTED,marginBottom:"1rem"}}>User: <b style={{color:TEXT}}>{creditModal.name}</b></div>
            {[{l:"Week Number",v:creditWeek,s:setCreditWeek,p:"1"},{l:"Amount (USDT)",v:creditAmt,s:setCreditAmt,p:"3"}].map(f=>(
              <div key={f.l} style={{marginBottom:"0.7rem"}}>
                <label style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase" as const,display:"block",marginBottom:"0.28rem"}}>{f.l}</label>
                <input type="number" style={inp} value={f.v} placeholder={f.p} onChange={e=>f.s(e.target.value)}/>
              </div>
            ))}
            <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.65rem",marginBottom:"0.9rem",fontSize:"0.73rem",color:MUTED,lineHeight:1.5}}>
              This marks Week <b style={{color:G}}>{creditWeek}</b> as PAID and adds <b style={{color:G}}>${creditAmt} USDT</b> to {creditModal.name}'s savings.
            </div>
            <div style={{display:"flex",gap:"0.6rem"}}>
              <button onClick={creditWallet} className="btn-approve">✓ Confirm Credit</button>
              <button onClick={()=>setCreditModal(null)} style={{padding:"0.7rem 1rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",background:"none",color:MUTED,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="adm">
        {/* SIDEBAR */}
        <aside className="adm-side">
          <div style={{marginBottom:"1rem",paddingBottom:"0.75rem",borderBottom:"1px solid rgba(0,200,150,0.08)"}}>
            <div style={{fontWeight:800,fontSize:"0.9rem",color:G}}>◈ NEXORA</div>
            <div style={{fontSize:"0.6rem",color:"#3a6a5a"}}>Admin Dashboard</div>
          </div>
          {TABS.map(t=>(
            <button key={t.id} className={`adm-nav ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id as Tab)}>
              <span>{t.icon}</span>
              <span style={{flex:1}}>{t.label}</span>
              {t.badge>0&&<span className={`adm-badge ${t.id==="users"?"green":""}`}>{t.badge}</span>}
            </button>
          ))}
          <div style={{marginTop:"auto",paddingTop:"0.7rem",borderTop:"1px solid rgba(0,200,150,0.07)"}}>
            <button className="adm-nav" onClick={loadAll} style={{color:G}}>🔄 Refresh Data</button>
            <button className="adm-nav" onClick={exportUsers} style={{color:G}}>📥 Export CSV</button>
            <button className="adm-nav" onClick={()=>router.push("/dashboard")} style={{color:MUTED}}>🏠 View Site</button>
            <button className="adm-nav" style={{color:RED}} onClick={()=>setAuthed(false)}>🚪 Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="adm-main">

          {/* ═══ DASHBOARD ═══ */}
          {tab==="dashboard"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Platform Dashboard</div>
                <div className="adm-sub">Real-time overview of NEXORA activity</div>
              </div>

              {/* MAIN STATS */}
              <div className="stat-grid">
                {[
                  {v:totalUsers,      l:"Total Users",       sub:`${activeUsers} active`,           c:G},
                  {v:`$${totalRevenue.toFixed(0)}`,l:"Total Revenue",  sub:"All payments collected",       c:G},
                  {v:`$${totalSaved.toFixed(0)}`,  l:"Total Saved",    sub:"Across all savings plans",     c:"#0066ff"},
                  {v:pendingPays.length,l:"Pending Payments", sub:"Awaiting your approval",          c:ORANGE},
                  {v:pendingWR.length, l:"Withdrawals",       sub:"Awaiting processing",              c:ORANGE},
                  {v:referrals.length, l:"Total Referrals",   sub:`$${referrals.length*1} bonuses`,  c:"#f39c12"},
                  {v:`$${weeklyTarget}`,l:"Weekly Target",    sub:`${totalUsers} users × $3`,        c:G},
                  {v:contributions.length,l:"Contributions",  sub:"Total weekly payments",           c:"#7c3aed"},
                ].map(s=>(
                  <div key={s.l} className="stat-card">
                    <div className="stat-val" style={{color:s.c}}>{s.v}</div>
                    <div className="stat-lbl">{s.l}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* ACTIVITY FEED */}
              <div className="adm-sec">📋 Recent Activity</div>
              <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"13px",overflow:"hidden"}}>
                {[...payments].reverse().slice(0,8).length===0
                  ?<div className="empty">No activity yet.</div>
                  :[...payments].reverse().slice(0,8).map((p:any,i:number)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1rem",borderBottom:"1px solid rgba(0,200,150,0.05)"}}>
                      <div style={{width:"34px",height:"34px",borderRadius:"9px",background:"rgba(0,200,150,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",flexShrink:0}}>
                        {p.type==="savings_credit"?"💰":p.type==="penalty"?"⚠️":"💳"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:"0.82rem"}}>{p.userName||"Unknown"} <span style={{color:MUTED,fontWeight:400}}>— {p.type==="savings_credit"?"Savings Credit":p.type==="penalty"?"Penalty Payment":"Payment"}</span></div>
                        <div style={{fontSize:"0.67rem",color:MUTED}}>{new Date(p.submittedAt||p.creditedAt||Date.now()).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                      <div style={{fontWeight:700,color:G,fontSize:"0.86rem"}}>${parseFloat(p.amount||3).toFixed(2)}</div>
                      <span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span>
                    </div>
                  ))
                }
              </div>

              {/* REVENUE BREAKDOWN */}
              <div className="adm-sec">💹 Revenue Breakdown</div>
              <div className="stat-grid">
                {[
                  {l:"Registration Fees", v:payments.filter(p=>p.type==="registration"&&p.status==="approved").length*4, u:"USDT"},
                  {l:"Penalty Collections",v:payments.filter(p=>p.type==="penalty"&&p.status==="approved").length*4, u:"USDT"},
                  {l:"Weekly Savings",   v:contributions.filter(c=>c.status==="completed").length*3, u:"USDT"},
                  {l:"Active Plans",     v:users.filter(u=>u.weeksPaid>0).length, u:"users"},
                ].map(s=>(
                  <div key={s.l} className="stat-card">
                    <div className="stat-val" style={{color:G}}>{s.u==="USDT"?`$${s.v}`:s.v}</div>
                    <div className="stat-lbl">{s.l}</div>
                    <div className="stat-sub">{s.u!=="users"&&`${s.u} collected`}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ USERS ═══ */}
          {tab==="users"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">All Registered Users</div>
                <div className="adm-sub">{totalUsers} users · {activeUsers} active</div>
              </div>
              <div style={{display:"flex",gap:"0.6rem",marginBottom:"1rem",flexWrap:"wrap"}}>
                <button onClick={exportUsers} style={{padding:"0.58rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.8rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                  📥 Export All to CSV/Excel
                </button>
                <div style={{fontSize:"0.76rem",color:MUTED,display:"flex",alignItems:"center"}}>
                  Total: {totalUsers} · Active: {activeUsers} · Pending: {totalUsers-activeUsers}
                </div>
              </div>
              {users.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>👥</div>No users yet. Users appear here after they register and submit payments.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Status</th><th>Registered</th><th>Weeks Paid</th><th>Total Saved</th><th>Actions</th></tr></thead>
                  <tbody>{users.map((u:any)=>(
                    <tr key={u.id} className={`cr ${selUser?.id===u.id?"sel":""}`} onClick={()=>setSelUser(selUser?.id===u.id?null:u)}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:"0.55rem"}}>
                          <div style={{width:"30px",height:"30px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.78rem",color:BG,flexShrink:0}}>{(u.name||"U").charAt(0).toUpperCase()}</div>
                          <div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{u.email}</div></div>
                        </div>
                      </td>
                      <td><span className="pill" style={{color:sc(u.status),borderColor:sc(u.status),background:`${sc(u.status)}18`}}>{sl(u.status)}</span></td>
                      <td style={{fontSize:"0.72rem",color:MUTED}}>{new Date(u.registeredAt||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
                      <td style={{fontWeight:700,color:G}}>{u.weeksPaid||0}/52</td>
                      <td style={{fontWeight:700,color:G}}>${(u.totalPaid||0).toFixed(2)}</td>
                      <td>
                        <button onClick={e=>{e.stopPropagation();setCreditModal(u);}} style={{padding:"0.28rem 0.65rem",border:"none",borderRadius:"7px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontSize:"0.7rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>💰 Credit</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selUser&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.85rem"}}>User Profile — {selUser.name}</div>
                  {[["Name",selUser.name],["Email",selUser.email],["Phone",selUser.phone||"Not provided"],["Status",selUser.status?.toUpperCase()],["Registered",new Date(selUser.registeredAt||Date.now()).toLocaleString("en-GB")],["Weeks Paid",`${selUser.weeksPaid||0}/52`],["Total Saved",`$${(selUser.totalPaid||0).toFixed(2)} USDT`],["Payments",selUser.payments?.length||0]].map(([l,v])=>(
                    <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.75rem"}}>{v}</span></div>
                  ))}
                  <div style={{marginTop:"0.85rem"}}>
                    <div style={{fontSize:"0.65rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.35rem"}}>Savings Progress</div>
                    <div className="pbar"><div className="pbar-fill" style={{width:`${Math.min(100,((selUser.weeksPaid||0)/52)*100)}%`}}/></div>
                    <div style={{fontSize:"0.68rem",color:MUTED,marginTop:"0.2rem"}}>{Math.round(((selUser.weeksPaid||0)/52)*100)}% complete</div>
                  </div>
                  <button onClick={()=>setCreditModal(selUser)} style={{marginTop:"0.85rem",width:"100%",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.84rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    💰 Credit Weekly Savings
                  </button>
                </div>
              )}
            </>
          )}

          {/* ═══ PAYMENTS ═══ */}
          {tab==="payments"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Payment Approvals</div>
                <div className="adm-sub">Approve or reject registration fees and weekly deposits</div>
              </div>
              <div className="stat-grid">
                <div className="stat-card"><div className="stat-val" style={{color:ORANGE}}>{pendingPays.length}</div><div className="stat-lbl">Pending</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>{payments.filter(p=>p.status==="approved").length}</div><div className="stat-lbl">Approved</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:RED}}>{payments.filter(p=>p.status==="rejected").length}</div><div className="stat-lbl">Rejected</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>${payments.filter(p=>p.status==="approved").reduce((s:number,p:any)=>s+parseFloat(p.amount||0),0).toFixed(0)}</div><div className="stat-lbl">Collected</div></div>
              </div>
              <div className="adm-sec">⏳ Pending ({pendingPays.length})</div>
              {pendingPays.length===0
                ?<div className="empty">No pending payments. All clear! ✅</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>{pendingPays.map((p:any)=>(
                    <tr key={p.id} className={`cr ${selPay?.id===p.id?"sel":""}`} onClick={()=>setSelPay(selPay?.id===p.id?null:p)}>
                      <td><div style={{fontWeight:600}}>{p.userName||"Unknown"}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{p.userEmail||""}</div></td>
                      <td><span style={{fontSize:"0.72rem",color:p.type==="penalty"?RED:G,fontWeight:600}}>{p.type==="penalty"?"⚠️ PENALTY":p.type==="savings_credit"?"💰 Savings":"💳 Registration"}</span></td>
                      <td style={{fontWeight:700,color:G}}>${parseFloat(p.amount||0).toFixed(2)}</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(p.submittedAt||Date.now()).toLocaleDateString("en-GB")}</td>
                      <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selPay&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.8rem"}}>Review Payment</div>
                  {selPay.type==="penalty"&&<div style={{background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"9px",padding:"0.65rem",marginBottom:"0.75rem",fontSize:"0.76rem",color:RED}}>⚠️ PENALTY PAYMENT — $4 USDT. Approve to unlock savings for Week {selPay.weekNumber}.</div>}
                  <div style={{display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.75rem",background:"rgba(0,200,150,0.04)",borderRadius:"9px",marginBottom:"0.8rem"}}>
                    <div style={{width:"36px",height:"36px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:BG,fontSize:"0.85rem",flexShrink:0}}>{(selPay.userName||"U").charAt(0).toUpperCase()}</div>
                    <div><div style={{fontWeight:700,fontSize:"0.86rem"}}>{selPay.userName||"Unknown"}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{selPay.userEmail||""}</div></div>
                  </div>
                  {[["Amount",`$${parseFloat(selPay.amount||0).toFixed(2)} ${selPay.currency||"USDT"}`],["Type",selPay.type||"registration"],["Submitted",new Date(selPay.submittedAt||Date.now()).toLocaleString()]].map(([l,v])=>(
                    <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.72rem"}}>{v}</span></div>
                  ))}
                  <div style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0.75rem 0 0.35rem"}}>Payment Screenshot</div>
                  {selPay.screenshot||selPay.screenshot_url
                    ?<img src={selPay.screenshot||selPay.screenshot_url} className="proof-img" alt="proof"/>
                    :<div className="no-proof">📄 No screenshot uploaded</div>
                  }
                  <textarea placeholder="Review note (optional)..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div style={{display:"flex",gap:"0.6rem"}}>
                    <button className="btn-approve" onClick={()=>selPay.type==="penalty"?approvePenalty(selPay.id):approvePayment(selPay.id)}>✓ Approve</button>
                    <button className="btn-reject" onClick={()=>rejectPayment(selPay.id)}>✗ Reject</button>
                  </div>
                </div>
              )}
              {/* HISTORY */}
              {payments.filter(p=>p.status!=="pending").length>0&&(
                <>
                  <div className="adm-sec">📁 All Payments History</div>
                  <div className="adm-table-wrap"><table>
                    <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>{payments.filter(p=>p.status!=="pending").map((p:any,i:number)=>(
                      <tr key={i}>
                        <td style={{fontWeight:600}}>{p.userName||"Unknown"}</td>
                        <td style={{fontSize:"0.72rem"}}>{p.type==="savings_credit"?"💰 Savings":p.type==="penalty"?"⚠️ Penalty":"💳 Reg Fee"}</td>
                        <td style={{fontWeight:700,color:G}}>${parseFloat(p.amount||0).toFixed(2)}</td>
                        <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(p.submittedAt||p.creditedAt||Date.now()).toLocaleDateString("en-GB")}</td>
                        <td><span className="pill" style={{color:sc(p.status),borderColor:sc(p.status),background:`${sc(p.status)}18`}}>{sl(p.status)}</span></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </>
              )}
            </>
          )}

          {/* ═══ CONTRIBUTIONS / SAVINGS TRACKING ═══ */}
          {tab==="contributions"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Weekly Savings Tracker</div>
                <div className="adm-sub">Track all user weekly contributions</div>
              </div>
              <div className="stat-grid">
                <div className="stat-card"><div className="stat-val" style={{color:G}}>{contributions.filter(c=>c.status==="completed").length}</div><div className="stat-lbl">Weeks Credited</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>${(contributions.filter(c=>c.status==="completed").length*3).toFixed(0)}</div><div className="stat-lbl">Total Collected</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:ORANGE}}>{users.filter(u=>u.weeksPaid===0).length}</div><div className="stat-lbl">Not Started</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>{users.filter(u=>u.weeksPaid>=52).length}</div><div className="stat-lbl">Plan Complete</div></div>
              </div>

              {/* USER SAVINGS OVERVIEW */}
              <div className="adm-sec">📊 User Savings Overview</div>
              {users.length===0
                ?<div className="empty">No savings data yet.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Weeks Paid</th><th>Progress</th><th>Total Saved</th><th>Est. Payout</th><th>Action</th></tr></thead>
                  <tbody>{users.map((u:any)=>{
                    const pct=Math.min(100,((u.weeksPaid||0)/52)*100);
                    const payout=((u.totalPaid||0)*1.35+15).toFixed(2);
                    return (
                      <tr key={u.id}>
                        <td><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{u.email}</div></td>
                        <td style={{fontWeight:700,color:G}}>{u.weeksPaid||0}/52</td>
                        <td style={{minWidth:"100px"}}>
                          <div className="pbar"><div className="pbar-fill" style={{width:pct+"%"}}/></div>
                          <div style={{fontSize:"0.62rem",color:MUTED,marginTop:"0.15rem"}}>{Math.round(pct)}%</div>
                        </td>
                        <td style={{fontWeight:700,color:G}}>${(u.totalPaid||0).toFixed(2)}</td>
                        <td style={{fontSize:"0.76rem",color:"#5a8a7a"}}>${payout}</td>
                        <td>
                          <button onClick={()=>setCreditModal(u)} style={{padding:"0.26rem 0.6rem",border:"none",borderRadius:"7px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>+ Credit</button>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table></div>
              }

              {/* RECENT CREDITS */}
              {contributions.length>0&&(
                <>
                  <div className="adm-sec">💰 Recent Contributions</div>
                  <div className="adm-table-wrap"><table>
                    <thead><tr><th>User</th><th>Week</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>{[...contributions].reverse().slice(0,20).map((c:any,i:number)=>(
                      <tr key={i}>
                        <td style={{fontWeight:600}}>{c.userName||"Unknown"}</td>
                        <td style={{fontWeight:700,color:G}}>Week {c.weekNumber||"?"}</td>
                        <td style={{fontWeight:700,color:G}}>${parseFloat(c.amount||3).toFixed(2)}</td>
                        <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(c.creditedAt||c.submittedAt||Date.now()).toLocaleDateString("en-GB")}</td>
                        <td><span className="pill" style={{color:G,borderColor:G,background:`${G}18`}}>✓ Credited</span></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </>
              )}
            </>
          )}

          {/* ═══ REFERRALS ═══ */}
          {tab==="referrals"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Referral Rewards Manager</div>
                <div className="adm-sub">Track and manage all referral bonuses — $1 USDT per referral</div>
              </div>
              <div className="stat-grid">
                <div className="stat-card"><div className="stat-val" style={{color:G}}>{referrals.length}</div><div className="stat-lbl">Total Referrals</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:ORANGE}}>{referrals.filter((r:any)=>r.status==="pending").length}</div><div className="stat-lbl">Pending Payout</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>{referrals.filter((r:any)=>r.status==="paid").length}</div><div className="stat-lbl">Paid Out</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>${referrals.length.toFixed(0)}</div><div className="stat-lbl">Total Bonuses</div></div>
              </div>
              {referrals.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🎁</div>No referrals yet. Users earn $1 USDT per successful referral.</div>
                :<>
                  <div className="adm-table-wrap"><table>
                    <thead><tr><th>Referrer</th><th>Code</th><th>New User</th><th>Bonus</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>{referrals.map((r:any,i:number)=>(
                      <tr key={i}>
                        <td style={{fontWeight:600}}>{r.referrerName||"Unknown"}</td>
                        <td><span style={{fontFamily:"monospace",fontSize:"0.72rem",color:G}}>{r.referralCode}</span></td>
                        <td style={{fontSize:"0.78rem"}}>{r.referredName||"Unknown"}</td>
                        <td style={{fontWeight:700,color:G}}>$1 USDT</td>
                        <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(r.createdAt||Date.now()).toLocaleDateString("en-GB")}</td>
                        <td><span className="pill" style={{color:r.status==="paid"?G:ORANGE,borderColor:r.status==="paid"?G:ORANGE,background:r.status==="paid"?`${G}18`:`${ORANGE}18`}}>{r.status==="paid"?"✓ Paid":"⏳ Pending"}</span></td>
                        <td>
                          {r.status!=="paid"&&(
                            <button onClick={()=>approveReferral(r.id||String(i))} style={{padding:"0.24rem 0.58rem",border:"none",borderRadius:"6px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Mark Paid</button>
                          )}
                        </td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </>
              }
            </>
          )}

          {/* ═══ ANNOUNCEMENTS ═══ */}
          {tab==="announcements"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Send Announcements</div>
                <div className="adm-sub">Broadcast messages to all {totalUsers} registered users</div>
              </div>

              {/* COMPOSE */}
              <div className="adm-form">
                <div style={{fontWeight:700,fontSize:"0.88rem",color:G,marginBottom:"0.85rem"}}>📢 New Announcement</div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"0.6rem",marginBottom:"0.65rem"}}>
                  <div className="adm-form-field">
                    <label className="adm-form-lbl">Title *</label>
                    <input className="adm-form-inp" placeholder="Announcement title..." value={annTitle} onChange={e=>setAnnTitle(e.target.value)}/>
                  </div>
                  <div className="adm-form-field">
                    <label className="adm-form-lbl">Type</label>
                    <select className="adm-form-inp" value={annType} onChange={e=>setAnnType(e.target.value)} style={{cursor:"pointer"}}>
                      <option value="info">ℹ️ Info</option>
                      <option value="success">✅ Success</option>
                      <option value="warning">⚠️ Warning</option>
                      <option value="bonus">🎁 Bonus</option>
                    </select>
                  </div>
                </div>
                <div className="adm-form-field" style={{marginBottom:"0.75rem"}}>
                  <label className="adm-form-lbl">Message *</label>
                  <textarea style={{minHeight:"80px",margin:0}} placeholder="Write your announcement message here..." value={annBody} onChange={e=>setAnnBody(e.target.value)}/>
                </div>
                <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.6rem",marginBottom:"0.75rem",fontSize:"0.73rem",color:MUTED}}>
                  📡 This will be sent as an in-app notification to all <b style={{color:G}}>{totalUsers} users</b>.
                </div>
                <button onClick={sendAnnouncement} disabled={!annTitle||!annBody} style={{padding:"0.75rem 1.5rem",border:"none",borderRadius:"10px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.88rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif",opacity:!annTitle||!annBody?0.5:1}}>
                  📢 Send to All Users
                </button>
              </div>

              {/* HISTORY */}
              <div className="adm-sec">📋 Sent Announcements ({announcements.length})</div>
              {announcements.length===0
                ?<div className="empty">No announcements sent yet.</div>
                :announcements.map((a:any,i:number)=>(
                  <div key={i} className="ann-card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.4rem"}}>
                      <div style={{fontWeight:700,fontSize:"0.88rem"}}>{a.title}</div>
                      <span style={{fontSize:"0.62rem",color:MUTED,flexShrink:0,marginLeft:"0.5rem"}}>{new Date(a.sentAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                    <div style={{fontSize:"0.78rem",color:MUTED,lineHeight:1.55,marginBottom:"0.4rem"}}>{a.body}</div>
                    <div style={{fontSize:"0.65rem",color:"#3a6a5a"}}>Sent to {a.recipients||0} users · by {a.sentBy||"Admin"}</div>
                  </div>
                ))
              }
            </>
          )}

          {/* ═══ WITHDRAWALS ═══ */}
          {tab==="withdrawals"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Withdrawal Requests</div>
                <div className="adm-sub">Approve or reject withdrawal requests with clearance documents</div>
              </div>
              <div className="stat-grid">
                <div className="stat-card"><div className="stat-val" style={{color:ORANGE}}>{pendingWR.length}</div><div className="stat-lbl">Pending</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>{withdrawals.filter(w=>w.status==="approved").length}</div><div className="stat-lbl">Approved</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:RED}}>{withdrawals.filter(w=>w.status==="rejected").length}</div><div className="stat-lbl">Rejected</div></div>
                <div className="stat-card"><div className="stat-val" style={{color:G}}>${withdrawals.filter(w=>w.status==="approved").reduce((s:number,w:any)=>s+parseFloat(w.amount||0),0).toFixed(0)}</div><div className="stat-lbl">Processed</div></div>
              </div>
              {withdrawals.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>⬇️</div>No withdrawal requests yet.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>{withdrawals.map((w:any,i:number)=>(
                    <tr key={w.id||i} className={`cr ${selWR?.id===w.id?"sel":""}`} onClick={()=>setSelWR(selWR?.id===w.id?null:w)}>
                      <td><div style={{fontWeight:600}}>{w.name||"Unknown"}</div><div style={{fontSize:"0.67rem",color:MUTED}}>{w.email||""}</div></td>
                      <td style={{fontWeight:700,color:G}}>${parseFloat(w.amount||0).toFixed(2)} {w.currency||"USDT"}</td>
                      <td style={{fontSize:"0.72rem"}}>{w.network||"TRC-20"}</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(w.created_at||Date.now()).toLocaleDateString("en-GB")}</td>
                      <td><span className="pill" style={{color:sc(w.status),borderColor:sc(w.status),background:`${sc(w.status)}18`}}>{sl(w.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selWR&&(
                <div className="adm-detail">
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.8rem"}}>Review Withdrawal Request</div>
                  {[["User",selWR.name||"Unknown"],["Amount",`$${parseFloat(selWR.amount||0).toFixed(2)} ${selWR.currency||"USDT"}`],["Wallet",selWR.wallet_address||selWR.walletAddress||"N/A"],["Network",selWR.network||"TRC-20"],["Submitted",new Date(selWR.created_at||Date.now()).toLocaleString()]].map(([l,v])=>(
                    <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.72rem",maxWidth:"60%",textAlign:"right",wordBreak:"break-all"}}>{v}</span></div>
                  ))}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",margin:"0.85rem 0"}}>
                    {selWR.clearance_form_url&&<div><div style={{fontSize:"0.62rem",color:MUTED,marginBottom:"0.25rem"}}>📋 Clearance Form</div><img src={selWR.clearance_form_url} style={{width:"100%",height:"80px",objectFit:"cover",borderRadius:"8px"}} alt="clearance"/></div>}
                    {selWR.payment_receipt_url&&<div><div style={{fontSize:"0.62rem",color:MUTED,marginBottom:"0.25rem"}}>🧾 Payment Receipt</div><img src={selWR.payment_receipt_url} style={{width:"100%",height:"80px",objectFit:"cover",borderRadius:"8px"}} alt="receipt"/></div>}
                  </div>
                  <textarea placeholder="Note or rejection reason..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div style={{display:"flex",gap:"0.6rem"}}>
                    <button className="btn-approve" onClick={()=>approveWithdrawal(selWR.id)}>✓ Approve & Process</button>
                    <button className="btn-reject" onClick={()=>rejectWithdrawal(selWR.id)}>✗ Reject</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ EXCHANGERS ═══ */}
          {tab==="exchangers"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Exchanger Management</div>
                <div className="adm-sub">Only you can add or remove exchangers — they are protected</div>
              </div>
              <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"11px",padding:"0.8rem",marginBottom:"1rem",display:"flex",gap:"0.5rem",alignItems:"center",fontSize:"0.76rem",color:MUTED}}>
                <span style={{fontSize:"1rem"}}>🔐</span>
                <span>Exchangers can only be added or removed by you as the admin. They cannot self-delete or be deleted by anyone else.</span>
              </div>
              <button onClick={()=>setShowAddEx(!showAddEx)} style={{padding:"0.62rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddEx?"Cancel":"+ Add New Exchanger"}
              </button>
              {showAddEx&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.8rem"}}>New Exchanger Details</div>
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"e.g. John Doe"},{k:"phone",l:"Phone",p:"+234..."},{k:"whatsapp",l:"WhatsApp",p:"+234..."},{k:"bank",l:"Bank Name",p:"GTBank"},{k:"accountNo",l:"Account No",p:"10 digits"},{k:"accountName",l:"Account Name",p:"Name"},{k:"network",l:"Crypto Network",p:"TRC-20"}].map(f=>(
                      <div key={f.k} className="adm-form-field">
                        <label className="adm-form-lbl">{f.l}</label>
                        <input className="adm-form-inp" placeholder={f.p} value={(newEx as any)[f.k]} onChange={e=>setNewEx((p:any)=>({...p,[f.k]:e.target.value}))}/>
                      </div>
                    ))}
                    <div className="adm-form-field" style={{gridColumn:"1/-1"}}>
                      <label className="adm-form-lbl">Wallet Address *</label>
                      <input className="adm-form-inp" placeholder="Full wallet address" value={newEx.walletAddress} onChange={e=>setNewEx(p=>({...p,walletAddress:e.target.value}))}/>
                    </div>
                  </div>
                  <button onClick={saveExchanger} style={{width:"100%",marginTop:"0.8rem",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Save Exchanger</button>
                </div>
              )}
              {exchangers.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💱</div>No exchangers added yet.</div>
                :exchangers.map((ex:any)=>(
                  <div key={ex.id} style={{background:CARD,border:"1px solid rgba(0,200,150,0.12)",borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                      <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:BG,fontSize:"0.9rem",flexShrink:0}}>{ex.name.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                          <span style={{fontWeight:700,fontSize:"0.88rem"}}>{ex.name}</span>
                          <span className="protect-badge">🔐 Protected</span>
                        </div>
                        <div style={{fontSize:"0.68rem",color:MUTED,marginTop:"0.1rem"}}>{ex.network} · {ex.country} · {ex.bank&&`${ex.bank} · ${ex.accountNo}`}</div>
                      </div>
                      <button onClick={()=>deleteExchanger(ex.id)} style={{padding:"0.28rem 0.65rem",border:"1px solid rgba(255,71,87,0.25)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>🗑️ Delete</button>
                    </div>
                    {ex.walletAddress&&<div style={{marginTop:"0.55rem",background:"rgba(0,0,0,0.3)",borderRadius:"7px",padding:"0.5rem 0.65rem",fontFamily:"monospace",fontSize:"0.68rem",color:"#3a8a6a",wordBreak:"break-all"}}>{ex.walletAddress}</div>}
                  </div>
                ))
              }
            </>
          )}

          {/* ═══ SUPPORT ═══ */}
          {tab==="support"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Support Team Manager</div>
                <div className="adm-sub">Only you can add or remove support agents — they are protected</div>
              </div>
              <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"11px",padding:"0.8rem",marginBottom:"1rem",display:"flex",gap:"0.5rem",alignItems:"center",fontSize:"0.76rem",color:MUTED}}>
                <span>🔐</span>
                <span>Support agents are protected. Only the admin can add or permanently remove agents. Toggle ON/OFF to control their visibility to users.</span>
              </div>
              <button onClick={()=>setShowAddAgent(!showAddAgent)} style={{padding:"0.62rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddAgent?"Cancel":"+ Add Support Agent"}
              </button>
              {showAddAgent&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.8rem"}}>New Support Agent</div>
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"e.g. Sarah Okafor"},{k:"whatsapp",l:"WhatsApp * (digits only)",p:"2348012345678"},{k:"role",l:"Role",p:"Support Agent"}].map(f=>(
                      <div key={f.k} className="adm-form-field" style={f.k==="role"?{gridColumn:"1/-1"}:{}}>
                        <label className="adm-form-lbl">{f.l}</label>
                        <input className="adm-form-inp" placeholder={f.p} value={(newAgent as any)[f.k]} onChange={e=>setNewAgent((p:any)=>({...p,[f.k]:e.target.value}))}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveAgent} style={{width:"100%",marginTop:"0.8rem",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Add Agent</button>
                </div>
              )}
              {supportTeam.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💬</div>No agents added yet.</div>
                :supportTeam.map((a:any)=>(
                  <div key={a.id} style={{background:CARD,border:`1.5px solid ${a.active?"rgba(0,200,150,0.2)":"rgba(255,255,255,0.05)"}`,borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem",opacity:a.active?1:0.65}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                      <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:BG,flexShrink:0}}>{a.name.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                          <span style={{fontWeight:700,fontSize:"0.88rem"}}>{a.name}</span>
                          <span className="protect-badge">🔐 Protected</span>
                        </div>
                        <div style={{fontSize:"0.68rem",color:MUTED,marginTop:"0.1rem"}}>{a.role} · WhatsApp: +{a.whatsapp}</div>
                      </div>
                      <div style={{display:"flex",gap:"0.35rem",alignItems:"center"}}>
                        <button onClick={()=>toggleAgent(a.id)} style={{padding:"0.28rem 0.65rem",border:`1px solid ${a.active?"rgba(0,200,150,0.25)":"rgba(255,255,255,0.1)"}`,borderRadius:"7px",background:a.active?"rgba(0,200,150,0.08)":"rgba(255,255,255,0.04)",color:a.active?G:MUTED,fontSize:"0.68rem",cursor:"pointer",fontWeight:700}}>
                          {a.active?"● Online":"○ Offline"}
                        </button>
                        <button onClick={()=>deleteAgent(a.id)} style={{padding:"0.28rem 0.65rem",border:"1px solid rgba(255,71,87,0.25)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>🗑️ Delete</button>
                      </div>
                    </div>
                    {a.active&&<a href={`https://wa.me/${a.whatsapp}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"0.3rem",marginTop:"0.6rem",padding:"0.28rem 0.7rem",background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.2)",borderRadius:"7px",color:"#25d366",fontSize:"0.68rem",fontWeight:600,textDecoration:"none"}}>Test WhatsApp Link ↗</a>}
                  </div>
                ))
              }
            </>
          )}

          {/* ═══ WALLETS ═══ */}
          {tab==="wallets"&&(
            <>
              <div className="adm-head">
                <div className="adm-title">Platform Wallet Addresses</div>
                <div className="adm-sub">Manage deposit addresses shown to users on the deposit page</div>
              </div>
              <div style={{background:"rgba(255,165,0,0.05)",border:"1px solid rgba(255,165,0,0.15)",borderRadius:"11px",padding:"0.8rem",marginBottom:"1rem",fontSize:"0.76rem",color:"#a08030",lineHeight:1.6}}>
                ⚠️ These wallet addresses are displayed to users when making deposits. Always double-check before saving. Changes are immediate.
              </div>
              <button onClick={()=>setShowAddWallet(!showAddWallet)} style={{padding:"0.62rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddWallet?"Cancel":"+ Add Wallet Address"}
              </button>
              {showAddWallet&&(
                <div className="adm-form">
                  <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.8rem"}}>New Platform Wallet</div>
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
                  <button onClick={saveWallet} style={{width:"100%",marginTop:"0.8rem",padding:"0.72rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Save Wallet Address</button>
                </div>
              )}
              {wallets.length===0
                ?<div className="empty"><div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>💼</div>No wallets added yet. Add your USDT wallet addresses for users to deposit.</div>
                :wallets.map((w:any)=>(
                  <div key={w.id} style={{background:CARD,border:"1px solid rgba(0,200,150,0.15)",borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.6rem"}}>
                      <div style={{width:"38px",height:"38px",borderRadius:"9px",background:"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.88rem",color:G,flexShrink:0}}>{w.symbol?.charAt(0)||"₮"}</div>
                      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.9rem"}}>{w.coin}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{w.network}</div></div>
                      <div style={{display:"flex",gap:"0.35rem"}}>
                        <button onClick={()=>setEditWallet(editWallet?.id===w.id?null:{...w,newAddr:w.address})} style={{padding:"0.26rem 0.58rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"7px",background:"rgba(0,200,150,0.06)",color:G,fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>✏️ Edit</button>
                        <button onClick={()=>deleteWallet(w.id)} style={{padding:"0.26rem 0.58rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>🗑️ Delete</button>
                      </div>
                    </div>
                    {editWallet?.id===w.id?(
                      <div>
                        <input style={{...inp,marginBottom:"0.45rem",fontFamily:"monospace",fontSize:"0.78rem"}} value={editWallet.newAddr} onChange={e=>setEditWallet((p:any)=>({...p,newAddr:e.target.value}))} placeholder="New wallet address"/>
                        <div style={{display:"flex",gap:"0.45rem"}}>
                          <button onClick={()=>updateWallet(w.id,editWallet.newAddr)} style={{flex:1,padding:"0.52rem",border:"none",borderRadius:"8px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>✓ Save</button>
                          <button onClick={()=>setEditWallet(null)} style={{padding:"0.52rem 0.85rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"8px",background:"none",color:MUTED,fontSize:"0.8rem",cursor:"pointer"}}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"7px",padding:"0.55rem 0.7rem",fontFamily:"monospace",fontSize:"0.72rem",color:G,wordBreak:"break-all",lineHeight:1.4}}>{w.address}</div>
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
