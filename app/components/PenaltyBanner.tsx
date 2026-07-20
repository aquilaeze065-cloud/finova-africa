"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PenaltyBanner() {
  const router = useRouter();
  const [penalties, setPenalties] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(()=>{
    function checkPenalties() {
      try {
        const savings = JSON.parse(
          localStorage.getItem("nexora_savings") ||
          localStorage.getItem("finova_savings") || "null"
        );
        if (!savings?.weeks) return;

        const now = new Date();
        const penaltyWeeks = savings.weeks.filter((w:any)=>
          w.status === "penalty" || w.status === "penalty_pending" ||
          (w.status !== "paid" && new Date(w.due_date||w.dueDate) < now)
        );
        setPenalties(penaltyWeeks);
      } catch {}
    }
    checkPenalties();
    const t = setInterval(checkPenalties, 30000);
    return ()=>clearInterval(t);
  },[]);

  if (penalties.length === 0 || dismissed) return null;

  const hasPending  = penalties.some(w=>w.status==="penalty_pending");
  const hasUnpaid   = penalties.some(w=>w.status==="penalty");
  const count       = penalties.length;

  return (
    <>
      <style>{`
        .pb-wrap{
          position:fixed;bottom:0;left:0;right:0;z-index:998;
          background:linear-gradient(135deg,#1a0800,#2a1000);
          border-top:2px solid rgba(255,100,0,0.4);
          padding:0.65rem 1rem;
          display:flex;align-items:center;gap:0.75rem;
          box-shadow:0 -4px 24px rgba(255,100,0,0.15);
          animation:pb-slide 0.3s ease;
        }
        @keyframes pb-slide{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .pb-icon{font-size:1.2rem;flex-shrink:0;animation:pb-shake 2s infinite;}
        @keyframes pb-shake{0%,100%{transform:rotate(0)}10%,30%,50%{transform:rotate(-8deg)}20%,40%{transform:rotate(8deg)}}
        .pb-text{flex:1;min-width:0;}
        .pb-title{font-weight:700;font-size:0.8rem;color:#ff8c00;margin-bottom:0.1rem;}
        .pb-sub{font-size:0.68rem;color:#a06030;line-height:1.4;}
        .pb-btn{padding:0.4rem 0.85rem;border:none;border-radius:8px;
          background:linear-gradient(135deg,#c05000,#ff6600);
          color:#fff;font-weight:700;font-size:0.72rem;cursor:pointer;
          white-space:nowrap;flex-shrink:0;font-family:"Inter",sans-serif;
          transition:all 0.18s;}
        .pb-btn:hover{transform:scale(1.05);}
        .pb-dismiss{background:none;border:none;color:#603010;cursor:pointer;
          font-size:0.85rem;flex-shrink:0;padding:0.2rem;}
        @media(max-width:768px){.pb-wrap{bottom:64px;padding:0.6rem 0.85rem;}}
      `}</style>

      <div className="pb-wrap">
        <div className="pb-icon">⚠️</div>
        <div className="pb-text">
          <div className="pb-title">
            {hasPending
              ? `${count} Penalty Payment${count>1?"s":""} Awaiting Verification`
              : `${count} Overdue Payment${count>1?"s":""} — $4 USDT Penalty Required`
            }
          </div>
          <div className="pb-sub">
            {hasPending
              ? "Admin is reviewing your penalty payment. Savings locked until verified."
              : `Pay $4 USDT penalty for week${count>1?"s":""} ${penalties.filter(w=>w.status==="penalty").map((w:any)=>w.week||w.week_number).join(", ")} to unlock your savings.`
            }
          </div>
        </div>
        {hasUnpaid&&(
          <button className="pb-btn" onClick={()=>router.push("/savings")}>
            Pay Now
          </button>
        )}
        <button className="pb-dismiss" onClick={()=>setDismissed(true)}>✕</button>
      </div>
    </>
  );
}
