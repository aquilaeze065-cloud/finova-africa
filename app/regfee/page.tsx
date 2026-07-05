"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FINOVA_TRC20 = "TFinovaAfricaUSDT1234567890ABCDEF";
const FINOVA_ERC20 = "0xFinovaAfricaUSDT1234567890abcdefghij";

export default function RegFeePage() {
  const router  = useRouter();
  const [user,       setUser]      = useState<any>(null);
  const [network,    setNetwork]   = useState("TRC-20");
  const [copied,     setCopied]    = useState("");
  const [file,       setFile]      = useState<any>(null);
  const [preview,    setPreview]   = useState<string|null>(null);
  const [txHash,     setTxHash]    = useState("");
  const [submitting, setSubmitting]= useState(false);
  const [submitted,  setSubmitted] = useState(false);
  const fileRef = useRef<any>(null);

  useEffect(()=>{
    const token = localStorage.getItem("nexora_token");
    const loggedin = localStorage.getItem("nexora_loggedin");
    if (!token || loggedin !== "true") {
      window.location.replace("/login"); return;
    }
    const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
    if (!u.id && !u.userId) { window.location.replace("/login"); return; }
    if (u.reg_fee_paid || u.account_status==="active") {
      router.replace("/dashboard"); return;
    }
    if (u.reg_fee_submitted || u.regFeeSubmitted) setSubmitted(true);
    setUser(u);
  },[]);

  const address = network==="TRC-20" ? FINOVA_TRC20 : FINOVA_ERC20;

  function copy(text:string, key:string) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(()=>setCopied(""),2500);
  }

  function handleFile(e:any) {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("nexora_token");
      const u     = JSON.parse(localStorage.getItem("nexora_user")||"{}");

      // Build payment record
      const paymentId = "pay_" + Date.now();
      const payment = {
        id:          paymentId,
        userId:      u.id || u.userId || "unknown",
        userName:    u.name || "Unknown",
        userEmail:   u.email || "unknown@email.com",
        type:        "registration",
        amount:      4,
        currency:    "USDT",
        network:     network,
        txHash:      txHash || "Not provided",
        screenshot:  preview,
        fileName:    file.name,
        fileSize:    file.size,
        status:      "pending",
        submittedAt: new Date().toISOString(),
      };

      // Save to nexora_payments for admin panel
      const existing = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
      existing.unshift(payment);
      localStorage.setItem("nexora_payments", JSON.stringify(existing));

      // Also save to nexora_kyc_payments (backup key)
      localStorage.setItem("nexora_pending_payment", JSON.stringify(payment));

      // Update user
      u.reg_fee_submitted = true;
      u.regFeeSubmitted   = true;
      u.regFeePaymentId   = paymentId;
      localStorage.setItem("nexora_user", JSON.stringify(u));

      // Try backend too
      if (token) {
        try {
          await fetch(`${API}/api/payments/reg-fee`, {
            method:  "POST",
            headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
            body:    JSON.stringify({
              network, txHash: txHash||"Not provided",
              screenshotUrl: preview, userName: u.name, userEmail: u.email,
            }),
          });
        } catch(e) { /* backend optional */ }
      }

      setSubmitting(false);
      setSubmitted(true);
    } catch(err) {
      console.error(err);
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap");
        html,body{margin:0;padding:0;}
        *,*::before,*::after{box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"DM Sans",sans-serif;min-height:100vh;}
        .rf-bg{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;
          padding:1rem;overflow-y:auto;
          background:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(0,200,150,0.07),transparent 60%),#050f0c;}
        .rf-card{width:100%;max-width:460px;background:rgba(6,18,14,0.98);border:1px solid rgba(0,200,150,0.2);
          border-radius:18px;padding:1.5rem 1.4rem;box-shadow:0 24px 64px rgba(0,0,0,0.8);margin:0.5rem auto;}
        .rf-logo{font-family:"Inter",serif;font-weight:800;font-size:0.9rem;text-align:center;
          color:#00c896;margin-bottom:1.2rem;display:flex;align-items:center;justify-content:center;gap:0.4rem;}
        .rf-section{font-family:"Inter",serif;font-weight:600;font-size:0.82rem;color:#00c896;
          margin-bottom:0.6rem;margin-top:0.9rem;}
        .rf-net-tabs{display:flex;gap:0.4rem;margin-bottom:0.75rem;}
        .rf-net-tab{flex:1;padding:0.55rem;border-radius:9px;border:1px solid rgba(0,200,150,0.12);
          background:none;color:#3a7a6a;cursor:pointer;font-size:0.78rem;font-weight:600;
          transition:all 0.18s;text-align:center;}
        .rf-net-tab.active{background:rgba(0,200,150,0.1);border-color:rgba(0,200,150,0.35);color:#00c896;}
        .rf-addr-box{background:rgba(0,0,0,0.4);border:1px solid rgba(0,200,150,0.15);
          border-radius:12px;padding:0.9rem;margin-bottom:0.75rem;}
        .rf-addr-label{font-size:0.65rem;color:#3a7a6a;font-weight:600;text-transform:uppercase;
          letter-spacing:0.06em;margin-bottom:0.35rem;}
        .rf-addr-row{display:flex;align-items:flex-start;gap:0.5rem;}
        .rf-addr-text{flex:1;font-family:"Courier New",monospace;font-size:0.67rem;color:#00c896;
          word-break:break-all;line-height:1.4;}
        .rf-copy{padding:0.32rem 0.7rem;border-radius:7px;border:1px solid rgba(0,200,150,0.25);
          background:rgba(0,200,150,0.08);color:#00c896;font-size:0.68rem;font-weight:700;
          cursor:pointer;white-space:nowrap;flex-shrink:0;}
        .rf-warn{background:rgba(231,76,60,0.06);border:1px solid rgba(231,76,60,0.15);
          border-radius:9px;padding:0.65rem;margin-bottom:0.75rem;font-size:0.72rem;color:#ff4757;line-height:1.5;}
        .rf-upload{border:2px dashed rgba(0,200,150,0.18);border-radius:12px;padding:1rem;
          text-align:center;cursor:pointer;transition:all 0.2s;margin-bottom:0.65rem;
          background:rgba(0,200,150,0.02);}
        .rf-upload:hover{border-color:rgba(0,200,150,0.35);background:rgba(0,200,150,0.04);}
        .rf-upload.has-file{border-style:solid;border-color:rgba(0,200,150,0.3);}
        .rf-preview{width:100%;max-height:90px;object-fit:cover;border-radius:8px;margin-top:0.4rem;}
        .rf-input{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);
          border-radius:10px;padding:0.65rem 0.85rem;font-size:0.84rem;color:#e8f8f4;
          outline:none;margin-bottom:0.65rem;font-family:"DM Sans",sans-serif;}
        .rf-input:focus{border-color:rgba(0,200,150,0.35);}
        .rf-btn{width:100%;padding:0.85rem;border:none;border-radius:11px;
          background:linear-gradient(135deg,#00a87a,#00c896,#4dffc3);
          font-family:"Inter",serif;font-weight:700;font-size:0.92rem;
          color:#050f0c;cursor:pointer;box-shadow:0 0 18px rgba(0,200,150,0.2);
          transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;}
        .rf-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .rf-out{width:100%;margin-top:0.65rem;padding:0.6rem;border:1px solid rgba(0,200,150,0.1);
          border-radius:10px;background:none;color:#3a7a6a;cursor:pointer;font-size:0.76rem;}
        .rf-amount-card{background:linear-gradient(135deg,rgba(8,20,14,0.9),rgba(6,18,14,0.95));
          border:1px solid rgba(0,200,150,0.25);border-radius:12px;padding:1rem;
          margin-bottom:0.85rem;text-align:center;}
        .rf-queue{text-align:center;padding:1.2rem 0.5rem;}
        .rf-queue-steps{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);
          border-radius:11px;padding:0.9rem;text-align:left;margin:1rem 0;}
        .rf-qstep{display:flex;align-items:flex-start;gap:0.55rem;padding:0.4rem 0;font-size:0.76rem;color:#5a8a7a;}
        .rf-qnum{width:19px;height:19px;border-radius:50%;background:rgba(0,200,150,0.1);
          border:1px solid rgba(0,200,150,0.2);display:flex;align-items:center;justify-content:center;
          font-family:"Inter",serif;font-weight:700;font-size:0.62rem;color:#00c896;flex-shrink:0;}
        .spinner{width:15px;height:15px;border:2px solid rgba(10,8,0,0.3);border-top-color:#050f0c;
          border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:380px){.rf-card{padding:1.2rem 1rem;border-radius:14px;}}
      `}</style>

      <div className="rf-bg">
        <div className="rf-card">
          <div className="rf-logo">👑 NEXORA</div>

          {submitted ? (
            <div className="rf-queue">
              <div style={{fontSize:"2.2rem",marginBottom:"0.75rem"}}>⏳</div>
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.4rem"}}>
                Payment Submitted!
              </div>
              <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.6}}>
                Hi <b style={{color:"#00c896"}}>{user.name}</b>, your payment proof has been received. Our admin team will review and activate your account.
              </div>
              <div className="rf-queue-steps">
                <div style={{fontSize:"0.65rem",color:"#3a7a6a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.5rem"}}>What happens next</div>
                {["Admin reviews your payment screenshot","Account verified within 24-48 hours","You receive an activation notification","Dashboard unlocks — start your savings journey"].map((s,i)=>(
                  <div key={i} className="rf-qstep">
                    <div className="rf-qnum">{i+1}</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"9px",padding:"0.65rem",fontSize:"0.72rem",color:"#5a8a7a",lineHeight:1.5}}>
                📧 Check your email for updates. You can close this page and sign in later to check your status.
              </div>
              <button className="rf-out" onClick={()=>{
                ["nexora_token","nexora_loggedin","nexora_user","nexora_savings",
                "nexora_notifications","nexora_payments"].forEach(k=>localStorage.removeItem(k));
                window.location.replace("/login");
              }}>Sign out and come back later</button>
            </div>
          ) : (
            <>
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1rem",marginBottom:"0.25rem"}}>
                Activation Fee
              </div>
              <div style={{fontSize:"0.73rem",color:"#3a7a6a",marginBottom:"0.9rem"}}>
                Hi <b style={{color:"#00c896"}}>{user.name}</b>! Pay the one-time fee to activate your account.
              </div>

              <div className="rf-amount-card">
                <div style={{fontSize:"0.65rem",color:"#3a7a6a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.25rem"}}>One-Time Activation Fee</div>
                <div style={{fontFamily:"Inter,serif",fontWeight:800,fontSize:"1.9rem",color:"#00c896",lineHeight:1}}>4 USDT</div>
                <div style={{fontSize:"0.68rem",color:"#3a7a6a",marginTop:"0.2rem"}}>2 USDT Registration + 2 USDT Wallet Setup</div>
              </div>

              <div className="rf-section">Step 1 — Select Network</div>
              <div className="rf-net-tabs">
                <button className={"rf-net-tab"+(network==="TRC-20"?" active":"")} onClick={()=>setNetwork("TRC-20")}>₮ USDT TRC-20</button>
                <button className={"rf-net-tab"+(network==="ERC-20"?" active":"")} onClick={()=>setNetwork("ERC-20")}>⟠ USDT ERC-20</button>
              </div>

              <div className="rf-section">Step 2 — Send to Our Address</div>
              <div className="rf-addr-box">
                <div className="rf-addr-label">NEXORA USDT ({network}) Address</div>
                <div className="rf-addr-row">
                  <div className="rf-addr-text">{address}</div>
                  <button className="rf-copy" onClick={()=>copy(address,"addr")}>
                    {copied==="addr"?"✓ Copied":"Copy"}
                  </button>
                </div>
              </div>

              <div className="rf-warn">
                ⚠️ Send <b>exactly 4 USDT</b> using <b>{network}</b>. Wrong amount or wrong network = payment rejected.
              </div>

              <div className="rf-section">Step 3 — Upload Payment Screenshot *</div>
              <input type="file" accept="image/*" style={{display:"none"}} ref={fileRef} onChange={handleFile}/>
              <div className={"rf-upload"+(file?" has-file":"")} onClick={()=>fileRef.current?.click()}>
                {preview
                  ?<><img src={preview} className="rf-preview" alt="proof"/><div style={{fontSize:"0.7rem",color:"#00c896",marginTop:"0.3rem",fontWeight:600}}>✓ {file.name}</div></>
                  :<><div style={{fontSize:"1.5rem",marginBottom:"0.3rem"}}>📸</div>
                    <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.82rem",marginBottom:"0.15rem"}}>Upload Screenshot</div>
                    <div style={{fontSize:"0.7rem",color:"#3a7a6a"}}>Tap to upload your payment proof</div>
                    <div style={{marginTop:"0.35rem",display:"inline-block",padding:"0.25rem 0.8rem",background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"7px",fontSize:"0.72rem",color:"#00c896",fontWeight:600}}>Choose File</div>
                  </>
                }
              </div>

              <input className="rf-input" placeholder="Transaction Hash / ID (optional)" value={txHash} onChange={e=>setTxHash(e.target.value)}/>

              <button className="rf-btn" onClick={handleSubmit} disabled={!file||submitting}>
                {submitting?<><div className="spinner"/> Submitting...</>:"Submit Payment Proof"}
              </button>
              <button className="rf-out" onClick={()=>{localStorage.removeItem("nexora_loggedin");router.replace("/login");}}>
                Pay later — Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
