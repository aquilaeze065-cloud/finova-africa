"use client";
import { useState, useEffect, useRef } from "react";
import ContractModal from "../components/ContractModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type Step = "form"|"phone"|"otp";

export default function LoginPage() {
  const [tab,       setTab]      = useState("signup");
  const [name,      setName]     = useState("");
  const [email,     setEmail]    = useState("");
  const [password,  setPass]     = useState("");
  const [phone,     setPhone]    = useState("");
  const [refCode,   setRefCode]  = useState("");
  const [showPass,  setShowPass] = useState(false);
  const [remember,  setRemember] = useState(true);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState("");
  const [step,      setStep]     = useState<Step>("form");
  const [otp,       setOtp]      = useState(["","","","","",""]);
  const [otpCode,   setOtpCode]  = useState("");
  const [waUrl,     setWaUrl]    = useState("");
  const [timer,     setTimer]    = useState(0);
  const [signedUser,setSignedUser] = useState<any>(null);
  const [pendingUser,setPendingUser] = useState<any>(null);
  const [showContract,setShowContract] = useState(false);
  const otpRefs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(()=>{
    try {
      const rem = localStorage.getItem("nexora_remember");
      if (rem) { const {e,p}=JSON.parse(rem); setEmail(e||""); setPass(p||""); setTab("signin"); }
    } catch {}
  },[]);

  function startTimer() {
    setTimer(60);
    const t = setInterval(()=>setTimer(s=>{ if(s<=1){clearInterval(t);return 0;} return s-1; }),1000);
  }

  function handleSignup() {
    if (!name||!email||!password) { setError("Please fill all fields"); return; }
    if (password.length<8) { setError("Password must be at least 8 characters"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    setError("");
    setPendingUser({name,email,password,refCode});
    setShowContract(true);
  }

  async function handleContractAccept(signature:string) {
    setShowContract(false);
    setLoading(true);
    try {
      const body:any = {name:pendingUser.name,email:pendingUser.email,password:pendingUser.password};
      if (pendingUser.refCode) body.referredBy = pendingUser.refCode;
      const res  = await fetch(`${API}/api/auth/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Signup failed"); setLoading(false); return; }
      setSignedUser(data);
      setLoading(false);
      setStep("phone");
    } catch { setError("Connection error. Try again."); setLoading(false); }
  }

  async function sendOTP() {
    const clean = phone.replace(/\D/g,"");
    if (clean.length<7) { setError("Enter a valid WhatsApp number with country code"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/otp/send`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:clean,name:pendingUser?.name||name||"User"})});
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error||"Failed to send OTP"); return; }
      setOtpCode(data.code||"");
      setWaUrl(data.waUrl||"");
      setStep("otp");
      startTimer();
      if (data.waUrl) window.open(data.waUrl,"_blank");
      if (data.code) setOtp(data.code.split(""));
    } catch { setError("Connection error. Try again."); setLoading(false); }
  }

  async function verifyOTP() {
    const code = otp.join("");
    if (code.length<6) { setError("Enter the complete 6-digit code"); return; }
    setLoading(true); setError("");
    const clean = phone.replace(/\D/g,"");
    try {
      const res  = await fetch(`${API}/api/otp/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:clean,code})});
      const data = await res.json();
      setLoading(false);
      if (!res.ok||!data.verified) { setError(data.error||"Wrong code. Try again."); return; }
      if (signedUser) {
        const userData = {...signedUser.user,balances:{btc:0,eth:0,usdt:0,bnb:0,ngn:0},account_status:"active",reg_fee_paid:true,phone:clean};
        localStorage.setItem("nexora_token",    signedUser.token);
        localStorage.setItem("nexora_user",     JSON.stringify(userData));
        localStorage.setItem("nexora_loggedin", "true");
        localStorage.setItem("nexora_visited",  "true");
        localStorage.setItem("finova_token",    signedUser.token);
        localStorage.setItem("finova_user",     JSON.stringify(userData));
        localStorage.setItem("finova_loggedin", "true");
        if (remember) localStorage.setItem("nexora_remember",JSON.stringify({e:pendingUser.email,p:pendingUser.password}));
      }
      window.location.replace("/dashboard");
    } catch { setError("Connection error. Try again."); setLoading(false); }
  }

  function handleOTPInput(val:string,idx:number) {
    const d=val.replace(/\D/g,"").slice(-1);
    const next=[...otp]; next[idx]=d; setOtp(next);
    if(d&&idx<5) otpRefs.current[idx+1]?.focus();
  }

  function handleOTPKey(e:any,idx:number) {
    if(e.key==="Backspace"&&!otp[idx]&&idx>0) otpRefs.current[idx-1]?.focus();
  }

  async function handleSignin() {
    if (!email||!password) { setError("Please fill all fields"); return; }
    setError(""); setLoading(true);
    try {
      const controller=new AbortController();
      setTimeout(()=>controller.abort(),8000);
      const res  = await fetch(`${API}/api/auth/signin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password}),signal:controller.signal});
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Login failed. Check your email and password."); setLoading(false); return; }
      const userData={...data.user,balances:{btc:0,eth:0,usdt:0,bnb:0,ngn:0},account_status:"active",reg_fee_paid:true};
      localStorage.setItem("nexora_token",    data.token);
      localStorage.setItem("nexora_user",     JSON.stringify(userData));
      localStorage.setItem("nexora_loggedin", "true");
      localStorage.setItem("nexora_visited",  "true");
      localStorage.setItem("finova_token",    data.token);
      localStorage.setItem("finova_user",     JSON.stringify(userData));
      localStorage.setItem("finova_loggedin", "true");
      if (remember) localStorage.setItem("nexora_remember",JSON.stringify({e:email,p:password}));
      else localStorage.removeItem("nexora_remember");
      setLoading(false);
      window.location.replace("/dashboard");
    } catch(err:any) {
      try {
        const stored=localStorage.getItem("nexora_user")||localStorage.getItem("finova_user");
        if(stored){const u=JSON.parse(stored);if(u.email===email){localStorage.setItem("nexora_loggedin","true");localStorage.setItem("finova_loggedin","true");setLoading(false);window.location.replace("/dashboard");return;}}
      } catch {}
      setError(err?.name==="AbortError"?"Server timeout. Try again.":"Cannot reach server. Check your internet.");
      setLoading(false);
    }
  }

  const css=`
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
    body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;min-height:100vh;}
    .pg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(0,200,150,0.1),transparent 60%),#050f0c;}
    .card{width:100%;max-width:400px;background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:1.8rem 1.6rem;box-shadow:0 20px 60px rgba(0,0,0,0.7);}
    .logo{display:flex;flex-direction:column;align-items:center;gap:0.3rem;margin-bottom:1.5rem;}
    .logo-mark{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(0,200,150,0.35);}
    .logo-name{font-weight:800;font-size:1.3rem;letter-spacing:0.05em;background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .logo-tag{font-size:0.6rem;color:#3a6a5a;letter-spacing:0.12em;text-transform:uppercase;}
    .tabs{display:flex;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:0.2rem;gap:0.2rem;margin-bottom:1.2rem;}
    .tab{flex:1;padding:0.55rem;border-radius:8px;border:none;cursor:pointer;font-family:"Inter",sans-serif;font-weight:600;font-size:0.85rem;transition:all 0.2s;background:none;color:#3a6a5a;}
    .tab.on{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
    .field{display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.75rem;}
    .lbl{font-size:0.65rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
    .iw{position:relative;}
    .inp{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:0.72rem 0.9rem;font-size:0.88rem;color:#e8f8f4;font-family:"Inter",sans-serif;outline:none;transition:all 0.2s;}
    .inp.pad{padding-right:2.6rem;}
    .inp:focus{border-color:rgba(0,200,150,0.4);box-shadow:0 0 0 3px rgba(0,200,150,0.08);}
    .eye{position:absolute;right:0;top:0;bottom:0;width:2.5rem;background:none;border:none;cursor:pointer;color:#3a6a5a;font-size:0.9rem;display:flex;align-items:center;justify-content:center;}
    .eye:hover{color:#00c896;}
    .err{background:rgba(255,71,87,0.08);border:1px solid rgba(255,71,87,0.2);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.76rem;color:#ff4757;margin-bottom:0.75rem;}
    .rem{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.85rem;cursor:pointer;}
    .rem-box{width:18px;height:18px;border-radius:5px;border:1.5px solid rgba(0,200,150,0.3);background:rgba(0,200,150,0.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .rem-box.on{background:linear-gradient(135deg,#00a87a,#00c896);border-color:#00c896;}
    .notice{background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.1);border-radius:9px;padding:0.6rem 0.8rem;font-size:0.72rem;color:#5a8a7a;margin-bottom:0.85rem;line-height:1.5;}
    .notice b{color:#00c896;}
    .btn{width:100%;padding:0.85rem;border:none;border-radius:11px;background:linear-gradient(135deg,#00a87a,#00c896);font-family:"Inter",sans-serif;font-weight:700;font-size:0.92rem;color:#050f0c;cursor:pointer;box-shadow:0 0 20px rgba(0,200,150,0.2);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;}
    .btn:hover{transform:translateY(-1px);}
    .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
    .btn-wa{background:linear-gradient(135deg,#128c7e,#25d366);box-shadow:0 0 20px rgba(37,211,102,0.25);}
    .sw{font-size:0.74rem;color:#3a6a5a;text-align:center;margin-top:0.85rem;}
    .sw button{background:none;border:none;color:#00c896;font-weight:600;cursor:pointer;font-size:0.74rem;text-decoration:underline;}
    .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0.35rem;margin-bottom:1rem;}
    .st{text-align:center;padding:0.5rem 0.2rem;border:1px solid rgba(0,200,150,0.1);border-radius:8px;background:rgba(0,200,150,0.03);}
    .st-n{font-weight:700;font-size:0.78rem;color:#00c896;}
    .st-l{font-size:0.58rem;color:#3a6a5a;margin-top:0.1rem;}
    .otp-wrap{display:flex;gap:0.5rem;justify-content:center;margin:1.2rem 0;}
    .otp-box{width:44px;height:52px;border-radius:10px;background:rgba(0,200,150,0.04);border:1.5px solid rgba(0,200,150,0.15);text-align:center;font-size:1.3rem;font-weight:700;color:#00c896;outline:none;font-family:"Inter",sans-serif;transition:all 0.2s;caret-color:#00c896;}
    .otp-box:focus{border-color:#00c896;box-shadow:0 0 0 3px rgba(0,200,150,0.12);background:rgba(0,200,150,0.06);}
    .code-box{background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.2);border-radius:14px;padding:0.9rem;text-align:center;margin-bottom:1rem;}
    .code-num{font-size:2rem;font-weight:800;letter-spacing:0.3em;color:#00c896;font-family:"Inter",sans-serif;}
    @keyframes sp{to{transform:rotate(360deg)}}
    @media(max-width:400px){.card{padding:1.4rem 1.1rem;}.otp-box{width:38px;height:46px;font-size:1.1rem;}}
  `;

  return (
    <>
      <style>{css}</style>
      {showContract&&pendingUser&&(
        <ContractModal userName={pendingUser.name} onAccept={handleContractAccept} onDecline={()=>{setShowContract(false);setPendingUser(null);}}/>
      )}
      <div className="pg">
        <div className="card">
          <div className="logo">
            <div className="logo-mark">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-name">NEXORA</div>
            <div className="logo-tag">Smart Finance. Borderless Future.</div>
          </div>

          {loading&&(
            <div style={{textAlign:"center",padding:"2rem"}}>
              <div style={{width:"40px",height:"40px",border:"3px solid rgba(0,200,150,0.15)",borderTop:"3px solid #00c896",borderRadius:"50%",animation:"sp 0.8s linear infinite",margin:"0 auto 1rem"}}/>
              <div style={{fontWeight:600,color:"#00c896",fontSize:"0.9rem"}}>Please wait...</div>
            </div>
          )}

          {!loading&&step==="phone"&&(
            <>
              <div style={{textAlign:"center",marginBottom:"1.2rem"}}>
                <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📱</div>
                <div style={{fontWeight:700,fontSize:"0.95rem",color:"#00c896",marginBottom:"0.2rem"}}>Verify via WhatsApp</div>
                <div style={{fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.5}}>Enter your WhatsApp number to receive a verification code.</div>
              </div>
              {error&&<div className="err">⚠️ {error}</div>}
              <div className="field">
                <label className="lbl">WhatsApp Number (with country code)</label>
                <input className="inp" type="tel" placeholder="e.g. 2348012345678" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendOTP()}/>
              </div>
              <div className="notice">Format: <b>country code + number</b> — Example: <b>2348012345678</b></div>
              <button className="btn btn-wa" onClick={sendOTP} disabled={!phone||loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#050f0c"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Send Code via WhatsApp
              </button>
              <button onClick={()=>window.location.replace("/dashboard")} style={{width:"100%",marginTop:"0.6rem",padding:"0.65rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"Inter,sans-serif"}}>
                Skip for now
              </button>
            </>
          )}

          {!loading&&step==="otp"&&(
            <>
              <div style={{textAlign:"center",marginBottom:"0.9rem"}}>
                <div style={{fontSize:"2rem",marginBottom:"0.4rem"}}>✅</div>
                <div style={{fontWeight:700,fontSize:"0.92rem",color:"#00c896",marginBottom:"0.2rem"}}>Code Sent!</div>
                <div style={{fontSize:"0.74rem",color:"#5a8a7a"}}>Check WhatsApp on <b style={{color:"#25d366"}}>+{phone}</b></div>
              </div>
              {error&&<div className="err">⚠️ {error}</div>}
              {otpCode&&(
                <div className="code-box">
                  <div style={{fontSize:"0.68rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.35rem"}}>Your Code</div>
                  <div className="code-num">{otpCode}</div>
                  <div style={{fontSize:"0.65rem",color:"#3a6a5a",marginTop:"0.3rem"}}>Expires in 15 minutes</div>
                </div>
              )}
              {waUrl&&(
                <div style={{background:"rgba(37,211,102,0.06)",border:"1px solid rgba(37,211,102,0.18)",borderRadius:"10px",padding:"0.7rem",marginBottom:"0.85rem",textAlign:"center"}}>
                  <a href={waUrl} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",color:"#25d366",fontSize:"0.76rem",fontWeight:700,textDecoration:"none"}}>
                    Open WhatsApp to view code
                  </a>
                </div>
              )}
              <div style={{fontSize:"0.72rem",color:"#5a8a7a",textAlign:"center",marginBottom:"0.5rem"}}>Enter the 6-digit code</div>
              <div className="otp-wrap">
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>{otpRefs.current[i]=el;}} className="otp-box" type="text" inputMode="numeric" maxLength={1} value={d} onChange={e=>handleOTPInput(e.target.value,i)} onKeyDown={e=>handleOTPKey(e,i)}/>
                ))}
              </div>
              <button className="btn" onClick={verifyOTP} disabled={otp.join("").length<6||loading}>Verify & Continue</button>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.75rem",fontSize:"0.74rem"}}>
                <button onClick={()=>setStep("phone")} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.74rem",fontFamily:"Inter,sans-serif"}}>Change number</button>
                {timer>0?<span style={{color:"#3a6a5a"}}>Resend in {timer}s</span>:<button onClick={sendOTP} style={{background:"none",border:"none",color:"#00c896",cursor:"pointer",fontWeight:600,fontSize:"0.74rem",fontFamily:"Inter,sans-serif"}}>Resend code</button>}
              </div>
              <button onClick={()=>window.location.replace("/dashboard")} style={{width:"100%",marginTop:"0.6rem",padding:"0.6rem",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"10px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.76rem",fontFamily:"Inter,sans-serif"}}>
                Skip verification
              </button>
            </>
          )}

          {!loading&&step==="form"&&(
            <>
              <div className="tabs">
                <button className={"tab"+(tab==="signup"?" on":"")} onClick={()=>{setTab("signup");setError("");}}>Create Account</button>
                <button className={"tab"+(tab==="signin"?" on":"")} onClick={()=>{setTab("signin");setError("");}}>Sign In</button>
              </div>
              {error&&<div className="err">⚠️ {error}</div>}

              {tab==="signup"&&(
                <>
                  <div className="steps">
                    <div className="st"><div className="st-n">1</div><div className="st-l">Register</div></div>
                    <div className="st"><div className="st-n">2</div><div className="st-l">WhatsApp OTP</div></div>
                    <div className="st"><div className="st-n">3</div><div className="st-l">Start Saving</div></div>
                  </div>
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
                  <div className="rem" onClick={()=>setRemember(r=>!r)}>
                    <div className={"rem-box"+(remember?" on":"")}>{remember&&<span style={{color:"#050f0c",fontSize:"0.65rem",fontWeight:800}}>✓</span>}</div>
                    <span style={{fontSize:"0.76rem",color:"#5a8a7a"}}>Remember me on this device</span>
                  </div>
                  <div className="notice">
                    After signup you will verify via <b>WhatsApp OTP</b>.
                    {refCode&&<span> Referral code <b>{refCode}</b> will be applied.</span>}
                  </div>
                  <button className="btn" onClick={handleSignup} disabled={!name||!email||!password}>Create Account</button>
                  <div className="sw">Already have an account? <button onClick={()=>{setTab("signin");setError("");}}>Sign In</button></div>
                </>
              )}

              {tab==="signin"&&(
                <>
                  <div style={{textAlign:"center",marginBottom:"1rem"}}>
                    <div style={{fontWeight:700,fontSize:"0.95rem",color:"#00c896",marginBottom:"0.15rem"}}>Welcome Back</div>
                    <div style={{fontSize:"0.74rem",color:"#3a6a5a"}}>Sign in to your NEXORA account</div>
                  </div>
                  <div className="field">
                    <label className="lbl">Email</label>
                    <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignin()}/>
                  </div>
                  <div className="field">
                    <label className="lbl">Password</label>
                    <div className="iw">
                      <input className="inp pad" type={showPass?"text":"password"} placeholder="Your password" value={password} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignin()}/>
                      <button className="eye" type="button" onClick={()=>setShowPass(p=>!p)}>{showPass?"🙈":"👁"}</button>
                    </div>
                  </div>
                  <div className="rem" onClick={()=>setRemember(r=>!r)}>
                    <div className={"rem-box"+(remember?" on":"")}>{remember&&<span style={{color:"#050f0c",fontSize:"0.65rem",fontWeight:800}}>✓</span>}</div>
                    <span style={{fontSize:"0.76rem",color:"#5a8a7a"}}>Remember me on this device</span>
                  </div>
                  <button className="btn" onClick={handleSignin} disabled={!email||!password}>Sign In to NEXORA</button>
                  <div className="sw">New to NEXORA? <button onClick={()=>{setTab("signup");setError("");}}>Create Account</button></div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
