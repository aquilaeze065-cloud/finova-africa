"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const WEEKLY_AMOUNT   = 2;
const PENALTY_AMOUNT  = 4;
const TOTAL_WEEKS     = 52;
const APY             = 45;
const VOUCHER         = 15;
const MAX_MISSES      = 5;
const GRACE_DAYS      = 1;

function generateWeeks(startDate: any) {
  const weeks = [];
  for (let i = 0; i < TOTAL_WEEKS; i++) {
    const due = new Date(startDate);
    due.setDate(due.getDate() + i * 7);
    const grace = new Date(due);
    grace.setDate(grace.getDate() + GRACE_DAYS);
    weeks.push({
      week:       i + 1,
      dueDate:    due.toISOString(),
      graceDate:  grace.toISOString(),
      status:     "upcoming",
      paidAmount: 0,
      paidAt:     null,
      penalty:    false,
    });
  }
  return weeks;
}

export default function SavingsPage() {
  const router  = useRouter();
  const [plan,   setPlan]   = useState(null);
  const [paying, setPaying] = useState(null);
  const [modal,  setModal]  = useState(null);
  const [toast,  setToast]  = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("finova_savings");
    if (saved) {
      const p = JSON.parse(saved);
      p.weeks = p.weeks.map((w: any) => ({
        ...w,
        dueDate:   new Date(w.dueDate),
        graceDate: new Date(w.graceDate),
        paidAt:    w.paidAt ? new Date(w.paidAt) : null,
      }));
      setPlan(p);
    }
  }, []);

  function savePlan(p: any) {
    localStorage.setItem("finova_savings", JSON.stringify(p));
    setPlan({...p});
  }

  function startPlan() {
    const now   = new Date();
    const weeks = generateWeeks(now);
    const newPlan = {
      startDate:    now.toISOString(),
      endDate:      new Date(now.getTime()+52*7*86400000).toISOString(),
      status:       "active",
      totalPaid:    0,
      missedWeeks:  0,
      penaltyWeeks: 0,
      weeks:        weeks,
    };
    savePlan(newPlan);
    showToast("Savings plan started! First payment due today.");
  }

  function payWeek(weekIdx: any) {
    if (!plan) return;
    const now    = new Date();
    const week   = plan.weeks[weekIdx];
    const isPenalty = week.status === "penalty";
    const amount    = isPenalty ? PENALTY_AMOUNT : WEEKLY_AMOUNT;
    setPaying(weekIdx);
    setTimeout(() => {
      const updated = {...plan};
      updated.weeks  = [...plan.weeks];
      updated.weeks[weekIdx] = {
        ...week,
        status:     "paid",
        paidAmount: amount,
        paidAt:     now.toISOString(),
        penalty:    isPenalty,
      };
      updated.totalPaid += amount;
      if (isPenalty) updated.penaltyWeeks += 1;

      // Check if contract complete
      const paidCount = updated.weeks.filter((w: any) =>w.status==="paid").length;
      if (paidCount === TOTAL_WEEKS) updated.status = "completed";

      savePlan(updated);
      setPaying(null);
      showToast(isPenalty ? "Penalty paid! Back on track." : "Week "+week.week+" paid!");
    }, 1500);
  }

  function syncStatuses() {
    if (!plan || plan.status !== "active") return;
    const now     = new Date();
    const updated = {...plan, weeks: [...plan.weeks]};
    let missed    = 0;

    updated.weeks = updated.weeks.map((w: any) => {
      if (w.status === "paid") return w;
      const due   = new Date(w.dueDate);
      const grace = new Date(w.graceDate);
      if (now > grace && w.status !== "penalty") {
        missed++;
        return {...w, status:"penalty"};
      }
      if (now >= due && now <= grace && w.status === "upcoming") {
        return {...w, status:"due"};
      }
      return w;
    });

    updated.missedWeeks = updated.weeks.filter((w: any) =>w.status==="penalty"||w.status==="missed").length;
    if (updated.missedWeeks >= MAX_MISSES && updated.status === "active") {
      updated.status = "terminated";
    }
    savePlan(updated);
  }

  useEffect(() => { syncStatuses(); }, [plan?.status]);

  function showToast(msg: any) {
    setToast(msg);
    setTimeout(()=>setToast(""),3000);
  }

  const now          = new Date();
  const paidWeeks    = plan ? plan.weeks.filter((w: any) =>w.status==="paid").length : 0;
  const dueWeeks     = plan ? plan.weeks.filter((w: any) =>w.status==="due"||w.status==="penalty") : [];
  const missedCount  = plan ? plan.weeks.filter((w: any) =>w.status==="penalty").length : 0;
  const progress     = Math.round((paidWeeks/TOTAL_WEEKS)*100);
  const totalContrib = plan ? plan.totalPaid : 0;
  const interest     = +(totalContrib*(APY/100)).toFixed(2);
  const projectedEnd = +(WEEKLY_AMOUNT*TOTAL_WEEKS*(1+APY/100)+VOUCHER).toFixed(2);
  const weeksLeft    = TOTAL_WEEKS - paidWeeks;
  const endDate      = plan ? new Date(plan.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "";

  const statusColor = (s) =>
    s==="paid"?"#2ecc71":s==="due"?"#f39c12":s==="penalty"?"#e74c3c":s==="upcoming"?"#7a9bbf":"#e74c3c";
  const statusLabel = (s) =>
    s==="paid"?"✓ Paid":s==="due"?"⏰ Due Now":s==="penalty"?"⚠️ Pay $4 (Penalty)":s==="upcoming"?"Upcoming":"Missed";
  const statusBg = (s) =>
    s==="paid"?"rgba(46,204,113,0.1)":s==="due"?"rgba(243,156,18,0.1)":s==="penalty"?"rgba(231,76,60,0.1)":"rgba(255,255,255,0.03)";

  return (
    <MobileLayout activePage="Savings">
      <style>{`
        .sv-hero{background:linear-gradient(135deg,rgba(46,204,113,0.12),rgba(15,32,56,0.95));border:1px solid rgba(46,204,113,0.2);border-radius:20px;padding:1.4rem;margin-bottom:1.2rem;position:relative;overflow:hidden;}
        .sv-hero::before{content:"";position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(46,204,113,0.12),transparent 70%);}
        .sv-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.7rem;margin-bottom:1.2rem;}
        .sv-stat{background:#0a1628;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:0.85rem;text-align:center;}
        .sv-stat-val{font-family:"Syne",sans-serif;font-weight:800;font-size:1rem;margin-bottom:0.15rem;}
        .sv-stat-label{font-size:0.68rem;color:#7a9bbf;line-height:1.3;}
        .sv-prog-wrap{margin:1rem 0 0.4rem;}
        .sv-prog-row{display:flex;justify-content:space-between;font-size:0.73rem;color:#7a9bbf;margin-bottom:0.35rem;}
        .sv-prog-track{height:8px;background:rgba(255,255,255,0.07);border-radius:10px;overflow:hidden;}
        .sv-prog-fill{height:100%;border-radius:10px;background:linear-gradient(90deg,#27ae60,#2ecc71);transition:width 0.5s;}
        .sv-week-row{display:flex;align-items:center;gap:0.7rem;padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
        .sv-week-row:last-child{border-bottom:none;}
        .sv-week-row:hover{background:rgba(255,255,255,0.02);}
        .sv-week-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Syne",sans-serif;font-weight:700;font-size:0.75rem;flex-shrink:0;}
        .sv-week-info{flex:1;min-width:0;}
        .sv-week-title{font-family:"Syne",sans-serif;font-weight:700;font-size:0.84rem;}
        .sv-week-date{font-size:0.7rem;color:#7a9bbf;margin-top:0.1rem;}
        .sv-badge{padding:0.2rem 0.55rem;border-radius:20px;font-size:0.68rem;font-weight:700;font-family:"Syne",sans-serif;white-space:nowrap;border:1px solid;}
        .sv-pay-btn{padding:0.4rem 0.9rem;border:none;border-radius:9px;font-family:"Syne",sans-serif;font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.18s;white-space:nowrap;flex-shrink:0;}
        .sv-pay-btn:hover{transform:translateY(-1px);}
        .sv-alert{border-radius:14px;padding:0.9rem 1rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:0.65rem;}
        .sv-alert-icon{font-size:1.2rem;flex-shrink:0;}
        .sv-alert-title{font-family:"Syne",sans-serif;font-weight:700;font-size:0.88rem;margin-bottom:0.2rem;}
        .sv-alert-body{font-size:0.78rem;color:#7a9bbf;line-height:1.45;}
        .sv-voucher{background:linear-gradient(135deg,rgba(243,156,18,0.12),rgba(15,32,56,0.9));border:1px solid rgba(243,156,18,0.25);border-radius:16px;padding:1.1rem;display:flex;align-items:center;gap:0.85rem;margin-bottom:1.2rem;}
        .sv-voucher-icon{width:48px;height:48px;border-radius:12px;background:rgba(243,156,18,0.15);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
        .sv-start-card{text-align:center;padding:2.5rem 1.5rem;}
        .toast{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 90px);left:50%;transform:translateX(-50%);background:#0d1b2e;border:1px solid rgba(46,204,113,0.3);border-radius:12px;padding:0.65rem 1.3rem;font-family:"Syne",sans-serif;font-weight:700;font-size:0.85rem;z-index:800;animation:tIn 0.3s ease;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .spinner{width:14px;height:14px;border:2px solid rgba(5,16,10,0.3);border-top-color:#05100a;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.sv-stats-grid{grid-template-columns:1fr 1fr;}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <h1 className="r-page-title">💰 Weekly Savings</h1>
      <p className="r-page-sub">Save $2/week · Earn 45% APY · Get $15 voucher</p>

      {/* NO PLAN YET */}
      {!plan&&(
        <div className="r-card">
          <div className="sv-start-card">
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🏦</div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.2rem",marginBottom:"0.5rem"}}>Start Your Savings Journey</div>
            <div style={{fontSize:"0.85rem",color:"#7a9bbf",marginBottom:"1.5rem",lineHeight:1.6,maxWidth:"320px",margin:"0 auto 1.5rem"}}>
              Save just $2 USDT every week for 52 weeks and earn 45% interest plus a $15 cash/food voucher.
            </div>

            {/* Plan summary */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1.5rem",textAlign:"left"}}>
              {[
                {icon:"📅",label:"Weekly Payment",val:"$2 USDT"},
                {icon:"📆",label:"Duration",val:"52 Weeks"},
                {icon:"💸",label:"Total Contributed",val:"$104"},
                {icon:"📈",label:"Interest Rate",val:"45% APY"},
                {icon:"💰",label:"Interest Earned",val:"~$46.80"},
                {icon:"🎁",label:"Bonus Voucher",val:"$15"},
                {icon:"⚠️",label:"Late Payment",val:"Pay $4 (double)"},
                {icon:"🚫",label:"5 Misses",val:"Contract ends"},
              ].map((r: any) =>(
                <div key={r.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"0.75rem"}}>
                  <div style={{fontSize:"1.1rem",marginBottom:"0.3rem"}}>{r.icon}</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"0.9rem",color:"#2ecc71"}}>{r.val}</div>
                  <div style={{fontSize:"0.68rem",color:"#7a9bbf"}}>{r.label}</div>
                </div>
              ))}
            </div>

            <div style={{background:"rgba(46,204,113,0.08)",border:"1px solid rgba(46,204,113,0.2)",borderRadius:"12px",padding:"1rem",marginBottom:"1.5rem",textAlign:"left"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"0.95rem",marginBottom:"0.5rem",color:"#2ecc71"}}>💵 Total Payout at 52 Weeks</div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.8rem",color:"#e8f0fe"}}>$165.80</div>
              <div style={{fontSize:"0.75rem",color:"#7a9bbf",marginTop:"0.3rem"}}>$104 contributed + $46.80 interest + $15 voucher</div>
            </div>

            <button onClick={startPlan} style={{width:"100%",padding:"0.95rem",border:"none",borderRadius:"13px",background:"linear-gradient(90deg,#27ae60,#2ecc71)",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",color:"#05100a",cursor:"pointer",boxShadow:"0 0 24px rgba(46,204,113,0.35)"}}>
              Start Saving Now 🚀
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE PLAN */}
      {plan&&plan.status==="active"&&(
        <>
          {/* HERO CARD */}
          <div className="sv-hero">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
              <div>
                <div style={{fontSize:"0.75rem",color:"#7a9bbf",marginBottom:"0.2rem"}}>Total Saved</div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.7rem"}}>
                  ${totalContrib.toFixed(2)}
                  <span style={{fontSize:"0.85rem",color:"#7a9bbf",fontWeight:400}}> / $104.00</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.1rem",color:"#2ecc71"}}>45% APY</div>
                <div style={{fontSize:"0.72rem",color:"#7a9bbf"}}>Ends {endDate}</div>
              </div>
            </div>
            <div className="sv-prog-wrap">
              <div className="sv-prog-row">
                <span>Progress</span>
                <span style={{color:"#2ecc71",fontWeight:700}}>{paidWeeks}/{TOTAL_WEEKS} weeks · {progress}%</span>
              </div>
              <div className="sv-prog-track">
                <div className="sv-prog-fill" style={{width:progress+"%"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:"0.4rem",marginTop:"0.6rem",flexWrap:"wrap"}}>
              {missedCount>0&&<span style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.25)",borderRadius:"20px",padding:"0.2rem 0.6rem",fontSize:"0.7rem",color:"#e74c3c",fontWeight:700}}>⚠️ {missedCount} penalty week{missedCount>1?"s":""}</span>}
              <span style={{background:"rgba(46,204,113,0.1)",border:"1px solid rgba(46,204,113,0.2)",borderRadius:"20px",padding:"0.2rem 0.6rem",fontSize:"0.7rem",color:"#2ecc71",fontWeight:700}}>{weeksLeft} weeks left</span>
              {missedCount>=3&&<span style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.25)",borderRadius:"20px",padding:"0.2rem 0.6rem",fontSize:"0.7rem",color:"#e74c3c",fontWeight:700}}>🚨 {MAX_MISSES-missedCount} miss{MAX_MISSES-missedCount===1?"":"es"} left before termination</span>}
            </div>
          </div>

          {/* STATS */}
          <div className="sv-stats-grid">
            <div className="sv-stat">
              <div className="sv-stat-val" style={{color:"#2ecc71"}}>${totalContrib.toFixed(2)}</div>
              <div className="sv-stat-label">Total Paid</div>
            </div>
            <div className="sv-stat">
              <div className="sv-stat-val" style={{color:"#f39c12"}}>${interest.toFixed(2)}</div>
              <div className="sv-stat-label">Est. Interest</div>
            </div>
            <div className="sv-stat">
              <div className="sv-stat-val" style={{color:"#e74c3c"}}>{missedCount}</div>
              <div className="sv-stat-label">Penalties</div>
            </div>
          </div>

          {/* PENALTY ALERT */}
          {dueWeeks.filter((w: any) =>w.status==="penalty").length>0&&(
            <div className="sv-alert" style={{background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)"}}>
              <div className="sv-alert-icon">🚨</div>
              <div>
                <div className="sv-alert-title" style={{color:"#e74c3c"}}>Penalty Payment Required!</div>
                <div className="sv-alert-body">You missed a payment deadline. You must now pay <b style={{color:"#e74c3c"}}>$4 USDT</b> (double) for each missed week. After {MAX_MISSES} misses your contract will be terminated.</div>
              </div>
            </div>
          )}

          {/* DUE ALERT */}
          {dueWeeks.filter((w: any) =>w.status==="due").length>0&&(
            <div className="sv-alert" style={{background:"rgba(243,156,18,0.08)",border:"1px solid rgba(243,156,18,0.2)"}}>
              <div className="sv-alert-icon">⏰</div>
              <div>
                <div className="sv-alert-title" style={{color:"#f39c12"}}>Payment Due!</div>
                <div className="sv-alert-body">Your weekly $2 USDT payment is due. You have a 1-day grace period. Pay now to avoid the $4 penalty.</div>
              </div>
            </div>
          )}

          {/* VOUCHER CARD */}
          <div className="sv-voucher">
            <div className="sv-voucher-icon">🎁</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.2rem"}}>$15 Cash/Food Voucher</div>
              <div style={{fontSize:"0.75rem",color:"#7a9bbf"}}>Unlocks when you complete all 52 weeks</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.1rem",color:"#f39c12"}}>{progress}%</div>
              <div style={{fontSize:"0.68rem",color:"#7a9bbf"}}>progress</div>
            </div>
          </div>

          {/* WEEKLY SCHEDULE */}
          <div className="r-card">
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"1rem",marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              Weekly Schedule
              <span style={{fontSize:"0.75rem",color:"#7a9bbf",fontWeight:400}}>{TOTAL_WEEKS} weeks total</span>
            </div>

            {/* Show due/penalty first, then upcoming (max 8), then paid (collapsed) */}
            {[
              ...plan.weeks.filter((w: any) =>w.status==="penalty"||w.status==="due"),
              ...plan.weeks.filter((w: any) =>w.status==="upcoming").slice(0,4),
              ...plan.weeks.filter((w: any) =>w.status==="paid").slice(-4),
            ].sort((a,b)=>a.week-b.week).map((week,i)=>(
              <div key={week.week} className="sv-week-row">
                <div className="sv-week-num" style={{background:statusBg(week.status),color:statusColor(week.status)}}>
                  {week.week}
                </div>
                <div className="sv-week-info">
                  <div className="sv-week-title">
                    Week {week.week}
                    {week.penalty&&week.status==="paid"&&<span style={{fontSize:"0.68rem",color:"#e74c3c",marginLeft:"0.4rem"}}>(penalty paid)</span>}
                  </div>
                  <div className="sv-week-date">
                    Due: {new Date(week.dueDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                    {week.status==="paid"&&week.paidAt&&<span style={{color:"#2ecc71",marginLeft:"0.4rem"}}>· Paid {new Date(week.paidAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexShrink:0}}>
                  <span className="sv-badge" style={{color:statusColor(week.status),borderColor:statusColor(week.status),background:statusBg(week.status)}}>
                    {statusLabel(week.status)}
                  </span>
                  {(week.status==="due"||week.status==="penalty")&&(
                    <button className="sv-pay-btn"
                      disabled={paying===i}
                      onClick={()=>payWeek(plan.weeks.indexOf(week))}
                      style={{background:week.status==="penalty"?"linear-gradient(90deg,#c0392b,#e74c3c)":"linear-gradient(90deg,#27ae60,#2ecc71)",color:week.status==="penalty"?"#fff":"#05100a"}}>
                      {paying===plan.weeks.indexOf(week)?<div className="spinner"/>:week.status==="penalty"?"Pay $4":"Pay $2"}
                    </button>
                  )}
                  {week.status==="paid"&&(
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.82rem",color:"#2ecc71"}}>${week.paidAmount}</span>
                  )}
                </div>
              </div>
            ))}

            {plan.weeks.filter((w: any) =>w.status==="upcoming").length>4&&(
              <div style={{textAlign:"center",padding:"0.75rem",fontSize:"0.78rem",color:"#7a9bbf"}}>
                + {plan.weeks.filter((w: any) =>w.status==="upcoming").length-4} more upcoming weeks
              </div>
            )}
          </div>
        </>
      )}

      {/* TERMINATED */}
      {plan&&plan.status==="terminated"&&(
        <div className="r-card" style={{textAlign:"center",padding:"2.5rem 1.5rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"1rem"}}>❌</div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.2rem",color:"#e74c3c",marginBottom:"0.5rem"}}>Contract Terminated</div>
          <div style={{fontSize:"0.85rem",color:"#7a9bbf",marginBottom:"1.5rem",lineHeight:1.6}}>
            Your savings contract was terminated due to 5 consecutive missed payments.
            You contributed ${totalContrib.toFixed(2)} before termination.
          </div>
          <div style={{background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)",borderRadius:"12px",padding:"1rem",marginBottom:"1.5rem"}}>
            <div style={{fontSize:"0.8rem",color:"#7a9bbf",marginBottom:"0.3rem"}}>Amount contributed before termination</div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.3rem"}}>${totalContrib.toFixed(2)}</div>
            <div style={{fontSize:"0.75rem",color:"#e74c3c",marginTop:"0.3rem"}}>Interest and voucher forfeited due to termination</div>
          </div>
          <button onClick={()=>{localStorage.removeItem("finova_savings");setPlan(null);}} style={{width:"100%",padding:"0.9rem",border:"none",borderRadius:"13px",background:"linear-gradient(90deg,#27ae60,#2ecc71)",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",color:"#05100a",cursor:"pointer"}}>
            Start New Contract
          </button>
        </div>
      )}

      {/* COMPLETED */}
      {plan&&plan.status==="completed"&&(
        <div className="r-card" style={{textAlign:"center",padding:"2.5rem 1.5rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🎉</div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#2ecc71",marginBottom:"0.5rem"}}>Contract Complete!</div>
          <div style={{fontSize:"0.85rem",color:"#7a9bbf",marginBottom:"1.5rem"}}>Congratulations! You completed all 52 weeks.</div>
          {[
            {l:"Total Contributed", v:"$104.00",     c:"#e8f0fe"},
            {l:"Interest Earned",   v:"$46.80",      c:"#2ecc71"},
            {l:"Bonus Voucher",     v:"$15.00",      c:"#f39c12"},
            {l:"Total Payout",      v:"$165.80",     c:"#2ecc71"},
          ].map((r: any) =>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"0.6rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"0.88rem"}}>
              <span style={{color:"#7a9bbf"}}>{r.l}</span>
              <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:r.c}}>{r.v}</span>
            </div>
          ))}
          <div style={{background:"rgba(243,156,18,0.1)",border:"1px solid rgba(243,156,18,0.25)",borderRadius:"12px",padding:"1rem",margin:"1.2rem 0"}}>
            <div style={{fontSize:"1.5rem",marginBottom:"0.4rem"}}>🎁</div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:"0.2rem"}}>Your $15 Voucher is Ready!</div>
            <div style={{fontSize:"0.78rem",color:"#7a9bbf"}}>Check your email for your cash/food voucher code</div>
          </div>
          <button onClick={()=>router.push("/dashboard")} style={{width:"100%",padding:"0.9rem",border:"none",borderRadius:"13px",background:"linear-gradient(90deg,#27ae60,#2ecc71)",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",color:"#05100a",cursor:"pointer"}}>
            Back to Dashboard
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
