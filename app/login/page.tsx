"use client";
import { useState, useEffect, useRef } from "react";
import ContractModal from "../components/ContractModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const REG_FEE = 4; // $4 USDT registration fee

export default function LoginPage() {
  const fileRef  = useRef<HTMLInputElement>(null);
  const otpRefs  = useRef<(HTMLInputElement|null)[]>([]);

  // Tab
  const [tab,        setTab]       = useState("signup");

  // Signup fields
  const [name,       setName]      = useState("");
  const [email,      setEmail]     = useState("");
  const [password,   setPass]      = useState("");
  const [showPass,   setShowPass]  = useState(false);
  const [refCode,    setRefCode]   = useState("");
  const [remember,   setRemember]  = useState(true);

  // Reg fee
  const [screenshot, setScreenshot]= useState("");
  const [txHash,     setTxHash]    = useState("");
  const [wallets,    setWallets]   = useState<any[]>([]);
  const [copied,     setCopied]    = useState("");
  const [feeReady,   setFeeReady]  = useState(false);

  // States
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [step,       setStep]      = useState<"form"|"otp"|"pending">("form");
  const [otp,        setOtp]       = useState(["","","","","",""]);
  const [otpCode,    setOtpCode]   = useState("");
  const [waUrl,      setWaUrl]     = useState("");
  const [phone,      setPhone]     = useState("");
  const [timer,      setTimer]     = useState(0);

  // Contract
  const [showContract, setShowContract] = useState(false);
  const [pendingUser,  setPendingUser]  = useState<any>(null);
  const [signedUser,   setSignedUser]   = useState<any>(null);

  // Signin
  const [semail,     setSemail]    = useState("");
  const [spassword,  setSpass]     = useState("");
  const [showSPass,  setShowSPass] = useState(false);

  useEffect(()=>{
    try {
      const rem = localStorage.getItem("nexora_remember");
      if (rem) { const {e,p}=JSON.parse(rem); setSemail(e||""); setSpass(p||""); setTab("signin"); }
    } catch {}
    // Load platform wallets for fee payment
    try {
      const saved = JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]");
      if (saved.length) setWallets(saved);
    } catch {}
    // Fetch wallets from backend
    fetch(`${API}/api/wallets`)
      .then(r=>r.json())
      .then(d=>{ if(d.wallets?.length) setWallets(d.wallets); })
      .catch(()=>{});
  },[]);

  function startTimer() {
    setTimer(60);
    const t=setInterval(()=>setTimer(s=>{ if(s<=1){clearInterval(t);return 0;} return s-1; }),1000);
  }

  function handleFile(e:any) {
    const f=e.target.files?.[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=ev=>{ setScreenshot(ev.target?.result as string); setFeeReady(true); };
    reader.readAsDataURL(f);
  }

  function copyAddr(addr:string, key:string) {
    navigator.clipboard.writeText(addr);
    setCopied(key); setTimeout(()=>setCopied(""),2500);
  }

  function handleSignup() {
    if (!name)       { setError("Please enter your full name"); return; }
    if (!email)      { setError("Please enter your email"); return; }
    if (!password)   { setError("Please enter a password"); return; }
    if (password.length<8) { setError("Password must be at least 8 characters"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    if (!screenshot) { setError("Please upload your $4 USDT registration fee payment screenshot to continue"); return; }
    setError("");
    setPendingUser({name,email,password,refCode,screenshot,txHash});
    setShowContract(true);
  }

  async function handleContractAccept(signature:string) {
    setShowContract(false);
    setLoading(true);
    try {
      const body:any = {
        name:pendingUser.name,
        email:pendingUser.email,
        password:pendingUser.password,
        regFeeScreenshot:pendingUser.screenshot,
        regFeeTxHash:pendingUser.txHash||null,
      };
      if (pendingUser.refCode) body.referredBy = pendingUser.refCode;

      const res  = await fetch(`${API}/api/auth/signup`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Signup failed. Try again."); setLoading(false); return; }

      // Save user as PENDING until admin approves fee
      const userData = {
        ...data.user,
        balances:{btc:0,eth:0,usdt:0,bnb:0,ngn:0},
        account_status:"pending",
        reg_fee_paid:false,
        reg_fee_submitted:true,
        regFeeSubmitted:true,
      };
      localStorage.setItem("nexora_token",    data.token);
      localStorage.setItem("nexora_user",     JSON.stringify(userData));
      localStorage.setItem("nexora_loggedin", "true");
      localStorage.setItem("nexora_visited",  "true");
      localStorage.setItem("finova_token",    data.token);
      localStorage.setItem("finova_user",     JSON.stringify(userData));
      localStorage.setItem("finova_loggedin", "true");
      if (remember) localStorage.setItem("nexora_remember",JSON.stringify({e:pendingUser.email,p:pendingUser.password}));

      setSignedUser(data);
      setLoading(false);
      setStep("otp");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  async function sendOTP() {
    const clean = phone.replace(/\D/g,"");
    if (clean.length<7) { setError("Enter a valid WhatsApp number with country code"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/otp/send`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({phone:clean, name:pendingUser?.name||name||"User"}),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error||"Failed to send code"); return; }
      setOtpCode(data.code||"");
      setWaUrl(data.waUrl||"");
      if (data.code) setOtp(data.code.split(""));
      startTimer();
      if (data.waUrl) window.open(data.waUrl,"_blank");
    } catch { setError("Connection error."); setLoading(false); }
  }

  async function verifyOTP() {
    const code = otp.join("");
    if (code.length<6) { setError("Enter the 6-digit code"); return; }
    setLoading(true); setError("");
    const clean = phone.replace(/\D/g,"");
    try {
      const res  = await fetch(`${API}/api/otp/verify`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({phone:clean, code}),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok||!data.verified) { setError(data.error||"Wrong code. Try again."); return; }
      // Update phone in localStorage
      try {
        const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
        u.phone = clean;
        localStorage.setItem("nexora_user",JSON.stringify(u));
        localStorage.setItem("finova_user",JSON.stringify(u));
      } catch {}
      setStep("pending");
    } catch { setError("Connection error."); setLoading(false); }
  }

  async function handleSignin() {
    if (!semail||!spassword) { setError("Please fill all fields"); return; }
    setError(""); setLoading(true);
    try {
      const controller = new AbortController();
      const t = setTimeout(()=>controller.abort(),12000);
      const res  = await fetch(`${API}/api/auth/signin`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:semail,password:spassword}),
        signal:controller.signal,
      });
      clearTimeout(t);
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Login failed. Check your email and password."); setLoading(false); return; }
      const userData={...data.user,balances:{btc:0,eth:0,usdt:0,bnb:0,ngn:0}};
      localStorage.setItem("nexora_token",    data.token);
      localStorage.setItem("nexora_user",     JSON.stringify(userData));
      localStorage.setItem("nexora_loggedin", "true");
      localStorage.setItem("nexora_visited",  "true");
      localStorage.setItem("finova_token",    data.token);
      localStorage.setItem("finova_user",     JSON.stringify(userData));
      localStorage.setItem("finova_loggedin", "true");
      if (remember) localStorage.setItem("nexora_remember",JSON.stringify({e:semail,p:spassword}));
      setLoading(false);
      // Route based on account status
      if (userData.account_status==="pending"||!userData.reg_fee_paid) {
        window.location.replace("/regfee");
      } else {
        window.location.replace("/dashboard");
      }
    } catch(err:any) {
      try {
        const stored = localStorage.getItem("nexora_user")||localStorage.getItem("finova_user");
        if (stored) {
          const u=JSON.parse(stored);
          if (u.email===semail) {
            localStorage.setItem("nexora_loggedin","true");
            localStorage.setItem("finova_loggedin","true");
            setLoading(false);
            window.location.replace(u.reg_fee_paid?"/dashboard":"/regfee");
            return;
          }
        }
      } catch {}
      setError(err?.name==="AbortError"?"Server timeout. Try again.":"Cannot reach server. Check your internet.");
      setLoading(false);
    }
  }

  function handleOTPInput(val:string,idx:number) {
    const d=val.replace(/\D/g,"").slice(-1);
    const next=[...otp]; next[idx]=d; setOtp(next);
    if(d&&idx<5) otpRefs.current[idx+1]?.focus();
  }
  function handleOTPKey(e:any,idx:number) {
    if(e.key==="Backspace"&&!otp[idx]&&idx>0) otpRefs.current[idx-1]?.focus();
  }

  const css=`
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
    body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;}
    .pg{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem 3rem;
      background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(0,200,150,0.1),transparent 60%),#050f0c;}
    .card{width:100%;max-width:420px;background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:20px;
      padding:1.8rem 1.6rem;box-shadow:0 20px 60px rgba(0,0,0,0.7);}
    .logo{display:flex;flex-direction:column;align-items:center;gap:0.3rem;margin-bottom:1.4rem;}
    .logo-mark{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#00c896,#0066ff);
      display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(0,200,150,0.35);}
    .logo-name{font-weight:800;font-size:1.25rem;letter-spacing:0.05em;
      background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;background-clip:text;}
    .logo-tag{font-size:0.58rem;color:#3a6a5a;letter-spacing:0.12em;text-transform:uppercase;}
    .tabs{display:flex;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.1);
      border-radius:10px;padding:0.2rem;gap:0.2rem;margin-bottom:1.2rem;}
    .tab{flex:1;padding:0.55rem;border-radius:8px;border:none;cursor:pointer;
      font-family:"Inter",sans-serif;font-weight:600;font-size:0.85rem;transition:all 0.2s;background:none;color:#3a6a5a;}
    .tab.on{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
    .field{display:flex;flex-direction:column;gap:0.28rem;margin-bottom:0.7rem;}
    .lbl{font-size:0.63rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
    .iw{position:relative;}
    .inp{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);
      border-radius:10px;padding:0.68rem 0.9rem;font-size:0.86rem;color:#e8f8f4;
      font-family:"Inter",sans-serif;outline:none;transition:all 0.2s;}
    .inp.pad{padding-right:2.6rem;}
    .inp:focus{border-color:rgba(0,200,150,0.4);box-shadow:0 0 0 3px rgba(0,200,150,0.08);}
    .eye{position:absolute;right:0;top:0;bottom:0;width:2.5rem;background:none;border:none;
      cursor:pointer;color:#3a6a5a;font-size:0.9rem;display:flex;align-items:center;justify-content:center;}
    .eye:hover{color:#00c896;}
    .err{background:rgba(255,71,87,0.08);border:1px solid rgba(255,71,87,0.2);border-radius:8px;
      padding:0.5rem 0.7rem;font-size:0.76rem;color:#ff4757;margin-bottom:0.75rem;}
    .rem{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;cursor:pointer;}
    .rem-box{width:18px;height:18px;border-radius:5px;border:1.5px solid rgba(0,200,150,0.3);
      background:rgba(0,200,150,0.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .rem-box.on{background:linear-gradient(135deg,#00a87a,#00c896);border-color:#00c896;}
    .btn{width:100%;padding:0.85rem;border:none;border-radius:11px;
      background:linear-gradient(135deg,#00a87a,#00c896);font-family:"Inter",sans-serif;
      font-weight:700;font-size:0.92rem;color:#050f0c;cursor:pointer;
      transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;}
    .btn:hover{transform:translateY(-1px);}
    .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
    .btn-wa{background:linear-gradient(135deg,#128c7e,#25d366);}
    .sw{font-size:0.74rem;color:#3a6a5a;text-align:center;margin-top:0.85rem;}
    .sw button{background:none;border:none;color:#00c896;font-weight:600;cursor:pointer;font-size:0.74rem;text-decoration:underline;}
    .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,0.2),transparent);margin:1rem 0;}
    .fee-box{background:rgba(0,200,150,0.04);border:1.5px solid rgba(0,200,150,0.2);border-radius:14px;padding:1.1rem;margin-bottom:0.85rem;}
    .fee-header{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;}
    .fee-badge{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;padding:0.25rem 0.7rem;border-radius:20px;font-size:0.72rem;font-weight:800;}
    .addr-box{background:rgba(0,0,0,0.35);border:1px solid rgba(0,200,150,0.1);border-radius:9px;padding:0.6rem 0.75rem;display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;}
    .addr-txt{flex:1;font-family:monospace;font-size:0.66rem;color:#3a8a6a;word-break:break-all;line-height:1.35;}
    .copy-btn{padding:0.26rem 0.6rem;border:1px solid rgba(0,200,150,0.2);border-radius:6px;
      background:rgba(0,200,150,0.08);color:#00c896;font-size:0.65rem;font-weight:700;cursor:pointer;
      white-space:nowrap;font-family:"Inter",sans-serif;transition:all 0.15s;}
    .copy-btn:hover{background:rgba(0,200,150,0.15);}
    .upload-box{border:2px dashed rgba(0,200,150,0.22);border-radius:11px;padding:0.85rem;
      text-align:center;cursor:pointer;transition:all 0.2s;margin-top:0.5rem;}
    .upload-box:hover{border-color:rgba(0,200,150,0.4);background:rgba(0,200,150,0.03);}
    .upload-box.has{border-style:solid;border-color:#00c896;background:rgba(0,200,150,0.04);}
    .fee-check{display:flex;align-items:center;gap:0.4rem;font-size:0.72rem;color:#5a8a7a;padding:0.25rem 0;}
    .otp-wrap{display:flex;gap:0.45rem;justify-content:center;margin:1rem 0;}
    .otp-b{width:42px;height:50px;border-radius:10px;background:rgba(0,200,150,0.04);
      border:1.5px solid rgba(0,200,150,0.15);text-align:center;font-size:1.25rem;font-weight:700;
      color:#00c896;outline:none;font-family:"Inter",sans-serif;transition:all 0.2s;}
    .otp-b:focus{border-color:#00c896;background:rgba(0,200,150,0.06);}
    @keyframes sp{to{transform:rotate(360deg)}}
    .spin{width:16px;height:16px;border:2px solid rgba(5,15,12,0.3);border-top-color:#050f0c;
      border-radius:50%;animation:sp 0.7s linear infinite;display:inline-block;}
    @media(max-width:400px){.card{padding:1.4rem 1.1rem;}.otp-b{width:36px;height:44px;font-size:1.1rem;}}
  `;

  // ── OTP STEP ──
  if (!loading && step==="otp") return (
    <>
      <style>{css}</style>
      <div className="pg">
        <div className="card">
          <div className="logo">
            <div className="logo-mark">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="logo-name">NEXORA</div>
          </div>
          <div style={{textAlign:"center",marginBottom:"1rem"}}>
            <div style={{fontSize:"1.8rem",marginBottom:"0.4rem"}}>📱</div>
            <div style={{fontWeight:700,fontSize:"0.95rem",color:"#00c896",marginBottom:"0.2rem"}}>Verify WhatsApp</div>
            <div style={{fontSize:"0.76rem",color:"#5a8a7a"}}>Last step! Verify your WhatsApp number</div>
          </div>
          {error&&<div className="err">⚠️ {error}</div>}
          {!otpCode&&(
            <>
              <div className="field">
                <label className="lbl">WhatsApp Number (with country code)</label>
                <input className="inp" type="tel" placeholder="e.g. 2348012345678" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendOTP()}/>
              </div>
              <div style={{fontSize:"0.72rem",color:"#5a8a7a",marginBottom:"0.85rem",lineHeight:1.5}}>
                Example: <b style={{color:"#e8f8f4"}}>2348012345678</b> for +234 (Nigeria)
              </div>
              <button className="btn btn-wa" onClick={sendOTP} disabled={!phone||loading}>Send Verification Code</button>
            </>
          )}
          {otpCode&&(
            <>
              <div style={{background:"rgba(0,200,150,0.06)",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"12px",padding:"0.85rem",textAlign:"center",marginBottom:"0.75rem"}}>
                <div style={{fontSize:"0.65rem",color:"#5a8a7a",marginBottom:"0.2rem"}}>Your Code</div>
                <div style={{fontSize:"2rem",fontWeight:800,color:"#00c896",letterSpacing:"0.3em"}}>{otpCode}</div>
                <div style={{fontSize:"0.65rem",color:"#3a6a5a",marginTop:"0.2rem"}}>Expires in 15 minutes</div>
              </div>
              {waUrl&&<div style={{textAlign:"center",marginBottom:"0.75rem"}}><a href={waUrl} target="_blank" rel="noreferrer" style={{fontSize:"0.76rem",color:"#25d366",fontWeight:700,textDecoration:"none"}}>📱 Open WhatsApp to view code</a></div>}
              <div style={{fontSize:"0.72rem",color:"#5a8a7a",textAlign:"center",marginBottom:"0.4rem"}}>Enter the 6-digit code</div>
              <div className="otp-wrap">
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>{otpRefs.current[i]=el;}} className="otp-b" type="text" inputMode="numeric" maxLength={1} value={d} onChange={e=>handleOTPInput(e.target.value,i)} onKeyDown={e=>handleOTPKey(e,i)}/>
                ))}
              </div>
              <button className="btn" onClick={verifyOTP} disabled={otp.join("").length<6||loading}>Verify & Complete</button>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.6rem",fontSize:"0.74rem"}}>
                <button onClick={()=>{setOtpCode("");setOtp(["","","","","",""]);}} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>← Change number</button>
                {timer>0?<span style={{color:"#3a6a5a"}}>Resend in {timer}s</span>:<button onClick={sendOTP} style={{background:"none",border:"none",color:"#00c896",cursor:"pointer",fontWeight:600,fontFamily:"Inter,sans-serif"}}>Resend code</button>}
              </div>
            </>
          )}
          <button onClick={()=>setStep("pending")} style={{width:"100%",marginTop:"0.65rem",padding:"0.6rem",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"10px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.76rem",fontFamily:"Inter,sans-serif"}}>
            Skip verification →
          </button>
        </div>
      </div>
    </>
  );

  // ── PENDING STEP ──
  if (!loading && step==="pending") return (
    <>
      <style>{css}</style>
      <div className="pg">
        <div className="card">
          <div className="logo">
            <div className="logo-mark"><svg width="26" height="26" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="logo-name">NEXORA</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>⏳</div>
            <div style={{fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.5rem"}}>Registration Under Review!</div>
            <div style={{fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.65,marginBottom:"1.2rem"}}>
              Your registration and <b style={{color:"#e8f8f4"}}>${REG_FEE} USDT payment</b> is being reviewed. Your account will be activated within <b style={{color:"#e8f8f4"}}>24-48 hours</b>.
            </div>
            <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"12px",padding:"1rem",textAlign:"left",marginBottom:"1.2rem"}}>
              <div style={{fontWeight:600,fontSize:"0.72rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.6rem"}}>What Happens Next</div>
              {["Admin reviews your $4 USDT payment screenshot","Account activated within 24-48 hours","You receive a notification when approved","Dashboard unlocks — start your savings journey! 🚀"].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"0.55rem",padding:"0.32rem 0",fontSize:"0.78rem",color:"#5a8a7a"}}>
                  <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:700,color:"#00c896",flexShrink:0}}>{i+1}</div>
                  {s}
                </div>
              ))}
            </div>
            <button onClick={()=>{
              Object.keys(localStorage).filter(k=>k.includes("nexora")||k.includes("finova")).forEach(k=>localStorage.removeItem(k));
              window.location.replace("/login");
            }} style={{width:"100%",padding:"0.75rem",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"11px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"Inter,sans-serif"}}>
              Sign out — come back after approval
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── LOADING ──
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="pg">
        <div className="card" style={{textAlign:"center",padding:"3rem 1.5rem"}}>
          <div style={{width:"44px",height:"44px",border:"3px solid rgba(0,200,150,0.15)",borderTop:"3px solid #00c896",borderRadius:"50%",animation:"sp 0.8s linear infinite",margin:"0 auto 1rem"}}/>
          <div style={{fontWeight:600,color:"#00c896",fontSize:"0.9rem"}}>
            {tab==="signup"?"Creating your account...":"Signing you in..."}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      {showContract&&pendingUser&&(
        <ContractModal userName={pendingUser.name} onAccept={handleContractAccept} onDecline={()=>{setShowContract(false);setPendingUser(null);}}/>
      )}
      <div className="pg">
        <div className="card">
          {/* LOGO */}
          <div className="logo">
            <div className="logo-mark">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="logo-name">NEXORA</div>
            <div className="logo-tag">Smart Finance. Borderless Future.</div>
          </div>

          {/* TABS */}
          <div className="tabs">
            <button className={"tab"+(tab==="signup"?" on":"")} onClick={()=>{setTab("signup");setError("");}}>Create Account</button>
            <button className={"tab"+(tab==="signin"?" on":"")} onClick={()=>{setTab("signin");setError("");}}>Sign In</button>
          </div>

          {error&&<div className="err">⚠️ {error}</div>}

          {/* ── SIGNUP ── */}
          {tab==="signup"&&(
            <>
              {/* STEP INDICATORS */}
              <div style={{display:"flex",alignItems:"center",gap:"0",marginBottom:"1.1rem"}}>
                {[{n:"1",l:"Details"},{n:"2",l:"Pay $4"},{n:"3",l:"Verify"},{n:"4",l:"Active"}].map((s,i,arr)=>(
                  <div key={s.n} style={{display:"flex",alignItems:"center",flex:1}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                      <div style={{width:"26px",height:"26px",borderRadius:"50%",background:i===0?"linear-gradient(135deg,#00a87a,#00c896)":i===1?"linear-gradient(135deg,#00a87a,#00c896)":"rgba(0,200,150,0.1)",color:i<=1?"#050f0c":"#5a8a7a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.72rem",fontWeight:800,border:i<=1?"none":"1px solid rgba(0,200,150,0.2)"}}>
                        {s.n}
                      </div>
                      <div style={{fontSize:"0.56rem",color:i<=1?"#00c896":"#3a6a5a",marginTop:"0.2rem",fontWeight:600}}>{s.l}</div>
                    </div>
                    {i<arr.length-1&&<div style={{height:"2px",flex:1,background:i<1?"#00c896":"rgba(0,200,150,0.12)",marginBottom:"1rem"}}/>}
                  </div>
                ))}
              </div>

              {/* PERSONAL DETAILS */}
              <div style={{fontWeight:700,fontSize:"0.82rem",color:"#e8f8f4",marginBottom:"0.65rem"}}>① Personal Details</div>

              <div className="field">
                <label className="lbl">Full Name</label>
                <input className="inp" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
              <div className="field">
                <label className="lbl">Email Address</label>
                <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div className="field">
                <label className="lbl">Password</label>
                <div className="iw">
                  <input className="inp pad" type={showPass?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPass(e.target.value)}/>
                  <button className="eye" type="button" onClick={()=>setShowPass(p=>!p)}>{showPass?"🙈":"👁"}</button>
                </div>
              </div>
              <div className="field">
                <label className="lbl">Referral Code (optional)</label>
                <input className="inp" placeholder="e.g. NXRABC12" value={refCode} onChange={e=>setRefCode(e.target.value.toUpperCase())}/>
              </div>

              {/* DIVIDER */}
              <div className="divider"/>

              {/* REGISTRATION FEE SECTION */}
              <div className="fee-box">
                <div className="fee-header">
                  <span style={{fontSize:"1.3rem"}}>💳</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.9rem",color:"#e8f8f4",marginBottom:"0.1rem"}}>
                      ② Pay Registration Fee
                    </div>
                    <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>Required to complete your registration</div>
                  </div>
                  <div className="fee-badge">${REG_FEE} USDT</div>
                </div>

                <div style={{background:"rgba(255,165,0,0.06)",border:"1px solid rgba(255,165,0,0.15)",borderRadius:"9px",padding:"0.65rem",marginBottom:"0.75rem",fontSize:"0.73rem",color:"#a08030",lineHeight:1.55}}>
                  ⚠️ Send <b>exactly ${REG_FEE} USDT</b> to one of the wallet addresses below, then upload your payment screenshot to continue registration.
                </div>

                {/* WALLET ADDRESSES */}
                {wallets.length>0?(
                  <div style={{marginBottom:"0.65rem"}}>
                    <label className="lbl" style={{marginBottom:"0.4rem"}}>Send ${REG_FEE} USDT to:</label>
                    {wallets.slice(0,3).map((w:any,i:number)=>(
                      <div key={i}>
                        <div style={{fontSize:"0.65rem",color:"#5a8a7a",marginBottom:"0.2rem",fontWeight:600}}>
                          {w.coin||"USDT"} — {w.network}
                        </div>
                        <div className="addr-box">
                          <div className="addr-txt">{w.address}</div>
                          <button className="copy-btn" onClick={()=>copyAddr(w.address,String(i))}>
                            {copied===String(i)?"✓ Copied":"Copy"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{background:"rgba(0,200,150,0.04)",border:"1px dashed rgba(0,200,150,0.2)",borderRadius:"9px",padding:"0.7rem",marginBottom:"0.65rem",fontSize:"0.76rem",color:"#5a8a7a",textAlign:"center"}}>
                    📋 Contact support to get deposit wallet address<br/>
                    <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{color:"#25d366",fontWeight:700,textDecoration:"none"}}>WhatsApp Support</a>
                  </div>
                )}

                {/* CHECKLIST */}
                <div style={{marginBottom:"0.65rem"}}>
                  {[
                    {done:!!(name&&email&&password), label:"Personal details filled in"},
                    {done:!!screenshot,              label:"Payment screenshot uploaded"},
                  ].map((item,i)=>(
                    <div key={i} className="fee-check">
                      <span style={{fontSize:"0.9rem"}}>{item.done?"✅":"⬜"}</span>
                      <span style={{color:item.done?"#00c896":"#5a8a7a",fontWeight:item.done?600:400}}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* SCREENSHOT UPLOAD */}
                <label className="lbl">Upload Payment Screenshot *</label>
                <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleFile}/>
                <div className={"upload-box"+(screenshot?" has":"")} onClick={()=>fileRef.current?.click()}>
                  {screenshot?(
                    <>
                      <img src={screenshot} style={{maxHeight:"100px",borderRadius:"7px",objectFit:"contain",marginBottom:"0.3rem"}} alt="proof"/>
                      <div style={{fontSize:"0.72rem",color:"#00c896",fontWeight:600}}>✓ Screenshot uploaded — tap to change</div>
                    </>
                  ):(
                    <>
                      <div style={{fontSize:"1.6rem",marginBottom:"0.3rem"}}>📸</div>
                      <div style={{fontWeight:600,fontSize:"0.82rem",color:"#e8f8f4",marginBottom:"0.15rem"}}>Upload Payment Proof</div>
                      <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>Take a screenshot of your transfer confirmation</div>
                    </>
                  )}
                </div>

                {/* OPTIONAL TX HASH */}
                {screenshot&&(
                  <div style={{marginTop:"0.5rem"}}>
                    <label className="lbl">Transaction Hash (optional)</label>
                    <input className="inp" placeholder="Blockchain TX hash for faster verification" value={txHash} onChange={e=>setTxHash(e.target.value)} style={{marginTop:"0.25rem"}}/>
                  </div>
                )}
              </div>

              {/* REMEMBER */}
              <div className="rem" onClick={()=>setRemember(r=>!r)}>
                <div className={"rem-box"+(remember?" on":"")}>{remember&&<span style={{color:"#050f0c",fontSize:"0.65rem",fontWeight:800}}>✓</span>}</div>
                <span style={{fontSize:"0.76rem",color:"#5a8a7a"}}>Remember me on this device</span>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                className="btn"
                onClick={handleSignup}
                disabled={!name||!email||!password||!screenshot||loading}
                style={{opacity:(!name||!email||!password||!screenshot)?0.6:1}}
              >
                {!screenshot
                  ?"Upload payment screenshot to continue →"
                  :"Complete Registration →"
                }
              </button>

              {!screenshot&&(
                <div style={{textAlign:"center",marginTop:"0.5rem",fontSize:"0.72rem",color:"#5a8a7a"}}>
                  📤 Upload your $4 USDT payment screenshot above to enable this button
                </div>
              )}

              <div className="sw">Already have an account? <button onClick={()=>{setTab("signin");setError("");}}>Sign In</button></div>
            </>
          )}

          {/* ── SIGNIN ── */}
          {tab==="signin"&&(
            <>
              <div style={{textAlign:"center",marginBottom:"1rem"}}>
                <div style={{fontWeight:700,fontSize:"0.95rem",color:"#00c896",marginBottom:"0.15rem"}}>Welcome Back</div>
                <div style={{fontSize:"0.74rem",color:"#3a6a5a"}}>Sign in to your NEXORA account</div>
              </div>
              <div className="field">
                <label className="lbl">Email</label>
                <input className="inp" type="email" placeholder="you@example.com" value={semail} onChange={e=>setSemail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignin()}/>
              </div>
              <div className="field">
                <label className="lbl">Password</label>
                <div className="iw">
                  <input className="inp pad" type={showSPass?"text":"password"} placeholder="Your password" value={spassword} onChange={e=>setSpass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignin()}/>
                  <button className="eye" type="button" onClick={()=>setShowSPass(p=>!p)}>{showSPass?"🙈":"👁"}</button>
                </div>
              </div>
              <div className="rem" onClick={()=>setRemember(r=>!r)}>
                <div className={"rem-box"+(remember?" on":"")}>{remember&&<span style={{color:"#050f0c",fontSize:"0.65rem",fontWeight:800}}>✓</span>}</div>
                <span style={{fontSize:"0.76rem",color:"#5a8a7a"}}>Remember me on this device</span>
              </div>
              <button className="btn" onClick={handleSignin} disabled={!semail||!spassword}>Sign In to NEXORA</button>
              <div className="sw">New to NEXORA? <button onClick={()=>{setTab("signup");setError("");}}>Create Account</button></div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
