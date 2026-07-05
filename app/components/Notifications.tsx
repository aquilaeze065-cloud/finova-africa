"use client";
import { useState, useEffect, useCallback } from "react";

export interface AppNotification {
  id:string; type:"kyc"|"deposit"|"withdrawal"|"price"|"security"|"system";
  title:string; body:string; icon:string; read:boolean; time:Date; action?:string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission,    setPermission]    = useState<NotificationPermission>("default");

  useEffect(()=>{
    if(typeof window!=="undefined"&&"Notification" in window) setPermission(Notification.permission);
    try {
      const saved=localStorage.getItem("nexora_notifications");
      if(saved) setNotifications(JSON.parse(saved).map((n:AppNotification)=>({...n,time:new Date(n.time)})));
    } catch {}
  },[]);

  const save=useCallback((notifs:AppNotification[])=>{ try{localStorage.setItem("nexora_notifications",JSON.stringify(notifs));}catch{} },[]);

  async function requestPermission():Promise<boolean> {
    if(!("Notification" in window)) return false;
    const r=await Notification.requestPermission(); setPermission(r); return r==="granted";
  }

  function push(notif:Omit<AppNotification,"id"|"read"|"time">) {
    const full:AppNotification={...notif,id:Date.now().toString(),read:false,time:new Date()};
    setNotifications(prev=>{ const u=[full,...prev].slice(0,50); save(u); return u; });
    if(typeof window!=="undefined"&&"Notification" in window&&Notification.permission==="granted") {
      try{ new Notification(notif.title,{body:notif.body,icon:"/favicon.ico"}); }catch{}
    }
  }

  function markRead(id:string){ setNotifications(prev=>{ const u=prev.map(n=>n.id===id?{...n,read:true}:n); save(u); return u; }); }
  function markAllRead(){ setNotifications(prev=>{ const u=prev.map(n=>({...n,read:true})); save(u); return u; }); }
  function clear(){ setNotifications([]); localStorage.removeItem("nexora_notifications"); }

  return { notifications, unreadCount:notifications.filter(n=>!n.read).length, permission, requestPermission, push, markRead, markAllRead, clear };
}

export function NotificationBell() {
  const { notifications, unreadCount, permission, requestPermission, push, markRead, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const demos=[
      {type:"price" as const,    icon:"📊",title:"BTC Price Alert",      body:"Bitcoin up 2.3% in the last hour! Now at $43,000+",        action:"/wallet"},
      {type:"system" as const,   icon:"🔔",title:"New Feature: AI Trading",body:"Auto-trade with smart algorithms. Try it now!",           action:"/ai-trading"},
      {type:"security" as const, icon:"🔒",title:"New Login Detected",   body:"Login from Lagos, Nigeria. If this wasn't you, secure your account.",action:"/profile"},
    ];
    let i=0;
    const t=setInterval(()=>{ push(demos[i++%demos.length]); },45000);
    return()=>clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const tc=(t:string)=>t==="kyc"?"#2ecc71":t==="deposit"?"#2ecc71":t==="withdrawal"?"#ff4757":t==="price"?"#00c896":t==="security"?"#ff4757":"#7a9bbf";

  return (
    <>
      <style>{`
        .nb-wrap{position:relative;}
        .nb-btn{position:relative;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.95rem;transition:all 0.2s;}
        .nb-btn:hover,.nb-btn.open{background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.3);}
        .nb-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#ff4757;color:#fff;font-size:0.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #060f0c;animation:nbP 2s infinite;}
        @keyframes nbP{0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,0.4)}70%{box-shadow:0 0 0 6px rgba(231,76,60,0)}}
        .nb-panel{position:absolute;top:calc(100%+10px);right:0;width:360px;max-width:calc(100vw - 1rem);background:#0d1b2e;border:1px solid rgba(46,204,113,0.15);border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,0.75);z-index:600;overflow:hidden;animation:nbDrop 0.2s ease;}
        @keyframes nbDrop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .nb-head{padding:0.9rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;}
        .nb-perm{padding:0.65rem 1rem;background:rgba(0,200,150,0.1);border-bottom:1px solid rgba(0,200,150,0.15);display:flex;align-items:center;justify-content:space-between;gap:0.5rem;font-size:0.78rem;}
        .nb-perm-btn{padding:0.25rem 0.7rem;background:rgba(0,200,150,0.2);border:1px solid rgba(0,200,150,0.3);border-radius:8px;color:#00c896;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;}
        .nb-list{max-height:360px;overflow-y:auto;}
        .nb-item{display:flex;align-items:flex-start;gap:0.75rem;padding:0.85rem 1rem;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.15s;}
        .nb-item:hover{background:rgba(255,255,255,0.03);}
        .nb-item.unread{background:rgba(46,204,113,0.04);}
        .nb-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
        .nb-udot{width:8px;height:8px;border-radius:50%;background:#2ecc71;flex-shrink:0;margin-top:4px;}
        .nb-empty{padding:2.5rem;text-align:center;color:#7a9bbf;font-size:0.85rem;}
      `}</style>
      <div className="nb-wrap">
        <button className={`nb-btn ${open?"open":""}`} onClick={()=>setOpen(!open)}>
          🔔
          {unreadCount>0&&<span className="nb-badge">{unreadCount>9?"9+":unreadCount}</span>}
        </button>
        {open&&(
          <div className="nb-panel">
            <div className="nb-head">
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.95rem"}}>
                Notifications {unreadCount>0&&<span style={{color:"#2ecc71"}}>({unreadCount})</span>}
              </div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                {unreadCount>0&&<button onClick={markAllRead} style={{background:"none",border:"none",cursor:"pointer",fontSize:"0.75rem",color:"#7a9bbf",fontFamily:"'Syne',sans-serif",fontWeight:600}}>Mark all read</button>}
                {notifications.length>0&&<button onClick={clear} style={{background:"none",border:"none",cursor:"pointer",fontSize:"0.75rem",color:"#7a9bbf",fontFamily:"'Syne',sans-serif",fontWeight:600}}>Clear</button>}
              </div>
            </div>
            {permission!=="granted"&&(
              <div className="nb-perm">
                <span style={{color:"#00c896"}}>🔔 Enable push notifications</span>
                <button className="nb-perm-btn" onClick={async()=>{
                  await requestPermission();
                  push({type:"system",icon:"🔔",title:"Notifications Enabled!",body:"You will now receive alerts for deposits, KYC updates and price changes.",action:"/dashboard"});
                }}>Enable</button>
              </div>
            )}
            <div className="nb-list">
              {notifications.length===0
                ?<div className="nb-empty">🔕 No notifications yet.<br/>You will see deposits, KYC updates, and price alerts here.</div>
                :notifications.map(n=>(
                  <div key={n.id} className={`nb-item ${!n.read?"unread":""}`} onClick={()=>markRead(n.id)}>
                    <div className="nb-icon" style={{background:`${tc(n.type)}15`,color:tc(n.type)}}>{n.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.84rem",marginBottom:"0.2rem"}}>{n.title}</div>
                      <div style={{fontSize:"0.78rem",color:"#7a9bbf",lineHeight:1.35,marginBottom:"0.2rem"}}>{n.body}</div>
                      <div style={{fontSize:"0.68rem",color:"#7a9bbf"}}>{new Date(n.time).toLocaleString()}</div>
                    </div>
                    {!n.read&&<div className="nb-udot"/>}
                  </div>
                ))
              }
            </div>
            <div style={{padding:"0.65rem 1rem",borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}>
              <button onClick={()=>setOpen(false)} style={{fontSize:"0.78rem",color:"#2ecc71",fontWeight:600,cursor:"pointer",background:"none",border:"none",fontFamily:"'Syne',sans-serif"}}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function notifyKycApproved(stepTitle:string) {
  try {
    const existing=JSON.parse(localStorage.getItem("nexora_notifications")??"[]");
    existing.unshift({id:Date.now().toString(),type:"kyc",icon:"🛡️",title:"KYC Step Approved!",body:`Your ${stepTitle} has been verified. Your account level has been upgraded!`,read:false,time:new Date(),action:"/profile"});
    localStorage.setItem("nexora_notifications",JSON.stringify(existing.slice(0,50)));
    if("Notification" in window&&Notification.permission==="granted") new Notification("KYC Approved! 🎉",{body:`Your ${stepTitle} has been verified.`});
  } catch {}
}

export function notifyKycRejected(stepTitle:string) {
  try {
    const existing=JSON.parse(localStorage.getItem("nexora_notifications")??"[]");
    existing.unshift({id:Date.now().toString(),type:"kyc",icon:"⚠️",title:"KYC Needs Attention",body:`Your ${stepTitle} was not approved. Please resubmit with clearer documents.`,read:false,time:new Date(),action:"/verify"});
    localStorage.setItem("nexora_notifications",JSON.stringify(existing.slice(0,50)));
    if("Notification" in window&&Notification.permission==="granted") new Notification("KYC Update",{body:`Your ${stepTitle} needs attention.`});
  } catch {}
}

export function notifyDeposit(amount:string, crypto:string) {
  try {
    const existing=JSON.parse(localStorage.getItem("nexora_notifications")??"[]");
    existing.unshift({id:Date.now().toString(),type:"deposit",icon:"✅",title:"Deposit Confirmed!",body:`${amount} ${crypto} has been credited to your Finova wallet.`,read:false,time:new Date(),action:"/wallet"});
    localStorage.setItem("nexora_notifications",JSON.stringify(existing.slice(0,50)));
  } catch {}
}
