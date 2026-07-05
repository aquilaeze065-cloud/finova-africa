"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const DEMO_TX = [
  {id:"1",type:"deposit",  crypto:"USDT",icon:"₮",color:"#26a17b",bg:"rgba(38,161,123,0.1)", amount:"+2.00",  usd:"$2.00",  date:"Today",      status:"confirmed"},
  {id:"2",type:"deposit",  crypto:"USDT",icon:"₮",color:"#26a17b",bg:"rgba(38,161,123,0.1)", amount:"+2.00",  usd:"$2.00",  date:"Last week",  status:"confirmed"},
  {id:"3",type:"withdrawal",crypto:"USDT",icon:"₮",color:"#26a17b",bg:"rgba(38,161,123,0.1)",amount:"-2.00",  usd:"$2.00",  date:"2 weeks ago", status:"confirmed"},
];

export default function TransactionsPage() {
  const router  = useRouter();
  const [tab,    setTab]    = useState("all");
  const [search, setSearch] = useState("");
  const [txs,    setTxs]    = useState<any[]>([]);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
    const t = u.transactions || [];
    setTxs(t.length > 0 ? t : []);
  },[]);

  const tabs = ["all","deposits","withdrawals"];
  const filtered = txs.filter(t=>{
    if (tab==="deposits"    && t.type!=="deposit")    return false;
    if (tab==="withdrawals" && t.type!=="withdrawal") return false;
    if (search && !JSON.stringify(t).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sc=(s:string)=>s==="confirmed"?"#00c896":s==="pending"?"#00c896":"#ff4757";

  return (
    <MobileLayout activePage="Transactions">
      <style>{`
        .tx-wrap{max-width:100%;overflow-x:hidden;}
        .tx-tabs{display:flex;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:0.2rem;gap:0.2rem;margin-bottom:0.9rem;}
        .tx-tab{flex:1;padding:0.35rem 0.3rem;border-radius:8px;border:none;cursor:pointer;font-size:0.72rem;font-weight:600;transition:all 0.18s;background:none;color:#3a7a6a;text-align:center;text-transform:capitalize;}
        .tx-tab.active{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
        .tx-search{display:flex;align-items:center;gap:0.5rem;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:0.55rem 0.8rem;margin-bottom:0.9rem;}
        .tx-search input{background:none;border:none;outline:none;font-size:0.82rem;color:#e8f8f4;flex:1;min-width:0;}
        .tx-row{display:flex;align-items:center;gap:0.65rem;padding:0.7rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .tx-row:last-child{border-bottom:none;}
        .tx-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;}
        .tx-info{flex:1;min-width:0;}
        .tx-name{font-weight:600;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .tx-date{font-size:0.68rem;color:#3a7a6a;margin-top:0.1rem;}
        .tx-right{text-align:right;flex-shrink:0;}
        .tx-amount{font-weight:700;font-size:0.85rem;}
        .tx-status{font-size:0.65rem;font-weight:600;margin-top:0.1rem;}
        .tx-empty{text-align:center;padding:2rem 1rem;color:#3a7a6a;font-size:0.82rem;}
      `}</style>

      <div className="tx-wrap">
        <div style={{marginBottom:"0.9rem"}}>
          <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1.05rem",color:"#00c896"}}>Transactions</div>
          <div style={{fontSize:"0.72rem",color:"#3a7a6a"}}>Your complete transaction history</div>
        </div>

        <div className="tx-tabs">
          {tabs.map(t=>(
            <button key={t} className={"tx-tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="tx-search">
          <span style={{color:"#3a7a6a",fontSize:"0.8rem"}}>🔍</span>
          <input placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        <div style={{background:"rgba(8,20,14,0.8)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"14px",padding:"0 0.9rem"}}>
          {filtered.length===0?(
            <div className="tx-empty">
              <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>📋</div>
              No transactions found.<br/>Start saving to see your history here.
            </div>
          ):filtered.map(tx=>(
            <div key={tx.id} className="tx-row">
              <div className="tx-icon" style={{background:tx.bg||"rgba(0,200,150,0.08)",color:tx.color||"#00c896"}}>
                {tx.icon||"₮"}
              </div>
              <div className="tx-info">
                <div className="tx-name">{tx.type==="deposit"?"Deposit":"Withdrawal"} · {tx.crypto}</div>
                <div className="tx-date">{tx.date||new Date(tx.created_at||Date.now()).toLocaleDateString()}</div>
              </div>
              <div className="tx-right">
                <div className="tx-amount" style={{color:tx.type==="deposit"?"#00c896":"#ff4757"}}>
                  {tx.type==="deposit"?"+":"-"}{tx.amount||tx.usd_value} {tx.crypto}
                </div>
                <div className="tx-status" style={{color:sc(tx.status||"confirmed")}}>
                  {tx.status||"confirmed"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
