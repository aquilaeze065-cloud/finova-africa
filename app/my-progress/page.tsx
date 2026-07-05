"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

export default function MyProgressPage() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [savings, setSavings] = useState(null);
  const [tab,     setTab]     = useState("overview");

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
    const s = JSON.parse(localStorage.getItem("nexora_savings")||"null");
    setUser(u);
    if (s) {
      s.weeks = s.weeks?.map((w: any) =>({...w,dueDate:new Date(w.dueDate),paidAt:w.paidAt?new Date(w.paidAt):null}));
      setSavings(s);
    }
  },[]);

  if (!user) return null;

  const WEEKLY = 3; const TOTAL_WEEKS = 52; const APY = 35; const VOUCHER = 15;
  const paidWeeks   = savings?.weeks?.filter((w: any) =>w.status==="paid").length||0;
  const totalPaid   = savings?.totalPaid||0;
  const penaltyWeeks= savings?.weeks?.filter((w: any) =>w.penalty).length||0;
  const progress    = Math.round((paidWeeks/TOTAL_WEEKS)*100);
  const interest    = +(totalPaid*(APY/100)).toFixed(2);
  const projPayout  = +(WEEKLY*TOTAL_WEEKS*(1+APY/100)+VOUCHER).toFixed(2);
  const weeksLeft   = TOTAL_WEEKS-paidWeeks;
  const nextDue     = savings?.weeks?.find(w=>w.status==="due"||w.status==="upcoming");
  const missedCount = savings?.weeks?.filter((w: any) =>w.status==="penalty").length||0;
  const endDate     = savings?.endDate?new Date(savings.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—";

  const RATES = {btc:42350,eth:3800,usdt:1,bnb:320};
  const NGN   = 1640;
  const bal   = user.balances||{btc:0,eth:0,usdt:0,bnb:0,ngn:0};
  const totalUSD = Object.entries(bal).reduce((s: number, [k,v]: [string,any])=>s+(k==="ngn"?v/NGN:v*(RATES[k]||1)),0);

  const coins = [
    {sym:"BTC",icon:"₿", color:"#00c896",bg:"#00c89618"},
    {sym:"ETH",icon:"⟠", color:"#627eea",bg:"#627eea18"},
    {sym:"USDT",icon:"₮",color:"#26a17b",bg:"#26a17b18"},
    {sym:"BNB",icon:"🔶",color:"#00c896",bg:"#00c89618"},
  ];

  const kycMap = JSON.parse(localStorage.getItem("nexora_kyc")||"{}");
  const kycSteps = [
    {id:"email",   icon:"✉️", title:"Email",          status:"verified"},
    {id:"phone",   icon:"📱", title:"Phone",          status:"verified"},
    {id:"full_kyc",icon:"🪪", title:"Identity Docs",  status:kycMap["full_kyc"]?.status||"unverified"},
  ];
  const kycVerified = kycSteps.filter((s: any) =>s.status==="verified"||s.status==="approved").length;
  const kycPct = Math.round((kycVerified/kycSteps.length)*100);

  const txs = user.transactions||[];

  const tabs = [
    {id:"overview",  label:"Overview"},
    {id:"savings",   label:"Savings"},
    {id:"wallet",    label:"Wallet"},
    {id:"kyc",       label:"KYC"},
  ];

  const sc=(s: string)=>s==="verified"||s==="approved"?"#00c896":s==="pending"?"#00c896":"#3a7a6a";
  const sl=(s: string)=>s==="verified"||s==="approved"?"✓ Verified":s==="pending"?"⏳ Pending":"○ Not Done";

  return (
    <MobileLayout activePage="Profile">
      <style>{`
        .up-hero{background:linear-gradient(135deg,rgba(0,200,150,0.12),rgba(6,18,14,0.95));border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:1.4rem;margin-bottom:1.2rem;position:relative;overflow:hidden;}
        .up-hero::before{content:"";position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(0,200,150,0.1),transparent 70%);}
        .up-tabs{display:flex;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.12);border-radius:14px;padding:0.2rem;gap:0.2rem;margin-bottom:1.2rem;overflow-x:auto;scrollbar-width:none;}
        .up-tabs::-webkit-scrollbar{display:none;}
        .up-tab{flex:1;min-width:fit-content;padding:0.5rem 0.7rem;border-radius:10px;border:none;cursor:pointer;font-size:0.78rem;font-weight:600;transition:all 0.2s;background:none;color:#5a8a7a;white-space:nowrap;}
        .up-tab.active{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;font-weight:700;}
        .up-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.7rem;margin-bottom:1.1rem;}
        .up-stat{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:14px;padding:0.9rem;}
        .up-stat-val{font-family:"Inter",serif;font-weight:800;font-size:1.1rem;color:#00c896;margin-bottom:0.15rem;}
        .up-stat-label{font-size:0.68rem;color:#5a8a7a;}
        .up-prog-track{height:10px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin:0.5rem 0;}
        .up-prog-fill{height:100%;border-radius:10px;background:linear-gradient(90deg,#00a87a,#00c896,#4dffc3);transition:width 0.8s;}
        .up-week-row{display:flex;align-items:center;gap:0.65rem;padding:0.65rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .up-week-row:last-child{border-bottom:none;}
        .up-coin-row{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .up-coin-row:last-child{border-bottom:none;}
        .up-kyc-row{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .up-kyc-row:last-child{border-bottom:none;}
        .up-badge{padding:0.2rem 0.55rem;border-radius:20px;font-size:0.68rem;font-weight:700;border:1px solid;white-space:nowrap;}
        .up-tx-row{display:flex;align-items:center;gap:0.65rem;padding:0.65rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .up-tx-row:last-child{border-bottom:none;}
      `}</style>

      {/* HERO */}
      <div className="up-hero">
        <div style={{display:"flex",alignItems:"center",gap:"0.85rem",marginBottom:"1rem"}}>
          <div style={{width:"52px",height:"52px",borderRadius:"50%",
            background:user.photoPreview?"transparent":"linear-gradient(135deg,#00a87a,#00c896)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:user.photoPreview?"0":"1.1rem",fontWeight:700,color:"#050f0c",
            border:"2px solid rgba(0,200,150,0.4)",overflow:"hidden",flexShrink:0}}>
            {user.photoPreview?<img src={user.photoPreview} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="avatar"/>
            :user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{fontFamily:"Inter,serif",fontWeight:800,fontSize:"1rem"}}>{user.name}</div>
            <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>{user.email}</div>
            <div style={{display:"flex",gap:"0.4rem",marginTop:"0.3rem",flexWrap:"wrap"}}>
              <span style={{background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.25)",borderRadius:"20px",padding:"0.15rem 0.5rem",fontSize:"0.65rem",color:"#00c896",fontWeight:700}}>
                {user.regFeePaid?"✅ Active":"⏳ Pending"}
              </span>
              <span style={{background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"20px",padding:"0.15rem 0.5rem",fontSize:"0.65rem",color:"#00c896"}}>
                ID: {user.userId}
              </span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"#5a8a7a",marginBottom:"0.35rem"}}>
          <span>Overall Progress</span>
          <span style={{color:"#00c896",fontWeight:700}}>{progress}% complete</span>
        </div>
        <div className="up-prog-track"><div className="up-prog-fill" style={{width:progress+"%"}}/></div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>{paidWeeks}/{TOTAL_WEEKS} weeks saved · ${totalPaid.toFixed(2)} contributed</div>
      </div>

      {/* TABS */}
      <div className="up-tabs">
        {tabs.map((t: any) =>(
          <button key={t.id} className={"up-tab"+(tab===t.id?" active":"")} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview"&&(
        <>
          <div className="up-stat-grid">
            <div className="up-stat"><div className="up-stat-val">${totalPaid.toFixed(2)}</div><div className="up-stat-label">Total Contributed</div></div>
            <div className="up-stat"><div className="up-stat-val" style={{color:"#00c896"}}>${interest.toFixed(2)}</div><div className="up-stat-label">Est. Interest</div></div>
            <div className="up-stat"><div className="up-stat-val">${totalUSD.toFixed(2)}</div><div className="up-stat-label">Wallet Balance</div></div>
            <div className="up-stat"><div className="up-stat-val" style={{color:"#ff4757"}}>{missedCount}</div><div className="up-stat-label">Penalty Weeks</div></div>
          </div>

          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.9rem",color:"#00c896",marginBottom:"0.75rem"}}>💰 Payout Summary</div>
            {[
              {l:"Total to Contribute",  v:"$104.00"},
              {l:"Already Contributed",  v:`$${totalPaid.toFixed(2)}`},
              {l:"Remaining",            v:`$${(104-totalPaid).toFixed(2)}`},
              {l:"Interest Rate",        v:"35% APY"},
              {l:"Projected Interest",   v:"~$46.80"},
              {l:"Completion Voucher",   v:"$15.00"},
              {l:"Total Payout at End",  v:"$165.80"},
              {l:"Contract Matures",     v:endDate},
            ].map((r: any) =>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:"1px solid rgba(0,200,150,0.06)",fontSize:"0.84rem"}}>
                <span style={{color:"#5a8a7a"}}>{r.l}</span>
                <span style={{fontFamily:"Inter,serif",fontWeight:700,color:r.l==="Total Payout at End"?"#00c896":"#e8f8f4"}}>{r.v}</span>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:"0.7rem"}}>
            <button onClick={()=>router.push("/savings")} style={{flex:1,padding:"0.75rem",border:"none",borderRadius:"12px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.88rem",color:"#050f0c",cursor:"pointer"}}>
              💰 Go to Savings
            </button>
            <button onClick={()=>router.push("/verify")} style={{flex:1,padding:"0.75rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"12px",background:"none",fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.88rem",color:"#00c896",cursor:"pointer"}}>
              🪪 Complete KYC
            </button>
          </div>
        </>
      )}

      {/* SAVINGS */}
      {tab==="savings"&&(
        <>
          <div className="up-stat-grid">
            <div className="up-stat"><div className="up-stat-val">{paidWeeks}</div><div className="up-stat-label">Weeks Paid</div></div>
            <div className="up-stat"><div className="up-stat-val">{weeksLeft}</div><div className="up-stat-label">Weeks Left</div></div>
            <div className="up-stat"><div className="up-stat-val" style={{color:"#ff4757"}}>{penaltyWeeks}</div><div className="up-stat-label">Penalty Paid</div></div>
            <div className="up-stat"><div className="up-stat-val" style={{color:"#00c896"}}>{missedCount}</div><div className="up-stat-label">Due Now</div></div>
          </div>

          {!savings?(
            <div className="r-card" style={{textAlign:"center",padding:"2rem"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>🏦</div>
              <div style={{fontFamily:"Inter,serif",fontWeight:700,marginBottom:"0.4rem"}}>No Savings Plan Yet</div>
              <div style={{fontSize:"0.82rem",color:"#5a8a7a",marginBottom:"1rem"}}>Start your weekly savings to track progress here</div>
              <button onClick={()=>router.push("/savings")} style={{padding:"0.75rem 1.5rem",border:"none",borderRadius:"12px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.88rem",color:"#050f0c",cursor:"pointer"}}>Start Saving</button>
            </div>
          ):(
            <div className="r-card">
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.9rem",color:"#00c896",marginBottom:"0.75rem"}}>Recent Payments</div>
              {savings.weeks?.filter((w: any) =>w.status==="paid"||w.status==="due"||w.status==="penalty").slice(0,10).map((w,i)=>(
                <div key={i} className="up-week-row">
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:w.status==="paid"?"rgba(0,200,150,0.12)":w.status==="penalty"?"rgba(231,76,60,0.1)":"rgba(0,200,150,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.75rem",color:w.status==="paid"?"#00c896":w.status==="penalty"?"#ff4757":"#00c896",flexShrink:0}}>
                    {w.week}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:"0.84rem"}}>Week {w.week}</div>
                    <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>Due: {new Date(w.dueDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span className="up-badge" style={{color:w.status==="paid"?"#00c896":w.status==="penalty"?"#ff4757":"#00c896",borderColor:w.status==="paid"?"#00c896":w.status==="penalty"?"#ff4757":"#00c896",background:w.status==="paid"?"rgba(0,200,150,0.1)":w.status==="penalty"?"rgba(231,76,60,0.1)":"rgba(0,200,150,0.1)"}}>
                      {w.status==="paid"?"✓ $"+w.paidAmount:w.status==="penalty"?"⚠️ $4 Due":"⏰ $2 Due"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* WALLET */}
      {tab==="wallet"&&(
        <>
          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div style={{textAlign:"center",marginBottom:"1rem"}}>
              <div style={{fontSize:"0.75rem",color:"#5a8a7a",marginBottom:"0.2rem"}}>Total Portfolio</div>
              <div style={{fontFamily:"Inter,serif",fontWeight:800,fontSize:"1.8rem",color:"#00c896"}}>${totalUSD.toFixed(2)}</div>
              <div style={{fontSize:"0.78rem",color:"#5a8a7a"}}>₦{(totalUSD*NGN).toLocaleString(undefined,{maximumFractionDigits:0})} NGN</div>
            </div>
            {coins.map((c: any) =>(
              <div key={c.sym} className="up-coin-row">
                <div style={{width:"38px",height:"38px",borderRadius:"50%",background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:c.color,fontWeight:700,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.88rem"}}>{c.sym}</div>
                  <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{(bal[c.sym.toLowerCase()]||0).toFixed(4)} {c.sym}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.88rem"}}>${((bal[c.sym.toLowerCase()]||0)*(RATES[c.sym.toLowerCase()]||1)).toFixed(2)}</div>
                  <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>₦{((bal[c.sym.toLowerCase()]||0)*(RATES[c.sym.toLowerCase()]||1)*NGN).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                </div>
              </div>
            ))}
          </div>

          {txs.length>0&&(
            <div className="r-card">
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.9rem",color:"#00c896",marginBottom:"0.75rem"}}>Recent Transactions</div>
              {txs.slice(0,8).map((tx,i)=>(
                <div key={i} className="up-tx-row">
                  <div style={{width:"36px",height:"36px",borderRadius:"10px",background:"rgba(0,200,150,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",flexShrink:0}}>
                    {tx.type==="deposit"?"⬇️":"⬆️"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:"0.84rem",textTransform:"capitalize"}}>{tx.type} {tx.crypto}</div>
                    <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>{new Date(tx.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.84rem",color:tx.type==="deposit"?"#00c896":"#ff4757"}}>
                      {tx.type==="deposit"?"+":"-"}{tx.amount} {tx.crypto}
                    </div>
                    <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>${tx.usdVal?.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* KYC */}
      {tab==="kyc"&&(
        <>
          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.9rem",color:"#00c896"}}>🪪 Verification Status</div>
              <span style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.82rem",color:"#00c896"}}>{kycPct}%</span>
            </div>
            <div className="up-prog-track"><div className="up-prog-fill" style={{width:kycPct+"%"}}/></div>
            {kycSteps.map((s: any) =>(
              <div key={s.id} className="up-kyc-row">
                <div style={{width:"36px",height:"36px",borderRadius:"10px",background:`${sc(s.status)}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:"0.86rem"}}>{s.title}</div>
                </div>
                <span className="up-badge" style={{color:sc(s.status),borderColor:sc(s.status),background:`${sc(s.status)}18`}}>{sl(s.status)}</span>
              </div>
            ))}
          </div>
          {kycPct<100&&(
            <button onClick={()=>router.push("/verify")} style={{width:"100%",padding:"0.9rem",border:"none",borderRadius:"13px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontFamily:"Inter,serif",fontWeight:700,fontSize:"1rem",color:"#050f0c",cursor:"pointer",boxShadow:"0 0 20px rgba(0,200,150,0.2)"}}>
              Complete Verification →
            </button>
          )}
        </>
      )}
    </MobileLayout>
  );
}
