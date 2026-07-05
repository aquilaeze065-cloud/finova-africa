"use client";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;overflow-x:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .about-wrap{min-height:100vh;max-width:960px;margin:0 auto;padding:0 1.2rem 4rem;}

        /* NAV */
        .about-nav{display:flex;align-items:center;justify-content:space-between;padding:1.2rem 0;margin-bottom:1rem;}
        .about-logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;font-size:1rem;letter-spacing:0.05em;text-decoration:none;color:#e8f8f4;}
        .about-logo-mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;}
        .about-logo-name{background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .nav-links{display:flex;align-items:center;gap:0.75rem;}
        .nav-link{padding:0.35rem 0.9rem;border-radius:9px;font-size:0.82rem;font-weight:600;text-decoration:none;transition:all 0.18s;border:none;cursor:pointer;font-family:"Inter",sans-serif;}
        .nav-link.outline{background:none;border:1px solid rgba(0,200,150,0.2);color:#5a8a7a;}
        .nav-link.outline:hover{border-color:rgba(0,200,150,0.4);color:#00c896;}
        .nav-link.solid{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}

        /* HERO */
        .hero{text-align:center;padding:3rem 0 2.5rem;animation:fadeUp 0.6s ease both;}
        .hero-badge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:0.35rem 1rem;font-size:0.75rem;color:#00c896;font-weight:600;margin-bottom:1.5rem;}
        .hero-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(2rem,5vw,3rem);line-height:1.15;margin-bottom:1rem;}
        .hero-title .gr{background:linear-gradient(135deg,#00c896,#4dffc3,#0066ff);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s infinite;}
        .hero-sub{font-size:1rem;color:#5a8a7a;max-width:560px;margin:0 auto 2rem;line-height:1.7;}
        .hero-stats{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;}
        .stat-pill{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:14px;padding:0.9rem 1.4rem;text-align:center;}
        .stat-val{font-family:"Syne",sans-serif;font-weight:800;font-size:1.4rem;color:#00c896;margin-bottom:0.15rem;}
        .stat-lbl{font-size:0.68rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.06em;}

        /* SECTION */
        .section{margin-bottom:3.5rem;}
        .section-tag{font-size:0.68rem;font-weight:700;color:#00c896;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.75rem;}
        .section-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.4rem,3vw,1.9rem);margin-bottom:1rem;line-height:1.2;}
        .section-text{font-size:0.88rem;color:#5a8a7a;line-height:1.8;margin-bottom:0.9rem;}

        /* MISSION CARDS */
        .mission-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-top:1.5rem;}
        .mission-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:18px;padding:1.4rem;position:relative;overflow:hidden;transition:border-color 0.2s,transform 0.2s;}
        .mission-card:hover{border-color:rgba(0,200,150,0.3);transform:translateY(-3px);}
        .mission-card::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00c896,transparent);opacity:0;transition:opacity 0.2s;}
        .mission-card:hover::before{opacity:1;}
        .mission-icon{font-size:1.8rem;margin-bottom:0.75rem;}
        .mission-title{font-family:"Syne",sans-serif;font-weight:700;font-size:0.95rem;margin-bottom:0.5rem;color:#e8f8f4;}
        .mission-text{font-size:0.78rem;color:#5a8a7a;line-height:1.65;}

        /* TEAM */
        .team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1.5rem;}
        .team-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:18px;padding:1.3rem;text-align:center;transition:all 0.2s;}
        .team-card:hover{border-color:rgba(0,200,150,0.3);transform:translateY(-2px);}
        .team-av{width:60px;height:60px;border-radius:50%;margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;color:#050f0c;border:2px solid rgba(0,200,150,0.3);}
        .team-name{font-weight:700;font-size:0.88rem;margin-bottom:0.2rem;}
        .team-role{font-size:0.7rem;color:#5a8a7a;}

        /* VALUES */
        .values-list{display:flex;flex-direction:column;gap:0.65rem;margin-top:1.2rem;}
        .value-row{display:flex;align-items:flex-start;gap:0.85rem;padding:0.9rem;background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:13px;transition:border-color 0.18s;}
        .value-row:hover{border-color:rgba(0,200,150,0.2);}
        .value-icon{width:36px;height:36px;border-radius:9px;background:rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
        .value-title{font-weight:700;font-size:0.86rem;margin-bottom:0.2rem;}
        .value-text{font-size:0.76rem;color:#5a8a7a;line-height:1.55;}

        /* COMPLIANCE */
        .compliance-box{background:linear-gradient(135deg,rgba(0,200,150,0.06),rgba(0,102,255,0.04));border:1px solid rgba(0,200,150,0.15);border-radius:18px;padding:1.6rem;display:flex;gap:1.2rem;align-items:flex-start;margin-top:1.5rem;}
        .compliance-icon{font-size:2rem;flex-shrink:0;}
        .compliance-title{font-family:"Syne",sans-serif;font-weight:800;font-size:1rem;margin-bottom:0.4rem;color:#00c896;}
        .compliance-text{font-size:0.8rem;color:#5a8a7a;line-height:1.7;}
        .compliance-badges{display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;}
        .badge{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:0.25rem 0.7rem;font-size:0.68rem;color:#00c896;font-weight:600;}

        /* CTA */
        .cta-box{background:linear-gradient(135deg,#081a14,#060f0c);border:1px solid rgba(0,200,150,0.18);border-radius:20px;padding:2.5rem 2rem;text-align:center;margin-top:2rem;}
        .cta-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.3rem,3vw,1.8rem);margin-bottom:0.75rem;}
        .cta-sub{font-size:0.88rem;color:#5a8a7a;margin-bottom:1.5rem;}
        .cta-btns{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
        .cta-btn{padding:0.85rem 1.8rem;border-radius:12px;font-family:"Inter",sans-serif;font-weight:700;font-size:0.92rem;cursor:pointer;transition:all 0.2s;border:none;}
        .cta-btn.primary{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;box-shadow:0 0 24px rgba(0,200,150,0.3);}
        .cta-btn.primary:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(0,200,150,0.5);}
        .cta-btn.secondary{background:none;border:1px solid rgba(0,200,150,0.2);color:#5a8a7a;}
        .cta-btn.secondary:hover{border-color:rgba(0,200,150,0.4);color:#00c896;}

        /* DIVIDER */
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,0.15),transparent);margin:2.5rem 0;}

        @media(max-width:600px){
          .hero-stats{gap:0.75rem;}
          .stat-pill{padding:0.75rem 1rem;}
          .compliance-box{flex-direction:column;}
          .cta-box{padding:1.8rem 1.2rem;}
          .nav-links{gap:0.4rem;}
        }
      `}</style>

      <div className="about-wrap">
        {/* NAV */}
        <nav className="about-nav">
          <a className="about-logo" href="/" onClick={e=>{e.preventDefault();router.push("/");}}>
            <div className="about-logo-mark">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="about-logo-name">NEXORA</span>
          </a>
          <div className="nav-links">
            <button className="nav-link outline" onClick={()=>router.push("/")}>← Home</button>
            <button className="nav-link solid" onClick={()=>router.push("/login")}>Get Started</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-badge">🌍 Built for Africa · Trusted Globally</div>
          <h1 className="hero-title">
            We're Building the<br/>
            <span className="gr">Financial Future</span><br/>
            of Africa
          </h1>
          <p className="hero-sub">
            NEXORA is a premium crypto savings and payments platform designed to help everyday Africans grow their wealth through disciplined saving and smart finance.
          </p>
          <div className="hero-stats">
            {[
              {v:"10,000+", l:"Active Users"},
              {v:"35% APY",  l:"Annual Returns"},
              {v:"$165.80",  l:"52-Week Payout"},
              {v:"12",       l:"African Currencies"},
            ].map(s=>(
              <div key={s.l} className="stat-pill">
                <div className="stat-val">{s.v}</div>
                <div className="stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* MISSION */}
        <section className="section">
          <div className="section-tag">Our Mission</div>
          <h2 className="section-title">Empowering Africans to Build Real Wealth</h2>
          <p className="section-text">
            Too many Africans are locked out of traditional financial systems. No credit history. No investment access. No structured savings culture. NEXORA changes that — by combining crypto technology with disciplined weekly savings to create a path to financial freedom for everyone.
          </p>
          <div className="mission-grid">
            {[
              {icon:"💰", title:"Structured Savings",    text:"Our 52-week savings plan builds the discipline needed for long-term wealth. Just 3 USDT per week adds up to real returns at 35% APY."},
              {icon:"🌍", title:"Pan-African Focus",     text:"Built specifically for African users with support for Naira, Cedi, Birr, and more. We understand your market, your currency, your reality."},
              {icon:"🔒", title:"Security First",        text:"Bank-grade encryption, KYC verification, and compliance-ready infrastructure protect your funds and identity at every step."},
              {icon:"⚡", title:"Fast & Transparent",   text:"Real-time wallet updates, instant notifications, and full transaction history. You always know exactly where your money is."},
              {icon:"🤝", title:"Trusted Exchangers",    text:"Our network of verified local exchangers means you can deposit even without crypto knowledge — just bank transfer or mobile money."},
              {icon:"🎁", title:"Rewards & Vouchers",    text:"Complete your 52-week commitment and earn a $15 cash/food voucher on top of your interest. We celebrate your discipline."},
            ].map(c=>(
              <div key={c.title} className="mission-card">
                <div className="mission-icon">{c.icon}</div>
                <div className="mission-title">{c.title}</div>
                <div className="mission-text">{c.text}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* VALUES */}
        <section className="section">
          <div className="section-tag">Our Values</div>
          <h2 className="section-title">What We Stand For</h2>
          <div className="values-list">
            {[
              {icon:"🎯", title:"Transparency",      text:"No hidden fees. No fine print surprises. Every charge, every return, every rule is communicated clearly upfront."},
              {icon:"💎", title:"Integrity",         text:"We do what we say. Our savings contracts are legally binding and our team is accountable for every promise made to users."},
              {icon:"🚀", title:"Innovation",        text:"We continuously improve our platform with feedback from our users. Technology should work for people, not the other way around."},
              {icon:"🌱", title:"Financial Inclusion",text:"Everyone deserves access to wealth-building tools regardless of their banking status, income level, or location in Africa."},
              {icon:"🛡️", title:"User Protection",  text:"Your funds, your data, and your identity are protected by industry-standard security practices and regulatory compliance frameworks."},
            ].map(v=>(
              <div key={v.title} className="value-row">
                <div className="value-icon">{v.icon}</div>
                <div>
                  <div className="value-title">{v.title}</div>
                  <div className="value-text">{v.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* COMPLIANCE */}
        <section className="section">
          <div className="section-tag">Compliance & Trust</div>
          <h2 className="section-title">Built to the Highest Standards</h2>
          <div className="compliance-box">
            <div className="compliance-icon">🏛️</div>
            <div>
              <div className="compliance-title">Regulatory Alignment</div>
              <div className="compliance-text">
                NEXORA is built with compliance in mind. We are actively working toward full regulatory alignment with <strong style={{color:"#e8f8f4"}}>EU MiCA (Markets in Crypto-Assets Regulation)</strong> and <strong style={{color:"#e8f8f4"}}>FSCA (Financial Sector Conduct Authority)</strong> standards. Our KYC/AML processes follow international best practices, and user data is handled in accordance with NDPR and GDPR principles.
              </div>
              <div className="compliance-badges">
                <span className="badge">EU MiCA Aligned</span>
                <span className="badge">FSCA Standards</span>
                <span className="badge">KYC / AML</span>
                <span className="badge">NDPR Compliant</span>
                <span className="badge">GDPR Principles</span>
              </div>
            </div>
          </div>
        </section>

        <div className="divider"/>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Simple. Transparent. Rewarding.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",marginTop:"1.2rem"}}>
            {[
              {n:"01", title:"Create Your Account",   text:"Sign up with your email, verify your identity, and get a personal crypto wallet instantly — no bank account required."},
              {n:"02", title:"Sign Your Contract",     text:"Review and sign your 52-week savings agreement. The contract is clear, binding, and designed to protect you."},
              {n:"03", title:"Make Weekly Deposits",   text:"Deposit 3 USDT every week. Use our trusted local exchangers if you don't have crypto — just bank transfer or mobile money."},
              {n:"04", title:"Watch Your Money Grow",  text:"Earn 35% APY on your contributions. Track your progress, see your interest accrue, and stay motivated every week."},
              {n:"05", title:"Complete & Get Paid",    text:"After 52 weeks, receive your full payout of $165.80 plus a $15 cash or food voucher. Your discipline, your reward."},
            ].map(s=>(
              <div key={s.n} style={{display:"flex",gap:"1rem",padding:"1rem",background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"14px",alignItems:"flex-start",transition:"border-color 0.18s"}}
                onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(0,200,150,0.2)")}
                onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(0,200,150,0.08)")}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.2rem",color:"rgba(0,200,150,0.3)",flexShrink:0,lineHeight:1,minWidth:"32px"}}>{s.n}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:"0.88rem",marginBottom:"0.25rem"}}>{s.title}</div>
                  <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.6}}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="cta-box">
          <h2 className="cta-title">Ready to Start Building Wealth?</h2>
          <p className="cta-sub">Join thousands of Africans already saving and growing with NEXORA.</p>
          <div className="cta-btns">
            <button className="cta-btn primary" onClick={()=>router.push("/login")}>Create Free Account</button>
            <button className="cta-btn secondary" onClick={()=>router.push("/")}>Learn More</button>
          </div>
        </div>
      </div>
    </>
  );
}
