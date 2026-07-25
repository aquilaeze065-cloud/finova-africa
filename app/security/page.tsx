"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SecurityPage() {
  const router = useRouter();
  const [twoFA,       setTwoFA]       = useState(false);
  const [step,        setStep]        = useState<"idle"|"phone"|"verify"|"backup">("idle");
  const [phone,       setPhone]       = useState("");
  const [otp,         setOtp]         = useState(["","","","","",""]);
  const [otpCode,     setOtpCode]     = useState("");
  const [waUrl,       setWaUrl]       = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState("");
  const [loginHist,   setLoginHist]   = useState<any[]>([]);
  const otpRefs = useRef<(HTMLInputElement|null)[]>([]);

  const getToken = ()=>localStorage.getItem("nexora_token")||localStorage.getItem("finova_token")||"";

  useEffect(()=>{
    const token = getToken();
    if(!token){ window.location.replace("/login"); return; }
    fetch(`${API}/api/2fa/status`,{headers:{"Authorization":`Bearer ${token}`}})
      .then(r=>r.json()).then(d=>{ if(d.enabled) setTwoFA(true); }).catch(()=>{});
    fetch(`${API}/api/login-history`,{headers:{"Authorization":`Bearer ${token}`}})
      .then(r=>r.json()).then(d=>{ if(d.history) setLoginHist(d.history.slice(0,5)); }).catch(()=>{});
  },[]);

  function showMsg(m:string){ setToast(m); setTimeout(()=>setToast(""),3500); }

  async function sendOTP(){
    const clean=phone.replace(/\D/g,"");
    if(clean.length<7){setError("Enter valid WhatsApp number with country code");return;}
    setLoading(true);setError("");
    try{
      const res=await fetch(`${API}/api/2fa/setup/send`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},body:JSON.stringify({phone:clean})});
      const data=await res.json();
      setLoading(false);
      if(!res.ok){setError(data.error);return;}
      setOtpCode(data.code||"");setWaUrl(data.waUrl||"");
      if(data.code) setOtp(data.code.split(""));
      setStep("verify");
      if(data.waUrl) window.open(data.waUrl,"_blank");
    }catch{setError("Connection error");setLoading(false);}
  }

  async function verifyOTP(){
    const code=otp.join("");
    if(code.length<6){setError("Enter the 6-digit code");return;}
    setLoading(true);setError("");
    try{
      const res=await fetch(`${API}/api/2fa/setup/verify`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},body:JSON.stringify({code})});
      const data=await res.json();
      setLoading(false);
      if(!res.ok){setError(data.error);return;}
      setTwoFA(true);setBackupCodes(data.backupCodes||[]);setStep("backup");
    }catch{setError("Connection error");setLoading(false);}
  }

  async function disable2FA(){
    if(!confirm("Disable 2FA? This reduces your account security."))return;
    try{
      await fetch(`${API}/api/2fa/disable`,{method:"POST",headers:{"Authorization":`Bearer ${getToken()}`}});
      setTwoFA(false);setStep("idle");showMsg("2FA disabled");
    }catch{showMsg("Error disabling 2FA");}
  }

  function handleOTPInput(val:string,idx:number){
    const d=val.replace(/\D/g,"").slice(-1);
    const next=[...otp];next[idx]=d;setOtp(next);
    if(d&&idx<5) otpRefs.current[idx+1]?.focus();
  }
  function handleOTPKey(e:any,idx:number){
    if(e.key==="Backspace"&&!otp[idx]&&idx>0) otpRefs.current[idx-1]?.focus();
  }

  const G="#00c896";
  const inp:React.CSSProperties={width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.72rem 0.9rem",fontSize:"0.88rem",color:"#e8f8f4",fontFamily:"Inter,sans-serif",outline:"none"};
  const btn=(extra:string=""):React.CSSProperties=>({width:"100%",padding:"0.82rem",borderRadius:"11px",border:extra==="outline"?"1px solid rgba(0,200,150,0.2)":"none",background:extra==="outline"?"none":`linear-gradient(135deg,#00a87a,${G})`,fontWeight:700,fontSize:"0.88rem",color:extra==="outline"?"#5a8a7a":"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif",marginBottom:"0.5rem"} as React.CSSProperties);

  return (
    <MobileLayout activePage="Settings">
      <style>{`
        .sec-card{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:16px;padding:1.1rem;margin-bottom:0.85rem;}
        .otp-row{display:flex;gap:0.45rem;justify-content:center;margin:1rem 0;}
        .otp-b{width:42px;height:50px;border-radius:10px;background:rgba(0,200,150,0.04);border:1.5px solid rgba(0,200,150,0.15);text-align:center;font-size:1.25rem;font-weight:700;color:#00c896;outline:none;font-family:Inter,sans-serif;}
        .otp-b:focus{border-color:#00c896;background:rgba(0,200,150,0.06);}
        .backup-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin:0.75rem 0;}
        .backup-code{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:8px;padding:0.55rem;text-align:center;font-family:monospace;font-size:0.82rem;font-weight:700;color:#00c896;}
        .toggle{width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;transition:all 0.25s;border:none;flex-shrink:0;}
        .toggle.on{background:linear-gradient(135deg,#00a87a,#00c896);}
        .toggle.off{background:rgba(255,255,255,0.1);}
        .toggle-dot{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:white;transition:all 0.25s;}
        .toggle.on .toggle-dot{left:22px;}
        .toggle.off .toggle-dot{left:2px;}
        .err{background:rgba(255,71,87,0.08);border:1px solid rgba(255,71,87,0.2);border-radius:8px;padding:0.45rem 0.7rem;font-size:0.74rem;color:#ff4757;margin-bottom:0.75rem;}
        .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.6rem 1.2rem;font-weight:700;font-size:0.82rem;z-index:999;color:#00c896;white-space:nowrap;}
        .sec-row{display:flex;align-items:center;gap:0.6rem;padding:0.6rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .sec-row:last-child{border-bottom:none;}
        @media(max-width:380px){.otp-b{width:36px;height:44px;font-size:1.1rem;}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <div style={{marginBottom:"1.2rem"}}>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:G,marginBottom:"0.15rem"}}>🔐 Security Settings</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Protect your NEXORA account</div>
      </div>

      {/* 2FA */}
      <div className="sec-card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"10px",background:"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>🔐</div>
            <div>
              <div style={{fontWeight:700,fontSize:"0.9rem"}}>Two-Factor Authentication</div>
              <div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>Extra login security via WhatsApp</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <span style={{fontSize:"0.68rem",fontWeight:700,color:twoFA?G:"#5a8a7a"}}>{twoFA?"ON":"OFF"}</span>
            <button className={`toggle ${twoFA?"on":"off"}`} onClick={()=>twoFA?disable2FA():setStep("phone")}>
              <div className="toggle-dot"/>
            </button>
          </div>
        </div>

        {twoFA&&step==="idle"&&(
          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.7rem",fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
            ✅ <b style={{color:G}}>2FA is active.</b> You'll receive a WhatsApp code each time you sign in.
          </div>
        )}

        {!twoFA&&step==="idle"&&(
          <div style={{fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
            Enable 2FA to require a WhatsApp verification code every time you sign in. Strongly recommended for all users.
          </div>
        )}

        {step==="phone"&&(
          <div style={{marginTop:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.6rem"}}>Step 1 — Enter WhatsApp Number</div>
            {error&&<div className="err">⚠️ {error}</div>}
            <div style={{marginBottom:"0.6rem"}}>
              <label style={{fontSize:"0.63rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.05em",display:"block",marginBottom:"0.3rem"}}>WhatsApp Number (with country code)</label>
              <input style={inp} type="tel" placeholder="e.g. 2348012345678" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendOTP()}/>
            </div>
            <button style={btn()} onClick={sendOTP} disabled={!phone||loading}>{loading?"Sending...":"Send Verification Code"}</button>
            <button style={btn("outline")} onClick={()=>setStep("idle")}>Cancel</button>
          </div>
        )}

        {step==="verify"&&(
          <div style={{marginTop:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:"0.86rem",color:G,marginBottom:"0.4rem"}}>Step 2 — Enter Code</div>
            {otpCode&&(
              <div style={{background:"rgba(0,200,150,0.06)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"11px",padding:"0.75rem",textAlign:"center",marginBottom:"0.75rem"}}>
                <div style={{fontSize:"0.65rem",color:"#5a8a7a",marginBottom:"0.2rem"}}>Your Code</div>
                <div style={{fontSize:"1.8rem",fontWeight:800,color:G,letterSpacing:"0.25em"}}>{otpCode}</div>
              </div>
            )}
            {waUrl&&<div style={{textAlign:"center",marginBottom:"0.75rem"}}><a href={waUrl} target="_blank" rel="noreferrer" style={{fontSize:"0.76rem",color:"#25d366",fontWeight:700,textDecoration:"none"}}>📱 Open WhatsApp</a></div>}
            {error&&<div className="err">⚠️ {error}</div>}
            <div className="otp-row">
              {otp.map((d,i)=>(
                <input key={i} ref={el=>{otpRefs.current[i]=el;}} className="otp-b" type="text" inputMode="numeric" maxLength={1} value={d} onChange={e=>handleOTPInput(e.target.value,i)} onKeyDown={e=>handleOTPKey(e,i)}/>
              ))}
            </div>
            <button style={btn()} onClick={verifyOTP} disabled={otp.join("").length<6||loading}>{loading?"Verifying...":"Verify & Enable 2FA"}</button>
            <button style={btn("outline")} onClick={()=>setStep("phone")}>← Back</button>
          </div>
        )}

        {step==="backup"&&(
          <div style={{marginTop:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.3rem"}}>🎉 2FA Enabled!</div>
            <div style={{fontSize:"0.74rem",color:"#5a8a7a",lineHeight:1.6,marginBottom:"0.75rem"}}>
              Save these backup codes. Use one to log in if you lose your WhatsApp. <b style={{color:"#ffa500"}}>Each works once only.</b>
            </div>
            <div className="backup-grid">
              {backupCodes.map((c,i)=><div key={i} className="backup-code">{c}</div>)}
            </div>
            <button style={btn()} onClick={()=>{ navigator.clipboard.writeText(backupCodes.join("\n")); showMsg("✅ Backup codes copied!"); }}>📋 Copy All Backup Codes</button>
            <button style={btn("outline")} onClick={()=>setStep("idle")}>Done</button>
          </div>
        )}
      </div>

      {/* LOGIN HISTORY PREVIEW */}
      <div className="sec-card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"10px",background:"rgba(0,200,150,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>📋</div>
            <div>
              <div style={{fontWeight:700,fontSize:"0.9rem"}}>Login History</div>
              <div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>Detect unauthorized access</div>
            </div>
          </div>
          <button onClick={()=>router.push("/login-history")} style={{padding:"0.3rem 0.7rem",border:"1px solid rgba(0,200,150,0.18)",borderRadius:"7px",background:"none",color:G,fontSize:"0.72rem",fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>View All</button>
        </div>
        {loginHist.length===0
          ?<div style={{fontSize:"0.76rem",color:"#5a8a7a"}}>No login history recorded yet. History appears after your next login.</div>
          :loginHist.slice(0,3).map((h:any,i:number)=>(
            <div key={i} className="sec-row">
              <span style={{fontSize:"1.1rem"}}>{h.device?.includes("Mobile")?"📱":"🖥️"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.78rem",fontWeight:600}}>{h.device||"Unknown Device"}</div>
                <div style={{fontSize:"0.66rem",color:"#5a8a7a"}}>{h.ip_address||"Unknown IP"}</div>
              </div>
              <div style={{fontSize:"0.66rem",color:"#5a8a7a",textAlign:"right"}}>{new Date(h.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
            </div>
          ))
        }
      </div>

      {/* SECURITY CHECKLIST */}
      <div className="sec-card">
        <div style={{fontWeight:700,fontSize:"0.88rem",marginBottom:"0.75rem"}}>🛡️ Security Checklist</div>
        {[
          {icon:"✅",label:"Strong password",                done:true},
          {icon:twoFA?"✅":"⬜",label:"Two-factor authentication (2FA)",done:twoFA},
          {icon:"✅",label:"WhatsApp OTP on signup",         done:true},
          {icon:"✅",label:"Auto session timeout (30 min)",  done:true},
          {icon:"✅",label:"256-bit SSL encryption",         done:true},
          {icon:"✅",label:"Login history monitoring",       done:true},
          {icon:"✅",label:"Brute force protection",         done:true},
        ].map((item,i)=>(
          <div key={i} className="sec-row">
            <span style={{fontSize:"0.9rem",width:"20px"}}>{item.icon}</span>
            <span style={{fontSize:"0.78rem",color:item.done?"#e8f8f4":"#5a8a7a",flex:1}}>{item.label}</span>
            {!item.done&&<span style={{fontSize:"0.65rem",color:"#ffa500",fontWeight:600}}>Recommended</span>}
          </div>
        ))}
      </div>

      {/* TRUST PAGE LINK */}
      <div onClick={()=>router.push("/trust")} style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"13px",padding:"0.9rem 1rem",display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",marginBottom:"0.85rem"}}>
        <span style={{fontSize:"1.2rem"}}>🛡️</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:"0.86rem"}}>View Security Certificate</div>
          <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>See our full security standards and compliance</div>
        </div>
        <span style={{color:G,fontSize:"0.9rem"}}>→</span>
      </div>

      {/* DANGER ZONE */}
      <div style={{background:"rgba(255,71,87,0.04)",border:"1px solid rgba(255,71,87,0.15)",borderRadius:"14px",padding:"1rem"}}>
        <div style={{fontWeight:700,fontSize:"0.86rem",color:"#ff4757",marginBottom:"0.75rem"}}>⚠️ Danger Zone</div>
        <button onClick={()=>router.push("/settings")} style={{width:"100%",padding:"0.72rem",border:"1px solid rgba(255,71,87,0.25)",borderRadius:"10px",background:"rgba(255,71,87,0.06)",color:"#ff4757",fontWeight:700,fontSize:"0.84rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
          Change Password
        </button>
      </div>
    </MobileLayout>
  );
}
