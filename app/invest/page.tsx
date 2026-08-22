"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const PORTFOLIOS = [
  {
    id:"stable",
    name:"Stable Growth",
    icon:"🛡️",
    color:"#00c896",
    border:"rgba(0,200,150,0.3)",
    bg:"rgba(0,200,150,0.06)",
    minAmount:10,
    targetReturn:"8–12%",
    risk:"Low Risk",
    riskColor:"#00c896",
    duration:"3–6 months",
    description:"Conservative portfolio focused on stable crypto assets and low-volatility instruments. Best for cautious investors who want to preserve capital.",
    assets:["USDT Lending","Bitcoin (BTC)","Ethereum (ETH)"],
    suitable:"First-time investors, risk-averse users",
    disclaimer:"Returns of 8–12% are estimated targets and not guaranteed. Capital is subject to investment risk and may decrease in value.",
  },
  {
    id:"balanced",
    name:"Balanced Portfolio",
    icon:"⚖️",
    color:"#f39c12",
    border:"rgba(243,156,18,0.3)",
    bg:"rgba(243,156,18,0.06)",
    minAmount:25,
    targetReturn:"12–20%",
    risk:"Medium Risk",
    riskColor:"#f39c12",
    duration:"6–12 months",
    description:"Diversified portfolio balancing stable and growth assets. Aims for consistent returns while managing downside risk through asset diversification.",
    assets:["Bitcoin (BTC)","Ethereum (ETH)","Altcoins","USDT Staking"],
    suitable:"Moderate investors comfortable with some volatility",
    disclaimer:"Returns of 12–20% are variable and depend on market performance. Capital is subject to investment risk and past performance does not guarantee future results.",
  },
  {
    id:"growth",
    name:"High Growth",
    icon:"🚀",
    color:"#ff6b35",
    border:"rgba(255,107,53,0.3)",
    bg:"rgba(255,107,53,0.06)",
    minAmount:50,
    targetReturn:"20–40%",
    risk:"High Risk",
    riskColor:"#ff4757",
    duration:"12+ months",
    description:"Aggressive portfolio targeting high returns through emerging crypto assets and DeFi protocols. High potential rewards come with significant risk of loss.",
    assets:["DeFi Protocols","Emerging Altcoins","Yield Farming","NFT Projects"],
    suitable:"Experienced investors who can tolerate significant losses",
    disclaimer:"Returns of 20–40% are highly variable and not guaranteed. This portfolio carries significant risk. You may lose a substantial portion or all of your invested capital. Only invest what you can afford to lose.",
  },
];

export default function InvestPage() {
  const router  = useRouter();
  const [sel,   setSel]   = useState<any>(null);
  const [amount,setAmount]= useState("");
  const [agree, setAgree] = useState(false);
  const [done,  setDone]  = useState(false);
  const [toast, setToast] = useState("");

  function showMsg(m:string){ setToast(m); setTimeout(()=>setToast(""),4000); }

  function submit() {
    if (!amount||parseFloat(amount)<(sel?.minAmount||10)){
      showMsg(`Minimum investment is $${sel?.minAmount} USDT`); return;
    }
    if (!agree){ showMsg("You must acknowledge the investment risk disclaimer"); return; }
    // Save interest request
    const reqs = JSON.parse(localStorage.getItem("nexora_invest_requests")||"[]");
    reqs.unshift({
      id:"inv_"+Date.now(),
      portfolio:sel.id,
      portfolioName:sel.name,
      amount:parseFloat(amount),
      targetReturn:sel.targetReturn,
      status:"pending",
      submittedAt:new Date().toISOString(),
    });
    localStorage.setItem("nexora_invest_requests",JSON.stringify(reqs));
    setDone(true);
  }

  const G="#00c896";

  return (
    <MobileLayout activePage="Invest">
      <style>{`
        .port-card{border-radius:16px;padding:1.1rem;margin-bottom:0.75rem;cursor:pointer;transition:all 0.22s;border:1.5px solid;}
        .port-card:hover{transform:translateY(-2px);}
        .port-card.selected{transform:translateY(-2px);}
        .risk-pill{display:inline-block;padding:0.18rem 0.6rem;border-radius:20px;font-size:0.65rem;font-weight:700;border:1px solid;}
        .inp{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.14);border-radius:10px;padding:0.7rem 0.9rem;font-size:0.9rem;color:#e8f8f4;font-family:Inter,sans-serif;outline:none;margin-bottom:0.75rem;}
        .inp:focus{border-color:rgba(0,200,150,0.4);}
        .check-row{display:flex;align-items:flex-start;gap:0.65rem;cursor:pointer;padding:0.75rem;background:rgba(255,71,87,0.04);border:1px solid rgba(255,71,87,0.15);border-radius:10px;margin-bottom:0.85rem;}
        .check-box{width:20px;height:20px;border-radius:5px;border:2px solid rgba(0,200,150,0.4);background:rgba(0,200,150,0.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all 0.15s;}
        .check-box.on{background:linear-gradient(135deg,#00a87a,#00c896);border-color:#00c896;}
        .submit-btn{width:100%;padding:0.88rem;border:none;border-radius:12px;background:linear-gradient(135deg,#00a87a,${G});font-weight:700;font-size:0.92rem;color:#050f0c;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;}
        .submit-btn:disabled{opacity:0.45;cursor:not-allowed;}
        .disclaimer-box{background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.2);border-radius:12px;padding:0.85rem;margin-bottom:0.85rem;font-size:0.74rem;color:#a08030;line-height:1.65;}
        .asset-tag{display:inline-block;padding:0.2rem 0.55rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.15);border-radius:20px;font-size:0.68rem;color:#00c896;margin:0.15rem;}
        .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.65rem 1.3rem;font-weight:700;font-size:0.82rem;z-index:999;color:${G};white-space:nowrap;}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      {done ? (
        <div style={{textAlign:"center",padding:"2rem 0"}}>
          <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>✅</div>
          <div style={{fontWeight:800,fontSize:"1.05rem",color:G,marginBottom:"0.5rem"}}>Investment Request Submitted!</div>
          <div style={{fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.65,marginBottom:"1.2rem"}}>
            Your <b style={{color:"#e8f8f4"}}>{sel.name}</b> investment request for <b style={{color:G}}>${amount} USDT</b> is under review. Our team will contact you within 24 hours.
          </div>
          <div style={{background:"rgba(255,165,0,0.06)",border:"1px solid rgba(255,165,0,0.18)",borderRadius:"12px",padding:"0.85rem",marginBottom:"1.2rem",fontSize:"0.75rem",color:"#a08030",lineHeight:1.6,textAlign:"left"}}>
            ⚠️ <b>Important Reminder:</b> NEXORA Investment Portfolio returns are variable and depend on investment performance. Capital is subject to investment risk. Past performance does not guarantee future results.
          </div>
          <button onClick={()=>{setDone(false);setSel(null);setAmount("");setAgree(false);}} style={{width:"100%",padding:"0.82rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"11px",background:"none",color:"#5a8a7a",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600}}>
            Browse Other Portfolios
          </button>
          <button onClick={()=>router.push("/dashboard")} style={{width:"100%",padding:"0.82rem",border:"none",borderRadius:"11px",background:`linear-gradient(135deg,#00a87a,${G})`,color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:700,marginTop:"0.5rem"}}>
            Back to Dashboard
          </button>
        </div>
      ) : sel ? (
        /* INVESTMENT FORM */
        <>
          <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.82rem",fontFamily:"Inter,sans-serif",marginBottom:"0.75rem",padding:0}}>
            ← Back to Portfolios
          </button>

          <div style={{background:sel.bg,border:`1.5px solid ${sel.border}`,borderRadius:"16px",padding:"1.1rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.65rem"}}>
              <span style={{fontSize:"1.8rem"}}>{sel.icon}</span>
              <div>
                <div style={{fontWeight:800,fontSize:"1rem",color:"#e8f8f4"}}>{sel.name}</div>
                <span className="risk-pill" style={{color:sel.riskColor,borderColor:sel.riskColor,background:`${sel.riskColor}18`}}>{sel.risk}</span>
              </div>
            </div>
            <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.6,marginBottom:"0.65rem"}}>{sel.description}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem"}}>
              {[{l:"Target Return",v:sel.targetReturn},{l:"Duration",v:sel.duration},{l:"Min. Amount",v:`$${sel.minAmount} USDT`}].map(s=>(
                <div key={s.l} style={{background:"rgba(0,0,0,0.25)",borderRadius:"8px",padding:"0.5rem",textAlign:"center"}}>
                  <div style={{fontSize:"0.62rem",color:"#5a8a7a",textTransform:"uppercase" as const,letterSpacing:"0.05em",marginBottom:"0.15rem"}}>{s.l}</div>
                  <div style={{fontWeight:700,fontSize:"0.82rem",color:sel.color}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ASSETS */}
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"0.65rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.06em",marginBottom:"0.4rem"}}>Portfolio Assets</div>
            <div>{sel.assets.map((a:string)=><span key={a} className="asset-tag">{a}</span>)}</div>
          </div>

          {/* AMOUNT INPUT */}
          <div style={{fontSize:"0.63rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.06em",display:"block",marginBottom:"0.28rem"}}>
            Investment Amount (USDT) *
          </div>
          <input
            className="inp"
            type="number"
            placeholder={`Minimum $${sel.minAmount} USDT`}
            value={amount}
            onChange={e=>setAmount(e.target.value)}
          />

          {/* POTENTIAL RETURN PREVIEW */}
          {amount&&parseFloat(amount)>0&&(
            <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.75rem",marginBottom:"0.85rem"}}>
              <div style={{fontWeight:600,fontSize:"0.78rem",color:"#e8f8f4",marginBottom:"0.5rem"}}>Estimated Return Preview</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.76rem",padding:"0.22rem 0",borderBottom:"1px solid rgba(0,200,150,0.06)"}}>
                <span style={{color:"#5a8a7a"}}>Amount invested</span>
                <span style={{fontWeight:700}}>${parseFloat(amount).toFixed(2)} USDT</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.76rem",padding:"0.22rem 0",borderBottom:"1px solid rgba(0,200,150,0.06)"}}>
                <span style={{color:"#5a8a7a"}}>Target return range</span>
                <span style={{fontWeight:700,color:sel.color}}>{sel.targetReturn}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.76rem",padding:"0.22rem 0"}}>
                <span style={{color:"#5a8a7a"}}>Duration</span>
                <span style={{fontWeight:700}}>{sel.duration}</span>
              </div>
              <div style={{marginTop:"0.5rem",padding:"0.5rem",background:"rgba(255,165,0,0.06)",borderRadius:"7px",fontSize:"0.68rem",color:"#a08030"}}>
                ⚠️ Returns are variable. Actual returns may be higher or lower than estimates.
              </div>
            </div>
          )}

          {/* MAIN DISCLAIMER */}
          <div className="disclaimer-box">
            <b style={{color:"#ffa500",display:"block",marginBottom:"0.3rem"}}>⚠️ Investment Risk Disclaimer</b>
            {sel.disclaimer}
            <br/><br/>
            <b>NEXORA Investment Portfolio</b> — returns are variable and depend on investment performance. Capital is subject to investment risk. You may lose part or all of your investment. Only invest what you can afford to lose. This is not financial advice.
          </div>

          {/* RISK ACKNOWLEDGEMENT */}
          <div className="check-row" onClick={()=>setAgree(a=>!a)}>
            <div className={"check-box"+(agree?" on":"")}>
              {agree&&<span style={{color:"#050f0c",fontSize:"0.75rem",fontWeight:800}}>✓</span>}
            </div>
            <span style={{fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
              I understand and acknowledge that <b style={{color:"#e8f8f4"}}>NEXORA Investment Portfolio returns are variable</b> and depend on investment performance. <b style={{color:"#e8f8f4"}}>Capital is subject to investment risk</b> and I may lose part or all of my invested amount.
            </span>
          </div>

          <button
            className="submit-btn"
            onClick={submit}
            disabled={!amount||parseFloat(amount)<sel.minAmount||!agree}
          >
            Submit Investment Request
          </button>
        </>
      ) : (
        /* PORTFOLIO LIST */
        <>
          {/* HEADER */}
          <div style={{marginBottom:"1.1rem"}}>
            <div style={{fontWeight:800,fontSize:"1.05rem",color:G,marginBottom:"0.15rem"}}>📈 Investment Portfolio</div>
            <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Grow your wealth beyond savings</div>
          </div>

          {/* MAIN RISK NOTICE */}
          <div style={{background:"rgba(255,165,0,0.06)",border:"1px solid rgba(255,165,0,0.22)",borderRadius:"14px",padding:"1rem",marginBottom:"1rem",display:"flex",gap:"0.65rem"}}>
            <span style={{fontSize:"1.2rem",flexShrink:0}}>⚠️</span>
            <div style={{fontSize:"0.76rem",color:"#a08030",lineHeight:1.65}}>
              <b style={{color:"#ffa500",display:"block",marginBottom:"0.2rem"}}>NEXORA Investment Portfolio</b>
              Returns are variable and depend on investment performance. Capital is subject to investment risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
            </div>
          </div>

          {/* STATS */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
            {[
              {v:"3",       l:"Portfolios"},
              {v:"8–40%",   l:"Target Range"},
              {v:"Variable",l:"Returns"},
            ].map(s=>(
              <div key={s.l} style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"11px",padding:"0.7rem",textAlign:"center"}}>
                <div style={{fontWeight:800,fontSize:"0.95rem",color:G,marginBottom:"0.1rem"}}>{s.v}</div>
                <div style={{fontSize:"0.62rem",color:"#5a8a7a",textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* PORTFOLIO CARDS */}
          {PORTFOLIOS.map(p=>(
            <div
              key={p.id}
              className="port-card"
              style={{background:p.bg,borderColor:p.border}}
              onClick={()=>setSel(p)}
            >
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"0.65rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                  <span style={{fontSize:"1.6rem"}}>{p.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:"0.95rem",color:"#e8f8f4",marginBottom:"0.2rem"}}>{p.name}</div>
                    <span className="risk-pill" style={{color:p.riskColor,borderColor:p.riskColor,background:`${p.riskColor}18`}}>{p.risk}</span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,fontSize:"1.1rem",color:p.color}}>{p.targetReturn}</div>
                  <div style={{fontSize:"0.62rem",color:"#5a8a7a"}}>target return</div>
                </div>
              </div>
              <div style={{fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.55,marginBottom:"0.65rem"}}>{p.description}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Min: <b style={{color:"#e8f8f4"}}>${p.minAmount} USDT</b> · {p.duration}</div>
                <span style={{fontSize:"0.76rem",color:p.color,fontWeight:700}}>Invest →</span>
              </div>
            </div>
          ))}

          {/* FULL DISCLAIMER FOOTER */}
          <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"14px",padding:"1rem",marginTop:"0.5rem"}}>
            <div style={{fontWeight:700,fontSize:"0.82rem",color:"#ffa500",marginBottom:"0.5rem"}}>⚠️ Important Risk Information</div>
            <div style={{fontSize:"0.74rem",color:"#5a8a7a",lineHeight:1.75}}>
              <b style={{color:"#e8f8f4"}}>NEXORA Investment Portfolio</b> — Returns are variable and depend on investment performance. Capital is subject to investment risk.
              <br/><br/>
              Crypto investments are highly volatile. The value of your investment can go up or down. Past performance is not indicative of future results. Target return ranges are estimates only and are not guaranteed.
              <br/><br/>
              NEXORA is not a licensed investment advisor. Nothing on this platform constitutes financial advice. Please do your own research and only invest what you can afford to lose.
            </div>
          </div>
        </>
      )}
    </MobileLayout>
  );
}
