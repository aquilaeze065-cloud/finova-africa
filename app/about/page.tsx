"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  const [activeValue, setActiveValue] = useState<number|null>(null);

  const css = `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap");
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
    body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;overflow-x:hidden;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,200,150,0.3)}50%{box-shadow:0 0 40px rgba(0,200,150,0.6)}}
    .wrap{max-width:900px;margin:0 auto;padding:0 1.2rem 5rem;}
    .nav{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 0;margin-bottom:0.5rem;position:sticky;top:0;background:rgba(5,15,12,0.95);backdrop-filter:blur(20px);z-index:100;border-bottom:1px solid rgba(0,200,150,0.06);}
    .nav-logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;font-size:0.95rem;text-decoration:none;color:#e8f8f4;cursor:pointer;}
    .nav-logo-mark{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;}
    .nav-links{display:flex;align-items:center;gap:0.5rem;}
    .nav-btn{padding:0.4rem 0.9rem;border-radius:9px;font-size:0.8rem;font-weight:600;cursor:pointer;border:none;font-family:"Inter",sans-serif;transition:all 0.18s;}
    .nav-btn.outline{background:none;border:1px solid rgba(0,200,150,0.2);color:#5a8a7a;}
    .nav-btn.outline:hover{border-color:rgba(0,200,150,0.4);color:#00c896;}
    .nav-btn.solid{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
    .hero{text-align:center;padding:4rem 0 3rem;animation:fadeUp 0.6s ease both;}
    .hero-badge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:0.38rem 1rem;font-size:0.75rem;color:#00c896;font-weight:600;margin-bottom:1.5rem;}
    .hero-title{font-family:"Syne",sans-serif;font-weight:900;font-size:clamp(2rem,5vw,3.2rem);line-height:1.12;margin-bottom:1rem;}
    .gr{background:linear-gradient(135deg,#00c896,#4dffc3,#00c896);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s infinite;}
    .hero-sub{font-size:0.95rem;color:#5a8a7a;max-width:540px;margin:0 auto;line-height:1.75;}
    .section{margin-bottom:4rem;}
    .section-tag{font-size:0.68rem;font-weight:700;color:#00c896;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.6rem;}
    .section-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.4rem,3vw,1.9rem);margin-bottom:1rem;line-height:1.2;}
    .section-text{font-size:0.88rem;color:#5a8a7a;line-height:1.85;margin-bottom:0.85rem;}
    .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,0.15),transparent);margin:3rem 0;}
    .card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:18px;padding:1.4rem;transition:all 0.22s;}
    .card:hover{border-color:rgba(0,200,150,0.25);transform:translateY(-3px);}
    .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-top:1.2rem;}
    .grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1.2rem;}
    .icon-box{width:48px;height:48px;border-radius:13px;background:rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:0.85rem;animation:float 3s ease infinite;}
    .card-title{font-weight:700;font-size:0.95rem;margin-bottom:0.4rem;}
    .card-text{font-size:0.78rem;color:#5a8a7a;line-height:1.65;}
    .stat-band{background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,102,255,0.04));border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:2rem;margin:2rem 0;}
    .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center;}
    .stat-val{font-family:"Syne",sans-serif;font-weight:800;font-size:1.6rem;color:#00c896;margin-bottom:0.2rem;}
    .stat-lbl{font-size:0.68rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.06em;}
    .value-item{padding:1rem;background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:14px;cursor:pointer;transition:all 0.2s;margin-bottom:0.5rem;}
    .value-item:hover{border-color:rgba(0,200,150,0.2);}
    .value-item.open{border-color:rgba(0,200,150,0.3);background:rgba(0,200,150,0.04);}
    .value-header{display:flex;align-items:center;gap:0.75rem;}
    .value-icon{width:36px;height:36px;border-radius:9px;background:rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
    .value-title{font-weight:700;font-size:0.88rem;flex:1;}
    .value-arrow{color:#5a8a7a;transition:transform 0.2s;font-size:0.8rem;}
    .value-arrow.open{transform:rotate(180deg);color:#00c896;}
    .value-body{font-size:0.78rem;color:#5a8a7a;line-height:1.7;margin-top:0.6rem;padding-top:0.6rem;border-top:1px solid rgba(0,200,150,0.08);}
    .step-list{display:flex;flex-direction:column;gap:0.6rem;margin-top:1.2rem;}
    .step-item{display:flex;gap:1rem;align-items:flex-start;padding:1rem;background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:14px;transition:all 0.2s;}
    .step-item:hover{border-color:rgba(0,200,150,0.2);}
    .step-num{font-family:"Syne",sans-serif;font-weight:800;font-size:1.5rem;color:rgba(0,200,150,0.2);flex-shrink:0;line-height:1;min-width:32px;}
    .step-title{font-weight:700;font-size:0.88rem;margin-bottom:0.25rem;}
    .step-text{font-size:0.78rem;color:#5a8a7a;line-height:1.6;}
    .compliance-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;margin-top:1.2rem;}
    .comp-badge{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:12px;padding:1rem;text-align:center;transition:all 0.2s;}
    .comp-badge:hover{border-color:rgba(0,200,150,0.25);transform:translateY(-2px);}
    .comp-icon{font-size:1.6rem;margin-bottom:0.5rem;}
    .comp-name{font-weight:700;font-size:0.8rem;margin-bottom:0.15rem;}
    .comp-sub{font-size:0.65rem;color:#5a8a7a;line-height:1.4;}
    .comp-status{display:inline-block;margin-top:0.4rem;padding:0.15rem 0.5rem;border-radius:20px;font-size:0.6rem;font-weight:700;}
    .active{background:rgba(0,200,150,0.1);color:#00c896;border:1px solid rgba(0,200,150,0.2);}
    .progress{background:rgba(255,165,0,0.1);color:#ffa500;border:1px solid rgba(255,165,0,0.2);}
    .cta-box{background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,102,255,0.04));border:1px solid rgba(0,200,150,0.18);border-radius:24px;padding:3rem 2rem;text-align:center;margin-top:2rem;}
    .cta-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.4rem,3vw,2rem);margin-bottom:0.75rem;}
    .cta-sub{font-size:0.9rem;color:#5a8a7a;margin-bottom:1.8rem;line-height:1.7;}
    .cta-btns{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
    .cta-btn{padding:0.9rem 1.8rem;border-radius:12px;font-weight:700;font-size:0.9rem;cursor:pointer;border:none;font-family:"Inter",sans-serif;transition:all 0.2s;}
    .cta-btn.primary{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;box-shadow:0 0 24px rgba(0,200,150,0.3);}
    .cta-btn.primary:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(0,200,150,0.5);}
    .cta-btn.secondary{background:none;border:1px solid rgba(0,200,150,0.2);color:#5a8a7a;}
    .cta-btn.secondary:hover{border-color:rgba(0,200,150,0.4);color:#00c896;}
    .team-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:16px;padding:1.4rem;text-align:center;transition:all 0.2s;}
    .team-card:hover{border-color:rgba(0,200,150,0.25);transform:translateY(-3px);}
    .team-av{width:64px;height:64px;border-radius:50%;margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#050f0c;border:2px solid rgba(0,200,150,0.3);}
    .timeline{display:flex;flex-direction:column;gap:0;margin-top:1.2rem;}
    .tl-item{display:flex;gap:1rem;padding-bottom:1.5rem;position:relative;}
    .tl-item:last-child{padding-bottom:0;}
    .tl-dot{width:14px;height:14px;border-radius:50%;background:#00c896;flex-shrink:0;margin-top:4px;position:relative;z-index:1;}
    .tl-line{position:absolute;left:6px;top:18px;bottom:0;width:2px;background:rgba(0,200,150,0.15);}
    .tl-year{font-family:"Syne",sans-serif;font-weight:800;font-size:0.9rem;color:#00c896;margin-bottom:0.2rem;}
    .tl-text{font-size:0.8rem;color:#5a8a7a;line-height:1.6;}
    @media(max-width:600px){.stat-grid{grid-template-columns:repeat(2,1fr);}.cta-box{padding:2rem 1.2rem;}}
  `;

  const values = [
    {icon:"🎯",title:"Transparency",text:"No hidden fees, no fine print surprises. Every charge, every interest rate, every rule is communicated clearly. We believe our users deserve complete visibility into how their money works."},
    {icon:"💎",title:"Integrity",text:"We do what we say. Our savings contracts are legally binding, our team is accountable, and we never make promises we can't keep. Your trust is our most valuable asset."},
    {icon:"🌍",title:"Financial Inclusion",text:"Everyone deserves access to wealth-building tools regardless of banking status, income level, or location in Africa. We're breaking down barriers to financial participation."},
    {icon:"🚀",title:"Innovation",text:"We continuously improve our platform with real user feedback. Technology should serve people, not the other way around. We build features that solve real African financial problems."},
    {icon:"🛡️",title:"Security First",text:"Your funds, data, and identity are protected by bank-grade security at every layer. We invest heavily in security because we know your savings represent real sacrifice and hard work."},
    {icon:"🤝",title:"Community",text:"NEXORA is more than a savings app — it's a community of disciplined savers helping each other grow. Through referrals, group savings, and shared milestones, we grow together."},
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"0 1.2rem"}}>
        <nav className="nav">
          <div className="nav-logo" onClick={()=>router.push("/")}>
            <div className="nav-logo-mark">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{background:"linear-gradient(135deg,#00c896,#4dffc3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</span>
          </div>
          <div className="nav-links">
            <button className="nav-btn outline" onClick={()=>router.push("/faq")}>FAQ</button>
            <button className="nav-btn outline" onClick={()=>router.push("/contact")}>Contact</button>
            <button className="nav-btn solid"   onClick={()=>router.push("/login")}>Get Started</button>
          </div>
        </nav>
      </div>

      <div className="wrap">
        {/* HERO */}
        <section className="hero">
          <div className="hero-badge">🌍 Built in Africa · Trusted Globally</div>
          <h1 className="hero-title">
            We're Building the<br/>
            <span className="gr">Financial Future</span><br/>
            of Africa
          </h1>
          <p className="hero-sub">
            NEXORA is a premium crypto savings and payments platform designed to help everyday Africans build real, lasting wealth through disciplined saving and smart finance.
          </p>
        </section>

        {/* STATS */}
        <div className="stat-band">
          <div className="stat-grid">
            {[
              {v:"10,000+",l:"Active Savers"},
              {v:"20% APY",  l:"Annual Returns"},
              {v:"$210+",    l:"52-Week Payout"},
              {v:"24/7",     l:"Support"},
            ].map(s=>(
              <div key={s.l}>
                <div className="stat-val">{s.v}</div>
                <div className="stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider"/>

        {/* OUR STORY */}
        <section className="section">
          <div className="section-tag">Our Story</div>
          <h2 className="section-title">From a Simple Idea to Africa's Premier Savings Platform</h2>
          <p className="section-text">
            NEXORA was born from a simple observation: millions of Africans have the desire to save and build wealth, but lack access to the right tools, incentives, and structure to do so consistently. Traditional banks are inaccessible to many. Investment platforms are complex. And informal savings groups, while popular, carry risks of mismanagement and fraud.
          </p>
          <p className="section-text">
            We set out to build something different — a platform that combines the discipline of structured savings, the transparency of blockchain technology, and the accessibility of mobile-first design to create a truly inclusive financial tool for Africa.
          </p>
          <p className="section-text">
            Today, NEXORA serves thousands of savers across Nigeria and beyond, helping them commit to weekly savings of just $3 USDT and watching that discipline compound into real wealth over 52 weeks.
          </p>

          {/* TIMELINE */}
          <div className="timeline" style={{marginTop:"1.5rem"}}>
            {[
              {year:"2024", text:"NEXORA concept developed — identifying the gap in African structured savings"},
              {year:"2025 Q1", text:"Platform built with full KYC, savings contracts, and local exchanger network"},
              {year:"2025 Q2", text:"Beta launch with first 1,000 users across Nigeria and Ghana"},
              {year:"2025 Q3", text:"Referral system, group savings, and leaderboard features launched"},
              {year:"2026", text:"10,000+ active savers, expanding to 12 African countries"},
            ].map((item,i)=>(
              <div key={i} className="tl-item">
                <div style={{position:"relative",flexShrink:0}}>
                  <div className="tl-dot"/>
                  {i<4&&<div className="tl-line"/>}
                </div>
                <div>
                  <div className="tl-year">{item.year}</div>
                  <div className="tl-text">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* MISSION & VISION */}
        <section className="section">
          <div className="grid-2">
            <div className="card" style={{borderColor:"rgba(0,200,150,0.2)"}}>
              <div className="icon-box">🎯</div>
              <div className="section-tag">Our Mission</div>
              <div className="card-title" style={{fontSize:"1rem",marginBottom:"0.6rem"}}>Empowering Africans to Build Real Wealth</div>
              <div className="card-text">
                Our mission is to make structured, disciplined saving accessible to every African regardless of their banking status, income level, or financial literacy. We provide the tools, incentives, and accountability to turn small weekly commitments into life-changing wealth.
              </div>
            </div>
            <div className="card" style={{borderColor:"rgba(0,102,255,0.2)"}}>
              <div className="icon-box" style={{background:"rgba(0,102,255,0.1)"}}>🔭</div>
              <div className="section-tag" style={{color:"#4dffc3"}}>Our Vision</div>
              <div className="card-title" style={{fontSize:"1rem",marginBottom:"0.6rem"}}>A Financially Free Africa by 2030</div>
              <div className="card-text">
                We envision a continent where every African has access to fair, transparent, and rewarding financial tools. Where saving is a habit, not a luxury. Where blockchain technology bridges the gap between the unbanked and the global financial system.
              </div>
            </div>
          </div>
        </section>

        <div className="divider"/>

        {/* CORE VALUES */}
        <section className="section">
          <div className="section-tag">Our Core Values</div>
          <h2 className="section-title">What We Stand For Every Day</h2>
          <div style={{marginTop:"1.2rem"}}>
            {values.map((v,i)=>(
              <div key={i} className={`value-item ${activeValue===i?"open":""}`} onClick={()=>setActiveValue(activeValue===i?null:i)}>
                <div className="value-header">
                  <div className="value-icon">{v.icon}</div>
                  <div className="value-title">{v.title}</div>
                  <div className={`value-arrow ${activeValue===i?"open":""}`}>▾</div>
                </div>
                {activeValue===i&&<div className="value-body">{v.text}</div>}
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* WHY CHOOSE NEXORA */}
        <section className="section">
          <div className="section-tag">Why Choose NEXORA</div>
          <h2 className="section-title">Built Specifically for African Savers</h2>
          <div className="grid-2">
            {[
              {icon:"💱",title:"Local Exchanger Network",text:"Don't have crypto? Our network of verified local exchangers accept Naira, Cedi, and mobile money transfers. They convert to USDT and credit your wallet same day."},
              {icon:"📈",title:"20% APY Returns",text:"Earn 20% annual percentage yield on your contributions. On $106 contributed over 52 weeks, you earn $31.20 in interest — guaranteed by your savings contract."},
              {icon:"🔒",title:"Bank-Grade Security",text:"AES-256 encryption, 2FA, KYC verification, session timeouts, and real-time fraud monitoring protect your funds and identity at every layer."},
              {icon:"📱",title:"Mobile-First Design",text:"Built for your smartphone. No app download needed — works in any browser. Deposit, track savings, view history, and contact support all from your phone."},
              {icon:"👥",title:"Group Savings",text:"Save with friends toward a shared goal. Up to 5 people can pool their weekly savings into one group plan, keeping each other accountable and motivated."},
              {icon:"🎁",title:"Referral Rewards",text:"Share your unique referral code and earn $1 USDT for every person who registers and completes their account setup. No limit on referrals."},
              {icon:"🏆",title:"Milestone Celebrations",text:"Celebrate your savings journey! Confetti animations at Week 10, 26, and 52. Streak badges for consecutive payments. Leaderboard rankings to compete with other savers."},
              {icon:"💬",title:"24/7 WhatsApp Support",text:"Real human support agents available via WhatsApp around the clock. AI-powered chat answers common questions instantly, with seamless handoff to live agents."},
            ].map(f=>(
              <div key={f.title} className="card">
                <div className="icon-box">{f.icon}</div>
                <div className="card-title">{f.title}</div>
                <div className="card-text">{f.text}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Save in 6 Simple Steps</h2>
          <div className="step-list">
            {[
              {n:"01",title:"Create Your Account",text:"Register with your email and password. Takes 2 minutes. No bank account required, no credit check, no complicated forms."},
              {n:"02",title:"Pay $4 Registration Fee",text:"A one-time $4 USDT registration fee activates your account. Send to our wallet address and upload the screenshot. Admin verifies within 24 hours."},
              {n:"03",title:"Sign Your Savings Contract",text:"Review and sign your 52-week savings agreement. The contract defines your weekly amount ($3 USDT), interest rate (20% APY), penalties, and payout date."},
              {n:"04",title:"Verify Your Identity (KYC)",text:"Upload your government ID, a selfie, and proof of address. KYC unlocks full withdrawal limits and demonstrates our commitment to regulatory compliance."},
              {n:"05",title:"Pay $3 USDT Every Week",text:"Send exactly $3 USDT every week to your assigned wallet address. Use our local exchangers if you don't have crypto — just bank transfer and they convert for you."},
              {n:"06",title:"Collect Your Full Payout",text:"After 52 weeks, submit your clearance form and final payment receipt to initiate withdrawal. Receive $106 contributed + $31.20 interest + $10 bonus = $197.20+ USDT."},
            ].map(s=>(
              <div key={s.n} className="step-item">
                <div className="step-num">{s.n}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-text">{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* SECURITY & COMPLIANCE */}
        <section className="section">
          <div className="section-tag">Security & Compliance</div>
          <h2 className="section-title">Built to the Highest Standards</h2>
          <p className="section-text">
            NEXORA takes security and regulatory compliance seriously. We have implemented multiple layers of protection to ensure your funds and personal data are always safe.
          </p>
          <div className="grid-2" style={{marginBottom:"1.5rem"}}>
            {[
              {icon:"🔐",title:"AES-256 Encryption",text:"All data encrypted at rest and in transit using military-grade encryption standards."},
              {icon:"📱",title:"Two-Factor Authentication",text:"Optional WhatsApp 2FA adds a second verification layer beyond your password."},
              {icon:"⏱️",title:"Session Auto-Timeout",text:"Sessions expire after 30 minutes of inactivity to protect you on shared devices."},
              {icon:"📋",title:"Login History",text:"Every login recorded. Instantly detect if someone accessed your account."},
              {icon:"🛡️",title:"Rate Limiting",text:"API protected against brute force, DDoS, and automated attacks."},
              {icon:"🔍",title:"KYC/AML Verification",text:"Identity verification prevents fraud and ensures platform integrity."},
            ].map(f=>(
              <div key={f.title} className="card">
                <div style={{display:"flex",gap:"0.65rem",alignItems:"flex-start"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"9px",background:"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>{f.icon}</div>
                  <div><div style={{fontWeight:700,fontSize:"0.86rem",marginBottom:"0.2rem"}}>{f.title}</div><div style={{fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.55}}>{f.text}</div></div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-tag">Regulatory Alignment</div>
          <div className="compliance-grid">
            {[
              {icon:"🇪🇺",name:"EU MiCA",sub:"Markets in Crypto-Assets Regulation",status:"progress",label:"In Progress"},
              {icon:"🇿🇦",name:"FSCA",sub:"Financial Sector Conduct Authority",status:"progress",label:"Aligned"},
              {icon:"🇳🇬",name:"NDPR",sub:"Nigeria Data Protection Regulation",status:"active",label:"Active"},
              {icon:"🌍",name:"GDPR",sub:"General Data Protection",status:"active",label:"Applied"},
              {icon:"🔍",name:"KYC/AML",sub:"Anti-Money Laundering",status:"active",label:"Active"},
              {icon:"📋",name:"FATF",sub:"Financial Action Task Force",status:"progress",label:"Aligned"},
            ].map(b=>(
              <div key={b.name} className="comp-badge">
                <div className="comp-icon">{b.icon}</div>
                <div className="comp-name">{b.name}</div>
                <div className="comp-sub">{b.sub}</div>
                <span className={`comp-status ${b.status}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* CTA */}
        <div className="cta-box">
          <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>🚀</div>
          <h2 className="cta-title">Ready to Start Your<br/><span className="gr">Savings Journey?</span></h2>
          <p className="cta-sub">Join thousands of Africans already building wealth with NEXORA. It takes just 2 minutes to sign up.</p>
          <div className="cta-btns">
            <button className="cta-btn primary" onClick={()=>router.push("/login")}>Create Free Account →</button>
            <button className="cta-btn secondary" onClick={()=>router.push("/contact")}>Contact Us</button>
            <button className="cta-btn secondary" onClick={()=>router.push("/faq")}>Read FAQs</button>
          </div>
        </div>

      </div>
    </>
  );
}
