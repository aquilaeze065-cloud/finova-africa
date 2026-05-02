"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const FINOVA_USDT_TRC20 = "TFinovaAfricaUSDT1234567890ABC";
const FINOVA_USDT_ERC20 = "0xFinovaAfricaUSDT1234567890abcdef";
const REG_FEE = 4;

export default function RegFeePage() {
  const router  = useRouter();
  const [user,     setUser]     = useState(null);
  const [network,  setNetwork]  = useState("TRC-20");
  const [copied,   setCopied]   = useState("");
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [txHash,   setTxHash]   = useState("");
  const [submitting,setSubmitting]=useState(false);
  const [submitted, setSubmitted]=useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
    if (!u.userId) { router.replace("/login"); return; }
    if (u.regFeePaid) { router.replace("/dashboard"); return; }
    if (u.regFeeSubmitted) { setSubmitted(true); }
    setUser(u);
  },[]);

  const address = network==="TRC-20" ? FINOVA_USDT_TRC20 : FINOVA_USDT_ERC20;

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(()=>setCopied(""),2000);
  }

  function handleFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
  }

  function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    setTimeout(()=>{
      // Save payment proof to localStorage for admin review
      const user = JSON.parse(localStorage.getItem("finova_user")||"{}");
      const payments = JSON.parse(localStorage.getItem("finova_payments")||"[]");
      const payment = {
        id:          "pay_"+Date.now(),
        userId:      user.userId,
        userName:    user.name,
        userEmail:   user.email,
        type:        "registration",
        amount:      REG_FEE,
        currency:    "USDT",
        network,
        txHash:      txHash||"Not provided",
        fileName:    file.name,
        preview:     preview,
        status:      "pending",
        submittedAt: new Date().toISOString(),
      };
      payments.push(payment);
      localStorage.setItem("finova_payments", JSON.stringify(payments));

      // Mark user as submitted
      user.regFeeSubmitted = true;
      user.regFeePaymentId = payment.id;
      localStorage.setItem("finova_user", JSON.stringify(user));

      setSubmitting(false);
      setSubmitted(true);
    },2000);
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0a0800;color:#f5e6c8;font-family:"DM Sans",sans-serif;min-height:100vh;}
        .rf-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
          background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(212,175,55,0.08),transparent 60%),#0a0800;}
        .rf-card{width:100%;max-width:480px;background:rgba(20,15,0,0.98);border:1px solid rgba(212,175,55,0.25);border-radius:24px;padding:2rem;box-shadow:0 32px 80px rgba(0,0,0,0.8);}
        .rf-logo{display:flex;align-items:center;gap:0.5rem;font-family:"Playfair Display",serif;font-weight:900;font-size:1rem;margin-bottom:1.5rem;justify-content:center;color:#d4af37;}
        .rf-title{font-family:"Playfair Display",serif;font-weight:900;font-size:1.4rem;text-align:center;margin-bottom:0.3rem;}
        .rf-sub{font-size:0.82rem;color:#8a7040;text-align:center;margin-bottom:1.5rem;line-height:1.5;}
        .rf-hi{background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:14px;padding:1rem;margin-bottom:1.3rem;text-align:center;}
        .rf-amount{font-family:"Playfair Display",serif;font-weight:900;font-size:2.5rem;color:#d4af37;line-height:1;}
        .rf-amount-label{font-size:0.75rem;color:#8a7040;margin-top:0.3rem;}
        .rf-breakdown{display:flex;gap:0.6rem;margin-top:0.85rem;flex-wrap:wrap;justify-content:center;}
        .rf-br-item{background:rgba(0,0,0,0.3);border:1px solid rgba(212,175,55,0.1);border-radius:10px;padding:0.5rem 0.75rem;font-size:0.75rem;color:#8a7040;text-align:center;}
        .rf-br-item b{color:#d4af37;display:block;font-size:0.88rem;}
        .rf-net-tabs{display:flex;gap:0.5rem;margin-bottom:1rem;}
        .rf-net-tab{flex:1;padding:0.65rem;border-radius:11px;border:1px solid rgba(212,175,55,0.15);background:none;color:#8a7040;cursor:pointer;font-family:"Playfair Display",serif;font-weight:700;font-size:0.85rem;transition:all 0.2s;text-align:center;}
        .rf-net-tab.active{background:rgba(212,175,55,0.12);border-color:rgba(212,175,55,0.4);color:#d4af37;}
        .rf-addr-wrap{background:rgba(0,0,0,0.4);border:1px solid rgba(212,175,55,0.15);border-radius:14px;padding:1rem;margin-bottom:1rem;}
        .rf-addr-label{font-size:0.7rem;color:#8a7040;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem;}
        .rf-addr-row{display:flex;align-items:center;gap:0.5rem;}
        .rf-addr-text{flex:1;font-family:"Courier New",monospace;font-size:0.72rem;color:#d4af37;word-break:break-all;line-height:1.4;}
        .rf-copy-btn{padding:0.4rem 0.8rem;border-radius:8px;border:1px solid rgba(212,175,55,0.3);background:rgba(212,175,55,0.1);color:#d4af37;font-family:"Playfair Display",serif;font-weight:700;font-size:0.72rem;cursor:pointer;white-space:nowrap;flex-shrink:0;}
        .rf-steps{margin-bottom:1.2rem;}
        .rf-step{display:flex;align-items:flex-start;gap:0.65rem;padding:0.6rem 0;border-bottom:1px solid rgba(212,175,55,0.06);}
        .rf-step:last-child{border-bottom:none;}
        .rf-step-n{width:24px;height:24px;border-radius:50%;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);display:flex;align-items:center;justify-content:center;font-family:"Playfair Display",serif;font-weight:700;font-size:0.72rem;color:#d4af37;flex-shrink:0;}
        .rf-step-text{font-size:0.8rem;color:#8a7040;line-height:1.45;}
        .rf-step-text b{color:#f5e6c8;}
        .rf-upload{border:2px dashed rgba(212,175,55,0.25);border-radius:14px;padding:1.2rem;text-align:center;cursor:pointer;transition:all 0.2s;margin-bottom:0.75rem;background:rgba(212,175,55,0.02);}
        .rf-upload:hover{border-color:rgba(212,175,55,0.5);background:rgba(212,175,55,0.05);}
        .rf-upload.has-file{border-style:solid;border-color:rgba(212,175,55,0.4);background:rgba(212,175,55,0.06);}
        .rf-preview{width:100%;max-height:120px;object-fit:cover;border-radius:9px;margin-top:0.5rem;}
        .rf-input{width:100%;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:11px;padding:0.75rem 0.9rem;font-size:0.88rem;color:#f5e6c8;font-family:"DM Sans",sans-serif;outline:none;margin-bottom:0.75rem;}
        .rf-input:focus{border-color:rgba(212,175,55,0.4);}
        .rf-btn{width:100%;padding:0.95rem;border:none;border-radius:13px;background:linear-gradient(135deg,#b8960c,#d4af37,#f5d76e);font-family:"Playfair Display",serif;font-weight:700;font-size:1rem;color:#0a0800;cursor:pointer;box-shadow:0 0 24px rgba(212,175,55,0.3);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;}
        .rf-btn:hover{transform:translateY(-2px);}
        .rf-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .rf-pending{text-align:center;padding:1.5rem 0;}
        .rf-logout{width:100%;margin-top:1rem;padding:0.7rem;border:1px solid rgba(212,175,55,0.15);border-radius:11px;background:none;color:#8a7040;cursor:pointer;font-size:0.82rem;font-family:"DM Sans",sans-serif;}
        .spinner{width:18px;height:18px;border:2px solid rgba(10,8,0,0.3);border-top-color:#0a0800;border-radius:50%;animation:spin 0.7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.rf-card{padding:1.4rem 1.1rem;border-radius:18px;}.rf-amount{font-size:2rem;}}
      `}</style>

      <div className="rf-bg">
        <div className="rf-card">
          <div className="rf-logo">👑 FINOVA AFRICA</div>

          {submitted ? (
            <div className="rf-pending">
              <div style={{fontSize:"3rem",marginBottom:"1rem"}}>⏳</div>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:"1.2rem",color:"#d4af37",marginBottom:"0.5rem"}}>Payment Under Review</div>
              <div style={{fontSize:"0.85rem",color:"#8a7040",lineHeight:1.6,marginBottom:"1.5rem"}}>
                Hi <b style={{color:"#f5e6c8"}}>{user.name}</b>, your payment proof has been submitted. Our team will verify and activate your account within <b style={{color:"#d4af37"}}>24-48 hours</b>.
              </div>
              <div style={{background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:"12px",padding:"1rem",marginBottom:"1.2rem"}}>
                <div style={{fontSize:"0.75rem",color:"#8a7040",marginBottom:"0.5rem"}}>What happens next?</div>
                {["Admin reviews your payment screenshot","Account gets activated within 24-48hrs","You receive a notification on approval","Start your weekly savings journey"].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.35rem 0",fontSize:"0.8rem",color:"#8a7040"}}>
                    <span style={{color:"#d4af37",fontWeight:700}}>{i+1}.</span> {s}
                  </div>
                ))}
              </div>
              <button className="rf-logout" onClick={()=>{
                localStorage.removeItem("finova_loggedin");
                router.replace("/login");
              }}>
                Sign out and come back later
              </button>
            </div>
          ) : (
            <>
              <div className="rf-title">Registration Fee</div>
              <div className="rf-sub">Hi, <b style={{color:"#d4af37"}}>{user.name}</b>! Complete your registration by paying the one-time activation fee below.</div>

              <div className="rf-hi">
                <div style={{fontSize:"0.75rem",color:"#8a7040",marginBottom:"0.3rem"}}>ONE-TIME REGISTRATION FEE</div>
                <div className="rf-amount">{REG_FEE} USDT</div>
                <div className="rf-amount-label">Pay once to activate your account & virtual wallets</div>
                <div className="rf-breakdown">
                  <div className="rf-br-item"><b>2 USDT</b>Registration</div>
                  <div className="rf-br-item"><b>2 USDT</b>Virtual Wallet Setup</div>
                </div>
              </div>

              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.75rem",color:"#d4af37"}}>Step 1 — Select Network</div>
              <div className="rf-net-tabs">
                <button className={"rf-net-tab"+(network==="TRC-20"?" active":"")} onClick={()=>setNetwork("TRC-20")}>
                  ₮ USDT TRC-20
                </button>
                <button className={"rf-net-tab"+(network==="ERC-20"?" active":"")} onClick={()=>setNetwork("ERC-20")}>
                  ⟠ USDT ERC-20
                </button>
              </div>

              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.75rem",color:"#d4af37"}}>Step 2 — Send to This Address</div>
              <div className="rf-addr-wrap">
                <div className="rf-addr-label">Finova Africa USDT ({network}) Address</div>
                <div className="rf-addr-row">
                  <div className="rf-addr-text">{address}</div>
                  <button className="rf-copy-btn" onClick={()=>copy(address,"addr")}>
                    {copied==="addr"?"Copied!":"Copy"}
                  </button>
                </div>
              </div>

              <div style={{background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)",borderRadius:"11px",padding:"0.75rem",marginBottom:"1.2rem",fontSize:"0.78rem",color:"#e74c3c",lineHeight:1.5}}>
                ⚠️ Send <b>exactly 4 USDT</b> to the address above. Do NOT send any other amount. Wrong amount = payment rejected.
              </div>

              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.75rem",color:"#d4af37"}}>Step 3 — Upload Payment Proof</div>

              <input type="file" accept="image/*" style={{display:"none"}} ref={fileRef} onChange={handleFile}/>
              <div className={"rf-upload"+(file?" has-file":"")} onClick={()=>fileRef.current?.click()}>
                {preview ? (
                  <>
                    <img src={preview} className="rf-preview" alt="proof"/>
                    <div style={{fontSize:"0.75rem",color:"#d4af37",marginTop:"0.4rem",fontWeight:600}}>✓ {file.name}</div>
                  </>
                ):(
                  <>
                    <div style={{fontSize:"1.8rem",marginBottom:"0.4rem"}}>📸</div>
                    <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.2rem"}}>Upload Screenshot</div>
                    <div style={{fontSize:"0.75rem",color:"#8a7040"}}>Tap to upload your payment screenshot</div>
                    <div style={{marginTop:"0.6rem",display:"inline-block",padding:"0.3rem 0.9rem",background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:"8px",fontSize:"0.78rem",color:"#d4af37",fontWeight:700}}>Choose File</div>
                  </>
                )}
              </div>

              <input className="rf-input" placeholder="Transaction Hash / ID (optional)" value={txHash} onChange={e=>setTxHash(e.target.value)}/>

              <div className="rf-steps" style={{marginBottom:"1.2rem"}}>
                {[
                  {n:"1",t:"Send exactly 4 USDT to the address above using your preferred network"},
                  {n:"2",t:"Take a screenshot of the completed transaction"},
                  {n:"3",t:"Upload the screenshot and optionally paste your transaction hash"},
                  {n:"4",t:"Submit and wait 24-48 hours for admin approval"},
                ].map(s=>(
                  <div key={s.n} className="rf-step">
                    <div className="rf-step-n">{s.n}</div>
                    <div className="rf-step-text">{s.t}</div>
                  </div>
                ))}
              </div>

              <button className="rf-btn" onClick={handleSubmit} disabled={!file||submitting}>
                {submitting?<><div className="spinner"/> Submitting...</>:"Submit Payment Proof"}
              </button>

              <button className="rf-logout" onClick={()=>{
                localStorage.removeItem("finova_loggedin");
                router.replace("/login");
              }}>
                Sign out and pay later
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
