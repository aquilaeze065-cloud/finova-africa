"use client";
import { useState, useEffect } from "react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner,     setShowBanner]     = useState(false);
  const [isIOS,          setIsIOS]          = useState(false);

  useEffect(()=>{
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(reg=>console.log("✅ SW registered"))
        .catch(()=>{});
    }

    const isInstalled = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (isInstalled) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const dismissed = localStorage.getItem("nexora_pwa_dismissed");
    if (dismissed && Date.now()-parseInt(dismissed) < 7*24*60*60*1000) return;

    window.addEventListener("beforeinstallprompt", (e:any)=>{
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(()=>setShowBanner(true), 3000);
    });

    if (ios) setTimeout(()=>setShowBanner(true), 3000);
  },[]);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
  }

  function dismiss() {
    localStorage.setItem("nexora_pwa_dismissed", Date.now().toString());
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div style={{
      position:"fixed" as const,
      bottom:0, left:0, right:0,
      zIndex:9990,
      background:"linear-gradient(135deg,#081a14,#060f0c)",
      borderTop:"2px solid rgba(0,200,150,0.25)",
      padding:"1rem 1.2rem",
      display:"flex",
      alignItems:"center",
      gap:"0.75rem",
      boxShadow:"0 -8px 32px rgba(0,0,0,0.6)",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      <div style={{width:"42px",height:"42px",borderRadius:"11px",background:"linear-gradient(135deg,#00c896,#0066ff)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{flex:1, minWidth:0}}>
        <div style={{fontWeight:700, fontSize:"0.86rem", color:"#e8f8f4"}}>Install NEXORA App</div>
        <div style={{fontSize:"0.68rem", color:"#5a8a7a", lineHeight:1.4}}>
          {isIOS ? "Tap Share → Add to Home Screen" : "Save to home screen for instant access"}
        </div>
      </div>

      {!isIOS && (
        <button onClick={install} style={{padding:"0.5rem 1rem",border:"none",borderRadius:"9px",background:"linear-gradient(135deg,#00a87a,#00c896)",color:"#050f0c",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0}}>
          Install
        </button>
      )}

      <button onClick={dismiss} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"1rem",padding:"0.2rem",flexShrink:0}}>
        ✕
      </button>
    </div>
  );
}
