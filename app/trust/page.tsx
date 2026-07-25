"use client";
import { useRouter } from "next/navigation";

export default function TrustPage() {
  const router = useRouter();
  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;}
        .wrap{max-width:720px;margin:0 auto;padding:0 1.2rem 4rem;}
        .nav{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 0;}
        .logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;font-size:0.95rem;text-decoration:none;color:#e8f8f4;}
        .logo-mark{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;}
        .back{padding:0.38rem 0.85rem;border:1px solid rgba(0,200,150,0.18);border-radius:8px;background:none;color:#5a8a7a;cursor:pointer;font-size:0.78rem;font-family:Inter,sans-serif;}
        .hero{text-align:center;padding:2.5rem 0 2rem;}
        .shield{width:88px;height:88px;border-radius:22px;background:linear-gradient(135deg,#00a87a,#00c896);display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem;font-size:2.5rem;box-shadow:0 0 40px rgba(0,200,150,0.35);}
        .hero-title{font-family:Syne,sans-serif;font-weight:800;font-size:clamp(1.6rem,4vw,2.2rem);margin-bottom:0.75rem;background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .hero-sub{font-size:0.88rem;color:#5a8a7a;max-width:480px;margin:0 auto;line-height:1.75;}
        .vbanner{background:linear-gradient(135deg,rgba(0,200,150,0.1),rgba(0,102,255,0.06));border:1px solid rgba(0,200,150,0.25);border-radius:16px;padding:1.2rem;text-align:center;margin:1.5rem 0;}
        .vbadge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.12);border:1px solid rgba(0,200,150,0.3);border-radius:20px;padding:0.35rem 1rem;font-size:0.75rem;color:#00c896;font-weight:700;margin-bottom:0.35rem;}
        .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.65rem;margin:1.2rem 0;}
        .stat{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:12px;padding:0.9rem;text-align:center;}
        .stat-val{font-family:Syne,sans-serif;font-weight:800;font-size:1.3rem;color:#00c896;}
        .stat-lbl{font-size:0.62rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.06em;margin-top:0.15rem;}
        .sec-title{font-family:Syne,sans-serif;font-weight:800;font-size:1.1rem;margin:2rem 0 1rem;color:#e8f8f4;}
        .badge-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;}
        .badge-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:14px;padding:1.1rem;text-align:center;transition:all 0.2s;}
        .badge-card:hover{border-color:rgba(0,200,150,0.25);transform:translateY(-2px);}
        .b-icon{font-size:1.8rem;margin-bottom:0.5rem;}
        .b-name{font-weight:700;font-size:0.82rem;margin-bottom:0.2rem;}
        .b-sub{font-size:0.66rem;color:#5a8a7a;line-height:1.4;}
        .b-status{display:inline-block;margin-top:0.5rem;padding:0.18rem 0.5rem;border-radius:20px;font-size:0.6rem;font-weight:700;}
        .active{background:rgba(0,200,150,0.1);color:#00c896;border:1px solid rgba(0,200,150,0.2);}
        .inprog{background:rgba(255,165,0,0.1);color:#ffa500;border:1px solid rgba(255,165,0,0.2);}
        .sec-list{display:flex;flex-direction:column;gap:0.5rem;}
        .sec-item{display:flex;align-items:flex-start;gap:0.75rem;padding:0.85rem;background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:12px;}
        .sec-ic{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,0.15),transparent);margin:1.5rem 0;}
        .cta-box{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:18px;padding:1.8rem;text-align:center;margin-top:1.5rem;}
        .cta-btn{padding:0.88rem 2rem;border:none;border-radius:12px;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;font-weight:700;font-size:0.92rem;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 0 24px rgba(0,200,150,0.4);}
        @media(max-width:480px){.stat-grid{grid-template-columns:1fr 1fr 1fr;}.badge-grid{grid-template-columns:1fr 1fr;}}
      `}</style>

      <div className="wrap">
        <nav className="nav">
          <a className="logo" href="/">
            <div className="logo-mark"><svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <span style={{background:"linear-gradient(135deg,#00c896,#4dffc3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</span>
          </a>
          <button className="back" onClick={()=>router.back()}>← Back</button>
        </nav>

        <div className="hero">
          <div className="shield">🛡️</div>
          <h1 className="hero-title">Trusted & Secure Platform</h1>
          <p className="hero-sub">NEXORA is built with bank-grade security and regulatory compliance to protect your funds and data at every step.</p>
        </div>

        <div className="vbanner">
          <div className="vbadge">✅ NEXORA SECURITY VERIFIED</div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",color:"#e8f8f4"}}>Platform Security Status: Active & Protected</div>
          <div style={{fontSize:"0.72rem",color:"#5a8a7a",marginTop:"0.25rem"}}>Last reviewed: {new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</div>
        </div>

        <div className="stat-grid">
          {[{v:"256-bit",l:"Encryption"},{v:"99.9%",l:"Uptime SLA"},{v:"24/7",l:"Monitoring"}].map(s=>(
            <div key={s.l} className="stat"><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>
          ))}
        </div>

        <div className="divider"/>

        <div className="sec-title">🏛️ Regulatory Compliance</div>
        <div className="badge-grid">
          {[
            {icon:"🇪🇺",name:"EU MiCA",          sub:"Markets in Crypto-Assets Regulation",                status:"inprog",label:"In Progress"},
            {icon:"🇿🇦",name:"FSCA Standards",    sub:"Financial Sector Conduct Authority",                status:"inprog",label:"Aligned"},
            {icon:"🇳🇬",name:"NDPR Compliant",    sub:"Nigeria Data Protection Regulation",                status:"active", label:"Active"},
            {icon:"🌍", name:"GDPR Principles",   sub:"General Data Protection Regulation",                status:"active", label:"Applied"},
            {icon:"🔍", name:"KYC / AML",          sub:"Know Your Customer & Anti-Money Laundering",       status:"active", label:"Active"},
            {icon:"📋", name:"FATF Guidelines",    sub:"Financial Action Task Force Standards",             status:"inprog",label:"Aligned"},
          ].map(b=>(
            <div key={b.name} className="badge-card">
              <div className="b-icon">{b.icon}</div>
              <div className="b-name">{b.name}</div>
              <div className="b-sub">{b.sub}</div>
              <span className={`b-status ${b.status}`}>{b.label}</span>
            </div>
          ))}
        </div>

        <div className="divider"/>

        <div className="sec-title">🔒 Security Infrastructure</div>
        <div className="sec-list">
          {[
            {icon:"🔐",bg:"rgba(0,200,150,0.1)",  title:"AES-256 Encryption",           text:"All data encrypted at rest and in transit using AES-256 — same standard used by banks worldwide."},
            {icon:"📱",bg:"rgba(0,102,255,0.1)",   title:"Two-Factor Authentication",    text:"Optional WhatsApp 2FA adds a second verification layer beyond your password."},
            {icon:"⏱️",bg:"rgba(255,165,0,0.1)",  title:"Auto Session Timeout",         text:"Sessions expire after 30 minutes of inactivity to protect you on shared devices."},
            {icon:"📋",bg:"rgba(0,200,150,0.08)",  title:"Login History Monitoring",     text:"Every login recorded with device, IP, and timestamp so you can detect unauthorized access."},
            {icon:"🛡️",bg:"rgba(99,102,241,0.1)", title:"Rate Limiting & DDoS Guard",   text:"APIs protected by rate limiting, brute force detection, and IP blocking."},
            {icon:"🧹",bg:"rgba(0,200,150,0.08)",  title:"Input Sanitization",           text:"All inputs sanitized to prevent SQL injection, XSS, and NoSQL injection attacks."},
            {icon:"🌐",bg:"rgba(0,102,255,0.08)",  title:"HTTPS Everywhere (HSTS)",      text:"NEXORA enforces HTTPS on all connections with strict transport security."},
            {icon:"🔍",bg:"rgba(0,200,150,0.06)",  title:"KYC Identity Verification",    text:"Identity verified before full account access, preventing fraud."},
            {icon:"🚨",bg:"rgba(255,71,87,0.08)",  title:"Suspicious Activity Detection",text:"Automated monitoring for unusual login patterns and suspicious transactions."},
          ].map(item=>(
            <div key={item.title} className="sec-item">
              <div className="sec-ic" style={{background:item.bg}}>{item.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:"0.84rem",marginBottom:"0.2rem"}}>{item.title}</div>
                <div style={{fontSize:"0.73rem",color:"#5a8a7a",lineHeight:1.55}}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="divider"/>

        <div className="sec-title">📊 Data Protection Commitment</div>
        <div style={{background:"linear-gradient(135deg,rgba(0,200,150,0.07),rgba(0,102,255,0.04))",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"16px",padding:"1.4rem"}}>
          {[
            {icon:"🚫",text:"We NEVER sell your personal data to third parties"},
            {icon:"🔒",text:"Financial data is encrypted and access-controlled"},
            {icon:"📧",text:"We only contact you for account and savings updates"},
            {icon:"🗑️",text:"You can request data deletion at any time"},
            {icon:"👁️",text:"You can view all data we hold about you on request"},
            {icon:"🔐",text:"Staff access to user data is logged and audited"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"0.6rem",fontSize:"0.81rem",color:"#5a8a7a",padding:"0.35rem 0",borderBottom:i<5?"1px solid rgba(0,200,150,0.05)":"none"}}>
              <span style={{flexShrink:0}}>{item.icon}</span><span>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="divider"/>

        <div className="sec-title">🤝 Responsible Disclosure</div>
        <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"14px",padding:"1.2rem",fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.75}}>
          Found a security vulnerability? Email <b style={{color:"#00c896"}}>security@nexora.com</b>. We respond within 48 hours and fix critical issues within 7 days.
        </div>

        <div className="cta-box">
          <div style={{fontSize:"1.5rem",marginBottom:"0.6rem"}}>🛡️</div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"0.4rem"}}>Your Funds Are Protected</div>
          <div style={{fontSize:"0.8rem",color:"#5a8a7a",marginBottom:"1.2rem",lineHeight:1.6}}>NEXORA combines industry-best security with regulatory compliance to keep your savings safe.</div>
          <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
            <button className="cta-btn" onClick={()=>router.push("/login")}>Start Saving Securely</button>
            <button onClick={()=>router.push("/security")} style={{padding:"0.88rem 1.5rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"12px",background:"none",color:"#5a8a7a",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:"0.88rem"}}>My Security Settings</button>
          </div>
        </div>
      </div>
    </>
  );
}
