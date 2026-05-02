"use client";
import { useState, useRef } from "react";

export default function ContractModal({ userName, onAccept, onDecline }) {
  const [section,   setSection]   = useState(0);
  const [signature, setSignature] = useState("");
  const [checks,    setChecks]    = useState({ terms:false, privacy:false, interest:false, kyc:false });
  const [signed,    setSigned]    = useState(false);
  const [sigError,  setSigError]  = useState("");
  const scrollRef = useRef(null);
  const today    = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const maturity = new Date(Date.now()+365*86400000).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

  const sections = [
    { id:"terms",    icon:"📋", title:"Terms & Conditions" },
    { id:"interest", icon:"💰", title:"Interest & Payout Terms" },
    { id:"kyc",      icon:"🪪", title:"KYC Agreement" },
    { id:"privacy",  icon:"🔒", title:"Privacy Policy" },
    { id:"sign",     icon:"✍️", title:"Sign Contract" },
  ];

  const allChecked = Object.values(checks).every(Boolean);

  function handleSign() {
    if (!allChecked) { setSigError("Please agree to all sections before signing."); return; }
    if (signature.trim().toLowerCase() !== userName.trim().toLowerCase()) {
      setSigError("Signature must match your full name exactly: " + userName); return;
    }
    setSigError(""); setSigned(true);
    setTimeout(() => onAccept(signature), 1500);
  }

  function toggleCheck(key) { setChecks(prev => ({ ...prev, [key]: !prev[key] })); }

  return (
    <>
      <style>{`
        .ct-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .ct-modal{width:100%;max-width:600px;max-height:90vh;background:#0a1628;border:1px solid rgba(46,204,113,0.25);border-radius:24px;display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(0,0,0,0.9);overflow:hidden;animation:ctIn 0.35s ease;}
        @keyframes ctIn{from{opacity:0;transform:scale(0.94) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .ct-head{background:linear-gradient(135deg,rgba(46,204,113,0.12),rgba(10,22,40,0.95));padding:1.3rem 1.5rem;border-bottom:1px solid rgba(46,204,113,0.15);flex-shrink:0;}
        .ct-tabs{display:flex;overflow-x:auto;gap:0.4rem;padding:0.75rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;scrollbar-width:none;}
        .ct-tabs::-webkit-scrollbar{display:none;}
        .ct-tab{display:flex;align-items:center;gap:0.3rem;padding:0.4rem 0.75rem;border-radius:20px;font-size:0.78rem;font-family:"Syne",sans-serif;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.18s;border:1px solid rgba(255,255,255,0.08);background:none;color:#7a9bbf;flex-shrink:0;}
        .ct-tab.active{background:rgba(46,204,113,0.12);border-color:rgba(46,204,113,0.3);color:#2ecc71;}
        .ct-tab.done{background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.2);color:#2ecc71;}
        .ct-body{flex:1;overflow-y:auto;padding:1.3rem 1.5rem;}
        .ct-clause{margin-bottom:1rem;padding:0.9rem;background:rgba(255,255,255,0.03);border-left:3px solid rgba(46,204,113,0.3);border-radius:0 10px 10px 0;}
        .ct-clause-title{font-family:"Syne",sans-serif;font-weight:700;font-size:0.85rem;margin-bottom:0.4rem;color:#e8f0fe;}
        .ct-clause-text{font-size:0.8rem;color:#7a9bbf;line-height:1.65;}
        .ct-warning{background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2);border-radius:11px;padding:0.85rem;margin-bottom:1rem;font-size:0.8rem;color:#e74c3c;line-height:1.5;}
        .ct-warning b{display:block;margin-bottom:0.3rem;font-size:0.85rem;}
        .ct-highlight{background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.2);border-radius:11px;padding:0.85rem;margin-bottom:1rem;font-size:0.8rem;color:#7a9bbf;line-height:1.5;}
        .ct-highlight b{color:#2ecc71;}
        .ct-check-row{display:flex;align-items:flex-start;gap:0.75rem;padding:0.85rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:0.6rem;cursor:pointer;transition:all 0.18s;}
        .ct-check-row:hover{border-color:rgba(46,204,113,0.25);background:rgba(46,204,113,0.04);}
        .ct-check-row.chk{border-color:rgba(46,204,113,0.3);background:rgba(46,204,113,0.06);}
        .ct-checkbox{width:22px;height:22px;border-radius:6px;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all 0.18s;}
        .ct-checkbox.chk{background:#2ecc71;border-color:#2ecc71;color:#05100a;font-size:0.75rem;font-weight:800;}
        .ct-check-text{font-size:0.82rem;color:#7a9bbf;line-height:1.45;}
        .ct-check-text b{color:#e8f0fe;}
        .ct-sig-input{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:0.9rem 1rem;font-size:1.1rem;color:#e8f0fe;font-family:"Syne",sans-serif;font-weight:700;outline:none;text-align:center;letter-spacing:0.05em;transition:border-color 0.2s;}
        .ct-sig-input:focus{border-color:#2ecc71;}
        .ct-sig-input.valid{border-color:#2ecc71;background:rgba(46,204,113,0.06);}
        .ct-meta-row{display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.82rem;}
        .ct-meta-row:last-child{border-bottom:none;}
        .ct-footer{padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:0.75rem;flex-shrink:0;}
        .ct-btn-next{flex:1;padding:0.8rem;border:none;border-radius:12px;background:linear-gradient(90deg,#27ae60,#2ecc71);font-family:"Syne",sans-serif;font-weight:700;font-size:0.95rem;color:#05100a;cursor:pointer;}
        .ct-btn-prev{padding:0.8rem 1.2rem;border:1px solid rgba(255,255,255,0.1);border-radius:12px;background:none;color:#7a9bbf;cursor:pointer;font-family:"Syne",sans-serif;font-weight:600;font-size:0.9rem;}
        .ct-btn-decline{padding:0.8rem 1.2rem;border:1px solid rgba(231,76,60,0.2);border-radius:12px;background:none;color:#e74c3c;cursor:pointer;font-family:"Syne",sans-serif;font-weight:600;font-size:0.9rem;}
        .ct-success{text-align:center;padding:2rem 1rem;}
        .ct-prog-step{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,0.1);transition:background 0.3s;}
        .ct-prog-step.done{background:#2ecc71;}
        .ct-prog-step.active{background:rgba(46,204,113,0.5);}
        @media(max-width:480px){.ct-modal{max-height:95vh;border-radius:18px;}.ct-body{padding:1rem;}.ct-footer{padding:0.75rem 1rem;}}
      `}</style>

      <div className="ct-overlay">
        <div className="ct-modal">

          <div className="ct-head">
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.1rem",marginBottom:"0.2rem"}}>
              📄 Finova Africa — 1 Year Savings Contract
            </div>
            <div style={{fontSize:"0.78rem",color:"#7a9bbf"}}>Weekly Savings Agreement · Effective {today}</div>
            <div style={{display:"flex",gap:"0.3rem",marginTop:"0.75rem"}}>
              {sections.map((s,i)=>(
                <div key={s.id} className={"ct-prog-step"+(i<section?" done":i===section?" active":"")}/>
              ))}
            </div>
          </div>

          <div className="ct-tabs">
            {sections.map((s,i)=>(
              <button key={s.id} className={"ct-tab"+(section===i?" active":i<section?" done":"")} onClick={()=>setSection(i)}>
                {i<section?"✓ ":""}{s.icon} {s.title}
              </button>
            ))}
          </div>

          <div className="ct-body" ref={scrollRef}>

            {section===0&&(
              <>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"1rem"}}>📋 Terms & Conditions</div>
                <div className="ct-highlight">This agreement is between <b>{userName}</b> and <b>Finova Africa Ltd</b>, effective <b>{today}</b>.</div>
                {[
                  {t:"1. Eligibility",            b:"You must be 18 years or older and have completed account registration on Finova Africa to enter this savings agreement."},
                  {t:"2. Weekly Contribution",     b:"The Saver agrees to contribute exactly $2 USDT every week for 52 consecutive weeks (1 full year). Total minimum contribution: $104 USDT."},
                  {t:"3. Late Payment Penalty",    b:"If a weekly payment is not made within 1 day of the due date, the Saver must pay DOUBLE ($4 USDT) for that missed week. The penalty cannot be waived under any circumstance."},
                  {t:"4. Contract Termination",    b:"If a Saver misses 5 or more weekly payments at any point during the contract, the contract is immediately and permanently terminated. Upon termination, all accrued interest and the $15 voucher are forfeited. Only the principal contributed is returned."},
                  {t:"5. No Early Withdrawal",     b:"Funds contributed to the savings plan are strictly locked for the 52-week contract period. No early withdrawal is permitted under any circumstances including personal emergencies or market conditions."},
                  {t:"6. Contract Duration",       b:"This contract is valid for exactly one year (52 weeks) from the date of signing. The maturity date is "+maturity+"."},
                ].map(c=>(
                  <div key={c.t} className="ct-clause">
                    <div className="ct-clause-title">{c.t}</div>
                    <div className="ct-clause-text">{c.b}</div>
                  </div>
                ))}
                <div className={"ct-check-row"+(checks.terms?" chk":"")} onClick={()=>toggleCheck("terms")}>
                  <div className={"ct-checkbox"+(checks.terms?" chk":"")}>{checks.terms?"✓":""}</div>
                  <div className="ct-check-text">I have read and agree to the <b>Terms & Conditions</b> including the penalty and termination rules.</div>
                </div>
              </>
            )}

            {section===1&&(
              <>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"1rem"}}>💰 Interest & Payout Terms</div>
                <div className="ct-highlight">
                  Save $2/week for 52 weeks and earn <b>45% APY</b> plus a <b>$15 cash/food voucher</b> at completion.
                </div>
                <div style={{background:"rgba(46,204,113,0.08)",border:"1px solid rgba(46,204,113,0.2)",borderRadius:"12px",padding:"1rem",marginBottom:"1rem"}}>
                  {[
                    {l:"Weekly Payment",       v:"$2 USDT"},
                    {l:"Total Weeks",          v:"52 Weeks"},
                    {l:"Total Contributed",    v:"$104 USDT"},
                    {l:"Interest Rate",        v:"45% APY"},
                    {l:"Interest Earned",      v:"~$46.80"},
                    {l:"Completion Voucher",   v:"$15 Cash/Food"},
                    {l:"Total Payout",         v:"$165.80"},
                    {l:"Late Payment Penalty", v:"$4 (double)"},
                    {l:"Miss 5 Weeks",         v:"Contract Terminated"},
                  ].map(r=>(
                    <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"0.4rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"0.82rem"}}>
                      <span style={{color:"#7a9bbf"}}>{r.l}</span>
                      <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:r.l==="Miss 5 Weeks"?"#e74c3c":r.l==="Late Payment Penalty"?"#e74c3c":"#e8f0fe"}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="ct-warning">
                  <b>⚠️ STRICT NO EARLY WITHDRAWAL</b>
                  Once funds are locked they CANNOT be withdrawn before the 52-week maturity date. Do not deposit funds you may need access to.
                </div>
                <div className="ct-warning">
                  <b>🚨 PENALTY RULES</b>
                  Miss payment by 1+ day = pay $4 that week. Miss 5 weeks total = contract terminated immediately and all interest is forfeited.
                </div>
                <div className={"ct-check-row"+(checks.interest?" chk":"")} onClick={()=>toggleCheck("interest")}>
                  <div className={"ct-checkbox"+(checks.interest?" chk":"")}>{checks.interest?"✓":""}</div>
                  <div className="ct-check-text">I understand the <b>Interest, Payout Terms, Penalty Rules</b> and the strict no early withdrawal policy.</div>
                </div>
              </>
            )}

            {section===2&&(
              <>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"1rem"}}>🪪 KYC Agreement</div>
                <div className="ct-highlight">Finova Africa is required by law to verify the identity of all users before processing financial transactions.</div>
                {[
                  {t:"7. Identity Verification", b:"You agree to provide accurate government-issued identification documents, proof of address, and a selfie when requested. Failure to complete KYC within 30 days may result in savings being held until verification is complete."},
                  {t:"8. AML/CFT Compliance",    b:"You confirm that all funds deposited are from legitimate sources and are not proceeds of money laundering, terrorism financing, fraud, or any illegal activity."},
                  {t:"9. Account Suspension",    b:"Finova Africa reserves the right to freeze accounts pending investigation if suspicious activity is detected. Funds may be held until investigation is complete."},
                  {t:"10. Data Accuracy",         b:"You are responsible for keeping your account information up to date. Changes must be reported within 14 days."},
                ].map(c=>(
                  <div key={c.t} className="ct-clause">
                    <div className="ct-clause-title">{c.t}</div>
                    <div className="ct-clause-text">{c.b}</div>
                  </div>
                ))}
                <div className={"ct-check-row"+(checks.kyc?" chk":"")} onClick={()=>toggleCheck("kyc")}>
                  <div className={"ct-checkbox"+(checks.kyc?" chk":"")}>{checks.kyc?"✓":""}</div>
                  <div className="ct-check-text">I agree to the <b>KYC Agreement</b> and confirm all information I provide is accurate and truthful.</div>
                </div>
              </>
            )}

            {section===3&&(
              <>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"1rem"}}>🔒 Privacy Policy</div>
                <div className="ct-highlight">Your data is protected under applicable data protection laws including NDPR and GDPR principles.</div>
                {[
                  {t:"11. Data Collection", b:"Finova Africa collects your name, email, phone number, government ID, proof of address, and transaction data for providing financial services and regulatory compliance."},
                  {t:"12. Data Usage",      b:"Your data is only used for account management, KYC verification, fraud prevention, and service improvement. We do not sell your personal data."},
                  {t:"13. Data Security",   b:"Finova Africa uses bank-grade AES-256 encryption, secure servers, and regular security audits to protect your data."},
                  {t:"14. Your Rights",     b:"You have the right to access, correct, or delete your personal data at any time by contacting support@finovaafrica.com."},
                ].map(c=>(
                  <div key={c.t} className="ct-clause">
                    <div className="ct-clause-title">{c.t}</div>
                    <div className="ct-clause-text">{c.b}</div>
                  </div>
                ))}
                <div className={"ct-check-row"+(checks.privacy?" chk":"")} onClick={()=>toggleCheck("privacy")}>
                  <div className={"ct-checkbox"+(checks.privacy?" chk":"")}>{checks.privacy?"✓":""}</div>
                  <div className="ct-check-text">I have read and consent to the <b>Privacy Policy</b> of Finova Africa.</div>
                </div>
              </>
            )}

            {section===4&&(
              <>
                {signed?(
                  <div style={{textAlign:"center",padding:"2rem 1rem"}}>
                    <div style={{width:"70px",height:"70px",borderRadius:"50%",background:"linear-gradient(135deg,#27ae60,#2ecc71)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",margin:"0 auto 1rem",boxShadow:"0 0 40px rgba(46,204,113,0.5)"}}>✅</div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.2rem",marginBottom:"0.4rem"}}>Contract Signed!</div>
                    <div style={{fontSize:"0.85rem",color:"#7a9bbf"}}>Setting up your account and wallet...</div>
                  </div>
                ):(
                  <>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"1rem"}}>✍️ Sign the Contract</div>
                    <div className="ct-highlight">By signing, you confirm you have read all sections and agree to be bound by this 1-year weekly savings contract.</div>
                    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1rem",marginBottom:"1rem"}}>
                      {[
                        {l:"Saver Name",       v:userName},
                        {l:"Contract Date",    v:today},
                        {l:"Maturity Date",    v:maturity},
                        {l:"Weekly Payment",   v:"$2 USDT"},
                        {l:"Late Penalty",     v:"$4 (double)"},
                        {l:"5 Misses",         v:"Terminated"},
                        {l:"Total Payout",     v:"$165.80"},
                        {l:"Early Withdrawal", v:"NOT PERMITTED"},
                      ].map(r=>(
                        <div key={r.l} className="ct-meta-row">
                          <span style={{color:"#7a9bbf"}}>{r.l}</span>
                          <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:r.l==="Early Withdrawal"||r.l==="5 Misses"?"#e74c3c":r.l==="Total Payout"?"#2ecc71":"#e8f0fe"}}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                    {!allChecked&&(
                      <div style={{background:"rgba(243,156,18,0.1)",border:"1px solid rgba(243,156,18,0.2)",borderRadius:"10px",padding:"0.75rem",fontSize:"0.78rem",color:"#f39c12",marginBottom:"1rem"}}>
                        ⚠️ Please go back and agree to all sections before signing.
                      </div>
                    )}
                    <div style={{marginTop:"0.5rem"}}>
                      <div style={{fontSize:"0.75rem",color:"#7a9bbf",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem"}}>Type your full name to sign</div>
                      <input
                        className={"ct-sig-input"+(signature.trim().toLowerCase()===userName.trim().toLowerCase()&&signature?" valid":"")}
                        placeholder={userName}
                        value={signature}
                        onChange={e=>{setSignature(e.target.value);setSigError("");}}
                      />
                      {sigError&&<div style={{fontSize:"0.76rem",color:"#e74c3c",marginTop:"0.4rem"}}>⚠️ {sigError}</div>}
                      <div style={{fontSize:"0.72rem",color:"#7a9bbf",marginTop:"0.4rem",textAlign:"center"}}>Type exactly: <b style={{color:"#2ecc71"}}>{userName}</b></div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {!signed&&(
            <div className="ct-footer">
              {section===0
                ?<button className="ct-btn-decline" onClick={onDecline}>Decline</button>
                :<button className="ct-btn-prev" onClick={()=>setSection(s=>s-1)}>← Back</button>
              }
              {section<4
                ?<button className="ct-btn-next" onClick={()=>{scrollRef.current?.scrollTo(0,0);setSection(s=>s+1);}}>Next →</button>
                :<button className="ct-btn-next"
                  disabled={!allChecked||signature.trim().toLowerCase()!==userName.trim().toLowerCase()}
                  style={{opacity:(!allChecked||signature.trim().toLowerCase()!==userName.trim().toLowerCase())?0.4:1}}
                  onClick={handleSign}>
                  ✍️ Sign & Create Account
                </button>
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
}
