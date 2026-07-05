"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [prices, setPrices] = useState({btc:"$—",eth:"$—",usdt:"$1.00"});

  useEffect(()=>{
    localStorage.setItem("nexora_visited","true");
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd")
      .then(r=>r.json()).then(d=>{
        setPrices({
          btc: "$"+d.bitcoin?.usd?.toLocaleString()||"$—",
          eth: "$"+d.ethereum?.usd?.toFixed(2)||"$—",
          usdt:"$1.00"
        });
      }).catch(()=>{});
  },[]);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;overflow-x:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(0,200,150,0.3)}50%{box-shadow:0 0 60px rgba(0,200,150,0.6)}}
        @keyframes pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* TICKER */
        .ticker-wrap{background:rgba(0,200,150,0.06);border-bottom:1px solid rgba(0,200,150,0.1);padding:0.5rem 0;overflow:hidden;}
        .ticker-inner{display:flex;gap:3rem;animation:ticker 18s linear infinite;white-space:nowrap;}
        .ticker-item{display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;color:#5a8a7a;}
        .ticker-item span{color:#00c896;}

        /* NAV */
        .nav{position:sticky;top:0;z-index:100;background:rgba(5,15,12,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,200,150,0.08);padding:0.85rem 1.5rem;display:flex;align-items:center;justify-content:space-between;}
        .nav-logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;font-size:1rem;letter-spacing:0.05em;text-decoration:none;color:#e8f8f4;}
        .nav-logo-mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;animation:glow 3s infinite;}
        .nav-logo-name{background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .nav-links{display:flex;align-items:center;gap:0.5rem;}
        .nav-link{padding:0.42rem 0.85rem;border-radius:9px;font-size:0.82rem;font-weight:600;text-decoration:none;cursor:pointer;border:none;font-family:"Inter",sans-serif;transition:all 0.18s;}
        .nav-link.ghost{background:none;color:#5a8a7a;}
        .nav-link.ghost:hover{color:#00c896;}
        .nav-link.outline{background:none;border:1px solid rgba(0,200,150,0.2);color:#5a8a7a;}
        .nav-link.outline:hover{border-color:rgba(0,200,150,0.4);color:#00c896;}
        .nav-link.solid{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}

        /* HERO */
        .hero{min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1.5rem;position:relative;overflow:hidden;}
        .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% -5%,rgba(0,200,150,0.12),transparent 60%),radial-gradient(ellipse 50% 40% at 80% 90%,rgba(0,102,255,0.07),transparent 50%);}
        .hero-particles{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
        .particle{position:absolute;border-radius:50%;background:rgba(0,200,150,0.5);animation:pulse 3s infinite;}
        .hero-content{position:relative;z-index:1;max-width:700px;}
        .hero-badge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:0.38rem 1rem;font-size:0.75rem;color:#00c896;font-weight:600;margin-bottom:1.75rem;animation:fadeUp 0.5s ease both;}
        .hero-title{font-family:"Syne",sans-serif;font-weight:900;font-size:clamp(2.2rem,6vw,3.8rem);line-height:1.1;margin-bottom:1.2rem;animation:fadeUp 0.5s 0.1s ease both;opacity:0;animation-fill-mode:both;}
        .gr{background:linear-gradient(135deg,#00c896,#4dffc3,#00c896);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s infinite;}
        .hero-sub{font-size:1.05rem;color:#5a8a7a;max-width:520px;margin:0 auto 2.2rem;line-height:1.75;animation:fadeUp 0.5s 0.2s ease both;opacity:0;animation-fill-mode:both;}
        .hero-btns{display:flex;gap:0.85rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem;animation:fadeUp 0.5s 0.3s ease both;opacity:0;animation-fill-mode:both;}
        .h-btn{padding:0.95rem 2rem;border-radius:13px;font-family:"Inter",sans-serif;font-weight:700;font-size:0.95rem;cursor:pointer;transition:all 0.22s;border:none;}
        .h-btn.primary{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;box-shadow:0 0 28px rgba(0,200,150,0.35);}
        .h-btn.primary:hover{transform:translateY(-2px);box-shadow:0 0 44px rgba(0,200,150,0.55);}
        .h-btn.secondary{background:none;border:1px solid rgba(0,200,150,0.22);color:#5a8a7a;}
        .h-btn.secondary:hover{border-color:rgba(0,200,150,0.35);color:#00c896;transform:translateY(-1px);}
        .hero-trust{font-size:0.76rem;color:#3a5a4a;animation:fadeUp 0.5s 0.4s ease both;opacity:0;animation-fill-mode:both;}

        /* STATS BAND */
        .stats-band{background:#081a14;border-top:1px solid rgba(0,200,150,0.08);border-bottom:1px solid rgba(0,200,150,0.08);padding:1.8rem 1.5rem;}
        .stats-inner{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center;}
        .s-val{font-family:"Syne",sans-serif;font-weight:800;font-size:1.6rem;color:#00c896;margin-bottom:0.2rem;}
        .s-lbl{font-size:0.7rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.07em;}

        /* SECTIONS */
        .section{max-width:900px;margin:0 auto;padding:4rem 1.5rem;}
        .section-tag{font-size:0.68rem;font-weight:700;color:#00c896;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.75rem;text-align:center;}
        .section-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.5rem,3vw,2.1rem);text-align:center;margin-bottom:0.75rem;line-height:1.2;}
        .section-sub{font-size:0.88rem;color:#5a8a7a;text-align:center;max-width:500px;margin:0 auto 2.5rem;line-height:1.7;}

        /* HOW IT WORKS */
        .steps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;}
        .step-card{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:18px;padding:1.4rem;text-align:center;transition:all 0.22s;position:relative;}
        .step-card:hover{border-color:rgba(0,200,150,0.25);transform:translateY(-4px);}
        .step-num{font-family:"Syne",sans-serif;font-weight:900;font-size:2rem;color:rgba(0,200,150,0.15);margin-bottom:0.75rem;line-height:1;}
        .step-icon{font-size:1.6rem;margin-bottom:0.6rem;}
        .step-title{font-weight:700;font-size:0.88rem;margin-bottom:0.4rem;}
        .step-text{font-size:0.76rem;color:#5a8a7a;line-height:1.6;}
        .step-connector{display:none;}

        /* FEATURES */
        .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;}
        .feature-card{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:18px;padding:1.4rem;transition:all 0.22s;}
        .feature-card:hover{border-color:rgba(0,200,150,0.22);transform:translateY(-3px);}
        .feature-icon{width:44px;height:44px;border-radius:12px;background:rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:0.85rem;}
        .feature-title{font-weight:700;font-size:0.9rem;margin-bottom:0.4rem;}
        .feature-text{font-size:0.78rem;color:#5a8a7a;line-height:1.65;}

        /* PAYOUT CALCULATOR */
        .calc-box{background:linear-gradient(135deg,#081a14,#060f0c);border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:2rem;max-width:480px;margin:0 auto;}
        .calc-title{font-family:"Syne",sans-serif;font-weight:800;font-size:1.1rem;margin-bottom:1.2rem;text-align:center;}
        .calc-row{display:flex;justify-content:space-between;padding:0.55rem 0;border-bottom:1px solid rgba(0,200,150,0.06);font-size:0.82rem;}
        .calc-row:last-child{border-bottom:none;padding-top:0.75rem;}
        .calc-lbl{color:#5a8a7a;}
        .calc-val{font-weight:700;}
        .calc-total{font-family:"Syne",sans-serif;font-weight:800;font-size:1.1rem;color:#00c896;}

        /* TESTIMONIALS */
        .testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;}
        .testi-card{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:18px;padding:1.3rem;transition:border-color 0.2s;}
        .testi-card:hover{border-color:rgba(0,200,150,0.2);}
        .testi-stars{color:#00c896;font-size:0.82rem;margin-bottom:0.65rem;}
        .testi-text{font-size:0.8rem;color:#5a8a7a;line-height:1.65;margin-bottom:0.85rem;font-style:italic;}
        .testi-user{display:flex;align-items:center;gap:0.55rem;}
        .testi-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:#050f0c;flex-shrink:0;}
        .testi-name{font-weight:700;font-size:0.8rem;}
        .testi-loc{font-size:0.68rem;color:#5a8a7a;}

        /* CTA */
        .cta-section{background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,102,255,0.04));border-top:1px solid rgba(0,200,150,0.1);border-bottom:1px solid rgba(0,200,150,0.1);padding:5rem 1.5rem;text-align:center;}
        .cta-title{font-family:"Syne",sans-serif;font-weight:900;font-size:clamp(1.6rem,4vw,2.5rem);margin-bottom:0.85rem;}
        .cta-sub{font-size:0.92rem;color:#5a8a7a;max-width:440px;margin:0 auto 2rem;line-height:1.7;}
        .cta-action{padding:1rem 2.5rem;border-radius:14px;background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;font-weight:700;font-size:1rem;border:none;cursor:pointer;box-shadow:0 0 32px rgba(0,200,150,0.4);transition:all 0.22s;font-family:"Inter",sans-serif;}
        .cta-action:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(0,200,150,0.6);}

        /* FOOTER */
        .footer{background:#060f0c;border-top:1px solid rgba(0,200,150,0.08);padding:2.5rem 1.5rem;}
        .footer-inner{max-width:900px;margin:0 auto;}
        .footer-top{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2rem;margin-bottom:2rem;}
        .footer-brand{}
        .footer-logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;font-size:1rem;letter-spacing:0.05em;margin-bottom:0.65rem;text-decoration:none;color:#e8f8f4;}
        .footer-desc{font-size:0.78rem;color:#3a5a4a;line-height:1.65;max-width:260px;}
        .footer-col-title{font-weight:700;font-size:0.8rem;color:#5a8a7a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.85rem;}
        .footer-link{display:block;font-size:0.78rem;color:#3a5a4a;text-decoration:none;margin-bottom:0.35rem;transition:color 0.18s;cursor:pointer;background:none;border:none;text-align:left;font-family:"Inter",sans-serif;}
        .footer-link:hover{color:#00c896;}
        .footer-bottom{border-top:1px solid rgba(0,200,150,0.06);padding-top:1.2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;}
        .footer-copy{font-size:0.7rem;color:#2a4a3a;}
        .footer-badges{display:flex;gap:0.5rem;flex-wrap:wrap;}
        .f-badge{background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.12);border-radius:20px;padding:0.2rem 0.6rem;font-size:0.62rem;color:#3a6a5a;}

        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,0.12),transparent);}

        @media(max-width:640px){
          .stats-inner{grid-template-columns:1fr 1fr;}
          .footer-top{grid-template-columns:1fr;}
          .footer-bottom{flex-direction:column;text-align:center;}
          .nav-links .nav-link.ghost{display:none;}
        }
      `}</style>

      {/* PRICE TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[
            {l:"BTC/USD",  v:prices.btc, c:"+2.4%"},
            {l:"ETH/USD",  v:prices.eth, c:"+1.8%"},
            {l:"USDT/USD", v:prices.usdt,c:"Stable"},
            {l:"NEXORA",   v:"35% APY",  c:"Weekly Savings"},
            {l:"BTC/USD",  v:prices.btc, c:"+2.4%"},
            {l:"ETH/USD",  v:prices.eth, c:"+1.8%"},
            {l:"USDT/USD", v:prices.usdt,c:"Stable"},
            {l:"NEXORA",   v:"35% APY",  c:"Weekly Savings"},
          ].map((t,i)=>(
            <div key={i} className="ticker-item">
              {t.l} <span>{t.v}</span> <span style={{color:"#3a7a6a"}}>{t.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav className="nav">
        <a className="nav-logo" href="/">
          <div className="nav-logo-mark">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="nav-logo-name">NEXORA</span>
        </a>
        <div className="nav-links">
          <button className="nav-link ghost" onClick={()=>router.push("/about")}>About Us</button>
          <button className="nav-link outline" onClick={()=>router.push("/login")}>Sign In</button>
          <button className="nav-link solid" onClick={()=>router.push("/login")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-particles">
          {[
            {top:"12%",left:"8%",  size:"4px", delay:"0s"},
            {top:"25%",left:"92%", size:"3px", delay:"1s"},
            {top:"70%",left:"5%",  size:"5px", delay:"0.5s"},
            {top:"80%",left:"88%", size:"3px", delay:"1.5s"},
            {top:"35%",left:"95%", size:"4px", delay:"2s"},
            {top:"55%",left:"2%",  size:"3px", delay:"0.8s"},
          ].map((p,i)=>(
            <div key={i} className="particle" style={{top:p.top,left:p.left,width:p.size,height:p.size,animationDelay:p.delay}}/>
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌍 Trusted by 10,000+ Africans</div>
          <h1 className="hero-title">
            Save Smart.<br/>
            <span className="gr">Grow Rich.</span><br/>
            Live Free.
          </h1>
          <p className="hero-sub">
            NEXORA is Africa's premier crypto savings platform. Save just <strong style={{color:"#e8f8f4"}}>3 USDT per week</strong> and earn <strong style={{color:"#e8f8f4"}}>35% APY</strong>. No bank account needed.
          </p>
          <div className="hero-btns">
            <button className="h-btn primary" onClick={()=>router.push("/login")}>
              Start Saving Free →
            </button>
            <button className="h-btn secondary" onClick={()=>router.push("/about")}>
              How It Works
            </button>
          </div>
          <div className="hero-trust">
            🔒 Secure · Compliant · Transparent · EU MiCA Aligned
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band">
        <div className="stats-inner">
          {[
            {v:"10,000+", l:"Active Savers"},
            {v:"35% APY",  l:"Annual Returns"},
            {v:"$165.80",  l:"52-Week Payout"},
            {v:"24h",      l:"Support Response"},
          ].map(s=>(
            <div key={s.l}>
              <div className="s-val">{s.v}</div>
              <div className="s-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section">
        <div className="section-tag">How It Works</div>
        <h2 className="section-title">Save in 5 Simple Steps</h2>
        <p className="section-sub">No crypto experience needed. Our local exchangers handle everything for you.</p>
        <div className="steps-grid">
          {[
            {n:"01", icon:"📝", title:"Sign Up Free",      text:"Create your account in 2 minutes. No bank account needed."},
            {n:"02", icon:"📄", title:"Sign Contract",     text:"Review your 52-week savings agreement — clear and binding."},
            {n:"03", icon:"💳", title:"Deposit 3 USDT",    text:"Use our local exchangers if you don't have crypto. Easy bank transfer."},
            {n:"04", icon:"📈", title:"Watch It Grow",     text:"Earn 35% APY. Track progress in real-time on your dashboard."},
            {n:"05", icon:"🎉", title:"Collect $165.80",   text:"At 52 weeks, get your full payout plus a $15 bonus voucher."},
          ].map(s=>(
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider"/>

      {/* PAYOUT CALCULATOR */}
      <div className="section">
        <div className="section-tag">Payout Calculator</div>
        <h2 className="section-title">See Exactly What You'll Earn</h2>
        <p className="section-sub">Complete 52 weeks of saving and here's your guaranteed payout breakdown.</p>
        <div className="calc-box">
          <div className="calc-title">💰 52-Week Savings Summary</div>
          {[
            {l:"Weekly Contribution",   v:"3 USDT"},
            {l:"Duration",             v:"52 Weeks (1 Year)"},
            {l:"Total Contributed",    v:"$156 USDT"},
            {l:"Interest Rate",        v:"35% APY"},
            {l:"Interest Earned",      v:"~$70.20 USDT"},
            {l:"Completion Bonus",     v:"$15 Cash/Food Voucher"},
          ].map(r=>(
            <div key={r.l} className="calc-row">
              <span className="calc-lbl">{r.l}</span>
              <span className="calc-val">{r.v}</span>
            </div>
          ))}
          <div className="calc-row">
            <span className="calc-lbl" style={{fontWeight:700,color:"#e8f8f4"}}>Total Payout</span>
            <span className="calc-total">~$241.20</span>
          </div>
        </div>
      </div>

      <div className="divider"/>

      {/* FEATURES */}
      <div className="section">
        <div className="section-tag">Why NEXORA</div>
        <h2 className="section-title">Everything You Need to Succeed</h2>
        <p className="section-sub">Built from the ground up for African savers with global standards.</p>
        <div className="features-grid">
          {[
            {icon:"💱", title:"Local Exchangers",     text:"No crypto knowledge needed. Our trusted local agents convert your Naira, Cedi, or mobile money into USDT for you."},
            {icon:"🔒", title:"Bank-Grade Security",  text:"Your funds and identity protected by KYC verification, AES-256 encryption, and multi-layer authentication."},
            {icon:"📱", title:"Mobile First",         text:"Designed for your phone. Track savings, make deposits, contact support — all from your mobile browser, no app needed."},
            {icon:"📊", title:"Real-Time Tracking",  text:"Watch your savings grow week by week. See your interest accruing, your progress bar filling, and your payout date approaching."},
            {icon:"💬", title:"24/7 WhatsApp Support",text:"Our support team is available via WhatsApp around the clock. Get instant responses, not automated replies."},
            {icon:"🏛️", title:"Regulatory Aligned",  text:"Built with EU MiCA and FSCA compliance standards in mind. Your savings are in safe, accountable hands."},
          ].map(f=>(
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider"/>

      {/* TESTIMONIALS */}
      <div className="section">
        <div className="section-tag">User Stories</div>
        <h2 className="section-title">What Our Savers Say</h2>
        <p className="section-sub">Real stories from real people across Africa building wealth with NEXORA.</p>
        <div className="testi-grid">
          {[
            {text:'"I never thought I could save consistently. NEXORA made it so simple. Every week I just send 3 USDT and watch my balance grow. 8 months in and I have never missed a week!"', name:"Amara O.", loc:"Lagos, Nigeria", color:"linear-gradient(135deg,#00a87a,#00c896)"},
            {text:'"The local exchanger system is genius. I don\'t understand crypto at all, but I just bank transfer to my exchanger and she handles everything. My wallet gets updated same day!"', name:"Kwame A.", loc:"Accra, Ghana",  color:"linear-gradient(135deg,#0066ff,#00c896)"},
            {text:'"At first I was skeptical. But 6 months later my savings are growing and the support team responds on WhatsApp within minutes. Legit platform, highly recommend."', name:"Fatima M.", loc:"Abuja, Nigeria", color:"linear-gradient(135deg,#7c3aed,#00c896)"},
          ].map(t=>(
            <div key={t.name} className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">{t.text}</div>
              <div className="testi-user">
                <div className="testi-av" style={{background:t.color}}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-loc">{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">
          Start Your<br/><span className="gr">Savings Journey</span><br/>Today
        </h2>
        <p className="cta-sub">
          Join thousands of Africans already building wealth with NEXORA. It takes 2 minutes to sign up.
        </p>
        <button className="cta-action" onClick={()=>router.push("/login")}>
          Create Free Account →
        </button>
        <div style={{marginTop:"1.2rem",fontSize:"0.76rem",color:"#2a4a3a"}}>
          No credit card · No bank account required · Cancel anytime
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <a className="footer-logo" href="/">
                <div style={{width:"26px",height:"26px",borderRadius:"7px",background:"linear-gradient(135deg,#00c896,#0066ff)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                    <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{background:"linear-gradient(135deg,#00c896,#4dffc3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</span>
              </a>
              <div className="footer-desc">
                Africa's premier crypto savings platform. Save 3 USDT/week, earn 35% APY, and build real wealth.
              </div>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              {[
                {l:"Dashboard",  p:"/dashboard"},
                {l:"Savings",    p:"/savings"},
                {l:"Deposit",    p:"/deposit"},
                {l:"Wallet",     p:"/wallet"},
                {l:"About Us",   p:"/about"},
              ].map(link=>(
                <button key={link.l} className="footer-link" onClick={()=>router.push(link.p)}>{link.l}</button>
              ))}
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              {[
                {l:"Terms & Conditions", p:"/terms"},
                {l:"Privacy Policy",     p:"/privacy"},
                {l:"Risk Disclosure",    p:"/risk"},
              ].map(link=>(
                <button key={link.l} className="footer-link" onClick={()=>router.push(link.p)}>{link.l}</button>
              ))}
              <div className="footer-col-title" style={{marginTop:"1rem"}}>Contact</div>
              <div className="footer-link" style={{cursor:"default"}}>support@nexora.com</div>
              <div className="footer-link" style={{cursor:"default"}}>admin@nexora.com</div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 NEXORA. All rights reserved.</div>
            <div className="footer-badges">
              <span className="f-badge">EU MiCA Aligned</span>
              <span className="f-badge">FSCA Standards</span>
              <span className="f-badge">KYC / AML</span>
              <span className="f-badge">NDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
