"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [form,   setForm]   = useState({name:"",email:"",subject:"",message:""});
  const [sent,   setSent]   = useState(false);
  const [loading,setLoad]   = useState(false);
  const [agent,  setAgent]  = useState<any>(null);

  useEffect(()=>{
    try {
      const team = JSON.parse(localStorage.getItem("nexora_support_team")||"[]");
      const active = team.find((a:any)=>a.active);
      if (active) setAgent(active);
    } catch {}
  },[]);

  function submit() {
    if (!form.name||!form.email||!form.message) return;
    setLoad(true);
    // Save to localStorage for admin
    const contacts = JSON.parse(localStorage.getItem("nexora_contacts")||"[]");
    contacts.unshift({...form,id:"c_"+Date.now(),submittedAt:new Date().toISOString(),status:"pending"});
    localStorage.setItem("nexora_contacts",JSON.stringify(contacts));
    setTimeout(()=>{ setLoad(false); setSent(true); },1200);
  }

  const WA_NUM = agent?.whatsapp||"2348000000000";
  const WA_MSG = encodeURIComponent("Hi NEXORA Support! I need help with:");

  const css = `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap");
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
    body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;}
    .wrap{max-width:820px;margin:0 auto;padding:0 1.2rem 5rem;}
    .nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;position:sticky;top:0;background:rgba(5,15,12,0.96);backdrop-filter:blur(20px);z-index:100;border-bottom:1px solid rgba(0,200,150,0.07);}
    .logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;cursor:pointer;}
    .logo-mark{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;}
    .hero{text-align:center;padding:3rem 0 2rem;}
    .tag{display:inline-flex;align-items:center;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:0.32rem 0.9rem;font-size:0.73rem;color:#00c896;font-weight:600;margin-bottom:1rem;}
    .title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.5rem);margin-bottom:0.5rem;}
    .gr{background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem;}
    .card{background:#081a14;border:1px solid rgba(0,200,150,0.13);border-radius:18px;padding:1.4rem;}
    .lbl{font-size:0.62rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:0.28rem;}
    .inp{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:0.68rem 0.9rem;font-size:0.86rem;color:#e8f8f4;font-family:"Inter",sans-serif;outline:none;transition:border-color 0.2s;margin-bottom:0.72rem;}
    .inp:focus{border-color:rgba(0,200,150,0.4);}
    textarea.inp{resize:vertical;min-height:95px;}
    .send-btn{width:100%;padding:0.88rem;border:none;border-radius:11px;background:linear-gradient(135deg,#00a87a,#00c896);font-weight:700;font-size:0.9rem;color:#050f0c;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.18s;}
    .send-btn:hover{transform:translateY(-1px);}
    .send-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
    .ch{display:flex;align-items:center;gap:0.75rem;padding:0.82rem;background:rgba(0,200,150,0.03);border:1px solid rgba(0,200,150,0.09);border-radius:12px;margin-bottom:0.5rem;text-decoration:none;transition:all 0.18s;cursor:pointer;}
    .ch:hover{border-color:rgba(0,200,150,0.22);background:rgba(0,200,150,0.06);transform:translateY(-1px);}
    .ch-ic{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0;}
    .ch-name{font-weight:700;font-size:0.85rem;margin-bottom:0.08rem;}
    .ch-sub{font-size:0.7rem;color:#5a8a7a;}
    .ch-arr{color:#5a8a7a;font-size:0.78rem;margin-left:auto;}
    .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#00ff88;animation:pulse 2s infinite;margin-right:0.3rem;}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
    .hours{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:11px;padding:0.85rem;margin-top:0.85rem;}
    .h-title{font-weight:700;font-size:0.82rem;color:#00c896;margin-bottom:0.55rem;}
    .h-row{display:flex;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(0,200,150,0.06);font-size:0.74rem;}
    .h-row:last-child{border-bottom:none;}
    .tip{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:0.7rem;margin-top:0.75rem;font-size:0.73rem;color:#5a8a7a;line-height:1.6;}
    .success{text-align:center;padding:2rem 1rem;}
    @media(max-width:600px){.grid{grid-template-columns:1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{maxWidth:"820px",margin:"0 auto",padding:"0 1.2rem"}}>
        <nav className="nav">
          <div className="logo" onClick={()=>router.push("/")}>
            <div className="logo-mark"><svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <span style={{background:"linear-gradient(135deg,#00c896,#4dffc3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</span>
          </div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>router.push("/about")} style={{padding:"0.38rem 0.85rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"8px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"Inter,sans-serif"}}>About</button>
            <button onClick={()=>router.push("/faq")} style={{padding:"0.38rem 0.85rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"8px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"Inter,sans-serif"}}>FAQ</button>
            <button onClick={()=>router.push("/login")} style={{padding:"0.38rem 0.9rem",border:"none",borderRadius:"8px",background:"linear-gradient(135deg,#00a87a,#00c896)",color:"#050f0c",cursor:"pointer",fontSize:"0.8rem",fontFamily:"Inter,sans-serif",fontWeight:700}}>Get Started</button>
          </div>
        </nav>
      </div>

      <div className="wrap">
        <div className="hero">
          <div className="tag">💬 Support</div>
          <h1 className="title">Get in <span className="gr">Touch</span></h1>
          <p style={{fontSize:"0.88rem",color:"#5a8a7a",maxWidth:"420px",margin:"0 auto",lineHeight:1.75}}>
            We're available 24/7. Choose the fastest channel for you — WhatsApp replies in minutes.
          </p>
        </div>

        <div className="grid">
          {/* FORM */}
          <div className="card">
            {sent?(
              <div className="success">
                <div style={{fontSize:"3rem",marginBottom:"0.7rem"}}>✅</div>
                <div style={{fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.4rem"}}>Message Sent!</div>
                <div style={{fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.65,marginBottom:"1.2rem"}}>
                  Thanks, <b style={{color:"#e8f8f4"}}>{form.name.split(" ")[0]}</b>! We'll reply to <b style={{color:"#e8f8f4"}}>{form.email}</b> within a few hours.
                </div>
                <button onClick={()=>{setSent(false);setForm({name:"",email:"",subject:"",message:""});}} style={{padding:"0.65rem 1.4rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"10px",background:"none",color:"#00c896",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600}}>
                  Send Another
                </button>
              </div>
            ):(
              <>
                <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.2rem"}}>Send us a message</div>
                <div style={{fontSize:"0.74rem",color:"#5a8a7a",marginBottom:"1.1rem"}}>Typically respond within 2-4 hours</div>
                <label className="lbl">Full Name *</label>
                <input className="inp" placeholder="Your full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                <label className="lbl">Email Address *</label>
                <input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
                <label className="lbl">Subject</label>
                <select className="inp" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={{cursor:"pointer"}}>
                  <option value="">Select topic...</option>
                  <option>Account Registration</option>
                  <option>Payment Issues</option>
                  <option>Savings Plan</option>
                  <option>Withdrawal Request</option>
                  <option>KYC Verification</option>
                  <option>Referral Program</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
                <label className="lbl">Message *</label>
                <textarea className="inp" placeholder="Describe your question or issue in detail..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/>
                <button className="send-btn" onClick={submit} disabled={!form.name||!form.email||!form.message||loading}>
                  {loading?"Sending...":"Send Message →"}
                </button>
              </>
            )}
          </div>

          {/* CHANNELS */}
          <div>
            <div className="card" style={{marginBottom:"0"}}>
              <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.2rem"}}>Quick Contact</div>
              <div style={{fontSize:"0.74rem",color:"#5a8a7a",marginBottom:"1rem"}}>Fastest response channels</div>

              {/* WHATSAPP */}
              <a href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`} target="_blank" rel="noreferrer" className="ch">
                <div className="ch-ic" style={{background:"rgba(37,211,102,0.12)"}}>📱</div>
                <div style={{flex:1}}>
                  <div className="ch-name">WhatsApp</div>
                  <div className="ch-sub"><span className="dot"/>Usually replies in minutes</div>
                </div>
                <span className="ch-arr">→</span>
              </a>

              {/* TELEGRAM */}
              <a href="https://t.me/NexoraSupport" target="_blank" rel="noreferrer" className="ch">
                <div className="ch-ic" style={{background:"rgba(0,136,204,0.12)"}}>✈️</div>
                <div style={{flex:1}}>
                  <div className="ch-name">Telegram</div>
                  <div className="ch-sub"><span className="dot"/>Fast responses</div>
                </div>
                <span className="ch-arr">→</span>
              </a>

              {/* EMAIL - properly working mailto */}
              <a href="mailto:support@nexora.com?subject=NEXORA Support Request" className="ch">
                <div className="ch-ic" style={{background:"rgba(0,200,150,0.1)"}}>📧</div>
                <div style={{flex:1}}>
                  <div className="ch-name">Email Support</div>
                  <div className="ch-sub">support@nexora.com</div>
                </div>
                <span className="ch-arr">→</span>
              </a>

              {/* ADMIN EMAIL */}
              <a href="mailto:admin@nexora.com?subject=NEXORA Urgent Matter" className="ch">
                <div className="ch-ic" style={{background:"rgba(255,165,0,0.1)"}}>👑</div>
                <div style={{flex:1}}>
                  <div className="ch-name">Admin — Urgent Only</div>
                  <div className="ch-sub">admin@nexora.com</div>
                </div>
                <span className="ch-arr">→</span>
              </a>

              <div className="hours">
                <div className="h-title">⏰ Support Hours</div>
                {[["Mon – Fri","7AM – 11PM WAT"],["Saturday","8AM – 10PM WAT"],["Sunday","10AM – 8PM WAT"],["WhatsApp / Chat","24/7 always on"]].map(([d,h])=>(
                  <div key={d} className="h-row"><span style={{color:"#5a8a7a"}}>{d}</span><span style={{fontWeight:600,color:"#e8f8f4",fontSize:"0.72rem"}}>{h}</span></div>
                ))}
              </div>

              <div className="tip">
                <b style={{color:"#00c896"}}>💡 Tip:</b> For fastest help, use WhatsApp. Include your registered email and describe your issue clearly. Never share your password with anyone.
              </div>

              <button onClick={()=>router.push("/faq")} style={{width:"100%",marginTop:"0.85rem",padding:"0.68rem",border:"1px solid rgba(0,200,150,0.18)",borderRadius:"10px",background:"none",color:"#5a8a7a",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:"0.82rem",fontWeight:600}}>
                📋 Check FAQ first →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
