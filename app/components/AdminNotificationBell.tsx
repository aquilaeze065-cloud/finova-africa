"use client";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_ICONS:Record<string,string> = {
  registration:"🆕", payment:"💳", savings:"💰", withdrawal:"⬇️",
  referral:"🎁", kyc:"🪪", penalty:"⚠️", info:"ℹ️",
};

interface Props { compact?: boolean; }

export default function AdminNotificationBell({ compact }: Props) {
  const [notifs,  setNotifs]  = useState<any[]>([]);
  const [unread,  setUnread]  = useState(0);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/admin-notifications`);
      const data = await res.json();
      if (data.notifications) {
        setNotifs(data.notifications);
        setUnread(data.unread || 0);
      }
    } catch {}
  }, []);

  useEffect(()=>{
    fetchNotifs();
    // Poll every 15 seconds for new notifications
    const interval = setInterval(fetchNotifs, 15000);
    return ()=>clearInterval(interval);
  },[fetchNotifs]);

  async function markAllRead() {
    try {
      await fetch(`${API}/api/admin-notifications/read-all`,{method:"PUT"});
      setUnread(0);
      setNotifs(n=>n.map(x=>({...x,read:true})));
    } catch {}
  }

  function timeAgo(date:string) {
    const diff=Date.now()-new Date(date).getTime();
    const m=Math.floor(diff/60000),h=Math.floor(diff/3600000),d=Math.floor(diff/86400000);
    if(m<2)return "Just now";if(m<60)return `${m}m ago`;
    if(h<24)return `${h}h ago`;return `${d}d ago`;
  }

  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>{ setOpen(o=>!o); if(!open) fetchNotifs(); }}
        style={{position:"relative",width:"36px",height:"36px",borderRadius:"9px",background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.18s"}}>
        🔔
        {unread>0&&(
          <div style={{position:"absolute",top:"-4px",right:"-4px",background:"#ff4757",color:"#fff",borderRadius:"50%",width:"18px",height:"18px",fontSize:"0.6rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #050f0c",fontFamily:"Inter,sans-serif"}}>
            {unread>9?"9+":unread}
          </div>
        )}
      </button>

      {open&&(
        <div style={{position:"fixed",top:"60px",right:"12px",width:"340px",maxWidth:"calc(100vw - 24px)",background:"#081a14",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"16px",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",zIndex:9000,overflow:"hidden",animation:"nb-pop 0.2s ease"}}>
          <style>{`@keyframes nb-pop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.9rem 1rem",borderBottom:"1px solid rgba(0,200,150,0.1)",background:"rgba(0,200,150,0.05)"}}>
            <div style={{fontWeight:700,fontSize:"0.88rem",color:"#e8f8f4"}}>
              🔔 Admin Notifications {unread>0&&<span style={{color:"#ff4757"}}>({unread} new)</span>}
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              {unread>0&&<button onClick={markAllRead} style={{background:"none",border:"none",color:"#00c896",fontSize:"0.68rem",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600}}>Mark all read</button>}
              <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.9rem"}}>✕</button>
            </div>
          </div>

          {/* Notifications list */}
          <div style={{maxHeight:"420px",overflowY:"auto"}}>
            {notifs.length===0?(
              <div style={{textAlign:"center",padding:"2rem",color:"#5a8a7a",fontSize:"0.82rem"}}>
                <div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>🔔</div>
                No notifications yet. Activity will appear here.
              </div>
            ):notifs.map((n:any)=>(
              <div key={n.id} style={{padding:"0.85rem 1rem",borderBottom:"1px solid rgba(0,200,150,0.06)",background:n.read?"none":"rgba(0,200,150,0.03)",display:"flex",gap:"0.65rem",alignItems:"flex-start",transition:"background 0.15s"}}>
                <div style={{width:"34px",height:"34px",borderRadius:"9px",background:"rgba(0,200,150,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",flexShrink:0}}>
                  {TYPE_ICONS[n.type]||"🔔"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.4rem"}}>
                    <div style={{fontWeight:n.read?500:700,fontSize:"0.82rem",color:n.read?"#5a8a7a":"#e8f8f4",lineHeight:1.3}}>{n.title}</div>
                    {!n.read&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#00c896",flexShrink:0,marginTop:"4px"}}/>}
                  </div>
                  <div style={{fontSize:"0.72rem",color:"#5a8a7a",marginTop:"0.15rem",lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.body}</div>
                  <div style={{fontSize:"0.62rem",color:"#3a5a4a",marginTop:"0.25rem"}}>{timeAgo(n.created_at)}</div>
                </div>
              </div>
            ))}
          </div>

          {notifs.length>0&&(
            <div style={{padding:"0.6rem 1rem",borderTop:"1px solid rgba(0,200,150,0.07)",textAlign:"center"}}>
              <button onClick={fetchNotifs} style={{background:"none",border:"none",color:"#5a8a7a",fontSize:"0.72rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
