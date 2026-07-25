"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegFeePage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user,       setUser]       = useState<any>(null);
  const [step,       setStep]       = useState<"pay"|"submitted"|"approved">("pay");
  const [screenshot, setScreenshot] = useState<string>("");
  const [txHash,     setTxHash]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [wallets,    setWallets]    = useState<any[]>([]);
  const [copied,     setCopied]     = useState("");

  useEffect(()=>{
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    if (!token) { window.location.replace("/login"); return; }
    try {
      const u = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");
      setUser(u);
      if (u.reg_fee_paid||u.account_status==="active") { window.location.replace("/dashboard"); return; }
      if (u.reg_fee_submitted||u.regFeeSubmitted) setStep("submitted");
    } catch {}
    // Load wallets
    try {
      const saved = JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]");
      if (saved.length) setWallets(saved);
      else setWallets([{coin:"USDT",network:"TRC-20 (TRON)",address:"Please check the deposit section for wallet addresses"}]);
    } catch {}
  },[]);

  function handleFile(e:any) {
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload=ev=>setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function submitPayment() {
    if (!screenshot) { setError("Please upload your payment screenshot"); return; }
    setLoading(true); setError("");
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    try {
      const res  = await fetch(`${API}/api/reg-fee/submit`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body:JSON.stringify({screenshotUrl:screenshot, txHash}),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error||"Submission failed"); return; }
      // Update localStorage
      const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
      u.reg_fee_submitted=true; u.regFeeSubmitted=true;
      localStorage.setItem("nexora_user",JSON.stringify(u));
      localStorage.setItem("finova_user",JSON.stringify(u));
      setStep("submitted");
    } catch {
      // Fallback - save locally
      const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
      u.reg_fee_submitted=true; u.regFeeSubmitted=true;
      localStorage.setItem("nexora_user",JSON.stringify(u));
      localStorage.setItem("finova_user",JSON.stringify(u));
      setStep("submitted"); setLoading(false);
    }
  }

  function copyAddr(addr:string, key:string) {
    navigator.clipboard.writeText(addr);
    setCopied(key); setTimeout(()=>setCopied(""),2500);
  }

  const G="#00c896";

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;}
        .pg{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem 3rem;
          background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(0,200,150,0.08),transparent 60%),#050f0c;}
        .card{width:100%;max-width:440px;background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:1.8rem 1.6rem;box-shadow:0 20px 60px rgba(0,0,0,0.7);}
        .logo{display:flex;flex-direction:column;align-items:center;gap:0.3rem;margin-bottom:1.5rem;}
        .lbl{font-size:0.63rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:0.3rem;}
        .inp{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:0.72rem 0.9rem;font-size:0.88rem;color:#e8f8f4;font-family:"Inter",sans-serif;outline:none;margin-bottom:0.85rem;}
        .inp:focus{border-color:rgba(0,200,150,0.4);}
        .btn{width:100%;padding:0.88rem;border:none;border-radius:11px;background:linear-gradient(135deg,#00a87a,${G});font-family:"Inter",sans-serif;font-weight:700;font-size:0.92rem;color:#050f0c;cursor:pointer;transition:all 0.2s;margin-bottom:0.5rem;}
        .btn:disabled{opacity:0.5;cursor:not-allowed;}
        .upload-box{border:2px dashed rgba(0,200,150,0.25);border-radius:12px;padding:1.2rem;text-align:center;cursor:pointer;margin-bottom:0.85rem;transition:all 0.2s;}
        .upload-box:hover{border-color:rgba(0,200,150,0.45);background:rgba(0,200,150,0.03);}
        .upload-box.has{border-style:solid;border-color:rgba(0,200,150,0.4);}
        .addr-box{background:rgba(0,0,0,0.4);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:0.75rem;margin-bottom:0.65rem;display:flex;align-items:center;gap:0.5rem;}
        .addr-txt{flex:1;font-family:monospace;font-size:0.7rem;color:#3a8a6a;word-break:break-all;line-height:1.4;}
        .copy-btn{padding:0.3rem 0.65rem;border:1px solid rgba(0,200,150,0.2);border-radius:7px;background:rgba(0,200,150,0.08);color:${G};font-size:0.68rem;font-weight:700;cursor:pointer;white-space:nowrap;font-family:"Inter",sans-serif;}
        .step-bar{display:flex;align-items:center;margin-bottom:1.5rem;gap:0;}
        .step-item{display:flex;align-items:center;gap:0.35rem;flex:1;}
        .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;flex-shrink:0;}
        .step-line{flex:1;height:2px;background:rgba(0,200,150,0.15);}
        .step-line.done{background:${G};}
        .err{background:rgba(255,71,87,0.08);border:1px solid rgba(255,71,87,0.2);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.76rem;color:#ff4757;margin-bottom:0.75rem;}
        @keyframes sp{to{transform:rotate(360deg)}}
      `}</style>

      <div className="pg">
        <div className="card">
          {/* LOGO */}
          <div className="logo">
            <div style={{width:"48px",height:"48px",borderRadius:"13px",background:"linear-gradient(135deg,#00c896,#0066ff)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 24px rgba(0,200,150,0.35)"}}>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{fontWeight:800,fontSize:"1.2rem",background:"linear-gradient(135deg,#00c896,#4dffc3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</div>
            <div style={{fontSize:"0.6rem",color:"#3a6a5a",letterSpacing:"0.12em",textTransform:"uppercase"}}>Smart Finance. Borderless Future.</div>
          </div>

          {/* STEP BAR */}
          <div className="step-bar">
            {[{n:"1",l:"Register"},{n:"2",l:"Pay $2"},{n:"3",l:"Approved"},{n:"4",l:"Start Saving"}].map((s,i,arr)=>(
              <div key={s.n} className="step-item">
                <div className="step-dot" style={{background:i<=1?`linear-gradient(135deg,#00a87a,${G})`:"rgba(0,200,150,0.1)",color:i<=1?"#050f0c":G,border:i<=1?"none":`1px solid rgba(0,200,150,0.2)`}}>{s.n}</div>
                {i<arr.length-1&&<div className={`step-line ${i<1?"done":""}`}/>}
              </div>
            ))}
          </div>

          {/* SUBMITTED STATE */}
          {step==="submitted"&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>⏳</div>
              <div style={{fontWeight:700,fontSize:"1rem",color:G,marginBottom:"0.5rem"}}>Payment Submitted!</div>
              <div style={{fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.65,marginBottom:"1.2rem"}}>
                Hi <b style={{color:"#e8f8f4"}}>{user?.name?.split(" ")[0]}</b>, your payment proof has been received. Our admin team will review and activate your account.
              </div>
              <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"12px",padding:"1rem",marginBottom:"1.2rem",textAlign:"left"}}>
                <div style={{fontWeight:600,fontSize:"0.72rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.65rem"}}>What Happens Next</div>
                {["Admin reviews your payment screenshot","Account verified within 24-48 hours","You receive an activation notification","Dashboard unlocks — start your savings journey"].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"0.55rem",padding:"0.35rem 0",fontSize:"0.78rem",color:"#5a8a7a"}}>
                    <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:700,color:G,flexShrink:0}}>{i+1}</div>
                    {s}
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(0,102,255,0.05)",border:"1px solid rgba(0,102,255,0.12)",borderRadius:"10px",padding:"0.75rem",marginBottom:"1.2rem",fontSize:"0.74rem",color:"#5a8a7a",lineHeight:1.5}}>
                📧 Check your email for updates. You can close this page and sign in later to check your status.
              </div>
              <button onClick={()=>{
                Object.keys(localStorage).filter(k=>k.includes("nexora")||k.includes("finova")).forEach(k=>localStorage.removeItem(k));
                window.location.replace("/login");
              }} style={{width:"100%",padding:"0.75rem",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"11px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"Inter,sans-serif"}}>
                Sign out and come back later
              </button>
            </div>
          )}

          {/* PAYMENT FORM */}
          {step==="pay"&&(
            <>
              <div style={{fontWeight:700,fontSize:"0.95rem",color:"#e8f8f4",marginBottom:"0.3rem"}}>Registration Fee — $2 USDT</div>
              <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.6,marginBottom:"1.1rem"}}>
                A one-time <b style={{color:G}}>$2 USDT</b> registration fee is required to activate your account. Send exactly <b style={{color:G}}>$2 USDT</b> to one of our wallet addresses below, then upload your payment screenshot.
              </div>

              {error&&<div className="err">⚠️ {error}</div>}

              {/* WALLET ADDRESSES */}
              <div style={{marginBottom:"1rem"}}>
                <label className="lbl">Send $2 USDT to any of these addresses</label>
                {wallets.length>0 ? wallets.map((w,i)=>(
                  <div key={i}>
                    <div style={{fontSize:"0.68rem",color:"#5a8a7a",marginBottom:"0.25rem",fontWeight:600}}>
                      {w.coin} — {w.network}
                    </div>
                    <div className="addr-box">
                      <div className="addr-txt">{w.address}</div>
                      <button className="copy-btn" onClick={()=>copyAddr(w.address,String(i))}>
                        {copied===String(i)?"✓ Copied":"Copy"}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"10px",padding:"0.75rem",fontSize:"0.78rem",color:"#5a8a7a"}}>
                    Wallet addresses are being set up. Check the deposit page or contact support.
                  </div>
                )}
              </div>

              {/* TX HASH */}
              <label className="lbl">Transaction Hash (optional)</label>
              <input className="inp" placeholder="Enter blockchain transaction hash" value={txHash} onChange={e=>setTxHash(e.target.value)}/>

              {/* SCREENSHOT UPLOAD */}
              <label className="lbl">Payment Screenshot *</label>
              <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleFile}/>
              <div className={"upload-box"+(screenshot?" has":"")} onClick={()=>fileRef.current?.click()}>
                {screenshot ? (
                  <>
                    <img src={screenshot} style={{maxHeight:"120px",borderRadius:"8px",objectFit:"contain",marginBottom:"0.35rem"}} alt="proof"/>
                    <div style={{fontSize:"0.72rem",color:G,fontWeight:600}}>✓ Screenshot uploaded — click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{fontSize:"1.8rem",marginBottom:"0.4rem"}}>📸</div>
                    <div style={{fontWeight:600,fontSize:"0.84rem",color:"#e8f8f4",marginBottom:"0.2rem"}}>Upload Payment Screenshot</div>
                    <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Take a screenshot of your transfer confirmation</div>
                  </>
                )}
              </div>

              <div style={{background:"rgba(255,165,0,0.05)",border:"1px solid rgba(255,165,0,0.15)",borderRadius:"10px",padding:"0.75rem",marginBottom:"0.85rem",fontSize:"0.74rem",color:"#a08030",lineHeight:1.55}}>
                ⚠️ Send <b>exactly $2 USDT</b>. Sending a different amount may delay your verification. Keep your transfer screenshot as proof.
              </div>

              <button className="btn" onClick={submitPayment} disabled={!screenshot||loading}>
                {loading
                  ?<><span style={{width:"16px",height:"16px",border:"2px solid rgba(5,15,12,0.3)",borderTop:"2px solid #050f0c",borderRadius:"50%",display:"inline-block",animation:"sp 0.7s linear infinite",marginRight:"0.4rem"}}/>Submitting...</>
                  :"Submit Payment Proof"
                }
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
