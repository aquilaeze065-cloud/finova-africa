"use client";
import { useState, useEffect, useRef } from "react";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WithdrawPage() {
  const clearanceRef = useRef<HTMLInputElement>(null);
  const receiptRef   = useRef<HTMLInputElement>(null);

  const [eligibility,   setEligibility]   = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]     = useState(false);
  const [step,          setStep]          = useState<"check"|"form"|"submitted">("check");
  const [amount,        setAmount]        = useState("");
  const [wallet,        setWallet]        = useState("");
  const [network,       setNetwork]       = useState("TRC-20 (TRON)");
  const [clearanceImg,  setClearanceImg]  = useState("");
  const [receiptImg,    setReceiptImg]    = useState("");
  const [error,         setError]         = useState("");
  const [requests,      setRequests]      = useState<any[]>([]);
  const [toast,         setToast]         = useState("");

  useEffect(()=>{
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    if (!token) { window.location.replace("/login"); return; }

    // Check eligibility from backend
    fetch(`${API}/api/withdrawals/eligibility`,{headers:{"Authorization":`Bearer ${token}`}})
      .then(r=>r.json())
      .then(d=>{ setEligibility(d); setLoading(false); })
      .catch(()=>{
        // Fallback - check savings locally
        const savings = JSON.parse(localStorage.getItem("nexora_savings")||"null");
        const paidWeeks = savings?.weeks?.filter((w:any)=>w.status==="paid").length||0;
        setEligibility({
          eligible: paidWeeks>=52,
          planComplete: paidWeeks>=52,
          weeksCompleted: paidWeeks,
          weeksRequired: 52,
          weeksRemaining: Math.max(0,52-paidWeeks),
          totalSaved: savings?.totalPaid||0,
          reason: paidWeeks<52?"plan_incomplete":"eligible",
        });
        setLoading(false);
      });

    // Load existing requests
    fetch(`${API}/api/withdrawals/my-requests`,{headers:{"Authorization":`Bearer ${token}`}})
      .then(r=>r.json())
      .then(d=>{ if(d.requests) setRequests(d.requests); })
      .catch(()=>{});
  },[]);

  function handleFile(e:any, setter:(v:string)=>void) {
    const f=e.target.files?.[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=ev=>setter(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function showMsg(msg:string){ setToast(msg); setTimeout(()=>setToast(""),3500); }

  async function submitRequest() {
    if (!amount)       { setError("Enter withdrawal amount"); return; }
    if (!wallet)       { setError("Enter your wallet address"); return; }
    if (!clearanceImg) { setError("Upload your clearance form"); return; }
    if (!receiptImg)   { setError("Upload your payment receipt"); return; }
    setSubmitting(true); setError("");
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    try {
      const res  = await fetch(`${API}/api/withdrawals/request`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body:JSON.stringify({amount:parseFloat(amount),walletAddress:wallet,network,clearanceFormUrl:clearanceImg,paymentReceiptUrl:receiptImg}),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) { setError(data.error); return; }
      setStep("submitted");
      showMsg("✅ Withdrawal request submitted!");
    } catch {
      // Save locally
      const req = {id:"wr_"+Date.now(),amount,walletAddress:wallet,network,status:"pending",submittedAt:new Date().toISOString()};
      const prev = JSON.parse(localStorage.getItem("nexora_withdrawals")||"[]");
      prev.unshift(req); localStorage.setItem("nexora_withdrawals",JSON.stringify(prev));
      setRequests([req,...requests]);
      setStep("submitted"); setSubmitting(false);
    }
  }

  const G="#00c896";
  const inp:React.CSSProperties={width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.72rem 0.9rem",fontSize:"0.88rem",color:"#e8f8f4",fontFamily:"Inter,sans-serif",outline:"none",marginBottom:"0.75rem"};

  const statusColor=(s:string)=>s==="approved"?G:s==="rejected"?"#ff4757":"#f39c12";

  return (
    <MobileLayout activePage="Withdraw">
      <style>{`
        .wd-card{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:16px;padding:1.1rem;margin-bottom:0.85rem;}
        .wd-locked{background:rgba(255,71,87,0.04);border:1px solid rgba(255,71,87,0.2);border-radius:16px;padding:1.4rem;text-align:center;margin-bottom:0.85rem;}
        .wd-prog{height:8px;background:rgba(0,200,150,0.08);border-radius:8px;overflow:hidden;margin:0.5rem 0;}
        .wd-prog-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,#00a87a,#00c896);transition:width 0.5s;}
        .upload-box{border:2px dashed rgba(0,200,150,0.2);border-radius:12px;padding:0.85rem;text-align:center;cursor:pointer;margin-bottom:0.75rem;transition:all 0.2s;}
        .upload-box:hover{border-color:rgba(0,200,150,0.4);}
        .upload-box.has{border-style:solid;border-color:rgba(0,200,150,0.35);}
        .lbl{font-size:0.63rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:0.3rem;}
        .btn{width:100%;padding:0.85rem;border:none;border-radius:11px;background:linear-gradient(135deg,#00a87a,${G});font-weight:700;font-size:0.9rem;color:#050f0c;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;margin-bottom:0.5rem;}
        .btn:disabled{opacity:0.5;cursor:not-allowed;}
        .err{background:rgba(255,71,87,0.08);border:1px solid rgba(255,71,87,0.2);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.76rem;color:#ff4757;margin-bottom:0.75rem;}
        .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.6rem 1.2rem;font-weight:700;font-size:0.82rem;z-index:999;color:${G};white-space:nowrap;}
        @keyframes spin2{to{transform:rotate(360deg)}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <div style={{marginBottom:"1.1rem"}}>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:G,marginBottom:"0.15rem"}}>⬇️ Withdraw</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Request your savings payout</div>
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"3rem",color:"#5a8a7a"}}>
          <div style={{width:"28px",height:"28px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin2 0.8s linear infinite",margin:"0 auto 0.75rem"}}/>
          Checking eligibility...
        </div>
      ): eligibility && !eligibility.eligible ? (
        /* LOCKED STATE */
        <>
          <div className="wd-locked">
            <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>🔒</div>
            <div style={{fontWeight:800,fontSize:"1rem",color:"#ff4757",marginBottom:"0.5rem"}}>Withdrawal Locked</div>
            <div style={{fontSize:"0.82rem",color:"#8a5a5a",lineHeight:1.65,marginBottom:"1rem"}}>
              {eligibility.reason==="no_plan"
                ? "You don't have an active savings plan yet. Start your 52-week savings journey first."
                : `Withdrawals are only allowed after completing your full <b style={{color:"#e8f8f4"}}>52-week savings plan</b>. You have completed ${eligibility.weeksCompleted} of 52 weeks.`
              }
            </div>
            {eligibility.reason==="plan_incomplete"&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.78rem",color:"#8a5a5a",marginBottom:"0.3rem"}}>
                  <span>Progress</span>
                  <span style={{color:"#ff4757",fontWeight:700}}>{eligibility.weeksCompleted}/52 weeks</span>
                </div>
                <div className="wd-prog">
                  <div className="wd-prog-fill" style={{width:`${(eligibility.weeksCompleted/52)*100}%`,background:"linear-gradient(90deg,#c0392b,#ff4757)"}}/>
                </div>
                <div style={{fontSize:"0.75rem",color:"#8a5a5a",marginTop:"0.5rem"}}>
                  <b style={{color:"#e8f8f4"}}>{eligibility.weeksRemaining} more weeks</b> until withdrawal is unlocked
                  {eligibility.estimatedDate&&<> · Est. <b style={{color:"#e8f8f4"}}>{new Date(eligibility.estimatedDate).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</b></>}
                </div>
              </>
            )}
          </div>

          {/* WHAT TO DO */}
          <div className="wd-card">
            <div style={{fontWeight:700,fontSize:"0.86rem",marginBottom:"0.65rem"}}>📋 How to unlock withdrawal</div>
            {[
              "Continue making your $3 USDT weekly payments on time",
              "Avoid missing payments to prevent penalty fees",
              "Complete all 52 weeks of your savings contract",
              "Once complete, upload your clearance form and receipt to withdraw",
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"0.55rem",padding:"0.35rem 0",borderBottom:"1px solid rgba(0,200,150,0.05)",fontSize:"0.78rem",color:"#5a8a7a"}}>
                <span style={{color:G,flexShrink:0,fontSize:"0.75rem"}}>0{i+1}</span>{item}
              </div>
            ))}
          </div>

          <button onClick={()=>window.location.replace("/savings")} style={{width:"100%",padding:"0.85rem",border:"none",borderRadius:"11px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.9rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            💰 Continue Saving
          </button>
        </>
      ) : step==="submitted" ? (
        /* SUBMITTED STATE */
        <div className="wd-card" style={{textAlign:"center",padding:"2rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>✅</div>
          <div style={{fontWeight:700,fontSize:"1rem",color:G,marginBottom:"0.5rem"}}>Withdrawal Request Submitted!</div>
          <div style={{fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.65,marginBottom:"1.2rem"}}>
            Your documents are under review. Our team will process your withdrawal within <b style={{color:"#e8f8f4"}}>24-48 hours</b> and send payment to your wallet.
          </div>
          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"11px",padding:"0.9rem",textAlign:"left"}}>
            {["Documents received and queued for review","Admin verifies clearance form and receipt","Payment sent to your wallet address","Notification sent to confirm payment"].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:"0.5rem",padding:"0.3rem 0",fontSize:"0.76rem",color:"#5a8a7a"}}>
                <span style={{color:G,flexShrink:0}}>0{i+1}</span>{s}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ELIGIBLE - WITHDRAWAL FORM */
        <>
          {/* PLAN COMPLETE BANNER */}
          <div style={{background:"linear-gradient(135deg,rgba(0,200,150,0.12),rgba(0,102,255,0.06))",border:"1px solid rgba(0,200,150,0.25)",borderRadius:"14px",padding:"1rem",marginBottom:"1rem",display:"flex",gap:"0.75rem",alignItems:"center"}}>
            <span style={{fontSize:"2rem"}}>🏆</span>
            <div>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:G,marginBottom:"0.1rem"}}>Plan Complete! Ready to Withdraw</div>
              <div style={{fontSize:"0.74rem",color:"#5a8a7a"}}>
                {eligibility?.weeksCompleted} weeks completed · ${eligibility?.totalSaved?.toFixed(2)||"0.00"} total saved
              </div>
            </div>
          </div>

          {error&&<div className="err">⚠️ {error}</div>}

          {/* AMOUNT */}
          <label className="lbl">Withdrawal Amount (USDT)</label>
          <input style={inp} type="number" placeholder="Enter amount to withdraw" value={amount} onChange={e=>setAmount(e.target.value)}/>

          {/* WALLET */}
          <label className="lbl">Your Wallet Address</label>
          <input style={inp} placeholder="Your USDT wallet address" value={wallet} onChange={e=>setWallet(e.target.value)}/>

          {/* NETWORK */}
          <label className="lbl">Network</label>
          <select style={{...inp,cursor:"pointer"}} value={network} onChange={e=>setNetwork(e.target.value)}>
            <option>TRC-20 (TRON)</option>
            <option>ERC-20 (Ethereum)</option>
            <option>BEP-20 (BSC)</option>
            <option>Bitcoin Network</option>
          </select>

          {/* CLEARANCE FORM */}
          <label className="lbl">Clearance Form * (Upload signed clearance document)</label>
          <input type="file" accept="image/*,application/pdf" ref={clearanceRef} style={{display:"none"}} onChange={e=>handleFile(e,setClearanceImg)}/>
          <div className={"upload-box"+(clearanceImg?" has":"")} onClick={()=>clearanceRef.current?.click()}>
            {clearanceImg?(
              <>
                <div style={{fontSize:"1.4rem",marginBottom:"0.25rem"}}>📄</div>
                <div style={{fontSize:"0.76rem",color:G,fontWeight:600}}>✓ Clearance form uploaded</div>
                <div style={{fontSize:"0.65rem",color:"#5a8a7a"}}>Tap to change</div>
              </>
            ):(
              <>
                <div style={{fontSize:"1.5rem",marginBottom:"0.3rem"}}>📋</div>
                <div style={{fontWeight:600,fontSize:"0.82rem",color:"#e8f8f4",marginBottom:"0.15rem"}}>Upload Clearance Form</div>
                <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>Download, sign, and upload your clearance document</div>
              </>
            )}
          </div>

          {/* PAYMENT RECEIPT */}
          <label className="lbl">Payment Receipt * (Proof of your last savings payment)</label>
          <input type="file" accept="image/*" ref={receiptRef} style={{display:"none"}} onChange={e=>handleFile(e,setReceiptImg)}/>
          <div className={"upload-box"+(receiptImg?" has":"")} onClick={()=>receiptRef.current?.click()}>
            {receiptImg?(
              <>
                <img src={receiptImg} style={{maxHeight:"80px",borderRadius:"6px",objectFit:"contain",marginBottom:"0.25rem"}} alt="receipt"/>
                <div style={{fontSize:"0.72rem",color:G,fontWeight:600}}>✓ Receipt uploaded</div>
              </>
            ):(
              <>
                <div style={{fontSize:"1.5rem",marginBottom:"0.3rem"}}>🧾</div>
                <div style={{fontWeight:600,fontSize:"0.82rem",color:"#e8f8f4",marginBottom:"0.15rem"}}>Upload Payment Receipt</div>
                <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>Screenshot of your most recent savings payment</div>
              </>
            )}
          </div>

          <div style={{background:"rgba(255,165,0,0.05)",border:"1px solid rgba(255,165,0,0.15)",borderRadius:"10px",padding:"0.75rem",marginBottom:"0.85rem",fontSize:"0.74rem",color:"#a08030",lineHeight:1.6}}>
            ⚠️ Both the <b>clearance form</b> and <b>payment receipt</b> are required. Incomplete submissions will be rejected. Processing takes 24-48 hours.
          </div>

          <button className="btn" onClick={submitRequest} disabled={!amount||!wallet||!clearanceImg||!receiptImg||submitting}>
            {submitting
              ?<><span style={{width:"16px",height:"16px",border:"2px solid rgba(5,15,12,0.3)",borderTop:"2px solid #050f0c",borderRadius:"50%",display:"inline-block",animation:"spin2 0.7s linear infinite",marginRight:"0.4rem"}}/>Submitting...</>
              :"Submit Withdrawal Request"
            }
          </button>
        </>
      )}

      {/* PREVIOUS REQUESTS */}
      {requests.length>0&&(
        <div className="wd-card" style={{marginTop:"1rem"}}>
          <div style={{fontWeight:700,fontSize:"0.82rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.65rem"}}>Previous Requests</div>
          {requests.map((r:any,i:number)=>(
            <div key={r.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.55rem 0",borderBottom:"1px solid rgba(0,200,150,0.05)",fontSize:"0.78rem"}}>
              <div>
                <div style={{fontWeight:600}}>${parseFloat(r.amount||0).toFixed(2)} USDT</div>
                <div style={{fontSize:"0.66rem",color:"#5a8a7a"}}>{new Date(r.created_at||r.submittedAt||Date.now()).toLocaleDateString("en-GB")}</div>
              </div>
              <span style={{padding:"0.2rem 0.6rem",borderRadius:"20px",fontSize:"0.65rem",fontWeight:700,color:statusColor(r.status),background:`${statusColor(r.status)}18`,border:`1px solid ${statusColor(r.status)}44`}}>
                {r.status?.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </MobileLayout>
  );
}
