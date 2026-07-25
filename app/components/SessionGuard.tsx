"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

const TIMEOUT_MS  = 30 * 60 * 1000;
const WARNING_MS  = 5  * 60 * 1000;
const PUBLIC = ["/","/welcome","/login","/about","/terms","/privacy","/risk","/verify-email","/trust"];

export default function SessionGuard() {
  const pathname  = usePathname();
  const [showWarn,setShowWarn] = useState(false);
  const [secs,    setSecs]     = useState(300);
  const isPublic  = PUBLIC.some(r=>pathname===r||pathname?.startsWith("/welcome"));

  const logout = useCallback(()=>{
    ["nexora_token","nexora_loggedin","nexora_user","nexora_savings",
     "finova_token","finova_loggedin","finova_user","nexora_session_expiry"]
    .forEach(k=>{ try{localStorage.removeItem(k);}catch{} });
    window.location.replace("/login?reason=timeout");
  },[]);

  const reset = useCallback(()=>{
    try{localStorage.setItem("nexora_session_expiry",(Date.now()+TIMEOUT_MS).toString());}catch{}
    setShowWarn(false); setSecs(300);
  },[]);

  useEffect(()=>{
    if(isPublic) return;
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    if(!token) return;
    if(!localStorage.getItem("nexora_session_expiry")) reset();
    const events=["mousedown","mousemove","keydown","scroll","touchstart","click"];
    events.forEach(e=>window.addEventListener(e,reset,{passive:true}));
    const iv = setInterval(()=>{
      const exp = parseInt(localStorage.getItem("nexora_session_expiry")||"0");
      const rem = exp - Date.now();
      if(rem<=0){logout();return;}
      if(rem<=WARNING_MS){setShowWarn(true);setSecs(Math.ceil(rem/1000));}
      else setShowWarn(false);
    },10000);
    return()=>{ events.forEach(e=>window.removeEventListener(e,reset)); clearInterval(iv); };
  },[pathname,isPublic,logout,reset]);

  useEffect(()=>{
    if(!showWarn) return;
    const t=setInterval(()=>setSecs(s=>{ if(s<=1){logout();return 0;} return s-1; }),1000);
    return()=>clearInterval(t);
  },[showWarn,logout]);

  if(!showWarn||isPublic) return null;

  const m=Math.floor(secs/60), s=secs%60;
  return (
    <>
      <style>{`.sg-ov{position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(12px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;}.sg-card{background:#081a14;border:1px solid rgba(255,165,0,0.3);border-radius:20px;padding:2rem 1.5rem;max-width:340px;width:100%;text-align:center;}.sg-timer{font-size:3rem;font-weight:800;color:#ffa500;margin:0.75rem 0;font-family:Inter,sans-serif;animation:sg-pulse 1s infinite;}@keyframes sg-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}.sg-btn{width:100%;padding:0.85rem;border:none;border-radius:12px;font-weight:700;font-size:0.92rem;cursor:pointer;font-family:Inter,sans-serif;margin-bottom:0.5rem;}.sg-stay{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}.sg-out{background:none;border:1px solid rgba(255,255,255,0.1);color:#5a8a7a;}`}</style>
      <div className="sg-ov">
        <div className="sg-card">
          <div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>⏱️</div>
          <div style={{fontWeight:800,fontSize:"1.05rem",color:"#e8f8f4",marginBottom:"0.35rem"}}>Session Expiring</div>
          <div style={{fontSize:"0.8rem",color:"#5a8a7a",marginBottom:"0.25rem"}}>You've been inactive. Logging out in:</div>
          <div className="sg-timer">{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</div>
          <div style={{fontSize:"0.7rem",color:"#3a5a4a",marginBottom:"1rem"}}>Any activity will keep you logged in</div>
          <button className="sg-btn sg-stay" onClick={reset}>Stay Logged In</button>
          <button className="sg-btn sg-out" onClick={logout}>Log Out Now</button>
        </div>
      </div>
    </>
  );
}
