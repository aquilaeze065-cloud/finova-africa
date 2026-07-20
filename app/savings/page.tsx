"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const WEEKLY_AMT = 3;
const PENALTY_AMT = 4;

export default function SavingsPage() {
  const router  = useRouter();
  const fileRef = useRef<any>(null);
  const [user,        setUser]       = useState<any>(null);
  const [savings,     setSavings]    = useState<any>(null);
  const [loading,     setLoading]    = useState(true);
  const [toast,       setToast]      = useState("");
  const [toastType,   setToastType]  = useState("ok");
  const [penaltyWeek, setPenaltyWeek]= useState<any>(null);
  const [screenshot,  setScreenshot] = useState<string|null>(null);
  const [submitting,  setSubmitting] = useState(false);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");
    setUser(u);
    const s = JSON.parse(localStorage.getItem("nexora_savings")||localStorage.getItem("finova_savings")||"null");
    if (s) {
      // Auto-update week statuses based on dates
      const now = new Date();
      s.weeks = s.weeks?.map((w:any)=>{
        if (w.status === "paid" || w.status === "penalty_pending") return w;
        const due   = new Date(w.due_date||w.dueDate);
        const grace = new Date(w.grace_date||w.graceDate||new Date(due.getTime()+86400000));
        if (now > grace && w.status !== "penalty") return {...w, status:"penalty"};
        if (now >= due && now <= grace && w.status === "upcoming") return {...w, status:"due"};
        return w;
      });
      setSavings(s);
      localStorage.setItem("nexora_savings", JSON.stringify(s));
    }
    setLoading(false);
  },[]);

  function showToast(msg:string, type="ok") {
    setToast(msg); setToastType(type);
    setTimeout(()=>setToast(""), 4000);
  }

  function payWeek(week:any) {
    if (!savings) return;

    // BLOCK if there's an unresolved penalty
    const hasPenalty = savings.weeks?.some((w:any)=>
      w.status === "penalty" || w.status === "penalty_pending"
    );
    if (hasPenalty && week.status !== "penalty") {
      showToast("⚠️ You have a pending penalty. Please pay the $4 USDT penalty first to unlock your savings.", "err");
      return;
    }

    // Handle penalty week
    if (week.status === "penalty") {
      setPenaltyWeek(week);
      return;
    }

    // Normal payment
    const updated = {...savings};
    updated.weeks = updated.weeks.map((w:any)=>
      w.week===week.week || w.week_number===week.week_number
        ? {...w, status:"paid", paid_amount:WEEKLY_AMT, paidAt:new Date().toISOString()}
        : w
    );
    updated.totalPaid = (updated.totalPaid||0) + WEEKLY_AMT;

    setSavings(updated);
    localStorage.setItem("nexora_savings", JSON.stringify(updated));
    localStorage.setItem("finova_savings", JSON.stringify(updated));
    showToast(`✅ Week ${week.week||week.week_number} paid! $${WEEKLY_AMT} USDT recorded.`);
  }

  function handlePenaltyFile(e:any) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setScreenshot(url);
    }
  }

  async function submitPenaltyPayment() {
    if (!penaltyWeek) return;
    setSubmitting(true);

    // Update locally to pending
    const updated = {...savings};
    updated.weeks = updated.weeks.map((w:any)=>
      w.week===penaltyWeek.week || w.week_number===penaltyWeek.week_number
        ? {...w, status:"penalty_pending"}
        : w
    );
    setSavings(updated);
    localStorage.setItem("nexora_savings", JSON.stringify(updated));
    localStorage.setItem("finova_savings", JSON.stringify(updated));

    // Save penalty payment for admin
    const pays = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
    pays.unshift({
      id:"pen_"+Date.now(),
      userId: user.id||user.userId,
      userName: user.name,
      userEmail: user.email,
      type:"penalty",
      weekNumber: penaltyWeek.week||penaltyWeek.week_number,
      amount: PENALTY_AMT,
      currency:"USDT",
      screenshot,
      status:"pending",
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem("nexora_payments", JSON.stringify(pays));

    setSubmitting(false);
    setPenaltyWeek(null);
    setScreenshot(null);
    showToast("⏳ Penalty payment submitted! Admin will verify within 24 hours.", "ok");
  }

  if (loading||!user) return (
    <div style={{minHeight:"100vh",background:"#050f0c",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"32px",height:"32px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const paidWeeks   = savings?.weeks?.filter((w:any)=>w.status==="paid").length||0;
  const penaltyWeeks= savings?.weeks?.filter((w:any)=>w.status==="penalty"||w.status==="penalty_pending").length||0;
  const totalPaid   = savings?.totalPaid||0;
  const progress    = Math.round((paidWeeks/52)*100);
  const interest    = +(totalPaid*0.35).toFixed(2);
  const hasPenalty  = penaltyWeeks > 0;
  const hasActivePenalty = savings?.weeks?.some((w:any)=>w.status==="penalty");
  const hasPendingPenalty= savings?.weeks?.some((w:any)=>w.status==="penalty_pending");

  const sc = (s:string) => {
    switch(s) {
      case "paid":            return {color:"#00c896", bg:"rgba(0,200,150,0.08)", label:"✓ Paid"};
      case "due":             return {color:"#f39c12", bg:"rgba(243,156,18,0.08)", label:"⏰ Due Now"};
      case "penalty":         return {color:"#ff4757", bg:"rgba(255,71,87,0.08)", label:"⚠️ Penalty"};
      case "penalty_pending": return {color:"#f39c12", bg:"rgba(243,156,18,0.08)", label:"⏳ Verifying"};
      default:                return {color:"#5a8a7a", bg:"rgba(0,200,150,0.03)", label:"○ Upcoming"};
    }
  };

  return (
    <MobileLayout activePage="Savings">
      <style>{`
        .sv-card{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:16px;padding:1.1rem;margin-bottom:0.85rem;}
        .sv-week{display:flex;align-items:center;gap:0.65rem;padding:0.75rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .sv-week:last-child{border-bottom:none;}
        .sv-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;}
        .sv-pay-btn{padding:0.32rem 0.75rem;border-radius:8px;border:none;cursor:pointer;font-size:0.72rem;font-weight:700;font-family:"Inter",sans-serif;transition:all 0.18s;flex-shrink:0;}
        .sv-pay-btn.primary{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
        .sv-pay-btn.danger{background:linear-gradient(135deg,#c03000,#ff4500);color:#fff;}
        .sv-pay-btn.disabled{background:rgba(255,255,255,0.06);color:#5a8a7a;cursor:not-allowed;}
        .sv-pay-btn.pending{background:rgba(243,156,18,0.1);color:#f39c12;border:1px solid rgba(243,156,18,0.2);}
        .sv-penalty-box{background:rgba(255,71,87,0.06);border:1px solid rgba(255,71,87,0.2);border-radius:14px;padding:1.2rem;margin-bottom:0.85rem;}
        .sv-lock-box{background:rgba(255,100,0,0.06);border:1px solid rgba(255,100,0,0.2);border-radius:12px;padding:0.9rem;margin-bottom:0.85rem;display:flex;gap:0.6rem;align-items:flex-start;}
        .sv-prog-track{height:8px;background:rgba(0,200,150,0.1);border-radius:8px;overflow:hidden;margin:0.4rem 0;}
        .sv-prog-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,#00a87a,#00c896);transition:width 0.5s;}
        .toast{position:fixed;top:70px;left:50%;transform:translateX(-50%);
          border-radius:12px;padding:0.65rem 1.2rem;font-weight:700;font-size:0.82rem;
          z-index:800;animation:tIn 0.3s ease;white-space:nowrap;max-width:90vw;text-align:center;}
        .toast.ok{background:#081a14;border:1px solid rgba(0,200,150,0.3);color:#00c896;}
        .toast.err{background:#1a0808;border:1px solid rgba(255,71,87,0.3);color:#ff4757;}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:flex-end;justify-content:center;padding:1rem;}
        .modal-card{background:#081a14;border:1px solid rgba(255,71,87,0.2);border-radius:20px 20px 16px 16px;padding:1.5rem;width:100%;max-width:420px;}
        .upload-box{border:2px dashed rgba(255,71,87,0.25);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;transition:all 0.2s;margin-bottom:0.85rem;}
        .upload-box:hover{border-color:rgba(255,71,87,0.45);background:rgba(255,71,87,0.04);}
        .upload-box.has{border-style:solid;border-color:rgba(0,200,150,0.3);}
        .upload-preview{width:100%;max-height:100px;object-fit:cover;border-radius:8px;margin-top:0.4rem;}
      `}</style>

      {toast&&<div className={`toast ${toastType}`}>{toast}</div>}

      {/* PENALTY PAYMENT MODAL */}
      {penaltyWeek&&(
        <div className="modal-ov" onClick={()=>setPenaltyWeek(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:"1rem",color:"#ff4757",marginBottom:"0.4rem"}}>
              ⚠️ Late Payment Penalty
            </div>
            <div style={{fontSize:"0.78rem",color:"#8a6a5a",lineHeight:1.5,marginBottom:"1rem"}}>
              Week {penaltyWeek.week||penaltyWeek.week_number} is overdue. You must pay a <b style={{color:"#ff4757"}}>$4 USDT penalty</b> to unlock your savings and continue your plan.
            </div>

            <div style={{background:"rgba(255,71,87,0.06)",border:"1px solid rgba(255,71,87,0.15)",borderRadius:"11px",padding:"0.85rem",marginBottom:"1rem"}}>
              {[
                ["Penalty Amount",  "$4 USDT"],
                ["Week Number",     `Week ${penaltyWeek.week||penaltyWeek.week_number}`],
                ["Reason",          "Late payment"],
                ["Payment Network", "USDT TRC-20 / ERC-20"],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"0.35rem 0",borderBottom:"1px solid rgba(255,71,87,0.08)",fontSize:"0.78rem"}}>
                  <span style={{color:"#8a6a5a"}}>{l}</span>
                  <span style={{fontWeight:600,color:l==="Penalty Amount"?"#ff4757":"#e8f8f4"}}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{fontSize:"0.72rem",color:"#8a6a5a",marginBottom:"0.5rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
              Upload Payment Screenshot *
            </div>
            <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handlePenaltyFile}/>
            <div className={"upload-box"+(screenshot?" has":"")} onClick={()=>fileRef.current?.click()}>
              {screenshot
                ?<><img src={screenshot} className="upload-preview" alt="proof"/><div style={{fontSize:"0.7rem",color:"#00c896",marginTop:"0.3rem",fontWeight:600}}>✓ Screenshot uploaded</div></>
                :<><div style={{fontSize:"1.4rem",marginBottom:"0.3rem"}}>📸</div><div style={{fontSize:"0.8rem",color:"#8a6a5a"}}>Tap to upload payment proof</div></>
              }
            </div>

            <button
              onClick={submitPenaltyPayment}
              disabled={!screenshot||submitting}
              style={{width:"100%",padding:"0.88rem",border:"none",borderRadius:"11px",background:"linear-gradient(135deg,#c03000,#ff4500)",fontWeight:700,fontSize:"0.92rem",color:"#fff",cursor:"pointer",marginBottom:"0.5rem",fontFamily:"Inter,sans-serif",opacity:!screenshot?0.5:1}}>
              {submitting?"Submitting...":"Submit Penalty Payment"}
            </button>
            <button onClick={()=>setPenaltyWeek(null)} style={{width:"100%",padding:"0.7rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",background:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.82rem",fontFamily:"Inter,sans-serif"}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{marginBottom:"0.9rem"}}>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:"#00c896",marginBottom:"0.15rem"}}>My Savings Plan</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>52-week savings · $3 USDT/week · 35% APY</div>
      </div>

      {/* PENALTY ALERT */}
      {hasActivePenalty&&(
        <div className="sv-lock-box">
          <span style={{fontSize:"1.2rem",flexShrink:0}}>🔒</span>
          <div>
            <div style={{fontWeight:700,fontSize:"0.84rem",color:"#ff8c00",marginBottom:"0.2rem"}}>Savings Locked — Penalty Required</div>
            <div style={{fontSize:"0.74rem",color:"#a06030",lineHeight:1.5}}>
              You have overdue payment(s). Pay the <b style={{color:"#ff4757"}}>$4 USDT penalty</b> to unlock your savings and continue. Click the week marked <span style={{color:"#ff4757"}}>⚠️ Penalty</span> below.
            </div>
          </div>
        </div>
      )}

      {hasPendingPenalty&&!hasActivePenalty&&(
        <div style={{background:"rgba(243,156,18,0.06)",border:"1px solid rgba(243,156,18,0.18)",borderRadius:"12px",padding:"0.85rem",marginBottom:"0.85rem",display:"flex",gap:"0.6rem",alignItems:"center"}}>
          <span style={{fontSize:"1.1rem"}}>⏳</span>
          <div style={{fontSize:"0.76rem",color:"#a08030",lineHeight:1.5}}>
            <b style={{color:"#f39c12"}}>Penalty payment under review.</b> Admin will verify within 24 hours. Your savings will unlock once approved.
          </div>
        </div>
      )}

      {/* PROGRESS CARD */}
      {savings&&(
        <div className="sv-card" style={{background:"linear-gradient(135deg,rgba(0,200,150,0.07),#081a14)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.75rem"}}>
            <div>
              <div style={{fontSize:"0.68rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em"}}>Total Saved</div>
              <div style={{fontWeight:800,fontSize:"1.3rem",color:"#e8f8f4"}}>${totalPaid.toFixed(2)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"0.68rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em"}}>Est. Interest</div>
              <div style={{fontWeight:800,fontSize:"1.3rem",color:"#00c896"}}>${interest.toFixed(2)}</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.68rem",color:"#4a7a6a",marginBottom:"0.25rem"}}>
            <span>Progress — {paidWeeks}/52 weeks</span>
            <span style={{color:"#00c896",fontWeight:700}}>{progress}%</span>
          </div>
          <div className="sv-prog-track"><div className="sv-prog-fill" style={{width:progress+"%"}}/></div>
          {penaltyWeeks>0&&(
            <div style={{marginTop:"0.5rem",fontSize:"0.7rem",color:"#ff4757",fontWeight:600}}>
              ⚠️ {penaltyWeeks} penalty week{penaltyWeeks>1?"s":""} — resolve to continue
            </div>
          )}
        </div>
      )}

      {/* SUMMARY STATS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem",marginBottom:"0.85rem"}}>
        {[
          {v:paidWeeks,     l:"Paid",     c:"#00c896"},
          {v:52-paidWeeks,  l:"Remaining",c:"#5a8a7a"},
          {v:penaltyWeeks,  l:"Penalty",  c:penaltyWeeks>0?"#ff4757":"#5a8a7a"},
        ].map(s=>(
          <div key={s.l} style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"12px",padding:"0.75rem",textAlign:"center"}}>
            <div style={{fontWeight:800,fontSize:"1.1rem",color:s.c}}>{s.v}</div>
            <div style={{fontSize:"0.62rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* WEEKS LIST */}
      {!savings?(
        <div className="sv-card" style={{textAlign:"center",padding:"2rem"}}>
          <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>💰</div>
          <div style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"0.4rem"}}>No Savings Plan Yet</div>
          <div style={{fontSize:"0.78rem",color:"#5a8a7a",marginBottom:"1rem"}}>Your plan activates after account approval.</div>
        </div>
      ):(
        <div className="sv-card">
          <div style={{fontWeight:600,fontSize:"0.72rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.6rem"}}>
            Weekly Payments
          </div>
          {savings.weeks?.slice(0,20).map((w:any)=>{
            const s   = sc(w.status);
            const wn  = w.week||w.week_number||0;
            const due = new Date(w.due_date||w.dueDate||Date.now());
            const isPenalty      = w.status==="penalty";
            const isPending      = w.status==="penalty_pending";
            const isPaid         = w.status==="paid";
            const isUpcoming     = w.status==="upcoming";
            const isDue          = w.status==="due";
            const hasOtherPenalty= savings.weeks?.some((x:any)=>x.status==="penalty" && (x.week||x.week_number)!==wn);

            return (
              <div key={wn} className="sv-week">
                <div className="sv-num" style={{background:s.bg,color:s.color}}>{wn}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:"0.82rem"}}>Week {wn}</div>
                  <div style={{fontSize:"0.67rem",color:"#5a8a7a"}}>
                    Due {due.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                    {isPenalty&&" · $4 USDT penalty"}
                    {isPending&&" · Awaiting verification"}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                  <span style={{fontSize:"0.65rem",fontWeight:700,color:s.color}}>{s.label}</span>
                  {!isPaid&&!isUpcoming&&(
                    <button
                      className={"sv-pay-btn "+(isPenalty?"danger":isPending?"pending":"disabled")}
                      onClick={()=>payWeek(w)}
                      disabled={isPending||(!isDue&&!isPenalty)||(hasOtherPenalty&&!isPenalty)}>
                      {isPenalty?"Pay $4":isPending?"Pending":isDue?"Pay $3":"—"}
                    </button>
                  )}
                  {isDue&&!hasOtherPenalty&&(
                    <button className="sv-pay-btn primary" onClick={()=>payWeek(w)}>
                      Pay $3
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MobileLayout>
  );
}
