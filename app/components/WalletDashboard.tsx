"use client";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const G = "#00c896";

interface WalletData {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  weeksPaid: number;
  nextWeek: number;
  plan: any;
  transactions: any[];
}

export default function WalletDashboard() {
  const [data,     setData]     = useState<WalletData|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [moving,   setMoving]   = useState(false);
  const [toast,    setToast]    = useState("");
  const [showTxns, setShowTxns] = useState(false);

  const token = ()=> localStorage.getItem("nexora_token") || localStorage.getItem("finova_token") || "";

  const load = useCallback(async ()=>{
    try {
      const res  = await fetch(`${API}/api/wallets/balance`,{
        headers:{"Authorization":`Bearer ${token()}`}
      });
      const d = await res.json();
      if (!d.error) setData(d);
    } catch {
      // Fallback to localStorage
      try {
        const savings = JSON.parse(localStorage.getItem("nexora_savings")||"{}");
        setData({
          balance: parseFloat(localStorage.getItem("nexora_wallet_balance")||"0"),
          totalDeposited: parseFloat(savings.totalPaid||0),
          totalWithdrawn: 0,
          weeksPaid: savings.weeks?.filter((w:any)=>w.status==="paid").length||0,
          nextWeek: 1,
          plan: savings,
          transactions: [],
        });
      } catch {}
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(()=>{ load(); },[load]);

  function showMsg(msg:string){ setToast(msg); setTimeout(()=>setToast(""),4000); }

  async function moveToSavings() {
    if (!data || data.balance < 3) {
      showMsg("❌ Insufficient balance. You need at least $3 USDT.");
      return;
    }
    setMoving(true);
    try {
      const res  = await fetch(`${API}/api/wallets/move-to-savings`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`},
        body:JSON.stringify({weekNumber:data.nextWeek}),
      });
      const d = await res.json();
      if (d.success) {
        showMsg(`✅ Week ${data.nextWeek} paid! $3 USDT moved to savings.`);
        // Update local savings
        try {
          const savings = JSON.parse(localStorage.getItem("nexora_savings")||"{}");
          if (savings.weeks) {
            const w = savings.weeks.find((x:any)=>x.week===data.nextWeek||x.week_number===data.nextWeek);
            if (w) { w.status="paid"; w.paid_amount=3; w.paidAt=new Date().toISOString(); }
            savings.totalPaid = (savings.totalPaid||0)+3;
            localStorage.setItem("nexora_savings",JSON.stringify(savings));
          }
        } catch {}
        await load();
      } else {
        showMsg("❌ "+d.error);
      }
    } catch {
      showMsg("❌ Connection error. Try again.");
    }
    setMoving(false);
  }

  if (loading) return (
    <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"16px",padding:"1.4rem",marginBottom:"1rem",textAlign:"center",color:"#5a8a7a",fontSize:"0.82rem"}}>
      Loading wallet...
    </div>
  );

  const canPay = data && data.balance >= 3 && data.plan && data.weeksPaid < 52;

  return (
    <>
      {toast&&(
        <div style={{position:"fixed",bottom:"90px",left:"50%",transform:"translateX(-50%)",background:"#081a14",border:"1px solid rgba(0,200,150,0.25)",borderRadius:"11px",padding:"0.65rem 1.3rem",fontWeight:700,fontSize:"0.82rem",zIndex:999,color:G,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
          {toast}
        </div>
      )}

      <div style={{background:"linear-gradient(135deg,#081a14,#060f0c)",border:"1px solid rgba(0,200,150,0.18)",borderRadius:"18px",padding:"1.2rem",marginBottom:"1rem",overflow:"hidden"}}>

        {/* WALLET BALANCE */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
          <div>
            <div style={{fontSize:"0.65rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.2rem"}}>Wallet Balance</div>
            <div style={{fontWeight:900,fontSize:"1.8rem",color:G,letterSpacing:"-0.02em"}}>
              ${(data?.balance||0).toFixed(2)}
            </div>
            <div style={{fontSize:"0.7rem",color:"#5a8a7a",marginTop:"0.1rem"}}>USDT available</div>
          </div>
          <div style={{width:"52px",height:"52px",borderRadius:"14px",background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem"}}>
            💼
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1rem"}}>
          {[
            {l:"Total Deposited",v:`$${(data?.totalDeposited||0).toFixed(2)}`,c:G},
            {l:"Moved to Savings",v:`$${(data?.totalWithdrawn||0).toFixed(2)}`,c:"#4dffc3"},
          ].map(s=>(
            <div key={s.l} style={{background:"rgba(0,0,0,0.25)",borderRadius:"10px",padding:"0.6rem 0.75rem"}}>
              <div style={{fontSize:"0.62rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.15rem"}}>{s.l}</div>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* MOVE TO SAVINGS BUTTON */}
        {data?.plan ? (
          <div>
            {data.weeksPaid < 52 ? (
              <>
                <div style={{background:"rgba(0,200,150,0.06)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"10px",padding:"0.65rem 0.75rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:"#5a8a7a",lineHeight:1.55}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.2rem"}}>
                    <span>Next payment due:</span>
                    <span style={{fontWeight:700,color:G}}>Week {data.nextWeek} — $3 USDT</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span>Your balance:</span>
                    <span style={{fontWeight:700,color:data.balance>=3?G:"#ff4757"}}>${(data?.balance||0).toFixed(2)} USDT</span>
                  </div>
                </div>
                <button
                  onClick={moveToSavings}
                  disabled={!canPay||moving}
                  style={{
                    width:"100%",padding:"0.85rem",border:"none",borderRadius:"12px",
                    background:canPay?`linear-gradient(135deg,#00a87a,${G})`:"rgba(0,200,150,0.1)",
                    fontWeight:700,fontSize:"0.9rem",
                    color:canPay?"#050f0c":"#5a8a7a",
                    cursor:canPay?"pointer":"not-allowed",
                    fontFamily:"Inter,sans-serif",
                    transition:"all 0.2s",
                    opacity:moving?0.7:1,
                  }}
                >
                  {moving?"Processing..."
                    :!canPay&&data.balance<3?"Insufficient balance — Deposit $3 USDT first"
                    :`💰 Pay Week ${data.nextWeek} from Wallet ($3 USDT)`
                  }
                </button>
                {!canPay&&data.balance<3&&(
                  <div style={{textAlign:"center",marginTop:"0.5rem",fontSize:"0.72rem",color:"#5a8a7a"}}>
                    You need ${(3-(data?.balance||0)).toFixed(2)} more USDT.{" "}
                    <a href="/deposit" style={{color:G,fontWeight:600,textDecoration:"none"}}>Deposit now →</a>
                  </div>
                )}
              </>
            ):(
              <div style={{textAlign:"center",padding:"0.75rem",background:"rgba(0,200,150,0.06)",borderRadius:"10px",fontSize:"0.82rem",color:G,fontWeight:600}}>
                🏆 All 52 weeks complete! Apply for withdrawal.
              </div>
            )}
          </div>
        ):(
          <div style={{textAlign:"center",fontSize:"0.78rem",color:"#5a8a7a",padding:"0.5rem"}}>
            No active savings plan. Complete registration to start.
          </div>
        )}

        {/* AUTO-DEBIT NOTICE */}
        <div style={{marginTop:"0.75rem",background:"rgba(0,102,255,0.06)",border:"1px solid rgba(0,102,255,0.15)",borderRadius:"10px",padding:"0.6rem 0.75rem",fontSize:"0.72rem",color:"#5a8a7a",lineHeight:1.55}}>
          ⚡ <b style={{color:"#4d9fff"}}>Auto-Debit Active:</b> When your weekly payment is due, $3 USDT will be automatically deducted from this wallet if you have sufficient balance.
        </div>

        {/* RECENT TRANSACTIONS */}
        {data?.transactions && data.transactions.length > 0 && (
          <div style={{marginTop:"0.75rem"}}>
            <button
              onClick={()=>setShowTxns(s=>!s)}
              style={{background:"none",border:"none",color:"#5a8a7a",fontSize:"0.73rem",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600,padding:0}}
            >
              {showTxns?"▲ Hide":"▼ Show"} wallet history ({data.transactions.length})
            </button>
            {showTxns&&(
              <div style={{marginTop:"0.5rem",display:"flex",flexDirection:"column",gap:"0.3rem"}}>
                {data.transactions.map((t:any,i:number)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.45rem 0",borderBottom:"1px solid rgba(0,200,150,0.06)",fontSize:"0.74rem"}}>
                    <div>
                      <span style={{fontWeight:600,color:t.type==="credit"?G:"#e8f8f4"}}>
                        {t.type==="credit"?"⬆️ Admin Credit":t.type==="savings_payment"?"💰 Savings Payment":"💳 Transaction"}
                      </span>
                      <div style={{fontSize:"0.65rem",color:"#5a8a7a"}}>{new Date(t.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,color:t.type==="credit"?G:"#ff4757"}}>{t.type==="credit"?"+":"-"}${parseFloat(t.amount||0).toFixed(2)}</div>
                      <div style={{fontSize:"0.62rem",color:"#5a8a7a"}}>bal: ${parseFloat(t.balance_after||0).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
