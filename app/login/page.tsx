"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ContractModal from "../components/ContractModal";

export default function LoginPage() {
  const router = useRouter();
  const [tab,          setTab]         = useState("signup");
  const [name,         setName]        = useState("");
  const [email,        setEmail]       = useState("");
  const [password,     setPass]        = useState("");
  const [loading,      setLoading]     = useState(false);
  const [step,         setStep]        = useState("form");
  const [addrs,        setAddrs]       = useState({});
  const [copied,       setCopied]      = useState("");
  const [error,        setError]       = useState("");
  const [showContract, setShowContract]= useState(false);
  const [pendingUser,  setPendingUser] = useState(null);

  const hex  = (n) => Array.from({length:n},()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
  const b58c = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const b58  = (n) => Array.from({length:n},()=>b58c[Math.floor(Math.random()*58)]).join("");
  function genAddresses() { return { btc:"1FNV"+b58(30), eth:"0x"+hex(40), usdt:"T"+b58(33), bnb:"bnb1"+hex(38) }; }

  function handleSignup() {
    if (!name||!email||!password) { setError("Please fill all fields"); return; }
    if (password.length<8)        { setError("Password must be at least 8 characters"); return; }
    setError("");
    setPendingUser({ name, email, password });
    setShowContract(true);
  }

  function handleContractAccept(signature) {
    setShowContract(false);
    setLoading(true);
    setTimeout(() => {
      const addresses = genAddresses();
      const user = {
        userId:            "FNV"+Date.now().toString(36).toUpperCase(),
        name:              pendingUser.name,
        email:             pendingUser.email,
        password:          pendingUser.password,
        addresses,
        balances:          { btc:0, eth:0, usdt:0, bnb:0, ngn:0 },
        transactions:      [],
        contractSigned:    true,
        contractSignedAt:  new Date().toISOString(),
        contractSignature: signature,
        createdAt:         new Date().toISOString(),
      };
      localStorage.setItem("finova_user",     JSON.stringify(user));
      localStorage.setItem("finova_visited",  "true");
      localStorage.setItem("finova_loggedin", "true");
      setAddrs(addresses);
      setLoading(false);
      setStep("wallet");
    }, 1500);
  }

  function handleContractDecline() {
    setShowContract(false);
    setPendingUser(null);
    setError("You must accept the contract to create an account.");
  }

  function handleSignin() {
    if (!email||!password) { setError("Please fill all fields"); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      try {
        const saved = localStorage.getItem("finova_user");
        if (saved) {
          const user = JSON.parse(saved);
          if (user.email === email) {
            localStorage.setItem("finova_loggedin", "true");
            localStorage.setItem("finova_visited",  "true");
            setLoading(false);
            router.replace("/dashboard");
          } else {
            setLoading(false);
            setError("No account found with this email.");
          }
        } else {
          setLoading(false);
          setError("No account found. Please sign up first.");
        }
      } catch {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    }, 1200);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(()=>setCopied(""),2000);
  }

  const coins = [
    { key:"btc",  label:"Bitcoin (BTC)",  icon:"₿",  color:"#f7931a", bg:"rgba(247,147,26,0.1)"  },
    { key:"eth",  label:"Ethereum (ETH)", icon:"⟠",  color:"#627eea", bg:"rgba(98,126,234,0.1)"  },
    { key:"usdt", label:"USDT (TRC-20)",  icon:"₮",  color:"#26a17b", bg:"rgba(38,161,123,0.1)"  },
    { key:"bnb",  label:"BNB Chain",      icon:"🔶", color:"#f3ba2f", bg:"rgba(243,186,47,0.1)"  },
  ];

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0a0800;color:#f5e6c8;font-family:"DM Sans",sans-serif;min-height:100vh;}
        .lg-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
          background:radial-gradient(ellipse 70% 60% at 20% 20%,rgba(212,175,55,0.07),transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 80%,rgba(180,140,20,0.05),transparent 50%),#0a0800;}
        .lg-card{width:100%;max-width:440px;background:rgba(20,15,0,0.98);border:1px solid rgba(212,175,55,0.25);border-radius:24px;padding:2.3rem 2rem;box-shadow:0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(212,175,55,0.05);}
        .lg-logo{display:flex;flex-direction:column;align-items:center;gap:0.4rem;margin-bottom:1.8rem;}
        .lg-logo-icon{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#b8960c,#d4af37,#f5d76e);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 0 24px rgba(212,175,55,0.4);}
        .lg-logo-name{font-family:"Playfair Display",serif;font-weight:900;font-size:1.2rem;background:linear-gradient(135deg,#d4af37,#f5d76e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .lg-logo-tag{font-size:0.65rem;color:#6a5a2a;letter-spacing:0.12em;text-transform:uppercase;}
        .lg-tabs{display:flex;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.12);border-radius:12px;padding:0.25rem;gap:0.25rem;margin-bottom:1.6rem;}
        .lg-tab{flex:1;padding:0.6rem;border-radius:9px;border:none;cursor:pointer;font-family:"Playfair Display",serif;font-weight:700;font-size:0.9rem;transition:all 0.2s;background:none;color:#6a5a2a;}
        .lg-tab.active{background:linear-gradient(135deg,#b8960c,#d4af37);color:#0a0800;}
        .lg-field{display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem;}
        .lg-label{font-size:0.72rem;color:#8a7040;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
        .lg-input{background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:12px;padding:0.85rem 1rem;font-size:0.93rem;color:#f5e6c8;font-family:"DM Sans",sans-serif;outline:none;transition:border-color 0.2s;width:100%;}
        .lg-input:focus{border-color:rgba(212,175,55,0.5);box-shadow:0 0 0 3px rgba(212,175,55,0.08);}
        .lg-error{background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.25);border-radius:9px;padding:0.6rem 0.8rem;font-size:0.8rem;color:#e74c3c;margin-bottom:0.8rem;}
        .lg-btn{width:100%;padding:0.95rem;border:none;border-radius:13px;background:linear-gradient(135deg,#b8960c,#d4af37,#f5d76e);font-family:"Playfair Display",serif;font-weight:700;font-size:1rem;color:#0a0800;cursor:pointer;margin-top:0.5rem;box-shadow:0 0 24px rgba(212,175,55,0.3);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;letter-spacing:0.02em;}
        .lg-btn:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(212,175,55,0.5);}
        .lg-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .lg-notice{background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.15);border-radius:10px;padding:0.65rem 0.85rem;font-size:0.76rem;color:#8a7040;margin-bottom:1rem;line-height:1.5;}
        .lg-notice b{color:#d4af37;}
        .lg-divider{display:flex;align-items:center;gap:0.75rem;margin:1rem 0;color:#4a3a1a;font-size:0.75rem;}
        .lg-divider::before,.lg-divider::after{content:"";flex:1;height:1px;background:rgba(212,175,55,0.1);}
        .lg-back{font-size:0.8rem;color:#6a5a2a;text-align:center;margin-top:1rem;cursor:pointer;background:none;border:none;width:100%;}
        .lg-back:hover{color:#d4af37;}
        .wl-screen{animation:fadeIn 0.4s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .wl-addr-card{background:rgba(212,175,55,0.04);border:1px solid rgba(212,175,55,0.12);border-radius:14px;padding:0.9rem;margin-bottom:0.65rem;}
        .wl-addr-top{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem;}
        .wl-coin-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;font-weight:700;flex-shrink:0;}
        .wl-copy-btn{padding:0.3rem 0.7rem;border-radius:8px;border:1px solid rgba(212,175,55,0.3);background:rgba(212,175,55,0.1);color:#d4af37;font-family:"Playfair Display",serif;font-weight:700;font-size:0.72rem;cursor:pointer;}
        .wl-addr-text{font-family:"Courier New",monospace;font-size:0.7rem;color:#8a7040;word-break:break-all;background:rgba(0,0,0,0.3);border-radius:7px;padding:0.45rem 0.6rem;}
        .wl-continue{width:100%;padding:0.95rem;border:none;border-radius:13px;background:linear-gradient(135deg,#b8960c,#d4af37);font-family:"Playfair Display",serif;font-weight:700;font-size:1rem;color:#0a0800;cursor:pointer;margin-top:1.2rem;box-shadow:0 0 24px rgba(212,175,55,0.3);}
        .spinner{width:18px;height:18px;border:2px solid rgba(10,8,0,0.3);border-top-color:#0a0800;border-radius:50%;animation:spin 0.7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.lg-card{padding:1.6rem 1.2rem;border-radius:18px;}}
      `}</style>

      {showContract && pendingUser && (
        <ContractModal
          userName={pendingUser.name}
          onAccept={handleContractAccept}
          onDecline={handleContractDecline}
        />
      )}

      <div className="lg-bg">
        <div className="lg-card">
          <div className="lg-logo">
            <div className="lg-logo-icon">👑</div>
            <div className="lg-logo-name">FINOVA AFRICA</div>
            <div className="lg-logo-tag">Premium Financial Platform</div>
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"3rem 1rem"}}>
              <div style={{width:"50px",height:"50px",border:"3px solid rgba(212,175,55,0.2)",borderTop:"3px solid #d4af37",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,color:"#d4af37"}}>Setting up your account...</div>
              <div style={{fontSize:"0.8rem",color:"#6a5a2a",marginTop:"0.4rem"}}>Generating wallet addresses</div>
            </div>
          ) : step==="wallet" ? (
            <div className="wl-screen">
              <div style={{textAlign:"center",marginBottom:"1.4rem"}}>
                <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"linear-gradient(135deg,#b8960c,#d4af37)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",margin:"0 auto 0.8rem",boxShadow:"0 0 32px rgba(212,175,55,0.5)"}}>👑</div>
                <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:"1.3rem",marginBottom:"0.3rem",color:"#d4af37"}}>Welcome to Finova!</div>
                <div style={{fontSize:"0.83rem",color:"#8a7040"}}>Your wallet addresses have been generated</div>
              </div>
              <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:"11px",padding:"0.75rem",fontSize:"0.78rem",color:"#8a7040",marginBottom:"1.2rem",lineHeight:1.5}}>
                Send crypto to any address below and your balance updates automatically.
              </div>
              {coins.map(c=>(
                <div key={c.key} className="wl-addr-card">
                  <div className="wl-addr-top">
                    <div className="wl-coin-icon" style={{background:c.bg,color:c.color}}>{c.icon}</div>
                    <span style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.88rem",flex:1,color:"#f5e6c8"}}>{c.label}</span>
                    <button className="wl-copy-btn" onClick={()=>copy(addrs[c.key]||"",c.key)}>
                      {copied===c.key?"Copied!":"Copy"}
                    </button>
                  </div>
                  <div className="wl-addr-text">{addrs[c.key]||"..."}</div>
                </div>
              ))}
              <button className="wl-continue" onClick={()=>router.replace("/dashboard")}>
                Enter Dashboard →
              </button>
            </div>
          ) : (
            <>
              <div className="lg-tabs">
                <button className={"lg-tab"+(tab==="signup"?" active":"")} onClick={()=>{setTab("signup");setError("");}}>Sign Up</button>
                <button className={"lg-tab"+(tab==="signin"?" active":"")} onClick={()=>{setTab("signin");setError("");}}>Sign In</button>
              </div>

              {error&&<div className="lg-error">⚠️ {error}</div>}

              {tab==="signup"?(
                <>
                  <div className="lg-field">
                    <label className="lg-label">Full Name</label>
                    <input className="lg-input" placeholder="e.g. Axion Maxwell" value={name} onChange={e=>setName(e.target.value)}/>
                  </div>
                  <div className="lg-field">
                    <label className="lg-label">Email Address</label>
                    <input className="lg-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                  <div className="lg-field">
                    <label className="lg-label">Password</label>
                    <input className="lg-input" type="password" placeholder="Min. 8 characters" value={password} onChange={e=>setPass(e.target.value)}/>
                  </div>
                  <div className="lg-notice">
                    📋 A <b>1-year savings contract</b> will appear next. You must read and sign it to activate your account.
                  </div>
                  <button className="lg-btn" onClick={handleSignup} disabled={!name||!email||!password}>
                    Continue to Contract →
                  </button>
                  <div className="lg-divider">or</div>
                  <button className="lg-back" onClick={()=>{setTab("signin");setError("");}}>
                    Already have an account? Sign In
                  </button>
                </>
              ):(
                <>
                  <div style={{textAlign:"center",marginBottom:"1.2rem"}}>
                    <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"1rem",color:"#d4af37",marginBottom:"0.2rem"}}>Welcome Back</div>
                    <div style={{fontSize:"0.8rem",color:"#6a5a2a"}}>Sign in to your Finova Africa account</div>
                  </div>
                  <div className="lg-field">
                    <label className="lg-label">Email Address</label>
                    <input className="lg-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                  <div className="lg-field">
                    <label className="lg-label">Password</label>
                    <input className="lg-input" type="password" placeholder="Your password" value={password} onChange={e=>setPass(e.target.value)}/>
                  </div>
                  <button className="lg-btn" onClick={handleSignin} disabled={loading}>
                    {loading?<><div className="spinner"/> Signing In...</>:"Sign In"}
                  </button>
                  <div className="lg-divider">or</div>
                  <button className="lg-back" onClick={()=>{setTab("signup");setError("");}}>
                    New to Finova Africa? Create Account
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
