"use client";
import { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import LiveChat from "./LiveChat";
import PWAInstaller from "./PWAInstaller";
import SessionGuard from "./SessionGuard";
import PenaltyBanner from "./PenaltyBanner";
import { NotificationBell } from "./Notifications";

const NAV = [
  { icon:"🏠", label:"Dashboard",   path:"/dashboard"   },
  { icon:"👛", label:"Wallet",      path:"/wallet"       },
  { icon:"⬆️", label:"Deposit",    path:"/deposit"      },
  { icon:"⬇️", label:"Withdraw",   path:"/withdraw"     },
  { icon:"💰", label:"Savings",     path:"/savings"      },
  { icon:"🕐", label:"History",     path:"/transactions" },
  { icon:"🪪", label:"Verify ID",   path:"/verify"       },
  { icon:"📊", label:"Progress",    path:"/my-progress"  },
  { icon:"⚙️", label:"Settings",   path:"/settings"     },
  { icon:"🔐", label:"Security",   path:"/security"     },
];

const BOTTOM_NAV = [
  { icon:"🏠", label:"Home",    path:"/dashboard"   },
  { icon:"👛", label:"Wallet",  path:"/wallet"       },
  { icon:"💰", label:"Savings", path:"/savings"      },
  { icon:"📊", label:"Progress",path:"/my-progress"  },
];

function doLogout() {
  const keys = [
    "nexora_token","nexora_loggedin","nexora_user","nexora_savings",
    "nexora_notifications","nexora_payments","nexora_kyc","nexora_visited",
    "nexora_exchangers","nexora_support_team","nexora_remember",
    // legacy keys too
    "finova_token","finova_loggedin","finova_user","finova_savings",
    "finova_notifications","finova_payments","finova_kyc","finova_visited"
  ];
  keys.forEach(k=>{ try { localStorage.removeItem(k); } catch(e){} });
  window.location.replace("/login");
}

function getUser() {
  try {
    const raw = localStorage.getItem("nexora_user") || localStorage.getItem("finova_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getInitials(name: string): string {
  if (!name || name.trim()==="") return "U";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0,2).toUpperCase();
  return (words[0][0] + words[words.length-1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "linear-gradient(135deg,#00a87a,#00c896)",
    "linear-gradient(135deg,#0066ff,#00c896)",
    "linear-gradient(135deg,#7c3aed,#00c896)",
    "linear-gradient(135deg,#dc2626,#ff6b6b)",
    "linear-gradient(135deg,#0891b2,#06b6d4)",
    "linear-gradient(135deg,#d97706,#fbbf24)",
  ];
  let hash = 0;
  for (let i=0; i<name.length; i++) hash = name.charCodeAt(i) + ((hash<<5)-hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function MobileLayout({ children, activePage }: { children: ReactNode; activePage: string }) {
  const router = useRouter();
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [user,         setUser]         = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load user and listen for changes
  useEffect(()=>{
    function loadUser() {
      const u = getUser();
      setUser(u);
    }
    loadUser();
    // Re-load if localStorage changes (e.g. after profile update)
    window.addEventListener("storage", loadUser);
    // Also poll every 2 seconds to catch same-tab updates
    const interval = setInterval(loadUser, 2000);
    return ()=>{
      window.removeEventListener("storage", loadUser);
      clearInterval(interval);
    };
  },[]);

  // Close profile dropdown when clicking outside
  useEffect(()=>{
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return ()=>document.removeEventListener("mousedown", handler);
  },[]);

  // Lock body scroll when drawer open
  useEffect(()=>{
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return ()=>{ document.body.style.overflow = ""; };
  },[drawerOpen]);

  const userName  = user?.name  || "User";
  const userEmail = user?.email || "";
  const initials  = getInitials(userName);
  const firstName = userName.split(" ")[0];
  const avatarBg  = getAvatarColor(userName);
  const photoUrl  = user?.photoPreview || user?.photo_url || null;

  function Avatar({ size=32, fontSize=0.75 }: { size?:number; fontSize?:number }) {
    return (
      <div style={{
        width:`${size}px`, height:`${size}px`, borderRadius:"50%",
        background: photoUrl ? "transparent" : avatarBg,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:`${fontSize}rem`, fontWeight:700, color:"#050f0c",
        flexShrink:0, overflow:"hidden",
        border:"2px solid rgba(0,200,150,0.3)",
      }}>
        {photoUrl
          ? <img src={photoUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={initials}/>
          : <span style={{color:"#050f0c"}}>{initials}</span>
        }
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --g:#00c896;--g2:#00a87a;--g3:#4dffc3;
          --red:#ff4757;
          --bg:#050f0c;--card:#081a14;--card2:#060f0c;
          --border:rgba(0,200,150,0.15);--border2:rgba(0,200,150,0.08);
          --muted:#5a8a7a;--text:#e8f8f4;
          --topbar:56px;--bottomnav:64px;
        }
        body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#081a14;border-radius:10px;}

        /* TOPBAR */
        .ml-top{position:fixed;top:0;left:0;right:0;z-index:300;height:var(--topbar);
          display:flex;align-items:center;justify-content:space-between;padding:0 1rem;
          background:rgba(5,15,12,0.97);backdrop-filter:blur(20px);
          border-bottom:1px solid var(--border2);}
        .ml-logo{display:flex;align-items:center;gap:0.35rem;font-weight:800;font-size:1rem;
          letter-spacing:0.05em;text-decoration:none;color:var(--text);}
        .ml-logo-mark{width:28px;height:28px;border-radius:7px;
          background:linear-gradient(135deg,#00c896,#0066ff);
          display:flex;align-items:center;justify-content:center;}
        .ml-logo-name{background:linear-gradient(135deg,#00c896,#4dffc3);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .ml-top-right{display:flex;align-items:center;gap:0.5rem;}
        .ml-burger{display:none;flex-direction:column;gap:4px;width:34px;height:34px;
          padding:7px;border-radius:9px;cursor:pointer;
          background:rgba(0,200,150,0.06);border:1px solid var(--border2);justify-content:center;}
        .ml-burger span{display:block;height:1.5px;border-radius:2px;background:var(--text);transition:all 0.25s;}
        .ml-burger.open span:nth-child(1){transform:translateY(5.5px) rotate(45deg);}
        .ml-burger.open span:nth-child(2){opacity:0;}
        .ml-burger.open span:nth-child(3){transform:translateY(-5.5px) rotate(-45deg);}

        /* USER CHIP */
        .ml-chip{display:flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.06);
          border:1px solid var(--border);border-radius:9px;padding:0.22rem 0.6rem;
          cursor:pointer;transition:all 0.2s;position:relative;}
        .ml-chip:hover,.ml-chip.open{border-color:rgba(0,200,150,0.4);background:rgba(0,200,150,0.1);}
        .ml-chip-name{font-weight:600;font-size:0.78rem;}

        /* PROFILE DROPDOWN */
        .ml-drop{position:absolute;top:calc(100%+8px);right:0;width:270px;
          max-width:calc(100vw-1rem);background:#081a14;
          border:1px solid rgba(0,200,150,0.18);border-radius:16px;
          box-shadow:0 20px 56px rgba(0,0,0,0.7);z-index:400;overflow:hidden;
          animation:dropIn 0.18s ease;}
        @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .pd-head{background:rgba(0,200,150,0.06);padding:0.95rem;border-bottom:1px solid var(--border2);}
        .pd-row{display:flex;align-items:center;gap:0.7rem;margin-bottom:0.5rem;}
        .pd-actions{padding:0.35rem;}
        .pd-btn{display:flex;align-items:center;gap:0.5rem;padding:0.58rem 0.65rem;
          border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:500;
          background:none;border:none;color:var(--text);transition:background 0.15s;width:100%;text-align:left;}
        .pd-btn:hover{background:rgba(0,200,150,0.07);}
        .pd-btn.red{color:var(--red);}
        .pd-btn.red:hover{background:rgba(255,71,87,0.07);}
        .pd-ic{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;background:rgba(0,200,150,0.08);flex-shrink:0;}

        /* SIDEBAR - desktop */
        .ml-side{position:fixed;top:var(--topbar);left:0;bottom:0;width:188px;z-index:200;
          background:rgba(5,15,12,0.98);border-right:1px solid var(--border2);
          display:flex;flex-direction:column;padding:1rem 0.75rem;overflow-y:auto;}
        .ml-side-user{display:flex;align-items:center;gap:0.6rem;padding:0.7rem;
          border-radius:11px;background:rgba(0,200,150,0.04);margin-bottom:1rem;}
        .ml-side-info{min-width:0;}
        .ml-side-name{font-weight:700;font-size:0.82rem;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .ml-side-email{font-size:0.62rem;color:var(--muted);
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;}
        .ml-nav{display:flex;align-items:center;gap:0.55rem;padding:0.58rem 0.8rem;
          border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:500;
          color:var(--muted);transition:all 0.16s;margin-bottom:2px;
          border:none;background:none;width:100%;text-align:left;}
        .ml-nav:hover{background:rgba(0,200,150,0.06);color:var(--text);}
        .ml-nav.active{background:var(--g);color:#050f0c;font-weight:700;}
        .ml-side-bottom{margin-top:auto;padding-top:0.75rem;border-top:1px solid var(--border2);}

        /* DRAWER - mobile */
        .ml-ov{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
          z-index:350;opacity:0;pointer-events:none;transition:opacity 0.25s;}
        .ml-ov.open{opacity:1;pointer-events:auto;}
        .ml-drawer{position:fixed;top:0;left:0;bottom:0;width:272px;
          background:#060f0c;z-index:360;display:flex;flex-direction:column;
          transform:translateX(-100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);
          box-shadow:8px 0 40px rgba(0,0,0,0.5);}
        .ml-drawer.open{transform:translateX(0);}
        .ml-drawer-head{padding:1.3rem 1.1rem 1rem;background:rgba(0,200,150,0.06);
          border-bottom:1px solid var(--border2);position:relative;}
        .ml-drawer-close{position:absolute;top:0.9rem;right:0.9rem;width:28px;height:28px;
          border-radius:50%;background:rgba(0,200,150,0.08);border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          color:var(--muted);font-size:0.85rem;}
        .ml-drawer-nav{flex:1;padding:0.9rem 0.8rem;overflow-y:auto;}
        .ml-ditem{display:flex;align-items:center;gap:0.7rem;padding:0.72rem 0.85rem;
          border-radius:11px;cursor:pointer;font-size:0.86rem;font-weight:500;
          color:var(--muted);transition:all 0.16s;margin-bottom:3px;
          border:none;background:none;width:100%;text-align:left;}
        .ml-ditem:hover{background:rgba(0,200,150,0.06);color:var(--text);}
        .ml-ditem.active{background:var(--g);color:#050f0c;font-weight:700;}
        .ml-drawer-bottom{padding:0.85rem 0.8rem 1.3rem;border-top:1px solid var(--border2);}

        /* MAIN */
        .ml-main{margin-left:188px;padding-top:var(--topbar);min-height:100vh;}
        .ml-inner{padding:1rem;}

        /* BOTTOM NAV */
        .ml-bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:300;
          height:var(--bottomnav);background:rgba(5,15,12,0.97);
          backdrop-filter:blur(20px);border-top:1px solid var(--border2);
          padding-bottom:env(safe-area-inset-bottom,0px);}
        .ml-bnav-inner{display:flex;align-items:center;justify-content:space-around;
          height:var(--bottomnav);}
        .ml-bitem{display:flex;flex-direction:column;align-items:center;gap:0.18rem;
          flex:1;cursor:pointer;padding:0.3rem 0.1rem;
          border:none;background:none;transition:all 0.18s;}
        .ml-bitem-icon{font-size:1.15rem;line-height:1;transition:transform 0.18s;}
        .ml-bitem-label{font-size:0.58rem;font-weight:600;color:var(--muted);
          white-space:nowrap;font-family:'Inter',sans-serif;}
        .ml-bitem.active .ml-bitem-label{color:var(--g);}
        .ml-bitem.active .ml-bitem-icon{transform:scale(1.2);}
        .ml-bitem-center{width:48px;height:48px;border-radius:50%;
          background:linear-gradient(135deg,#00a87a,#00c896);
          display:flex;align-items:center;justify-content:center;
          font-size:1.2rem;box-shadow:0 0 18px rgba(0,200,150,0.35);
          cursor:pointer;flex-shrink:0;border:none;transition:all 0.2s;margin-top:-14px;}
        .ml-bitem-center:hover{transform:scale(1.08);}

        /* FOOTER */
        .ml-footer{border-top:1px solid var(--border2);padding:1rem;text-align:center;margin-top:1rem;}
        .ml-footer-links{display:flex;gap:1.2rem;justify-content:center;flex-wrap:wrap;margin-bottom:0.4rem;}
        .ml-footer-link{font-size:0.6rem;color:#3a5a4a;text-decoration:none;transition:color 0.2s;}
        .ml-footer-link:hover{color:var(--g);}
        .ml-footer-copy{font-size:0.57rem;color:#2a4a3a;}

        /* GLOBAL CARD */
        .r-card{background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:1.1rem;}

        /* RESPONSIVE */
        @media(max-width:768px){
          .ml-side{display:none;}
          .ml-burger{display:flex;}
          .ml-chip-name{display:none;}
          .ml-main{margin-left:0;padding-bottom:var(--bottomnav);}
          .ml-inner{padding:0.85rem;}
          .ml-bnav{display:block;}
          .ml-drop{right:-0.4rem;width:calc(100vw - 1rem);}
        }
        @media(max-width:380px){.ml-inner{padding:0.75rem;}}
      `}</style>

      {/* ── TOPBAR ── */}
      <header className="ml-top">
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <button className={`ml-burger ${drawerOpen?"open":""}`} onClick={()=>setDrawerOpen(!drawerOpen)}>
            <span/><span/><span/>
          </button>
          <a className="ml-logo" href="/dashboard" onClick={e=>{e.preventDefault();router.push("/dashboard");}}>
            <div className="ml-logo-mark">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="ml-logo-name">NEXORA</span>
          </a>
        </div>

        <div className="ml-top-right">
          <NotificationBell />
          <div ref={profileRef} style={{position:"relative"}}>
            <div className={`ml-chip ${profileOpen?"open":""}`} onClick={()=>setProfileOpen(!profileOpen)}>
              <Avatar size={26} fontSize={0.65}/>
              <span className="ml-chip-name">{firstName}</span>
              <span style={{fontSize:"0.55rem",color:profileOpen?"var(--g)":"var(--muted)",transition:"transform 0.2s",display:"inline-block",transform:profileOpen?"rotate(180deg)":"none"}}>▾</span>
            </div>

            {profileOpen&&(
              <div className="ml-drop">
                <div className="pd-head">
                  <div className="pd-row">
                    <Avatar size={44} fontSize={0.95}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:"0.9rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</div>
                      <div style={{fontSize:"0.68rem",color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userEmail}</div>
                    </div>
                  </div>
                </div>
                <div className="pd-actions">
                  {[
                    {icon:"📊",label:"My Progress",  path:"/my-progress"},
                    {icon:"🪪", label:"Verify ID",    path:"/verify"},
                    {icon:"⚙️",label:"Settings",     path:"/settings"},
                  ].map(item=>(
                    <button key={item.label} className="pd-btn" onClick={()=>{setProfileOpen(false);router.push(item.path);}}>
                      <span className="pd-ic">{item.icon}</span>{item.label}
                    </button>
                  ))}
                  <div style={{height:"1px",background:"rgba(0,200,150,0.08)",margin:"0.3rem 0"}}/>
                  <button className="pd-btn red" onClick={()=>{setProfileOpen(false);doLogout();}}>
                    <span className="pd-ic" style={{background:"rgba(255,71,87,0.1)"}}>🚪</span>Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="ml-side">
        <div className="ml-side-user">
          <Avatar size={32} fontSize={0.72}/>
          <div className="ml-side-info">
            <div className="ml-side-name">{firstName}</div>
            <div className="ml-side-email">{userEmail}</div>
          </div>
        </div>
        {NAV.map(item=>(
          <button key={item.label} className={`ml-nav ${activePage===item.label?"active":""}`} onClick={()=>router.push(item.path)}>
            <span style={{fontSize:"0.95rem"}}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <div className="ml-side-bottom">
          <button className="ml-nav" style={{color:"var(--red)"}} onClick={doLogout}>
            <span style={{fontSize:"0.95rem"}}>🚪</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      <div className={`ml-ov ${drawerOpen?"open":""}`} onClick={()=>setDrawerOpen(false)}/>
      <nav className={`ml-drawer ${drawerOpen?"open":""}`}>
        <button className="ml-drawer-close" onClick={()=>setDrawerOpen(false)}>✕</button>
        <div className="ml-drawer-head">
          <div style={{marginBottom:"0.75rem"}}>
            <Avatar size={52} fontSize={1.1}/>
          </div>
          <div style={{fontWeight:800,fontSize:"1rem",marginBottom:"0.1rem"}}>{userName}</div>
          <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{userEmail}</div>
        </div>
        <div className="ml-drawer-nav">
          {NAV.map(item=>(
            <button key={item.label} className={`ml-ditem ${activePage===item.label?"active":""}`}
              onClick={()=>{setDrawerOpen(false);router.push(item.path);}}>
              <span style={{fontSize:"1rem",width:"22px",textAlign:"center"}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="ml-drawer-bottom">
          <button className="ml-ditem" style={{color:"var(--red)"}}
            onClick={()=>{setDrawerOpen(false);doLogout();}}>
            <span style={{fontSize:"1rem",width:"22px",textAlign:"center"}}>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="ml-main">
        <div className="ml-inner">
          {children}
        </div>
        <footer className="ml-footer">
          <div className="ml-footer-links">
            <a href="/about"   className="ml-footer-link">About</a>
            <a href="/faq"     className="ml-footer-link">FAQ</a>
            <a href="/contact" className="ml-footer-link">Contact</a>
            <a href="/terms"   className="ml-footer-link">Terms</a>
            <a href="/trust"   className="ml-footer-link">🛡️ Security</a>
            <a href="/privacy" className="ml-footer-link">Privacy</a>
            <a href="/risk"    className="ml-footer-link">Risk Disclosure</a>
          </div>
          <div className="ml-footer-copy">EU MiCA & FSCA compliance in progress · © 2026 NEXORA</div>
        </footer>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="ml-bnav">
        <div className="ml-bnav-inner">
          {BOTTOM_NAV.slice(0,2).map(item=>(
            <button key={item.label} className={`ml-bitem ${activePage===item.label?"active":""}`} onClick={()=>router.push(item.path)}>
              <span className="ml-bitem-icon">{item.icon}</span>
              <span className="ml-bitem-label">{item.label}</span>
            </button>
          ))}
          <button className="ml-bitem-center" onClick={()=>router.push("/deposit")}>⬆️</button>
          {BOTTOM_NAV.slice(2).map(item=>(
            <button key={item.label} className={`ml-bitem ${activePage===item.label?"active":""}`} onClick={()=>router.push(item.path)}>
              <span className="ml-bitem-icon">{item.icon}</span>
              <span className="ml-bitem-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <LiveChat />
      <PWAInstaller />
      <SessionGuard />
      <PenaltyBanner />
    </>
  );
}
