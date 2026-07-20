"use client";
import { useState, useRef } from "react";

export default function ContractModal({ userName, onAccept, onDecline }: any) {
  const [section,   setSection]   = useState(0);
  const [signature, setSignature] = useState("");
  const [checks,    setChecks]    = useState({terms:false,interest:false,kyc:false,privacy:false});
  const [signed,    setSigned]    = useState(false);
  const [sigError,  setSigError]  = useState("");
  const scrollRef = useRef<any>(null);

  const today    = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const maturity = new Date(Date.now()+365*86400000).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

  const sections = [
    {id:"terms",    icon:"📋", title:"Terms & Conditions"},
    {id:"interest", icon:"💰", title:"Interest & Payout"},
    {id:"kyc",      icon:"🪪", title:"KYC Agreement"},
    {id:"privacy",  icon:"🔒", title:"Privacy Policy"},
    {id:"sign",     icon:"✍️", title:"Sign Contract"},
  ];

  const allChecked = Object.values(checks).every(Boolean);

  function handleSign() {
    if (!allChecked) { setSigError("Please agree to all sections first."); return; }
    if (signature.trim().toLowerCase() !== userName.trim().toLowerCase()) {
      setSigError("Signature must match exactly: " + userName); return;
    }
    setSigError(""); setSigned(true);
    setTimeout(()=>onAccept(signature), 1500);
  }

  function toggle(key: string) { setChecks((p:any)=>({...p,[key]:!p[key]})); }

  const checkStyle = (checked: boolean) => ({
    display:"flex",alignItems:"flex-start",gap:"0.7rem",
    padding:"0.8rem",
    background:checked?"rgba(0,200,150,0.06)":"rgba(255,255,255,0.02)",
    border:`1px solid ${checked?"rgba(0,200,150,0.25)":"rgba(255,255,255,0.06)"}`,
    borderRadius:"11px",marginBottom:"0.6rem",cursor:"pointer",transition:"all 0.18s"
  });

  const boxStyle = (checked: boolean) => ({
    width:"20px",height:"20px",borderRadius:"5px",flexShrink:0,marginTop:"1px",
    background:checked?"linear-gradient(135deg,#00a87a,#00c896)":"rgba(255,255,255,0.05)",
    border:`1.5px solid ${checked?"#00c896":"rgba(255,255,255,0.15)"}`,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:"0.65rem",color:"#050f0c",fontWeight:800,
  });

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap");
        .ct-ov{position:fixed;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:0.75rem;}
        .ct-modal{width:100%;max-width:580px;max-height:92vh;background:#060f0c;border:1px solid rgba(0,200,150,0.2);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;animation:ctIn 0.3s ease;box-shadow:0 32px 80px rgba(0,0,0,0.9);}
        @keyframes ctIn{from{opacity:0;transform:scale(0.95) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .ct-head{background:linear-gradient(135deg,rgba(8,22,16,0.95),rgba(13,9,0,0.98));padding:1.1rem 1.3rem;border-bottom:1px solid rgba(0,200,150,0.12);flex-shrink:0;}
        .ct-head-title{font-family:"Inter",serif;font-weight:700;font-size:0.95rem;color:#00c896;margin-bottom:0.2rem;}
        .ct-head-sub{font-size:0.7rem;color:#3a7a6a;}
        .ct-prog{display:flex;gap:0.25rem;margin-top:0.7rem;}
        .ct-prog-step{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,0.08);transition:background 0.3s;}
        .ct-prog-step.done{background:#00c896;}
        .ct-prog-step.active{background:rgba(0,200,150,0.4);}
        .ct-tabs{display:flex;overflow-x:auto;gap:0.3rem;padding:0.6rem 0.9rem;border-bottom:1px solid rgba(0,200,150,0.08);flex-shrink:0;scrollbar-width:none;}
        .ct-tabs::-webkit-scrollbar{display:none;}
        .ct-tab{display:flex;align-items:center;gap:0.25rem;padding:0.35rem 0.65rem;border-radius:20px;font-size:0.72rem;font-family:"Inter",serif;font-weight:600;cursor:pointer;white-space:nowrap;border:1px solid rgba(0,200,150,0.08);background:none;color:#3a7a6a;transition:all 0.18s;flex-shrink:0;}
        .ct-tab.active{background:rgba(0,200,150,0.1);border-color:rgba(0,200,150,0.3);color:#00c896;}
        .ct-tab.done{color:#00c896;opacity:0.7;}
        .ct-body{flex:1;overflow-y:auto;padding:1.1rem 1.3rem;}
        .ct-sec-title{font-family:"Inter",serif;font-weight:700;font-size:0.92rem;color:#00c896;margin-bottom:0.85rem;}
        .ct-clause{margin-bottom:0.85rem;padding:0.8rem;background:rgba(255,255,255,0.02);border-left:2px solid rgba(0,200,150,0.25);border-radius:0 9px 9px 0;}
        .ct-ct{font-family:"Inter",serif;font-weight:600;font-size:0.8rem;color:#e8f8f4;margin-bottom:0.3rem;}
        .ct-cb{font-size:0.76rem;color:#5a8a7a;line-height:1.6;}
        .ct-cb b{color:#e8f8f4;}
        .ct-hi{background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.15);border-radius:10px;padding:0.8rem;margin-bottom:0.85rem;font-size:0.76rem;color:#5a8a7a;line-height:1.5;}
        .ct-hi b{color:#00c896;}
        .ct-warn{background:rgba(231,76,60,0.07);border:1px solid rgba(231,76,60,0.18);border-radius:10px;padding:0.8rem;margin-bottom:0.85rem;font-size:0.76rem;color:#ff4757;line-height:1.5;}
        .ct-warn b{display:block;margin-bottom:0.25rem;font-size:0.8rem;}
        .ct-fee-box{background:linear-gradient(135deg,rgba(8,22,16,0.9),rgba(13,9,0,0.95));border:1px solid rgba(0,200,150,0.3);border-radius:12px;padding:1rem;margin-bottom:0.85rem;text-align:center;}
        .ct-fee-amount{font-family:"Inter",serif;font-weight:800;font-size:1.8rem;color:#00c896;line-height:1;}
        .ct-fee-label{font-size:0.68rem;color:#3a7a6a;text-transform:uppercase;letter-spacing:0.06em;margin-top:0.25rem;}
        .ct-table{width:100%;border-collapse:collapse;margin-bottom:0.85rem;}
        .ct-table td{padding:0.35rem 0;border-bottom:1px solid rgba(0,200,150,0.07);font-size:0.78rem;}
        .ct-table td:first-child{color:#3a7a6a;} .ct-table td:last-child{color:#e8f8f4;font-weight:600;text-align:right;}
        .ct-sig-input{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:0.8rem 0.9rem;font-size:1rem;color:#e8f8f4;font-family:"Inter",serif;font-weight:600;outline:none;text-align:center;letter-spacing:0.03em;transition:border-color 0.2s;}
        .ct-sig-input:focus{border-color:rgba(0,200,150,0.4);}
        .ct-sig-input.valid{border-color:#00c896;background:rgba(0,200,150,0.05);}
        .ct-sig-err{font-size:0.72rem;color:#ff4757;margin-top:0.35rem;text-align:center;}
        .ct-sig-hint{font-size:0.68rem;color:#3a7a6a;text-align:center;margin-top:0.3rem;}
        .ct-footer{padding:0.85rem 1.1rem;border-top:1px solid rgba(0,200,150,0.08);display:flex;gap:0.6rem;flex-shrink:0;}
        .ct-next{flex:1;padding:0.75rem;border:none;border-radius:10px;background:linear-gradient(135deg,#00a87a,#00c896);font-family:"Inter",serif;font-weight:700;font-size:0.9rem;color:#050f0c;cursor:pointer;transition:all 0.2s;}
        .ct-next:disabled{opacity:0.35;cursor:not-allowed;}
        .ct-back{padding:0.75rem 1rem;border:1px solid rgba(0,200,150,0.12);border-radius:10px;background:none;color:#3a7a6a;cursor:pointer;font-family:"Inter",serif;font-weight:600;font-size:0.88rem;}
        .ct-decline{padding:0.75rem 1rem;border:1px solid rgba(231,76,60,0.18);border-radius:10px;background:none;color:#ff4757;cursor:pointer;font-family:"Inter",serif;font-weight:600;font-size:0.88rem;}
        .ct-success{text-align:center;padding:1.5rem 1rem;}
        @media(max-width:480px){.ct-modal{max-height:96vh;border-radius:16px;}.ct-body{padding:0.9rem 1rem;}.ct-footer{padding:0.7rem 0.9rem;}}
      `}</style>

      <div className="ct-ov">
        <div className="ct-modal">
          {/* HEADER */}
          <div className="ct-head">
            <div className="ct-head-title">👑 NEXORA — Savings Contract</div>
            <div className="ct-head-sub">1-Year Fixed Savings Agreement · {today}</div>
            <div className="ct-prog">
              {sections.map((s,i)=>(
                <div key={s.id} className={"ct-prog-step"+(i<section?" done":i===section?" active":"")}/>
              ))}
            </div>
          </div>

          {/* TABS */}
          <div className="ct-tabs">
            {sections.map((s,i)=>(
              <button key={s.id} className={"ct-tab"+(section===i?" active":i<section?" done":"")} onClick={()=>setSection(i)}>
                {i<section?"✓ ":""}{s.icon} {s.title}
              </button>
            ))}
          </div>

          {/* BODY */}
          <div className="ct-body" ref={scrollRef}>

            {/* TERMS */}
            {section===0&&(<>
              <div className="ct-sec-title">📋 Terms & Conditions</div>
              <div className="ct-hi">This agreement is between <b>{userName}</b> and <b>NEXORA Ltd</b>, effective <b>{today}</b>.</div>

              {/* REGISTRATION FEE - PROMINENT */}
              <div className="ct-fee-box">
                <div style={{fontSize:"0.7rem",color:"#3a7a6a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.3rem"}}>One-Time Registration Fee</div>
                <div className="ct-fee-amount">4 USDT</div>
                <div className="ct-fee-label">Required to activate your account</div>
                <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",marginTop:"0.7rem"}}>
                  <div style={{flex:1,maxWidth:"100px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.4rem",textAlign:"center"}}>
                    <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.8rem",color:"#00c896"}}>2 USDT</div>
                    <div style={{fontSize:"0.6rem",color:"#3a7a6a"}}>Registration</div>
                  </div>
                  <div style={{flex:1,maxWidth:"100px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"8px",padding:"0.4rem",textAlign:"center"}}>
                    <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.8rem",color:"#00c896"}}>2 USDT</div>
                    <div style={{fontSize:"0.6rem",color:"#3a7a6a"}}>Wallet Setup</div>
                  </div>
                </div>
              </div>

              {[
                {t:"1. Eligibility",         b:"You must be 18 years or older. By signing this contract you confirm all information is accurate."},
                {t:"2. Registration Fee",    b:"A one-time activation fee of 4 USDT is required before accessing any features. This covers account registration (2 USDT) and virtual wallet creation (2 USDT). This fee is non-refundable."},
                {t:"3. Weekly Contribution", b:"After activation, you agree to contribute $2 USDT every week for 52 consecutive weeks (1 full year). Total minimum contribution: $104 USDT."},
                {t:"4. Late Payment Penalty",b:"If a weekly payment is not made within 1 day of the due date, you must pay double ($4 USDT) for that week. Missing 5 or more weeks results in immediate contract termination."},
                {t:"5. No Early Withdrawal", b:"Funds contributed to the savings plan are strictly locked for 52 weeks. No early withdrawal is permitted under any circumstances."},
                {t:"6. Contract Duration",   b:"This contract is valid for exactly 1 year (52 weeks) from activation. Maturity date: "+maturity+"."},
              ].map(c=>(
                <div key={c.t} className="ct-clause">
                  <div className="ct-ct">{c.t}</div>
                  <div className="ct-cb">{c.b}</div>
                </div>
              ))}
              <div onClick={()=>toggle("terms")} style={checkStyle(checks.terms)}>
                <div style={boxStyle(checks.terms)}>{checks.terms?"✓":""}</div>
                <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.45}}>I have read and agree to the <b style={{color:"#e8f8f4"}}>Terms & Conditions</b> including the  and penalty rules.</div>
              </div>
            </>)}

            {/* INTEREST */}
            {section===1&&(<>
              <div className="ct-sec-title">💰 Interest & Payout Terms</div>
              <div className="ct-hi">Save <b>$3 USDT/week</b> for 52 weeks and earn <b>35% APY</b> plus a <b>$15 cash/food voucher</b>.</div>
              <table className="ct-table">
                <tbody>
                  {[
                    ["Registration Fee",  "4 USDT (one-time)"],
                    ["Weekly Payment",    "$3 USDT"],
                    ["Duration",          "52 Weeks (1 Year)"],
                    ["Total Contributed", "$104 USDT"],
                    ["Interest Rate",     "35% APY"],
                    ["Interest Earned",   "~$46.80"],
                    ["Completion Voucher","$15 Cash/Food"],
                    ["Total Payout",      "$165.80"],
                    ["Late Payment",      "$4 USDT (double penalty)"],
                    ["Miss 5 Weeks",      "Contract Terminated"],
                  ].map(([l,v])=>(
                    <tr key={l}><td>{l}</td><td style={{color:l==="Miss 5 Weeks"||l==="Late Payment"?"#ff4757":l==="Total Payout"?"#00c896":"#e8f8f4"}}>{v}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="ct-warn">
                <b>⚠️ NO EARLY WITHDRAWAL</b>
                Once funds are locked they cannot be withdrawn before the 52-week maturity date under any circumstances.
              </div>
              <div onClick={()=>toggle("interest")} style={checkStyle(checks.interest)}>
                <div style={boxStyle(checks.interest)}>{checks.interest?"✓":""}</div>
                <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.45}}>I understand the <b style={{color:"#e8f8f4"}}>Interest, Payout Terms and Penalty Rules</b>.</div>
              </div>
            </>)}

            {/* KYC */}
            {section===2&&(<>
              <div className="ct-sec-title">🪪 KYC Agreement</div>
              <div className="ct-hi">NEXORA is required by law to verify the identity of all users.</div>
              {[
                {t:"7. Identity Verification", b:"You agree to provide accurate government-issued ID, proof of address, and a selfie when requested."},
                {t:"8. AML Compliance",        b:"You confirm all funds are from legitimate sources and not proceeds of any illegal activity."},
                {t:"9. Account Suspension",    b:"NEXORA may freeze accounts pending investigation if suspicious activity is detected."},
              ].map(c=>(
                <div key={c.t} className="ct-clause">
                  <div className="ct-ct">{c.t}</div>
                  <div className="ct-cb">{c.b}</div>
                </div>
              ))}
              <div onClick={()=>toggle("kyc")} style={checkStyle(checks.kyc)}>
                <div style={boxStyle(checks.kyc)}>{checks.kyc?"✓":""}</div>
                <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.45}}>I agree to the <b style={{color:"#e8f8f4"}}>KYC Agreement</b> and confirm all information is accurate.</div>
              </div>
            </>)}

            {/* PRIVACY */}
            {section===3&&(<>
              <div className="ct-sec-title">🔒 Privacy Policy</div>
              <div className="ct-hi">Your data is protected under NDPR and GDPR principles.</div>
              {[
                {t:"10. Data Collection", b:"We collect your name, email, phone, government ID, and transaction data for regulatory compliance and service delivery."},
                {t:"11. Data Usage",      b:"Your data is only used for account management, KYC verification, and fraud prevention. We never sell your data."},
                {t:"12. Your Rights",     b:"You may request access, correction or deletion of your data at any time by contacting support@nexora.com."},
              ].map(c=>(
                <div key={c.t} className="ct-clause">
                  <div className="ct-ct">{c.t}</div>
                  <div className="ct-cb">{c.b}</div>
                </div>
              ))}
              <div onClick={()=>toggle("privacy")} style={checkStyle(checks.privacy)}>
                <div style={boxStyle(checks.privacy)}>{checks.privacy?"✓":""}</div>
                <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.45}}>I consent to the <b style={{color:"#e8f8f4"}}>Privacy Policy</b> of NEXORA.</div>
              </div>
            </>)}

            {/* SIGN */}
            {section===4&&(<>
              {signed?(
                <div className="ct-success">
                  <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>✅</div>
                  <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.35rem"}}>Contract Signed!</div>
                  <div style={{fontSize:"0.78rem",color:"#3a7a6a"}}>Setting up your account and wallet...</div>
                </div>
              ):(
                <>
                  <div className="ct-sec-title">✍️ Sign the Contract</div>
                  <div className="ct-hi">By signing, you confirm you have read all sections and agree to all terms including the <b>4 USDT activation fee</b> and <b>52-week savings commitment</b>.</div>

                  <table className="ct-table" style={{marginBottom:"1rem"}}>
                    <tbody>
                      {[
                        ["Saver Name",        userName],
                        ["Contract Date",     today],
                        ["Maturity Date",     maturity],
                        ["Activation Fee",    "4 USDT (one-time)"],
                        ["Weekly Payment",    "$3 USDT"],
                        ["Total Payout",      "$165.80 at completion"],
                        ["Early Withdrawal",  "NOT PERMITTED"],
                      ].map(([l,v])=>(
                        <tr key={l}><td>{l}</td><td style={{color:l==="Early Withdrawal"?"#ff4757":l==="Activation Fee"||l==="Total Payout"?"#00c896":"#e8f8f4"}}>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>

                  {!allChecked&&(
                    <div style={{background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.18)",borderRadius:"9px",padding:"0.65rem",fontSize:"0.74rem",color:"#00c896",marginBottom:"0.85rem"}}>
                      ⚠️ Please go back and agree to all sections before signing.
                    </div>
                  )}

                  <div style={{marginBottom:"0.3rem"}}>
                    <div style={{fontSize:"0.68rem",color:"#3a7a6a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.5rem"}}>
                      Type your full name to sign
                    </div>
                    <input
                      className={"ct-sig-input"+(signature.trim().toLowerCase()===userName.trim().toLowerCase()&&signature?" valid":"")}
                      placeholder={userName}
                      value={signature}
                      onChange={e=>{setSignature(e.target.value);setSigError("");}}
                    />
                    {sigError&&<div className="ct-sig-err">⚠️ {sigError}</div>}
                    <div className="ct-sig-hint">Type exactly: <b style={{color:"#00c896"}}>{userName}</b></div>
                  </div>
                </>
              )}
            </>)}
          </div>

          {/* FOOTER */}
          {!signed&&(
            <div className="ct-footer">
              {section===0
                ?<button className="ct-decline" onClick={onDecline}>Decline</button>
                :<button className="ct-back" onClick={()=>setSection(s=>s-1)}>← Back</button>
              }
              {section<4
                ?<button className="ct-next" onClick={()=>{scrollRef.current?.scrollTo(0,0);setSection(s=>s+1);}}>Next →</button>
                :<button className="ct-next"
                  disabled={!allChecked||signature.trim().toLowerCase()!==userName.trim().toLowerCase()}
                  onClick={handleSign}>
                  ✍️ Sign & Continue to Payment
                </button>
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
}
