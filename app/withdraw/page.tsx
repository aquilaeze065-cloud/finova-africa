"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const currencies = [
  {code:"USD",flag:"🇺🇸",rate:1},   {code:"USDT",flag:"₮",rate:1},
  {code:"NGN",flag:"🇳🇬",rate:1640}, {code:"KES",flag:"🇰🇪",rate:129},
  {code:"GHS",flag:"🇬🇭",rate:15.2}, {code:"ZAR",flag:"🇿🇦",rate:18.6},
];

const methods = [
  {id:"mobile",icon:"📱",title:"Mobile Money", sub:"MTN, Airtel"},
  {id:"bank",  icon:"🏦",title:"Bank Transfer",sub:"Any bank"},
  {id:"usdt",  icon:"₮", title:"USDT Wallet",  sub:"TRC-20 / ERC-20"},
];

export default function WithdrawPage() {
  const router = useRouter();
  const [amount,   setAmount]  = useState("");
  const [currency, setCurrency]= useState("USDT");
  const [method,   setMethod]  = useState("mobile");
  const [showDrop, setShowDrop]= useState(false);
  const [confirmed,setConfirmed]=useState(false);
  const [loading,  setLoading] = useState(false);

  const getRate = (c:string) => currencies.find(x=>x.code===c)?.rate||1;
  const numAmt  = parseFloat(amount)||0;
  const numUSD  = numAmt/getRate(currency);
  const fee     = +(numUSD*0.01).toFixed(2);
  const net     = +(numUSD-fee).toFixed(2);

  function handleSubmit() {
    if (!amount||numAmt<=0) return;
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setConfirmed(true); },1500);
  }

  return (
    <MobileLayout activePage="Withdraw">
      <style>{`
        .wd-wrap{max-width:100%;overflow-x:hidden;padding-bottom:1rem;}
        .wd-label{font-size:0.7rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;display:block;}
        .wd-input-row{display:flex;gap:0.5rem;margin-bottom:0.75rem;}
        .wd-input{flex:1;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.15);border-radius:10px;padding:0.7rem 0.85rem;font-size:0.92rem;color:#e8f8f4;outline:none;min-width:0;}
        .wd-input:focus{border-color:rgba(0,200,150,0.4);}
        .wd-cur-btn{display:flex;align-items:center;gap:0.3rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:10px;padding:0.7rem 0.75rem;cursor:pointer;font-size:0.82rem;color:#00c896;font-weight:600;white-space:nowrap;flex-shrink:0;}
        .wd-drop{background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:12px;padding:0.35rem;margin-bottom:0.75rem;max-height:180px;overflow-y:auto;}
        .wd-drop-item{display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.65rem;border-radius:8px;cursor:pointer;font-size:0.82rem;}
        .wd-drop-item:hover{background:rgba(0,200,150,0.08);}
        .wd-drop-item.sel{background:rgba(0,200,150,0.12);color:#00c896;font-weight:600;}
        .wd-method{display:flex;align-items:center;gap:0.65rem;padding:0.75rem;background:rgba(0,200,150,0.03);border:1px solid rgba(0,200,150,0.1);border-radius:11px;cursor:pointer;margin-bottom:0.5rem;transition:all 0.18s;}
        .wd-method.sel{border-color:rgba(0,200,150,0.35);background:rgba(0,200,150,0.07);}
        .wd-method-icon{width:32px;height:32px;border-radius:8px;background:rgba(0,200,150,0.08);display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;}
        .wd-review-row{display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(0,200,150,0.06);font-size:0.82rem;}
        .wd-review-row:last-child{border-bottom:none;}
        .wd-btn{width:100%;padding:0.85rem;border:none;border-radius:12px;background:linear-gradient(135deg,#00a87a,#00c896);font-family:"Inter",serif;font-weight:700;font-size:0.95rem;color:#050f0c;cursor:pointer;margin-top:0.9rem;transition:all 0.2s;}
        .wd-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .wd-success{text-align:center;padding:2rem 1rem;}
        .spinner{width:16px;height:16px;border:2px solid rgba(10,8,0,0.3);border-top-color:#050f0c;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="wd-wrap">
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1.05rem",color:"#00c896"}}>Withdraw Funds</div>
          <div style={{fontSize:"0.72rem",color:"#3a7a6a"}}>Cash out to your preferred method</div>
        </div>

        {confirmed ? (
          <div style={{background:"rgba(8,20,14,0.8)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"14px",padding:"1.5rem"}}>
            <div className="wd-success">
              <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>✅</div>
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.4rem"}}>Withdrawal Submitted</div>
              <div style={{fontSize:"0.8rem",color:"#5a8a7a",lineHeight:1.5,marginBottom:"1.2rem"}}>
                Your withdrawal of {amount} {currency} has been submitted and is being processed.
              </div>
              <button className="wd-btn" onClick={()=>{setConfirmed(false);setAmount("");}}>Make Another</button>
              <button onClick={()=>router.push("/dashboard")} style={{width:"100%",padding:"0.75rem",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"12px",background:"none",color:"#5a8a7a",cursor:"pointer",marginTop:"0.5rem",fontSize:"0.85rem"}}>Back to Dashboard</button>
            </div>
          </div>
        ) : (
          <>
            {/* AMOUNT */}
            <div style={{background:"rgba(8,20,14,0.8)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"14px",padding:"1rem",marginBottom:"0.75rem"}}>
              <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.85rem",color:"#00c896",marginBottom:"0.75rem"}}>Amount</div>
              <div className="wd-input-row">
                <input className="wd-input" type="number" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}/>
                <button className="wd-cur-btn" onClick={()=>setShowDrop(!showDrop)}>
                  {currencies.find(c=>c.code===currency)?.flag} {currency} ▾
                </button>
              </div>
              {showDrop&&(
                <div className="wd-drop">
                  {currencies.map(c=>(
                    <div key={c.code} className={"wd-drop-item"+(currency===c.code?" sel":"")} onClick={()=>{setCurrency(c.code);setShowDrop(false);}}>
                      <span>{c.flag}</span>
                      <span style={{fontWeight:600}}>{c.code}</span>
                    </div>
                  ))}
                </div>
              )}
              {numAmt>0&&(
                <div style={{fontSize:"0.75rem",color:"#3a7a6a"}}>
                  ≈ ${numUSD.toFixed(2)} USD · Fee: ${fee} · Net: ${net}
                </div>
              )}
            </div>

            {/* METHOD */}
            <div style={{background:"rgba(8,20,14,0.8)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"14px",padding:"1rem",marginBottom:"0.75rem"}}>
              <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.85rem",color:"#00c896",marginBottom:"0.75rem"}}>Payout Method</div>
              {methods.map(m=>(
                <div key={m.id} className={"wd-method"+(method===m.id?" sel":"")} onClick={()=>setMethod(m.id)}>
                  <div className="wd-method-icon">{m.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:"0.84rem"}}>{m.title}</div>
                    <div style={{fontSize:"0.7rem",color:"#3a7a6a"}}>{m.sub}</div>
                  </div>
                  {method===m.id&&<span style={{color:"#00c896",fontSize:"0.8rem"}}>✓</span>}
                </div>
              ))}
            </div>

            {/* REVIEW */}
            {numAmt>0&&(
              <div style={{background:"rgba(8,20,14,0.8)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"14px",padding:"1rem",marginBottom:"0.75rem"}}>
                <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.85rem",color:"#00c896",marginBottom:"0.75rem"}}>Review</div>
                <div className="wd-review-row"><span style={{color:"#3a7a6a"}}>Amount</span><span style={{color:"#00c896",fontWeight:600}}>{amount} {currency}</span></div>
                <div className="wd-review-row"><span style={{color:"#3a7a6a"}}>Fee (1%)</span><span>${fee}</span></div>
                <div className="wd-review-row"><span style={{color:"#3a7a6a"}}>Method</span><span>{methods.find(m=>m.id===method)?.title}</span></div>
                <div className="wd-review-row"><span style={{fontWeight:600}}>Net Payout</span><span style={{color:"#00c896",fontWeight:700}}>${net}</span></div>
              </div>
            )}

            <button className="wd-btn" onClick={handleSubmit} disabled={!amount||numAmt<=0||loading}>
              {loading?<><div className="spinner"/> Processing...</>:"Confirm Withdrawal"}
            </button>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
