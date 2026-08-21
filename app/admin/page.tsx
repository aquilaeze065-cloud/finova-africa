"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PW = "nexora2024admin";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const G="#00c896",DG="#00a87a",BG="#050f0c",CARD="#081a14",MUTED="#5a8a7a",TEXT="#e8f8f4",RED="#ff4757",ORANGE="#f39c12";

type Tab="dashboard"|"pending"|"users"|"savings"|"referrals"|"announcements"|"exchangers"|"support"|"wallets"|"withdrawals";

export default function AdminPage() {
  const router = useRouter();
  const [authed,setAuthed]=useState(false);
  const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [pwErr,setPwErr]=useState(false);
  const [tab,setTab]=useState<Tab>("dashboard");
  const [toast,setToast]=useState("");
  const [note,setNote]=useState("");
  const [loading,setLoading]=useState(false);

  // Stats
  const [stats,setStats]=useState<any>({totalUsers:0,activeUsers:0,pendingUsers:0,totalRevenue:0,pendingPayments:0,pendingWithdrawals:0,totalSaved:0,weeklyPayments:0});

  // Data
  const [users,setUsers]=useState<any[]>([]);
  const [pending,setPending]=useState<any>({registrations:[],payments:[],withdrawals:[],total:0});
  const [savings,setSavings]=useState<any[]>([]);
  const [referrals,setReferrals]=useState<any[]>([]);
  const [announcements,setAnnouncements]=useState<any[]>([]);
  const [exchangers,setExchangers]=useState<any[]>([]);
  const [supportTeam,setSupportTeam]=useState<any[]>([]);
  const [wallets,setWallets]=useState<any[]>([]);
  const [withdrawals,setWithdrawals]=useState<any[]>([]);
  const [notifications,setNotifications]=useState<any[]>([]);
  const [unread,setUnread]=useState(0);

  // Selected items
  const [selItem,setSelItem]=useState<any>(null);
  const [selUser,setSelUser]=useState<any>(null);
  const [creditModal,setCreditModal]=useState<any>(null);
  const [creditWeek,setCreditWeek]=useState("1");
  const [creditAmt,setCreditAmt]=useState("3");

  // Forms
  const [newEx,setNewEx]=useState({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
  const [newAgent,setNewAgent]=useState({name:"",whatsapp:"",role:"Support Agent"});
  const [newWallet,setNewWallet]=useState({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
  const [editWallet,setEditWallet]=useState<any>(null);
  const [showAddEx,setShowAddEx]=useState(false);
  const [showAddAgent,setShowAddAgent]=useState(false);
  const [showAddWallet,setShowAddWallet]=useState(false);
  const [annTitle,setAnnTitle]=useState("");
  const [annBody,setAnnBody]=useState("");
  const [annType,setAnnType]=useState("info");

  // ── LOAD ALL DATA ──
  const loadAll = useCallback(async ()=>{
    if (!authed) return;
    try {
      // Stats
      fetch(`${API}/api/admin/stats`).then(r=>r.json()).then(d=>{ if(!d.error) setStats(d); }).catch(()=>{});
      // Pending actions
      fetch(`${API}/api/admin/pending-all`).then(r=>r.json()).then(d=>{ if(!d.error) setPending(d); }).catch(()=>{});
      // Users
      fetch(`${API}/api/admin/users`).then(r=>r.json()).then(d=>{ if(d.users) setUsers(d.users); }).catch(()=>{});
      // Savings
      fetch(`${API}/api/admin/savings`).then(r=>r.json()).then(d=>{ if(d.savings) setSavings(d.savings); }).catch(()=>{});
      // Withdrawals
      fetch(`${API}/api/withdrawals/admin/all`).then(r=>r.json()).then(d=>{ if(d.requests) setWithdrawals(d.requests); }).catch(()=>{});
      // Admin notifications
      fetch(`${API}/api/admin-notifications`).then(r=>r.json()).then(d=>{ if(d.notifications){setNotifications(d.notifications);setUnread(d.unread||0);} }).catch(()=>{});
      // Local data
      try { setExchangers(JSON.parse(localStorage.getItem("nexora_exchangers")||"[]")); } catch {}
      try { setSupportTeam(JSON.parse(localStorage.getItem("nexora_support_team")||"[]")); } catch {}
      try { setReferrals(JSON.parse(localStorage.getItem("nexora_referrals")||"[]")); } catch {}
      try { setAnnouncements(JSON.parse(localStorage.getItem("nexora_announcements")||"[]")); } catch {}
      // Wallets from backend
      fetch(`${API}/api/wallets`).then(r=>r.json()).then(d=>{ if(d.wallets?.length) setWallets(d.wallets); }).catch(()=>{
        try { setWallets(JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]")); } catch {}
      });
    } catch(err) { console.error("loadAll error:",err); }
  },[authed]);

  useEffect(()=>{ if(authed){ loadAll(); const t=setInterval(loadAll,20000); return ()=>clearInterval(t); } },[authed,loadAll]);

  function showMsg(msg:string){ setToast(msg); setTimeout(()=>setToast(""),4000); }
  const sc=(s:string)=>s==="approved"||s==="active"||s==="confirmed"?G:s==="rejected"||s==="cancelled"?RED:ORANGE;
  const sl=(s:string)=>s==="approved"?"✓ Approved":s==="rejected"?"✗ Rejected":s==="active"?"● Active":"⏳ Pending";
  const inp:React.CSSProperties={width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",padding:"0.62rem 0.85rem",fontSize:"0.84rem",color:TEXT,outline:"none",fontFamily:"Inter,sans-serif"};

  // ── APPROVE REGISTRATION ──
  async function approveReg(userId:string) {
    setLoading(true);
    const res = await fetch(`${API}/api/admin/approve-registration/${userId}`,{method:"POST"});
    const data = await res.json();
    if (data.success) {
      showMsg("✅ Account activated! Savings plan created. Client notified.");
      setPending((p:any)=>({...p, registrations:p.registrations.filter((r:any)=>r.user_id!==userId)}));
      loadAll();
    } else showMsg("❌ Error: "+data.error);
    setLoading(false); setSelItem(null); setNote("");
  }

  // ── REJECT REGISTRATION ──
  async function rejectReg(userId:string) {
    await fetch(`${API}/api/admin/reject-registration/${userId}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:note})});
    showMsg("❌ Registration rejected. Client notified.");
    setPending((p:any)=>({...p,registrations:p.registrations.filter((r:any)=>r.user_id!==userId)}));
    setSelItem(null); setNote("");
  }

  // ── APPROVE PAYMENT + CREDIT WALLET ──
  async function approvePayment(paymentId:string, userId?:string, amount?:number) {
    setLoading(true);
    try {
      // 1. Credit the user wallet directly
      if (userId && amount) {
        const creditRes = await fetch(`${API}/api/admin/credit-wallet/${userId}`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({amount, paymentId, note:"Payment approved by admin"}),
        });
        const creditData = await creditRes.json();
        if (!creditData.success) {
          showMsg("❌ Credit failed: "+creditData.error);
          setLoading(false); return;
        }
      }
      // 2. Mark payment approved
      await fetch(`${API}/api/admin/approve-payment/${paymentId}`,{method:"POST"});
      showMsg("✅ Wallet credited $"+(amount||3)+" USDT! Client notified instantly. Auto-debit will handle savings.");
      setPending((p:any)=>({...p,payments:p.payments.filter((x:any)=>x.id!==paymentId)}));
      loadAll();
    } catch(err) {
      showMsg("❌ Error approving payment");
    }
    setLoading(false); setSelItem(null); setNote("");
  }

  // ── REJECT PAYMENT ──
  async function rejectPayment(paymentId:string) {
    await fetch(`${API}/api/admin/reject-payment/${paymentId}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:note})});
    showMsg("❌ Payment rejected. Client notified.");
    setPending((p:any)=>({...p,payments:p.payments.filter((x:any)=>x.id!==paymentId)}));
    setSelItem(null); setNote("");
  }

  // ── APPROVE WITHDRAWAL ──
  async function approveWithdrawal(id:string) {
    await fetch(`${API}/api/withdrawals/admin/approve/${id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note})});
    showMsg("✅ Withdrawal approved! Client notified.");
    setPending((p:any)=>({...p,withdrawals:p.withdrawals.filter((x:any)=>x.id!==id)}));
    setWithdrawals(w=>w.map((x:any)=>x.id===id?{...x,status:"approved"}:x));
    setSelItem(null); setNote("");
  }

  // ── REJECT WITHDRAWAL ──
  async function rejectWithdrawal(id:string) {
    await fetch(`${API}/api/withdrawals/admin/reject/${id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:note})});
    showMsg("❌ Withdrawal rejected. Client notified.");
    setPending((p:any)=>({...p,withdrawals:p.withdrawals.filter((x:any)=>x.id!==id)}));
    setSelItem(null); setNote("");
  }

  // ── QUICK CREDIT WALLET ──
  const [creditWalletModal, setCreditWalletModal] = useState<any>(null);
  const [creditWalletAmt,   setCreditWalletAmt]   = useState("3");
  const [creditWalletNote,  setCreditWalletNote]  = useState("");

  async function quickCreditWallet() {
    if (!creditWalletModal || !creditWalletAmt) return;
    setLoading(true);
    const res = await fetch(`${API}/api/admin/credit-wallet/${creditWalletModal.id}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        amount: parseFloat(creditWalletAmt),
        note: creditWalletNote || "Manual admin credit",
      }),
    });
    const data = await res.json();
    if (data.success) {
      showMsg(`✅ $${creditWalletAmt} USDT credited to ${creditWalletModal.name}'s wallet! Balance: $${data.balanceAfter?.toFixed(2)}`);
      setCreditWalletModal(null); setCreditWalletAmt("3"); setCreditWalletNote("");
      loadAll();
    } else {
      showMsg("❌ Error: "+data.error);
    }
    setLoading(false);
  }

  // ── CREDIT SAVINGS ──
  async function creditSavings() {
    if (!creditModal||!creditWeek||!creditAmt) return;
    const res = await fetch(`${API}/api/admin/credit-savings/${creditModal.id||creditModal.user_id}`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({weekNumber:parseInt(creditWeek),amount:parseFloat(creditAmt)}),
    });
    const data = await res.json();
    if (data.success) {
      showMsg(`✅ Week ${creditWeek} credited ($${creditAmt} USDT) to ${creditModal.name}. Client notified.`);
    } else showMsg("❌ Error: "+data.error);
    setCreditModal(null); setCreditWeek("1"); setCreditAmt("3"); loadAll();
  }

  // ── MARK ALL NOTIFICATIONS READ ──
  async function markRead() {
    await fetch(`${API}/api/admin-notifications/read-all`,{method:"PUT"}).catch(()=>{});
    setUnread(0); setNotifications(n=>n.map(x=>({...x,read:true})));
  }

  // ── LOCAL ACTIONS ──
  function sendAnnouncement() {
    if(!annTitle||!annBody){showMsg("Title and message required");return;}
    const ann={id:"ann_"+Date.now(),title:annTitle,body:annBody,type:annType,sentAt:new Date().toISOString(),recipients:stats.totalUsers||users.length};
    const updated=[ann,...announcements];
    localStorage.setItem("nexora_announcements",JSON.stringify(updated)); setAnnouncements(updated);
    const notifs=JSON.parse(localStorage.getItem("nexora_notifications")||"[]");
    notifs.unshift({id:Date.now().toString(),type:annType,title:`📢 ${annTitle}`,body:annBody,read:false,time:new Date()});
    localStorage.setItem("nexora_notifications",JSON.stringify(notifs));
    setAnnTitle(""); setAnnBody(""); setAnnType("info");
    showMsg(`✅ Announcement sent to ${stats.totalUsers} users!`);
  }
  async function saveExchanger(){
    if(!newEx.name){showMsg("Name is required");return;}
    try {
      const res = await fetch(`${API}/api/permanent/exchangers`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(newEx),
      });
      const d = await res.json();
      if(d.success){
        showMsg("✅ Exchanger saved permanently to database!");
        setShowAddEx(false);
        setNewEx({name:"",phone:"",whatsapp:"",bank:"",accountNo:"",accountName:"",network:"",walletAddress:"",country:"Nigeria"});
        loadAll();
      } else showMsg("❌ "+d.error);
    } catch { showMsg("❌ Connection error. Try again."); }
  }
  async function deleteExchanger(id:string){
    if(!confirm("Permanently delete this exchanger from the database?"))return;
    await fetch(`${API}/api/permanent/exchangers/${id}`,{method:"DELETE"});
    showMsg("Exchanger deleted.");
    loadAll();
  }
  async function saveAgent(){
    if(!newAgent.name||!newAgent.whatsapp){showMsg("Name and WhatsApp required");return;}
    try {
      const res = await fetch(`${API}/api/permanent/support-team`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(newAgent),
      });
      const d = await res.json();
      if(d.success){
        showMsg("✅ Agent saved permanently to database!");
        setShowAddAgent(false);
        setNewAgent({name:"",whatsapp:"",role:"Support Agent"});
        loadAll();
      } else showMsg("❌ "+d.error);
    } catch { showMsg("❌ Connection error. Try again."); }
  }
  async function toggleAgent(id:string){
    const agent = supportTeam.find((a:any)=>a.id===id);
    if(!agent) return;
    await fetch(`${API}/api/permanent/support-team/${id}`,{
      method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({active:!agent.active}),
    });
    loadAll();
  }
  async function deleteAgent(id:string){
    if(!confirm("Permanently remove this support agent from the database?"))return;
    await fetch(`${API}/api/permanent/support-team/${id}`,{method:"DELETE"});
    showMsg("Agent permanently removed.");
    loadAll();
  }
  async function saveWallet(){
    if(!newWallet.address){showMsg("Wallet address is required");return;}
    try {
      const res = await fetch(`${API}/api/permanent/wallets`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(newWallet),
      });
      const d = await res.json();
      if(d.success){
        showMsg("✅ Wallet saved permanently to database! Users can now see it.");
        setShowAddWallet(false);
        setNewWallet({coin:"USDT",symbol:"USDT",network:"TRC-20 (TRON)",address:""});
        loadAll();
      } else showMsg("❌ "+d.error);
    } catch { showMsg("❌ Connection error. Try again."); }
  }
  async function updateWallet(id:string,addr:string){
    await fetch(`${API}/api/permanent/wallets/${id}`,{
      method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({address:addr}),
    });
    setEditWallet(null);
    showMsg("✅ Wallet address updated permanently!");
    loadAll();
  }
  async function deleteWallet(id:string){
    if(!confirm("Permanently delete this wallet address from the database?"))return;
    await fetch(`${API}/api/permanent/wallets/${id}`,{method:"DELETE"});
    showMsg("Wallet permanently deleted.");
    loadAll();
  }
  function exportCSV(){
    if(!users.length){showMsg("No users to export yet");return;}
    const headers=["Name","Email","Phone","Status","Registered","Weeks Paid","Total Saved"];
    const rows=users.map((u:any)=>[u.name,u.email,u.phone||"",u.account_status,new Date(u.created_at||Date.now()).toLocaleDateString("en-GB"),u.weeks_paid||0,"$"+(u.total_saved||0)].map(v=>`"${v}"`).join(","));
    const csv=[headers.join(","),...rows].join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=`nexora-users-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    showMsg("✅ CSV exported!");
  }

  const totalPending = pending.total || (pending.registrations?.length||0)+(pending.payments?.length||0)+(pending.withdrawals?.length||0);

  const TABS=[
    {id:"dashboard",    icon:"📊",label:"Dashboard",   badge:0},
    {id:"pending",      icon:"🔔",label:"Pending",      badge:totalPending},
    {id:"users",        icon:"👥",label:"Users",        badge:stats.totalUsers},
    {id:"savings",      icon:"📈",label:"Savings",      badge:0},
    {id:"referrals",    icon:"🎁",label:"Referrals",    badge:0},
    {id:"announcements",icon:"📢",label:"Announce",     badge:0},
    {id:"withdrawals",  icon:"⬇️", label:"Withdrawals",  badge:stats.pendingWithdrawals||0},
    {id:"exchangers",   icon:"💱",label:"Exchangers",   badge:0},
    {id:"support",      icon:"💬",label:"Support",      badge:0},
    {id:"wallets",      icon:"💼",label:"Wallets",      badge:0},
  ];

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");*{margin:0;padding:0;box-sizing:border-box;}body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}`}</style>
      <div style={{width:"100%",maxWidth:"360px",padding:"1rem"}}>
        <div style={{background:CARD,border:"1px solid rgba(0,200,150,0.2)",borderRadius:"20px",padding:"2rem 1.75rem",boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
          <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`linear-gradient(135deg,${G},#0066ff)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem"}}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{fontWeight:800,fontSize:"1.1rem",background:`linear-gradient(135deg,${G},#4dffc3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA Admin</div>
            <div style={{fontSize:"0.72rem",color:MUTED,marginTop:"0.15rem"}}>Restricted Access</div>
          </div>
          <div style={{position:"relative",marginBottom:"0.85rem"}}>
            <input style={{...inp,paddingRight:"2.8rem"}} type={showPw?"text":"password"} placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pw===ADMIN_PW?(setAuthed(true),setPwErr(false)):setPwErr(true))}/>
            <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:0,top:0,bottom:0,width:"2.5rem",background:"none",border:"none",cursor:"pointer",color:MUTED}}>{showPw?"🙈":"👁"}</button>
          </div>
          {pwErr&&<div style={{fontSize:"0.75rem",color:RED,marginBottom:"0.75rem",textAlign:"center"}}>⚠️ Incorrect password</div>}
          <button onClick={()=>pw===ADMIN_PW?(setAuthed(true),setPwErr(false)):setPwErr(true)} style={{width:"100%",padding:"0.88rem",border:"none",borderRadius:"11px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.95rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            Enter Dashboard
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
        .adm-main{flex:1;padding:1.4rem;overflow-y:auto;}
        .adm-nav{display:flex;align-items:center;gap:0.45rem;padding:0.52rem 0.65rem;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;color:#5a8a7a;background:none;text-align:left;margin-bottom:2px;transition:all 0.15s;width:100%;font-family:"Inter",sans-serif;}
        .adm-nav:hover{background:rgba(0,200,150,0.06);color:#e8f8f4;}
        .adm-nav.on{background:#00c896;color:#050f0c;font-weight:700;}
        .adm-badge{margin-left:auto;color:#fff;border-radius:10px;padding:0.05rem 0.38rem;font-size:0.58rem;font-weight:700;min-width:18px;text-align:center;}
        .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.65rem;margin-bottom:1.2rem;}
        .stat-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:14px;padding:1rem;}
        .stat-val{font-weight:800;font-size:1.4rem;margin-bottom:0.12rem;}
        .stat-lbl{font-size:0.63rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.06em;}
        .stat-sub{font-size:0.66rem;color:#3a6a5a;margin-top:0.18rem;}
        .adm-sec{font-weight:700;font-size:0.82rem;color:#00c896;margin:1rem 0 0.6rem;display:flex;align-items:center;gap:0.4rem;}
        .pending-item{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:14px;padding:0;margin-bottom:0.75rem;overflow:hidden;}
        .pending-header{display:flex;align-items:center;gap:0.7rem;padding:0.9rem 1rem;cursor:pointer;transition:background 0.15s;}
        .pending-header:hover{background:rgba(0,200,150,0.03);}
        .pending-header.open{background:rgba(0,200,150,0.05);}
        .pending-body{padding:0 1rem 1rem;border-top:1px solid rgba(0,200,150,0.08);}
        .proof-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:0.75rem 0;}
        .proof-img{width:100%;max-height:120px;object-fit:contain;border-radius:8px;border:1px solid rgba(0,200,150,0.1);background:#060f0c;}
        .no-proof{height:60px;background:#060f0c;border:1px solid rgba(0,200,150,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#5a8a7a;font-size:0.72rem;}
        .info-row{display:flex;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(0,200,150,0.05);font-size:0.73rem;}
        .info-row:last-child{border-bottom:none;}
        textarea{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.58rem 0.75rem;font-size:0.82rem;color:#e8f8f4;outline:none;resize:vertical;min-height:50px;margin-bottom:0.65rem;font-family:"Inter",sans-serif;}
        .btn-approve{flex:1;padding:0.68rem;border:none;border-radius:9px;background:linear-gradient(135deg,#00a87a,#00c896);font-weight:700;font-size:0.82rem;color:#050f0c;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.18s;}
        .btn-approve:hover{transform:translateY(-1px);}
        .btn-reject{flex:1;padding:0.68rem;border:none;border-radius:9px;background:linear-gradient(135deg,#c0392b,#ff4757);font-weight:700;font-size:0.82rem;color:#fff;cursor:pointer;font-family:"Inter",sans-serif;}
        .pill{display:inline-block;padding:0.15rem 0.5rem;border-radius:20px;font-weight:600;font-size:0.63rem;border:1px solid;}
        .empty{text-align:center;padding:2.5rem 1rem;color:#5a8a7a;font-size:0.82rem;background:#081a14;border:1px solid rgba(0,200,150,0.07);border-radius:13px;}
        .toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.3);border-radius:11px;padding:0.7rem 1.4rem;font-weight:700;font-size:0.82rem;z-index:9999;animation:tIn 0.3s ease;white-space:nowrap;color:#00c896;box-shadow:0 8px 32px rgba(0,0,0,0.7);}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .adm-table-wrap{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:13px;overflow:hidden;margin-bottom:0.9rem;overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:360px;}
        th{text-align:left;padding:0.5rem 0.75rem;font-size:0.62rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid rgba(0,200,150,0.07);white-space:nowrap;}
        td{padding:0.58rem 0.75rem;font-size:0.77rem;border-bottom:1px solid rgba(0,200,150,0.04);}
        .pbar{height:6px;background:rgba(0,200,150,0.08);border-radius:6px;overflow:hidden;}
        .pbar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#00a87a,#00c896);}
        .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal-card{background:#081a14;border:1px solid rgba(0,200,150,0.2);border-radius:18px;padding:1.4rem;width:100%;max-width:400px;}
        .adm-form{background:#060f0c;border:1px solid rgba(0,200,150,0.12);border-radius:13px;padding:1rem;margin-bottom:1rem;}
        .adm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;}
        .adm-form-lbl{font-size:0.6rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.2rem;display:block;}
        .adm-form-inp{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.54rem 0.7rem;font-size:0.79rem;color:#e8f8f4;outline:none;width:100%;font-family:"Inter",sans-serif;}
        .notif-dot{width:8px;height:8px;border-radius:50%;background:#ff4757;flex-shrink:0;}
        @media(max-width:768px){.adm{flex-direction:column;}.adm-side{width:100%;height:auto;flex-direction:row;flex-wrap:wrap;gap:0.2rem;padding:0.6rem;position:relative;overflow-x:auto;}.adm-main{padding:0.85rem;}.stat-grid{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      {/* CREDIT WALLET MODAL */}
      {creditWalletModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={()=>setCreditWalletModal(null)}>
          <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"18px",padding:"1.4rem",width:"100%",maxWidth:"400px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.3rem"}}>💼 Credit User Wallet</div>
            <div style={{fontSize:"0.76rem",color:"#5a8a7a",marginBottom:"1rem"}}>Adding funds to: <b style={{color:"#e8f8f4"}}>{creditWalletModal.name}</b></div>
            <div style={{marginBottom:"0.7rem"}}>
              <label style={{fontSize:"0.63rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,display:"block",marginBottom:"0.25rem"}}>Amount (USDT) *</label>
              <input type="number" style={{width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",padding:"0.62rem 0.85rem",fontSize:"0.84rem",color:"#e8f8f4",outline:"none",fontFamily:"Inter,sans-serif"}} value={creditWalletAmt} placeholder="3" onChange={e=>setCreditWalletAmt(e.target.value)}/>
            </div>
            <div style={{marginBottom:"0.85rem"}}>
              <label style={{fontSize:"0.63rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,display:"block",marginBottom:"0.25rem"}}>Note (optional)</label>
              <input style={{width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",padding:"0.62rem 0.85rem",fontSize:"0.84rem",color:"#e8f8f4",outline:"none",fontFamily:"Inter,sans-serif"}} value={creditWalletNote} placeholder="e.g. Week 3 payment confirmed" onChange={e=>setCreditWalletNote(e.target.value)}/>
            </div>
            <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.65rem",marginBottom:"0.85rem",fontSize:"0.74rem",color:"#5a8a7a",lineHeight:1.55}}>
              ✅ This will add <b style={{color:"#00c896"}}>${creditWalletAmt} USDT</b> to {creditWalletModal.name}'s wallet immediately.<br/>
              ⚡ Auto-debit will move $3 to their savings when their weekly payment is due.
            </div>
            <div style={{display:"flex",gap:"0.6rem"}}>
              <button onClick={quickCreditWallet} disabled={!creditWalletAmt||loading} style={{flex:1,padding:"0.7rem",border:"none",borderRadius:"9px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.84rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                {loading?"Processing...":"✓ Credit Wallet Now"}
              </button>
              <button onClick={()=>setCreditWalletModal(null)} style={{padding:"0.7rem 1rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",background:"none",color:"#5a8a7a",cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CREDIT MODAL */}
      {creditModal&&(
        <div className="modal-ov" onClick={()=>setCreditModal(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:"1rem",color:G,marginBottom:"0.4rem"}}>💰 Credit Weekly Savings</div>
            <div style={{fontSize:"0.76rem",color:MUTED,marginBottom:"1rem"}}>User: <b style={{color:TEXT}}>{creditModal.name}</b></div>
            {[{l:"Week Number",v:creditWeek,s:setCreditWeek},{l:"Amount (USDT)",v:creditAmt,s:setCreditAmt}].map(f=>(
              <div key={f.l} style={{marginBottom:"0.7rem"}}>
                <label style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase" as const,display:"block",marginBottom:"0.25rem"}}>{f.l}</label>
                <input type="number" style={inp} value={f.v} onChange={e=>f.s(e.target.value)}/>
              </div>
            ))}
            <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.6rem",marginBottom:"0.85rem",fontSize:"0.73rem",color:MUTED,lineHeight:1.5}}>
              Marks Week <b style={{color:G}}>{creditWeek}</b> as PAID, credits <b style={{color:G}}>${creditAmt} USDT</b> to wallet, and notifies {creditModal.name} immediately.
            </div>
            <div style={{display:"flex",gap:"0.6rem"}}>
              <button onClick={creditSavings} className="btn-approve">✓ Confirm & Credit</button>
              <button onClick={()=>setCreditModal(null)} style={{padding:"0.68rem 1rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"9px",background:"none",color:MUTED,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="adm">
        {/* SIDEBAR */}
        <aside className="adm-side">
          <div style={{marginBottom:"0.85rem",paddingBottom:"0.75rem",borderBottom:"1px solid rgba(0,200,150,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontWeight:800,fontSize:"0.9rem",color:G}}>◈ NEXORA</div>
                <div style={{fontSize:"0.6rem",color:"#3a6a5a"}}>Admin Panel</div>
              </div>
              {unread>0&&(
                <div onClick={markRead} style={{position:"relative",cursor:"pointer"}}>
                  <span style={{fontSize:"1.1rem"}}>🔔</span>
                  <div style={{position:"absolute",top:"-4px",right:"-4px",background:RED,color:"#fff",borderRadius:"50%",width:"16px",height:"16px",fontSize:"0.55rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread>9?"9+":unread}</div>
                </div>
              )}
            </div>
          </div>

          {TABS.map(t=>(
            <button key={t.id} className={`adm-nav ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id as Tab)}>
              <span>{t.icon}</span>
              <span style={{flex:1,textAlign:"left"}}>{t.label}</span>
              {t.badge>0&&<span className="adm-badge" style={{background:t.id==="pending"?RED:t.id==="users"?"rgba(0,200,150,0.3)":ORANGE,color:t.id==="users"?G:"#fff"}}>{t.badge}</span>}
            </button>
          ))}

          <div style={{marginTop:"auto",paddingTop:"0.7rem",borderTop:"1px solid rgba(0,200,150,0.07)"}}>
            <button className="adm-nav" onClick={loadAll} style={{color:G}}>🔄 Refresh</button>
            <button className="adm-nav" onClick={exportCSV} style={{color:G}}>📥 Export CSV</button>
            <button className="adm-nav" onClick={()=>router.push("/dashboard")} style={{color:MUTED}}>🏠 View Site</button>
            <button className="adm-nav" onClick={()=>setAuthed(false)} style={{color:RED}}>🚪 Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="adm-main">

          {/* ══ DASHBOARD ══ */}
          {tab==="dashboard"&&(
            <>
              <div style={{marginBottom:"1.2rem"}}>
                <div style={{fontWeight:800,fontSize:"1.15rem",color:G}}>Platform Dashboard</div>
                <div style={{fontSize:"0.72rem",color:MUTED,marginTop:"0.1rem"}}>Live overview · Auto-refreshes every 20 seconds</div>
              </div>

              <div className="stat-grid">
                {[
                  {v:stats.totalUsers,     l:"Total Users",      sub:`${stats.activeUsers} active · ${stats.pendingUsers} pending`,c:G},
                  {v:`$${(stats.totalRevenue||0).toFixed(0)}`,l:"Total Revenue",sub:"All approved payments",c:G},
                  {v:`$${(stats.totalSaved||0).toFixed(0)}`,  l:"Total Saved",  sub:"Across all savings plans",c:"#0066ff"},
                  {v:stats.pendingPayments||0, l:"Pending Payments",sub:"Awaiting your approval",c:ORANGE},
                  {v:stats.pendingWithdrawals||0,l:"Withdrawals",sub:"Awaiting processing",c:ORANGE},
                  {v:stats.weeklyPayments||0,l:"This Week",sub:"Approved payments",c:G},
                ].map(s=>(
                  <div key={s.l} className="stat-card">
                    <div className="stat-val" style={{color:s.c}}>{s.v}</div>
                    <div className="stat-lbl">{s.l}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* PENDING SUMMARY */}
              {totalPending>0&&(
                <div style={{background:"rgba(255,71,87,0.06)",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"14px",padding:"1rem",marginBottom:"1rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:RED,marginBottom:"0.6rem"}}>
                    🔔 {totalPending} Item{totalPending!==1?"s":""} Waiting for Your Approval
                  </div>
                  <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap" as const}}>
                    {pending.registrations?.length>0&&<div style={{background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"8px",padding:"0.35rem 0.75rem",fontSize:"0.76rem",color:RED}}>💳 {pending.registrations.length} Registration Fee{pending.registrations.length!==1?"s":""}</div>}
                    {pending.payments?.length>0&&<div style={{background:"rgba(243,156,18,0.1)",border:"1px solid rgba(243,156,18,0.2)",borderRadius:"8px",padding:"0.35rem 0.75rem",fontSize:"0.76rem",color:ORANGE}}>💰 {pending.payments.length} Payment{pending.payments.length!==1?"s":""}</div>}
                    {pending.withdrawals?.length>0&&<div style={{background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"8px",padding:"0.35rem 0.75rem",fontSize:"0.76rem",color:G}}>⬇️ {pending.withdrawals.length} Withdrawal{pending.withdrawals.length!==1?"s":""}</div>}
                  </div>
                  <button onClick={()=>setTab("pending")} style={{marginTop:"0.75rem",padding:"0.58rem 1.2rem",border:"none",borderRadius:"9px",background:"linear-gradient(135deg,#c0392b,#ff4757)",color:"#fff",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    Review Now →
                  </button>
                </div>
              )}

              {/* RECENT NOTIFICATIONS */}
              <div className="adm-sec">🔔 Recent Activity</div>
              {notifications.length===0
                ?<div className="empty">No activity yet. Notifications appear here when clients take actions.</div>
                :<div style={{background:CARD,border:"1px solid rgba(0,200,150,0.08)",borderRadius:"13px",overflow:"hidden"}}>
                  {notifications.slice(0,8).map((n:any,i:number)=>(
                    <div key={i} style={{display:"flex",gap:"0.65rem",alignItems:"flex-start",padding:"0.75rem 1rem",borderBottom:"1px solid rgba(0,200,150,0.05)",background:n.read?"none":"rgba(0,200,150,0.02)"}}>
                      <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(0,200,150,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",flexShrink:0}}>
                        {n.type==="registration"?"🆕":n.type==="payment"?"💳":n.type==="savings"?"💰":n.type==="withdrawal"?"⬇️":n.type==="referral"?"🎁":"🔔"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:n.read?500:700,fontSize:"0.82rem",color:n.read?MUTED:TEXT}}>{n.title}</div>
                        <div style={{fontSize:"0.7rem",color:MUTED,marginTop:"0.1rem",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.body}</div>
                      </div>
                      <div style={{fontSize:"0.62rem",color:"#3a5a4a",flexShrink:0}}>{new Date(n.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
                      {!n.read&&<div className="notif-dot"/>}
                    </div>
                  ))}
                </div>
              }
            </>
          )}

          {/* ══ PENDING APPROVALS ══ */}
          {tab==="pending"&&(
            <>
              <div style={{marginBottom:"1.2rem"}}>
                <div style={{fontWeight:800,fontSize:"1.15rem",color:G}}>🔔 Pending Approvals</div>
                <div style={{fontSize:"0.72rem",color:MUTED,marginTop:"0.1rem"}}>All items waiting for your review — approvals reflect on client's dashboard immediately</div>
              </div>

              {totalPending===0&&(
                <div className="empty">
                  <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>✅</div>
                  All clear! No pending approvals right now.
                  <div style={{fontSize:"0.76rem",marginTop:"0.4rem"}}>New registrations, payments, and withdrawals will appear here.</div>
                </div>
              )}

              {/* PENDING REGISTRATIONS */}
              {pending.registrations?.length>0&&(
                <>
                  <div className="adm-sec">💳 Registration Fee Payments ({pending.registrations.length})</div>
                  {pending.registrations.map((r:any)=>(
                    <div key={r.id} className="pending-item">
                      <div className={`pending-header ${selItem?.id===r.id?"open":""}`} onClick={()=>setSelItem(selItem?.id===r.id?null:r)}>
                        <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:BG,flexShrink:0}}>{(r.name||"U").charAt(0).toUpperCase()}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:"0.86rem"}}>{r.name}</div>
                          <div style={{fontSize:"0.7rem",color:MUTED}}>{r.email} · Registered {new Date(r.registered_at||r.created_at).toLocaleDateString("en-GB")}</div>
                        </div>
                        <div style={{fontWeight:700,color:G,fontSize:"0.9rem",marginRight:"0.5rem"}}>${parseFloat(r.amount||4).toFixed(2)} USDT</div>
                        <span style={{color:ORANGE,fontSize:"0.75rem"}}>{selItem?.id===r.id?"▲":"▼"}</span>
                      </div>
                      {selItem?.id===r.id&&(
                        <div className="pending-body">
                          <div style={{marginTop:"0.75rem"}}>
                            {[["Name",r.name],["Email",r.email],["Phone",r.phone||"Not provided"],["Amount",`$${parseFloat(r.amount||4).toFixed(2)} USDT`],["Submitted",new Date(r.created_at).toLocaleString("en-GB")]].map(([l,v])=>(
                              <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.73rem"}}>{v}</span></div>
                            ))}
                          </div>
                          <div style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0.75rem 0 0.3rem"}}>Payment Screenshot</div>
                          {r.screenshot_url
                            ?<img src={r.screenshot_url} className="proof-img" style={{width:"100%"}} alt="proof"/>
                            :<div className="no-proof">📄 No screenshot uploaded</div>
                          }
                          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"9px",padding:"0.65rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:MUTED,lineHeight:1.55}}>
                            ✅ Approving will: activate the account, create their 52-week savings plan, credit their wallet, and send them a notification instantly.
                          </div>
                          <textarea placeholder="Note (optional)..." value={note} onChange={e=>setNote(e.target.value)}/>
                          <div style={{display:"flex",gap:"0.6rem"}}>
                            <button className="btn-approve" onClick={()=>approveReg(r.user_id)} disabled={loading}>
                              {loading?"Processing...":"✓ Approve & Activate Account"}
                            </button>
                            <button className="btn-reject" onClick={()=>rejectReg(r.user_id)}>✗ Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* PENDING SAVINGS PAYMENTS */}
              {pending.payments?.length>0&&(
                <>
                  <div className="adm-sec">💰 Savings & Deposit Payments ({pending.payments.length})</div>
                  {pending.payments.map((p:any)=>(
                    <div key={p.id} className="pending-item">
                      <div className={`pending-header ${selItem?.id===p.id?"open":""}`} onClick={()=>setSelItem(selItem?.id===p.id?null:p)}>
                        <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:BG,flexShrink:0}}>{(p.name||"U").charAt(0).toUpperCase()}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                            <span style={{fontWeight:700,fontSize:"0.86rem"}}>{p.name}</span>
                            <span style={{fontSize:"0.65rem",fontWeight:700,color:p.payment_type==="penalty"?RED:ORANGE,background:`${p.payment_type==="penalty"?RED:ORANGE}18`,padding:"0.1rem 0.4rem",borderRadius:"20px"}}>{p.payment_type==="penalty"?"⚠️ PENALTY":p.payment_type==="registration"?"💳 REG FEE":"💰 SAVINGS"}{p.week_number?` Wk${p.week_number}`:""}</span>
                          </div>
                          <div style={{fontSize:"0.7rem",color:MUTED}}>{p.email}</div>
                        </div>
                        <div style={{fontWeight:700,color:G,fontSize:"0.9rem",marginRight:"0.5rem"}}>${parseFloat(p.amount||3).toFixed(2)}</div>
                        <span style={{color:ORANGE,fontSize:"0.75rem"}}>{selItem?.id===p.id?"▲":"▼"}</span>
                      </div>
                      {selItem?.id===p.id&&(
                        <div className="pending-body">
                          <div style={{marginTop:"0.75rem"}}>
                            {[["User",p.name],["Email",p.email],["Type",p.payment_type||(p.week_number?"Savings Week "+p.week_number:"Deposit")],["Amount",`$${parseFloat(p.amount||3).toFixed(2)} USDT`],["Network",p.network||"TRC-20"],["Submitted",new Date(p.created_at).toLocaleString("en-GB")]].map(([l,v])=>(
                              <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.73rem"}}>{v}</span></div>
                            ))}
                          </div>
                          <div style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0.75rem 0 0.3rem"}}>Payment Screenshot</div>
                          {p.screenshot_url
                            ?<img src={p.screenshot_url} className="proof-img" style={{width:"100%"}} alt="proof"/>
                            :<div className="no-proof">📄 No screenshot uploaded</div>
                          }
                          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"9px",padding:"0.65rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:MUTED,lineHeight:1.55}}>
                            ✅ Approving will: credit ${p.amount} USDT to their wallet balance, mark Week {p.week_number||"?"} as paid in their savings plan, and notify them instantly.
                          </div>
                          <textarea placeholder="Review note (optional)..." value={note} onChange={e=>setNote(e.target.value)}/>
                          <div style={{display:"flex",gap:"0.6rem"}}>
                            <button className="btn-approve" onClick={()=>approvePayment(p.id, p.user_id||p.userId, parseFloat(p.amount||3))} disabled={loading}>{loading?"Processing...":"✓ Approve & Credit Wallet"}</button>
                            <button className="btn-reject" onClick={()=>rejectPayment(p.id)}>✗ Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* PENDING WITHDRAWALS */}
              {pending.withdrawals?.length>0&&(
                <>
                  <div className="adm-sec">⬇️ Withdrawal Requests ({pending.withdrawals.length})</div>
                  {pending.withdrawals.map((w:any)=>(
                    <div key={w.id} className="pending-item">
                      <div className={`pending-header ${selItem?.id===w.id?"open":""}`} onClick={()=>setSelItem(selItem?.id===w.id?null:w)}>
                        <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:BG,flexShrink:0}}>{(w.name||"U").charAt(0).toUpperCase()}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:"0.86rem"}}>{w.name}</div>
                          <div style={{fontSize:"0.7rem",color:MUTED}}>{w.email} · {w.network||"TRC-20"}</div>
                        </div>
                        <div style={{fontWeight:700,color:G,fontSize:"0.9rem",marginRight:"0.5rem"}}>${parseFloat(w.amount||0).toFixed(2)}</div>
                        <span style={{color:G,fontSize:"0.75rem"}}>{selItem?.id===w.id?"▲":"▼"}</span>
                      </div>
                      {selItem?.id===w.id&&(
                        <div className="pending-body">
                          <div style={{marginTop:"0.75rem"}}>
                            {[["User",w.name],["Email",w.email],["Amount",`$${parseFloat(w.amount||0).toFixed(2)} ${w.currency||"USDT"}`],["Wallet",w.wallet_address],["Network",w.network||"TRC-20"],["Submitted",new Date(w.created_at).toLocaleString("en-GB")]].map(([l,v])=>(
                              <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.73rem",maxWidth:"60%",textAlign:"right",wordBreak:"break-all"}}>{v}</span></div>
                            ))}
                          </div>
                          <div className="proof-wrap">
                            {w.clearance_form_url&&<div><div style={{fontSize:"0.62rem",color:MUTED,marginBottom:"0.25rem"}}>📋 Clearance Form</div><img src={w.clearance_form_url} className="proof-img" alt="clearance"/></div>}
                            {w.payment_receipt_url&&<div><div style={{fontSize:"0.62rem",color:MUTED,marginBottom:"0.25rem"}}>🧾 Payment Receipt</div><img src={w.payment_receipt_url} className="proof-img" alt="receipt"/></div>}
                          </div>
                          <textarea placeholder="Note or rejection reason..." value={note} onChange={e=>setNote(e.target.value)}/>
                          <div style={{display:"flex",gap:"0.6rem"}}>
                            <button className="btn-approve" onClick={()=>approveWithdrawal(w.id)}>✓ Approve & Process</button>
                            <button className="btn-reject" onClick={()=>rejectWithdrawal(w.id)}>✗ Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ══ USERS ══ */}
          {tab==="users"&&(
            <>
              <div style={{marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:"0.5rem"}}>
                <div>
                  <div style={{fontWeight:800,fontSize:"1.15rem",color:G}}>All Users</div>
                  <div style={{fontSize:"0.72rem",color:MUTED}}>{stats.totalUsers} registered · {stats.activeUsers} active</div>
                </div>
                <button onClick={exportCSV} style={{padding:"0.55rem 1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.78rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>📥 Export CSV</button>
              </div>
              {users.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>👥</div>No users yet. Users appear here after they register.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Status</th><th>Registered</th><th>Weeks</th><th>Saved</th><th>Wallet</th><th>Action</th></tr></thead>
                  <tbody>{users.map((u:any)=>(
                    <tr key={u.id} style={{cursor:"pointer",background:selUser?.id===u.id?"rgba(0,200,150,0.04)":"none"}} onClick={()=>setSelUser(selUser?.id===u.id?null:u)}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.76rem",color:BG,flexShrink:0}}>{(u.name||"U").charAt(0).toUpperCase()}</div>
                          <div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:"0.66rem",color:MUTED}}>{u.email}</div></div>
                        </div>
                      </td>
                      <td><span className="pill" style={{color:sc(u.account_status),borderColor:sc(u.account_status),background:`${sc(u.account_status)}18`}}>{sl(u.account_status)}</span></td>
                      <td style={{fontSize:"0.7rem",color:MUTED}}>{new Date(u.created_at||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})}</td>
                      <td style={{fontWeight:700,color:G}}>{u.weeks_paid||0}/52</td>
                      <td style={{fontWeight:700,color:G}}>${parseFloat(u.total_saved||0).toFixed(0)}</td>
                      <td style={{fontWeight:700,color:"#4dffc3"}}>${parseFloat(u.wallet_balance||0).toFixed(2)}</td>
                      <td style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
                        <button onClick={e=>{e.stopPropagation();setCreditWalletModal(u);}} style={{padding:"0.24rem 0.6rem",border:"none",borderRadius:"6px",background:`linear-gradient(135deg,#0066ff,#4d9fff)`,color:"#fff",fontSize:"0.66rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>💼 Wallet</button>
                        <button onClick={e=>{e.stopPropagation();setCreditModal(u);}} style={{padding:"0.24rem 0.6rem",border:"none",borderRadius:"6px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontSize:"0.66rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>💰 Savings</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
              {selUser&&(
                <div style={{background:CARD,border:"1px solid rgba(0,200,150,0.15)",borderRadius:"14px",padding:"1.05rem",marginTop:"0.85rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.8rem"}}>Profile — {selUser.name}</div>
                  {[["Name",selUser.name],["Email",selUser.email],["Phone",selUser.phone||"Not provided"],["Status",selUser.account_status?.toUpperCase()],["KYC",selUser.kyc_status||"unverified"],["Registered",new Date(selUser.created_at||Date.now()).toLocaleString("en-GB")],["Weeks Paid",`${selUser.weeks_paid||0}/52`],["Total Saved",`$${parseFloat(selUser.total_saved||0).toFixed(2)} USDT`],["Wallet Balance",`$${parseFloat(selUser.wallet_balance||0).toFixed(2)} USDT`]].map(([l,v])=>(
                    <div key={l} className="info-row"><span style={{color:MUTED}}>{l}</span><span style={{fontWeight:600,fontSize:"0.75rem"}}>{v}</span></div>
                  ))}
                  <div style={{marginTop:"0.85rem"}}>
                    <div style={{color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.3rem",fontSize:"0.64rem"}}>Savings Progress</div>
                    <div className="pbar"><div className="pbar-fill" style={{width:`${Math.min(100,((selUser.weeks_paid||0)/52)*100)}%`}}/></div>
                    <div style={{fontSize:"0.66rem",color:MUTED,marginTop:"0.2rem"}}>{Math.round(((selUser.weeks_paid||0)/52)*100)}% complete</div>
                  </div>
                  <button onClick={()=>setCreditModal(selUser)} style={{marginTop:"0.85rem",width:"100%",padding:"0.7rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.84rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    💰 Credit Weekly Savings
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══ SAVINGS TRACKER ══ */}
          {tab==="savings"&&(
            <>
              <div style={{marginBottom:"1.1rem"}}>
                <div style={{fontWeight:800,fontSize:"1.15rem",color:G}}>Savings Tracker</div>
                <div style={{fontSize:"0.72rem",color:MUTED}}>Auto-debit runs daily at 8AM — deducts $3 from wallet when week is due</div>
              </div>
              <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"12px",padding:"0.85rem",marginBottom:"1rem",fontSize:"0.78rem",color:MUTED,lineHeight:1.6}}>
                <b style={{color:G}}>⚡ Auto-Debit System:</b> When a client's weekly due date arrives, the system automatically deducts $3 USDT from their wallet balance and marks the week as paid. If they don't have enough balance, a penalty is applied and you're notified via Telegram.
              </div>
              {savings.length===0
                ?<div className="empty">No savings plans yet. Plans are created automatically when you approve a registration.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Weeks Paid</th><th>Progress</th><th>Total Saved</th><th>Est. Payout</th><th>Penalties</th><th>Action</th></tr></thead>
                  <tbody>{savings.map((s:any)=>{
                    const pct=Math.min(100,((parseInt(s.weeks_paid)||0)/52)*100);
                    const payout=((parseFloat(s.total_paid)||0)*1.35+15).toFixed(2);
                    return (
                      <tr key={s.plan_id||s.user_id}>
                        <td><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:"0.66rem",color:MUTED}}>{s.email}</div></td>
                        <td style={{fontWeight:700,color:G}}>{s.weeks_paid||0}/52</td>
                        <td style={{minWidth:"100px"}}>
                          <div className="pbar"><div className="pbar-fill" style={{width:pct+"%"}}/></div>
                          <div style={{fontSize:"0.62rem",color:MUTED,marginTop:"0.12rem"}}>{Math.round(pct)}%</div>
                        </td>
                        <td style={{fontWeight:700,color:G}}>${parseFloat(s.total_paid||0).toFixed(2)}</td>
                        <td style={{fontSize:"0.76rem",color:MUTED}}>${payout}</td>
                        <td style={{color:parseInt(s.penalty_weeks||0)>0?RED:MUTED,fontWeight:700}}>{s.penalty_weeks||0}</td>
                        <td><button onClick={()=>setCreditModal({id:s.user_id,name:s.name})} style={{padding:"0.24rem 0.6rem",border:"none",borderRadius:"6px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>+ Credit</button></td>
                      </tr>
                    );
                  })}</tbody>
                </table></div>
              }
            </>
          )}

          {/* ══ REFERRALS ══ */}
          {tab==="referrals"&&(
            <>
              <div style={{fontWeight:800,fontSize:"1.15rem",color:G,marginBottom:"0.25rem"}}>Referral Rewards</div>
              <div style={{fontSize:"0.72rem",color:MUTED,marginBottom:"1rem"}}>$1 USDT per successful referral</div>
              {referrals.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🎁</div>No referrals yet.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>Referrer</th><th>New User</th><th>Code</th><th>Bonus</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>{referrals.map((r:any,i:number)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{r.referrerName||"Unknown"}</td>
                      <td>{r.referredName||"Unknown"}</td>
                      <td><span style={{fontFamily:"monospace",fontSize:"0.72rem",color:G}}>{r.referralCode}</span></td>
                      <td style={{fontWeight:700,color:G}}>$1 USDT</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(r.createdAt||Date.now()).toLocaleDateString("en-GB")}</td>
                      <td><span className="pill" style={{color:r.status==="paid"?G:ORANGE,borderColor:r.status==="paid"?G:ORANGE,background:r.status==="paid"?`${G}18`:`${ORANGE}18`}}>{r.status==="paid"?"✓ Paid":"⏳ Pending"}</span></td>
                      <td>{r.status!=="paid"&&<button onClick={()=>{const u=referrals.map((x:any,j:number)=>j===i?{...x,status:"paid"}:x);localStorage.setItem("nexora_referrals",JSON.stringify(u));setReferrals(u);showMsg("✅ Marked as paid!");}} style={{padding:"0.22rem 0.55rem",border:"none",borderRadius:"6px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Mark Paid</button>}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
            </>
          )}

          {/* ══ ANNOUNCEMENTS ══ */}
          {tab==="announcements"&&(
            <>
              <div style={{fontWeight:800,fontSize:"1.15rem",color:G,marginBottom:"1rem"}}>Send Announcements</div>
              <div className="adm-form">
                <div style={{fontWeight:700,fontSize:"0.88rem",color:G,marginBottom:"0.85rem"}}>📢 Compose Message</div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"0.6rem",marginBottom:"0.65rem"}}>
                  <div><label className="adm-form-lbl">Title *</label><input className="adm-form-inp" placeholder="e.g. Important Update" value={annTitle} onChange={e=>setAnnTitle(e.target.value)}/></div>
                  <div><label className="adm-form-lbl">Type</label>
                    <select className="adm-form-inp" value={annType} onChange={e=>setAnnType(e.target.value)} style={{cursor:"pointer"}}>
                      <option value="info">ℹ️ Info</option><option value="success">✅ Success</option><option value="warning">⚠️ Warning</option><option value="bonus">🎁 Bonus</option>
                    </select>
                  </div>
                </div>
                <label className="adm-form-lbl">Message *</label>
                <textarea style={{minHeight:"80px",margin:"0 0 0.75rem"}} placeholder="Write your message..." value={annBody} onChange={e=>setAnnBody(e.target.value)}/>
                <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.6rem",marginBottom:"0.75rem",fontSize:"0.73rem",color:MUTED}}>
                  📡 Sends to all <b style={{color:G}}>{stats.totalUsers}</b> registered users as an in-app notification.
                </div>
                <button onClick={sendAnnouncement} disabled={!annTitle||!annBody} style={{padding:"0.72rem 1.5rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif",opacity:!annTitle||!annBody?0.5:1}}>
                  📢 Send to All Users
                </button>
              </div>
              {announcements.length>0&&(
                <>
                  <div className="adm-sec">📋 Sent ({announcements.length})</div>
                  {announcements.map((a:any,i:number)=>(
                    <div key={i} style={{background:CARD,border:"1px solid rgba(0,200,150,0.08)",borderRadius:"12px",padding:"0.85rem",marginBottom:"0.5rem"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.3rem"}}>
                        <div style={{fontWeight:700,fontSize:"0.86rem"}}>{a.title}</div>
                        <span style={{fontSize:"0.62rem",color:MUTED}}>{new Date(a.sentAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                      <div style={{fontSize:"0.76rem",color:MUTED,lineHeight:1.55}}>{a.body}</div>
                      <div style={{fontSize:"0.64rem",color:"#3a6a5a",marginTop:"0.35rem"}}>Sent to {a.recipients||0} users</div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ══ WITHDRAWALS HISTORY ══ */}
          {tab==="withdrawals"&&(
            <>
              <div style={{fontWeight:800,fontSize:"1.15rem",color:G,marginBottom:"1rem"}}>Withdrawal History</div>
              {withdrawals.length===0
                ?<div className="empty"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>⬇️</div>No withdrawal requests yet.</div>
                :<div className="adm-table-wrap"><table>
                  <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>{withdrawals.map((w:any,i:number)=>(
                    <tr key={w.id||i}>
                      <td><div style={{fontWeight:600}}>{w.name||"Unknown"}</div><div style={{fontSize:"0.66rem",color:MUTED}}>{w.email}</div></td>
                      <td style={{fontWeight:700,color:G}}>${parseFloat(w.amount||0).toFixed(2)} {w.currency||"USDT"}</td>
                      <td style={{fontSize:"0.72rem"}}>{w.network||"TRC-20"}</td>
                      <td style={{fontSize:"0.68rem",color:MUTED}}>{new Date(w.created_at||Date.now()).toLocaleDateString("en-GB")}</td>
                      <td><span className="pill" style={{color:sc(w.status),borderColor:sc(w.status),background:`${sc(w.status)}18`}}>{sl(w.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              }
            </>
          )}

          {/* ══ EXCHANGERS ══ */}
          {tab==="exchangers"&&(
            <>
              <div style={{fontWeight:800,fontSize:"1.15rem",color:G,marginBottom:"0.25rem"}}>Exchangers</div>
              <div style={{fontSize:"0.72rem",color:MUTED,marginBottom:"0.85rem"}}>🔐 Only you can add or delete exchangers</div>
              <button onClick={()=>setShowAddEx(!showAddEx)} style={{padding:"0.6rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddEx?"Cancel":"+ Add Exchanger"}
              </button>
              {showAddEx&&(
                <div className="adm-form">
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"John Doe"},{k:"phone",l:"Phone",p:"+234..."},{k:"whatsapp",l:"WhatsApp",p:"+234..."},{k:"bank",l:"Bank",p:"GTBank"},{k:"accountNo",l:"Account No",p:"1234567890"},{k:"accountName",l:"Account Name",p:"Name"},{k:"network",l:"Network",p:"TRC-20"}].map(f=>(
                      <div key={f.k}><label className="adm-form-lbl">{f.l}</label><input className="adm-form-inp" placeholder={f.p} value={(newEx as any)[f.k]} onChange={e=>setNewEx((p:any)=>({...p,[f.k]:e.target.value}))}/></div>
                    ))}
                    <div style={{gridColumn:"1/-1"}}><label className="adm-form-lbl">Wallet Address *</label><input className="adm-form-inp" placeholder="Full wallet address" value={newEx.walletAddress} onChange={e=>setNewEx(p=>({...p,walletAddress:e.target.value}))}/></div>
                  </div>
                  <button onClick={saveExchanger} style={{width:"100%",marginTop:"0.8rem",padding:"0.7rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Save Exchanger</button>
                </div>
              )}
              {exchangers.length===0?<div className="empty">No exchangers added yet.</div>:exchangers.map((ex:any)=>(
                <div key={ex.id} style={{background:CARD,border:"1px solid rgba(0,200,150,0.12)",borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                    <div style={{width:"36px",height:"36px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:BG,flexShrink:0}}>{ex.name.charAt(0).toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:"0.88rem"}}>{ex.name}</div>
                      <div style={{fontSize:"0.68rem",color:MUTED}}>{ex.network} · {ex.bank&&`${ex.bank} · ${ex.accountNo}`}</div>
                    </div>
                    <button onClick={()=>deleteExchanger(ex.id)} style={{padding:"0.26rem 0.62rem",border:"1px solid rgba(255,71,87,0.25)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>🗑️ Delete</button>
                  </div>
                  {ex.walletAddress&&<div style={{marginTop:"0.5rem",background:"rgba(0,0,0,0.3)",borderRadius:"7px",padding:"0.45rem 0.65rem",fontFamily:"monospace",fontSize:"0.68rem",color:G,wordBreak:"break-all"}}>{ex.walletAddress}</div>}
                </div>
              ))}
            </>
          )}

          {/* ══ SUPPORT ══ */}
          {tab==="support"&&(
            <>
              <div style={{fontWeight:800,fontSize:"1.15rem",color:G,marginBottom:"0.25rem"}}>Support Team</div>
              <div style={{fontSize:"0.72rem",color:MUTED,marginBottom:"0.85rem"}}>🔐 Only you can add or remove agents — toggle online/offline to control visibility</div>
              <button onClick={()=>setShowAddAgent(!showAddAgent)} style={{padding:"0.6rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddAgent?"Cancel":"+ Add Agent"}
              </button>
              {showAddAgent&&(
                <div className="adm-form">
                  <div className="adm-form-grid">
                    {[{k:"name",l:"Full Name *",p:"Sarah Okafor"},{k:"whatsapp",l:"WhatsApp * (digits only)",p:"2348012345678"},{k:"role",l:"Role",p:"Support Agent"}].map(f=>(
                      <div key={f.k} style={f.k==="role"?{gridColumn:"1/-1"}:{}}><label className="adm-form-lbl">{f.l}</label><input className="adm-form-inp" placeholder={f.p} value={(newAgent as any)[f.k]} onChange={e=>setNewAgent((p:any)=>({...p,[f.k]:e.target.value}))}/></div>
                    ))}
                  </div>
                  <button onClick={saveAgent} style={{width:"100%",marginTop:"0.8rem",padding:"0.7rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Add Agent</button>
                </div>
              )}
              {supportTeam.length===0?<div className="empty">No agents yet.</div>:supportTeam.map((a:any)=>(
                <div key={a.id} style={{background:CARD,border:`1.5px solid ${a.active?"rgba(0,200,150,0.2)":"rgba(255,255,255,0.05)"}`,borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem",opacity:a.active?1:0.65}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                    <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`linear-gradient(135deg,${DG},${G})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:BG,flexShrink:0}}>{a.name.charAt(0).toUpperCase()}</div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.88rem"}}>{a.name}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{a.role} · +{a.whatsapp}</div></div>
                    <div style={{display:"flex",gap:"0.35rem"}}>
                      <button onClick={()=>toggleAgent(a.id)} style={{padding:"0.26rem 0.62rem",border:`1px solid ${a.active?"rgba(0,200,150,0.25)":"rgba(255,255,255,0.1)"}`,borderRadius:"7px",background:a.active?"rgba(0,200,150,0.08)":"rgba(255,255,255,0.04)",color:a.active?G:MUTED,fontSize:"0.68rem",cursor:"pointer",fontWeight:700}}>{a.active?"● Online":"○ Offline"}</button>
                      <button onClick={()=>deleteAgent(a.id)} style={{padding:"0.26rem 0.62rem",border:"1px solid rgba(255,71,87,0.25)",borderRadius:"7px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.68rem",cursor:"pointer",fontWeight:600}}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ══ WALLETS ══ */}
          {tab==="wallets"&&(
            <>
              <div style={{fontWeight:800,fontSize:"1.15rem",color:G,marginBottom:"0.25rem"}}>Platform Wallets</div>
              <div style={{fontSize:"0.72rem",color:MUTED,marginBottom:"0.85rem"}}>Deposit addresses shown to users during registration and on the deposit page</div>
              <div style={{background:"rgba(255,165,0,0.05)",border:"1px solid rgba(255,165,0,0.15)",borderRadius:"10px",padding:"0.75rem",marginBottom:"0.85rem",fontSize:"0.75rem",color:"#a08030",lineHeight:1.6}}>
                ⚠️ These wallet addresses are displayed to users immediately. Always double-check before saving.
              </div>
              <button onClick={()=>setShowAddWallet(!showAddWallet)} style={{padding:"0.6rem 1.1rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.82rem",color:BG,cursor:"pointer",marginBottom:"0.9rem",fontFamily:"Inter,sans-serif"}}>
                {showAddWallet?"Cancel":"+ Add Wallet"}
              </button>
              {showAddWallet&&(
                <div className="adm-form">
                  <div className="adm-form-grid">
                    {[{k:"coin",l:"Coin",p:"USDT"},{k:"symbol",l:"Symbol",p:"USDT"},{k:"network",l:"Network",p:"TRC-20"}].map(f=>(
                      <div key={f.k}><label className="adm-form-lbl">{f.l}</label><input className="adm-form-inp" placeholder={f.p} value={(newWallet as any)[f.k]} onChange={e=>setNewWallet((p:any)=>({...p,[f.k]:e.target.value}))}/></div>
                    ))}
                    <div style={{gridColumn:"1/-1"}}><label className="adm-form-lbl">Wallet Address *</label><input className="adm-form-inp" placeholder="Full wallet address" value={newWallet.address} onChange={e=>setNewWallet(p=>({...p,address:e.target.value}))}/></div>
                  </div>
                  <button onClick={saveWallet} style={{width:"100%",marginTop:"0.8rem",padding:"0.7rem",border:"none",borderRadius:"9px",background:`linear-gradient(135deg,${DG},${G})`,fontWeight:700,fontSize:"0.86rem",color:BG,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Save Wallet</button>
                </div>
              )}
              {wallets.length===0?<div className="empty">No wallets added yet. Add your USDT wallet address so users can deposit.</div>:wallets.map((w:any)=>(
                <div key={w.id} style={{background:CARD,border:"1px solid rgba(0,200,150,0.15)",borderRadius:"13px",padding:"0.9rem",marginBottom:"0.6rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.6rem"}}>
                    <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.88rem",color:G,flexShrink:0}}>{w.symbol?.charAt(0)||"₮"}</div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.9rem"}}>{w.coin}</div><div style={{fontSize:"0.68rem",color:MUTED}}>{w.network}</div></div>
                    <div style={{display:"flex",gap:"0.35rem"}}>
                      <button onClick={()=>setEditWallet(editWallet?.id===w.id?null:{...w,newAddr:w.address})} style={{padding:"0.24rem 0.55rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"6px",background:"rgba(0,200,150,0.06)",color:G,fontSize:"0.66rem",cursor:"pointer",fontWeight:600}}>✏️</button>
                      <button onClick={()=>deleteWallet(w.id)} style={{padding:"0.24rem 0.55rem",border:"1px solid rgba(255,71,87,0.2)",borderRadius:"6px",background:"rgba(255,71,87,0.06)",color:RED,fontSize:"0.66rem",cursor:"pointer",fontWeight:600}}>🗑️</button>
                    </div>
                  </div>
                  {editWallet?.id===w.id?(
                    <div>
                      <input style={{...inp,marginBottom:"0.4rem",fontFamily:"monospace",fontSize:"0.76rem"}} value={editWallet.newAddr} onChange={e=>setEditWallet((p:any)=>({...p,newAddr:e.target.value}))} placeholder="New wallet address"/>
                      <div style={{display:"flex",gap:"0.4rem"}}>
                        <button onClick={()=>updateWallet(w.id,editWallet.newAddr)} style={{flex:1,padding:"0.5rem",border:"none",borderRadius:"8px",background:`linear-gradient(135deg,${DG},${G})`,color:BG,fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>✓ Save</button>
                        <button onClick={()=>setEditWallet(null)} style={{padding:"0.5rem 0.8rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"8px",background:"none",color:MUTED,fontSize:"0.78rem",cursor:"pointer"}}>Cancel</button>
                      </div>
                    </div>
                  ):(
                    <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"7px",padding:"0.5rem 0.65rem",fontFamily:"monospace",fontSize:"0.7rem",color:G,wordBreak:"break-all",lineHeight:1.4}}>{w.address}</div>
                  )}
                </div>
              ))}
            </>
          )}

        </main>
      </div>
    </>
  );
}
