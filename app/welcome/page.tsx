"use client";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  function go() {
    localStorage.setItem("finova_visited", "true");
    router.push("/login");
  }
  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0a0800;color:#f5e6c8;font-family:"DM Sans",sans-serif;min-height:100vh;overflow-x:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 40px rgba(212,175,55,0.3)}50%{box-shadow:0 0 80px rgba(212,175,55,0.7)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes rotateSlow{to{transform:rotate(360deg)}}
        .bg{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;text-align:center;
          background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(212,175,55,0.08),transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 90%,rgba(180,140,20,0.05),transparent 50%),#0a0800;
          position:relative;}
        .ring1{position:fixed;top:50%;left:50%;width:600px;height:600px;border-radius:50%;border:1px solid rgba(212,175,55,0.06);transform:translate(-50%,-50%);pointer-events:none;}
        .ring2{position:fixed;top:50%;left:50%;width:900px;height:900px;border-radius:50%;border:1px solid rgba(212,175,55,0.03);transform:translate(-50%,-50%);pointer-events:none;}
        .pt{position:fixed;border-radius:50%;background:rgba(212,175,55,0.4);animation:pulse 3s infinite;}
        .logo{display:flex;flex-direction:column;align-items:center;gap:0.4rem;margin-bottom:2.5rem;animation:fadeUp 0.6s ease both;}
        .logo-icon{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#f5d76e,#b8960c);display:flex;align-items:center;justify-content:center;font-size:1.8rem;animation:glow 3s ease-in-out infinite,float 4s ease-in-out infinite;box-shadow:0 0 40px rgba(212,175,55,0.4);}
        .logo-name{font-family:"Playfair Display",serif;font-weight:900;font-size:1.6rem;background:linear-gradient(135deg,#d4af37,#f5d76e,#d4af37);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s infinite;}
        .logo-tag{font-size:0.72rem;color:#8a7a4a;letter-spacing:0.15em;text-transform:uppercase;}
        .title{font-family:"Playfair Display",serif;font-weight:900;font-size:clamp(2rem,6vw,3.2rem);line-height:1.15;margin-bottom:0.75rem;animation:fadeUp 0.6s 0.1s ease both;opacity:0;animation-fill-mode:both;}
        .gold{background:linear-gradient(135deg,#d4af37,#f5d76e,#d4af37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .sub{font-size:1rem;color:#8a7a4a;max-width:420px;line-height:1.65;margin-bottom:2rem;animation:fadeUp 0.6s 0.2s ease both;opacity:0;animation-fill-mode:both;}
        .pills{display:flex;gap:0.6rem;flex-wrap:wrap;justify-content:center;margin-bottom:2.2rem;animation:fadeUp 0.6s 0.3s ease both;opacity:0;animation-fill-mode:both;}
        .pill{background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:20px;padding:0.4rem 0.9rem;font-size:0.78rem;color:#c4a43a;}
        .btn{padding:1rem 3rem;border:none;border-radius:14px;background:linear-gradient(135deg,#b8960c,#d4af37,#f5d76e);font-family:"Playfair Display",serif;font-weight:700;font-size:1.1rem;color:#0a0800;cursor:pointer;box-shadow:0 0 40px rgba(212,175,55,0.4);transition:all 0.25s;animation:fadeUp 0.6s 0.4s ease both;opacity:0;animation-fill-mode:both;margin-bottom:1rem;letter-spacing:0.02em;}
        .btn:hover{transform:translateY(-3px);box-shadow:0 0 60px rgba(212,175,55,0.6);}
        .signin{font-size:0.84rem;color:#6a5a2a;animation:fadeUp 0.6s 0.5s ease both;opacity:0;animation-fill-mode:both;}
        .signin button{background:none;border:none;color:#d4af37;font-weight:600;cursor:pointer;font-size:0.84rem;}
        .steps{display:flex;gap:1.5rem;margin-top:2rem;flex-wrap:wrap;justify-content:center;animation:fadeUp 0.6s 0.55s ease both;opacity:0;animation-fill-mode:both;}
        .step{display:flex;flex-direction:column;align-items:center;gap:0.35rem;}
        .step-n{width:32px;height:32px;border-radius:50%;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;font-family:"Playfair Display",serif;font-weight:700;font-size:0.82rem;color:#d4af37;}
        .step-l{font-size:0.72rem;color:#6a5a2a;max-width:80px;text-align:center;}
        .trust{display:flex;align-items:center;gap:0.5rem;margin-top:2rem;font-size:0.75rem;color:#6a5a2a;animation:fadeUp 0.6s 0.6s ease both;opacity:0;animation-fill-mode:both;}
        .divider{width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent);margin:1.5rem auto;animation:fadeUp 0.6s 0.35s ease both;opacity:0;animation-fill-mode:both;}
        @media(max-width:480px){.btn{width:100%;padding:0.95rem;}.logo-icon{width:60px;height:60px;font-size:1.5rem;}.title{font-size:1.9rem;}}
      `}</style>

      <div className="ring1"/><div className="ring2"/>
      <div className="pt" style={{top:"10%",left:"8%",width:"3px",height:"3px"}}/>
      <div className="pt" style={{top:"25%",left:"90%",width:"4px",height:"4px",animationDelay:"1s"}}/>
      <div className="pt" style={{top:"75%",left:"5%",width:"3px",height:"3px",animationDelay:"2s"}}/>
      <div className="pt" style={{top:"85%",left:"88%",width:"5px",height:"5px",animationDelay:"0.5s"}}/>

      <div className="bg">
        <div className="logo">
          <div className="logo-icon">👑</div>
          <div className="logo-name">FINOVA AFRICA</div>
          <div className="logo-tag">Premium Financial Platform</div>
        </div>

        <h1 className="title">
          Save. Grow.<br/><span className="gold">Prosper.</span>
        </h1>

        <p className="sub">
          Africa most trusted all-in-one crypto, savings and payments platform. Earn up to 45% APY on your weekly contributions.
        </p>

        <div className="pills">
          <span className="pill">👑 Premium Savings</span>
          <span className="pill">₿ Crypto Wallet</span>
          <span className="pill">🌍 12 African Currencies</span>
          <span className="pill">📈 45% APY</span>
          <span className="pill">🎁 $15 Voucher</span>
        </div>

        <div className="divider"/>

        <button className="btn" onClick={go}>Get Started — It is Free</button>

        <div className="signin">
          Already have an account?{" "}
          <button onClick={()=>{localStorage.setItem("finova_visited","true");router.push("/login");}}>Sign In</button>
        </div>

        <div className="steps">
          <div className="step"><div className="step-n">1</div><div className="step-l">Create Account</div></div>
          <div className="step"><div className="step-n">2</div><div className="step-l">Sign Contract</div></div>
          <div className="step"><div className="step-n">3</div><div className="step-l">Get Wallet</div></div>
          <div className="step"><div className="step-n">4</div><div className="step-l">Start Saving</div></div>
        </div>

        <div className="trust">
          Trusted by <strong style={{color:"#d4af37",margin:"0 0.25rem"}}>10,000+</strong> users across Africa
        </div>
      </div>
    </>
  );
}
