"use client";
import { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type VerifStatus = "verified" | "pending" | "unverified";
const verificationSteps = [
  { id:"email",   icon:"✉️",  title:"Email",         status:"verified"   as VerifStatus },
  { id:"phone",   icon:"📱",  title:"Phone",         status:"verified"   as VerifStatus },
  { id:"id",      icon:"🪪",  title:"Government ID", status:"pending"    as VerifStatus },
  { id:"address", icon:"🏠",  title:"Address",       status:"unverified" as VerifStatus },
  { id:"selfie",  icon:"🤳",  title:"Selfie",        status:"unverified" as VerifStatus },
];

const navItems = [
  { icon:"🏠", label:"Dashboard",    path:"/dashboard" },
  { icon:"👛", label:"Wallet",       path:"/wallet" },
  { icon:"⬆️", label:"Deposit",     path:"/deposit" },
  { icon:"⬇️", label:"Withdraw",    path:"/withdraw" },
  { icon:"🕐", label:"Transactions", path:"/transactions" },
  
  { icon:"💰", label:"Savings",      path:"/savings" },
  { icon:"⚙️", label:"Settings",    path:"/settings" },
  { icon:"📊", label:"My Progress",  path:"/my-progress" },
];

const bottomNav = [
  { icon:"🏠", label:"Home",    path:"/dashboard" },
  { icon:"👛", label:"Wallet",  path:"/wallet" },
  { icon:"⬆️", label:"Deposit",path:"/deposit" },
  { icon:"🕐", label:"History", path:"/transactions" },
  { icon:"👤", label:"Profile", path:"/verify" },
];

export default function MobileLayout({ children, activePage }: { children: ReactNode; activePage: string }) {
  const router = useRouter();
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const verified = verificationSteps.filter(s => s.status === "verified").length;
  const total    = verificationSteps.length;
  const pct      = Math.round((verified / total) * 100);
  const level    = verified <= 1 ? "Basic" : verified <= 3 ? "Intermediate" : "Advanced";
  const lvlColor = level === "Basic" ? "#e74c3c" : level === "Intermediate" ? "#f39c12" : "#2ecc71";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap");
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --green:#2ecc71; --red:#e74c3c; --amber:#f39c12;
          --bg:#080f1a; --bg-card:#0f2038;
          --border:rgba(46,204,113,0.13); --border2:rgba(255,255,255,0.07);
          --muted:#7a9bbf; --text:#e8f0fe;
          --topbar-h:60px; --bottomnav-h:68px;
        }
        html { font-size:16px; }
        body { background:var(--bg); color:var(--text); font-family:"DM Sans",sans-serif; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#1a3a5c; border-radius:10px; }
        .ml-topbar { position:fixed; top:0; left:0; right:0; z-index:300; height:var(--topbar-h); display:flex; align-items:center; justify-content:space-between; padding:0 clamp(0.75rem, 3vw, 1rem); background:rgba(8,15,26,0.92); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); }
        .ml-logo { display:flex; align-items:center; gap:0.5rem; font-family:"Syne",sans-serif; font-weight:600; font-size:0.88rem; text-decoration:none; color:var(--text); cursor:pointer; }
        .ml-logo span { color:var(--green); }
        .ml-topbar-right { display:flex; align-items:center; gap:0.6rem; }
        .ml-notif { position:relative; width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid var(--border2); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.95rem; }
        .ml-notif-dot { position:absolute; top:-2px; right:-2px; width:14px; height:14px; border-radius:50%; background:var(--green); color:#06100d; font-size:0.55rem; font-weight:600; display:flex; align-items:center; justify-content:center; border:2px solid var(--bg); }
        .ml-hamburger { display:none; flex-direction:column; gap:4px; width:36px; height:36px; padding:8px; border-radius:10px; cursor:pointer; background:rgba(255,255,255,0.06); border:1px solid var(--border2); justify-content:center; }
        .ml-hamburger span { display:block; height:2px; border-radius:2px; background:var(--text); transition:all 0.25s; }
        .ml-hamburger.active span:nth-child(1) { transform:translateY(6px) rotate(45deg); }
        .ml-hamburger.active span:nth-child(2) { opacity:0; }
        .ml-hamburger.active span:nth-child(3) { transform:translateY(-6px) rotate(-45deg); }
        .ml-user-chip { display:flex; align-items:center; gap:0.45rem; background:rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:10px; padding:0.28rem 0.7rem; cursor:pointer; font-size:0.85rem; font-weight:500; transition:all 0.2s; position:relative; }
        .ml-user-chip:hover, .ml-user-chip.open { border-color:rgba(46,204,113,0.45); background:rgba(46,204,113,0.07); }
        .ml-avatar { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#27ae60,#1a6b40); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; color:#fff; flex-shrink:0; }
        .ml-chip-name { font-family:"Syne",sans-serif; font-weight:600; }
        .ml-chevron { font-size:0.55rem; color:var(--muted); transition:transform 0.2s; }
        .ml-chevron.up { transform:rotate(180deg); }
        .ml-profile-drop { position:absolute; top:calc(100% + 10px); right:0; width:310px; max-width:calc(100vw - 2rem); background:#0d1b2e; border:1px solid rgba(46,204,113,0.2); border-radius:18px; box-shadow:0 24px 64px rgba(0,0,0,0.75); z-index:400; overflow:hidden; animation:dropIn 0.2s ease; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .pd-head { background:linear-gradient(135deg,rgba(46,204,113,0.1),rgba(10,22,40,0.95)); padding:1.1rem; border-bottom:1px solid rgba(46,204,113,0.1); }
        .pd-user-row { display:flex; align-items:center; gap:0.85rem; margin-bottom:0.85rem; }
        .pd-big-av { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#27ae60,#1a6b40); display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:600; color:#fff; border:2px solid rgba(46,204,113,0.4); flex-shrink:0; position:relative; }
        .pd-av-dot { position:absolute; bottom:1px; right:1px; width:12px; height:12px; border-radius:50%; background:var(--green); border:2px solid #0d1b2e; }
        .pd-uname { font-family:"Syne",sans-serif; font-weight:600; font-size:0.95rem; }
        .pd-uemail { font-size:0.72rem; color:var(--muted); }
        .pd-lvl-tag { display:inline-flex; align-items:center; gap:0.3rem; padding:0.22rem 0.6rem; border-radius:20px; font-family:"Syne",sans-serif; font-weight:700; font-size:0.68rem; border:1px solid; margin-top:0.4rem; }
        .pd-prog-row { display:flex; justify-content:space-between; font-size:0.7rem; color:var(--muted); margin-bottom:0.3rem; }
        .pd-prog-track { height:4px; background:rgba(255,255,255,0.07); border-radius:4px; overflow:hidden; }
        .pd-prog-fill { height:100%; border-radius:4px; }
        .pd-steps { padding:0.8rem 1rem; }
        .pd-steps-lbl { font-size:0.68rem; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.6rem; }
        .pd-step { display:flex; align-items:center; gap:0.55rem; padding:0.42rem 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .pd-step:last-child { border-bottom:none; }
        .pd-step-ic { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; flex-shrink:0; }
        .pd-step-nm { flex:1; font-size:0.8rem; font-weight:500; }
        .pd-badge { display:inline-flex; align-items:center; padding:0.18rem 0.5rem; border-radius:10px; font-size:0.65rem; font-weight:700; }
        .pd-v { background:rgba(46,204,113,0.15); color:var(--green); border:1px solid rgba(46,204,113,0.25); }
        .pd-p { background:rgba(243,156,18,0.15); color:var(--amber); border:1px solid rgba(243,156,18,0.25); }
        .pd-u { background:rgba(255,255,255,0.06); color:var(--muted); border:1px solid rgba(255,255,255,0.08); }
        .pd-footer { padding:0.7rem 0.9rem; border-top:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:0.35rem; }
        .pd-act { display:flex; align-items:center; gap:0.55rem; padding:0.55rem 0.7rem; border-radius:9px; cursor:pointer; font-size:0.82rem; font-weight:500; background:none; border:none; color:var(--text); transition:background 0.15s; width:100%; text-align:left; }
        .pd-act:hover { background:rgba(255,255,255,0.05); }
        .pd-act.primary { background:rgba(46,204,113,0.1); color:var(--green); font-weight:700; border:1px solid rgba(46,204,113,0.18); }
        .pd-act.primary:hover { background:rgba(46,204,113,0.18); }
        .pd-act.danger { color:var(--red); }
        .pd-act.danger:hover { background:rgba(231,76,60,0.07); }
        .pd-act-ic { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:0.78rem; background:rgba(255,255,255,0.06); flex-shrink:0; }
        .ml-sidebar { position:fixed; top:var(--topbar-h); left:0; bottom:0; width:190px; z-index:200; background:rgba(8,15,26,0.97); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:1.1rem 0.75rem; overflow-y:auto; }
        .ml-sidebar-profile { display:flex; align-items:center; gap:0.65rem; padding:0.75rem; border-radius:12px; background:rgba(255,255,255,0.04); margin-bottom:1.3rem; }
        .ml-sidebar-av { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#27ae60,#1a6b40); display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700; flex-shrink:0; }
        .ml-sidebar-name { font-family:"Syne",sans-serif; font-weight:700; font-size:0.87rem; }
        .ml-sidebar-sub { font-size:0.7rem; color:var(--muted); }
        .ml-nav-item { display:flex; align-items:center; gap:0.65rem; padding:0.6rem 0.85rem; border-radius:10px; cursor:pointer; font-size:0.86rem; font-weight:500; color:var(--muted); transition:all 0.16s; margin-bottom:2px; border:none; background:none; width:100%; text-align:left; }
        .ml-nav-item:hover { background:rgba(255,255,255,0.05); color:var(--text); }
        .ml-nav-item.active { background:var(--green); color:#06100d; font-weight:700; }
        .ml-sidebar-bottom { margin-top:auto; padding-top:1rem; border-top:1px solid var(--border); }
        .ml-drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); z-index:350; opacity:0; pointer-events:none; transition:opacity 0.25s; }
        .ml-drawer-overlay.open { opacity:1; pointer-events:auto; }
        .ml-drawer { position:fixed; top:0; left:0; bottom:0; width:280px; background:#0a1628; z-index:360; display:flex; flex-direction:column; overflow-y:auto; transform:translateX(-100%); transition:transform 0.28s cubic-bezier(0.4,0,0.2,1); box-shadow:8px 0 40px rgba(0,0,0,0.6); }
        .ml-drawer.open { transform:translateX(0); }
        .ml-drawer-head { padding:1.4rem 1.2rem 1.1rem; background:linear-gradient(135deg,rgba(46,204,113,0.1),rgba(10,22,40,0.9)); border-bottom:1px solid var(--border); }
        .ml-drawer-av { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#27ae60,#1a6b40); display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:600; color:#fff; border:2px solid rgba(46,204,113,0.4); margin-bottom:0.7rem; position:relative; }
        .ml-drawer-av-dot { position:absolute; bottom:2px; right:2px; width:14px; height:14px; border-radius:50%; background:var(--green); border:2px solid #0a1628; }
        .ml-drawer-name { font-family:"Syne",sans-serif; font-weight:600; font-size:0.88rem; }
        .ml-drawer-email { font-size:0.76rem; color:var(--muted); margin-top:0.1rem; }
        .ml-drawer-lvl { display:inline-flex; align-items:center; gap:0.3rem; padding:0.25rem 0.65rem; border-radius:20px; font-family:"Syne",sans-serif; font-weight:700; font-size:0.7rem; border:1px solid; margin-top:0.5rem; }
        .ml-drawer-prog-wrap { margin-top:0.85rem; }
        .ml-drawer-prog-row { display:flex; justify-content:space-between; font-size:0.7rem; color:var(--muted); margin-bottom:0.3rem; }
        .ml-drawer-prog-track { height:4px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden; }
        .ml-drawer-nav { flex:1; padding:1rem 0.85rem; }
        .ml-drawer-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 0.9rem; border-radius:12px; cursor:pointer; font-size:0.9rem; font-weight:500; color:var(--muted); transition:all 0.16s; margin-bottom:3px; border:none; background:none; width:100%; text-align:left; }
        .ml-drawer-item:hover { background:rgba(255,255,255,0.05); color:var(--text); }
        .ml-drawer-item.active { background:var(--green); color:#06100d; font-weight:700; }
        .ml-drawer-item-icon { font-size:1.1rem; width:24px; text-align:center; flex-shrink:0; }
        .ml-drawer-bottom { padding:1rem 0.85rem 1.5rem; border-top:1px solid var(--border); }
        .ml-drawer-close { position:absolute; top:1rem; right:1rem; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.08); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1rem; color:var(--muted); }
        .ml-main { margin-left:190px; padding-top:var(--topbar-h); min-height:100vh; }
        .ml-page-inner { padding:clamp(0.85rem,3vw,1.6rem) clamp(0.85rem,3vw,1.4rem); }
        .ml-bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:300; height:calc(var(--bottomnav-h) + env(safe-area-inset-bottom, 0px)); background:rgba(8,15,26,0.97); backdrop-filter:blur(20px); border-top:1px solid var(--border); padding:0 0.5rem; padding-bottom:env(safe-area-inset-bottom,0px); }
        .ml-bottom-nav-inner { display:flex; align-items:center; justify-content:space-around; height:100%; }
        .ml-bnav-item { display:flex; flex-direction:column; align-items:center; gap:0.22rem; flex:1; cursor:pointer; padding:0.4rem 0.2rem; border:none; background:none; transition:all 0.18s; }
        .ml-bnav-icon { font-size:1.2rem; line-height:1; transition:transform 0.18s; }
        .ml-bnav-label { font-size:clamp(0.58rem,1.8vw,0.65rem); font-weight:600; color:var(--muted); font-family:"Syne",sans-serif; white-space:nowrap; }
        .ml-bnav-item.active .ml-bnav-label { color:var(--green); }
        .ml-bnav-item.active .ml-bnav-icon { transform:scale(1.2); }
        .ml-bnav-dot { display:none; width:4px; height:4px; border-radius:50%; background:var(--green); }
        .ml-bnav-item.active .ml-bnav-dot { display:block; }
        .ml-bnav-center { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#27ae60,#2ecc71); display:flex; align-items:center; justify-content:center; font-size:1rem; box-shadow:0 0 20px rgba(46,204,113,0.5); cursor:pointer; flex-shrink:0; border:none; transition:all 0.2s; margin-top:-16px; }
        .ml-bnav-center:hover { transform:scale(1.08); }
        @media (max-width: 768px) {
          .ml-sidebar { display:none; }
          .ml-hamburger { display:flex; }
          .ml-chip-name { display:none; }
          .ml-chevron { display:none; }
          .ml-main { margin-left:0; padding-bottom:calc(var(--bottomnav-h) + env(safe-area-inset-bottom, 0px)); }
          .ml-page-inner { padding:0.75rem; }
          .ml-bottom-nav { display:block; }
          .ml-profile-drop { right:-0.5rem; width:calc(100vw - 1rem); }
        }
        @media (max-width: 480px) { .ml-page-inner { padding:0.85rem; } }
        .r-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .r-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
        .r-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:0.8rem; }
        @media(max-width:768px) { .r-grid-4{grid-template-columns:1fr 1fr;} .r-grid-3{grid-template-columns:1fr 1fr;} }
        @media(max-width:480px) { .r-grid-2{grid-template-columns:1fr;} .r-grid-3{grid-template-columns:1fr;} .r-grid-4{grid-template-columns:1fr 1fr;} }
        .r-card { background:var(--bg-card); border:1px solid var(--border); border-radius:18px; padding:1.3rem; }
        @media(max-width:480px) { .r-card { border-radius:14px; padding:1rem; } }
        .r-page-title { font-family:"Syne",sans-serif; font-weight:600; font-size:1.1rem; margin-bottom:0.2rem; }
        .r-page-sub { font-size:0.86rem; color:var(--muted); margin-bottom:1.2rem; }
        .r-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .r-table-wrap table { min-width:480px; }
        @media(max-width:480px) { .hide-mobile { display:none !important; } }
        @media(min-width:769px) { .hide-desktop { display:none !important; } }
        .r-btn-primary { width:100%; padding:0.9rem; border:none; border-radius:13px; background:linear-gradient(90deg,#27ae60,#2ecc71); font-family:"Syne",sans-serif; font-weight:700; font-size:1rem; color:#05100a; cursor:pointer; box-shadow:0 0 24px rgba(46,204,113,0.35); transition:all 0.2s; }
        .r-btn-primary:hover { transform:translateY(-2px); }
      `}</style>

      <header className="ml-topbar">
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
          <button className={"ml-hamburger" + (drawerOpen ? " active" : "")} onClick={()=>setDrawerOpen(!drawerOpen)}>
            <span/><span/><span/>
          </button>
          <div className="ml-logo" onClick={()=>router.push("/dashboard")}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M6 26L14 10L20 20L24 14L28 26" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="26" r="2" fill="#2ecc71"/>
            </svg>
            Finova <span>Africa</span>
          </div>
        </div>
        <div className="ml-topbar-right">
          <div className="ml-notif">🔔<span className="ml-notif-dot">6</span></div>
          <div ref={profileRef} style={{position:"relative"}}>
            <div className={"ml-user-chip" + (profileOpen ? " open" : "")} onClick={()=>setProfileOpen(!profileOpen)}>
              <div className="ml-avatar">AX</div>
              <span className="ml-chip-name">Axion</span>
              <span className={"ml-chevron" + (profileOpen ? " up" : "")}>▾</span>
            </div>
            {profileOpen && (
              <div className="ml-profile-drop">
                <div className="pd-head">
                  <div className="pd-user-row">
                    <div className="pd-big-av">AX<div className="pd-av-dot"/></div>
                    <div>
                      <div className="pd-uname">Axion Maxwell</div>
                      <div className="pd-uemail">axion@gmail.com</div>
                      <div className="pd-lvl-tag" style={{color:lvlColor,borderColor:lvlColor,background:lvlColor+"18"}}>
                        🛡️ {level} Account
                      </div>
                    </div>
                  </div>
                  <div className="pd-prog-row"><span>Verification</span><span style={{color:lvlColor,fontWeight:700}}>{verified}/{total} · {pct}%</span></div>
                  <div className="pd-prog-track"><div className="pd-prog-fill" style={{width:pct+"%",background:"linear-gradient(90deg,"+lvlColor+","+lvlColor+"cc)"}}/></div>
                </div>
                <div className="pd-steps">
                  <div className="pd-steps-lbl">KYC Verification</div>
                  {verificationSteps.map(s=>(
                    <div key={s.id} className="pd-step">
                      <div className="pd-step-ic" style={{background:s.status==="verified"?"rgba(46,204,113,0.12)":s.status==="pending"?"rgba(243,156,18,0.12)":"rgba(255,255,255,0.05)",border:"1px solid "+(s.status==="verified"?"rgba(46,204,113,0.25)":s.status==="pending"?"rgba(243,156,18,0.25)":"rgba(255,255,255,0.07)")}}>{s.icon}</div>
                      <span className="pd-step-nm">{s.title}</span>
                      <span className={"pd-badge "+(s.status==="verified"?"pd-v":s.status==="pending"?"pd-p":"pd-u")}>{s.status==="verified"?"✓ Done":s.status==="pending"?"⏳ Review":"○ Needed"}</span>
                    </div>
                  ))}
                </div>
                <div className="pd-footer">
                  <button className="pd-act primary" onClick={()=>{setProfileOpen(false);router.push("/profile");}}><span className="pd-act-ic">🛡️</span>Complete Verification</button>
                  <button className="pd-act" onClick={()=>{setProfileOpen(false);router.push("/profile");}}><span className="pd-act-ic">👤</span>View Full Profile</button>
                  <button className="pd-act" onClick={()=>{setProfileOpen(false);router.push("/profile");}}><span className="pd-act-ic">🔒</span>Security Settings</button>
                  <button className="pd-act danger" onClick={()=>{setProfileOpen(false);router.push("/login");}}><span className="pd-act-ic" style={{background:"rgba(231,76,60,0.1)"}}>🚪</span>Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="ml-sidebar">
        <div className="ml-sidebar-profile">
          <div className="ml-sidebar-av">AX</div>
          <div><div className="ml-sidebar-name">Axion</div><div className="ml-sidebar-sub">Basic Account</div></div>
        </div>
        {navItems.map(item=>(
          <button key={item.label} className={"ml-nav-item"+(activePage===item.label?" active":"")} onClick={()=>router.push(item.path)}>
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
        <div className="ml-sidebar-bottom">
          <button className="ml-nav-item" onClick={()=>router.push("/login")} style={{color:"#e74c3c"}}>
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className={"ml-drawer-overlay"+(drawerOpen?" open":"")} onClick={()=>setDrawerOpen(false)}/>
      <nav className={"ml-drawer"+(drawerOpen?" open":"")}>
        <button className="ml-drawer-close" onClick={()=>setDrawerOpen(false)}>✕</button>
        <div className="ml-drawer-head">
          <div className="ml-drawer-av">AX<div className="ml-drawer-av-dot"/></div>
          <div className="ml-drawer-name">Axion Maxwell</div>
          <div className="ml-drawer-email">axion@gmail.com</div>
          <div className="ml-drawer-lvl" style={{color:lvlColor,borderColor:lvlColor,background:lvlColor+"18"}}>🛡️ {level} Account</div>
          <div className="ml-drawer-prog-wrap">
            <div className="ml-drawer-prog-row"><span>Verification</span><span style={{color:lvlColor,fontWeight:700}}>{pct}% complete</span></div>
            <div className="ml-drawer-prog-track"><div style={{width:pct+"%",background:"linear-gradient(90deg,"+lvlColor+","+lvlColor+"cc)",height:"100%",borderRadius:"4px"}}/></div>
          </div>
        </div>
        <div className="ml-drawer-nav">
          {navItems.map(item=>(
            <button key={item.label} className={"ml-drawer-item"+(activePage===item.label?" active":"")} onClick={()=>{setDrawerOpen(false);router.push(item.path);}}>
              <span className="ml-drawer-item-icon">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="ml-drawer-bottom">
          <button className="ml-drawer-item" onClick={()=>{setDrawerOpen(false);router.push("/profile");}} style={{color:"var(--green)"}}>
            <span className="ml-drawer-item-icon">👤</span><span>My Profile</span>
          </button>
          <button className="ml-drawer-item" onClick={()=>{setDrawerOpen(false);router.push("/login");}} style={{color:"#e74c3c"}}>
            <span className="ml-drawer-item-icon">🚪</span><span>Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="ml-main">
        <div className="ml-page-inner">{children}</div>
      </main>

      <nav className="ml-bottom-nav">
        <div className="ml-bottom-nav-inner">
          {bottomNav.slice(0,2).map(item=>(
            <button key={item.label} className={"ml-bnav-item"+(activePage===item.label||(activePage==="Transactions"&&item.label==="History")?" active":"")} onClick={()=>router.push(item.path)}>
              <span className="ml-bnav-icon">{item.icon}</span>
              <span className="ml-bnav-label">{item.label}</span>
              <span className="ml-bnav-dot"/>
            </button>
          ))}
          <button className="ml-bnav-center" onClick={()=>router.push("/deposit")}>⬆️</button>
          {bottomNav.slice(3).map(item=>(
            <button key={item.label} className={"ml-bnav-item"+(activePage===item.label||(activePage==="Transactions"&&item.label==="History")?" active":"")} onClick={()=>router.push(item.path)}>
              <span className="ml-bnav-icon">{item.icon}</span>
              <span className="ml-bnav-label">{item.label}</span>
              <span className="ml-bnav-dot"/>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
