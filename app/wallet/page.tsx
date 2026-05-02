"use client";
import MobileLayout from "../components/MobileLayout";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();
  useEffect(() => {
    const user = localStorage.getItem("finova_user");
    if (!user) router.replace("/login");
  }, []);

  return (
    <MobileLayout activePage="Wallet">
      <style>{`
        .wl-balance{background:linear-gradient(135deg,rgba(46,204,113,0.12),rgba(15,32,56,0.95));border:1px solid rgba(46,204,113,0.2);border-radius:20px;padding:1.4rem;margin-bottom:1.2rem;text-align:center;}
        .wl-bal-label{font-size:0.78rem;color:#7a9bbf;margin-bottom:0.3rem;}
        .wl-bal-amount{font-family:'Syne',sans-serif;font-weight:800;font-size:1.9rem;color:#e8f0fe;}
        .wl-bal-btc{font-size:0.8rem;color:#7a9bbf;margin-top:0.3rem;}
        .wl-btn-row{display:flex;gap:0.8rem;margin-top:1rem;}
        .wl-btn{flex:1;padding:0.7rem;border-radius:12px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;transition:all 0.2s;}
        .wl-btn-dep{background:linear-gradient(90deg,#27ae60,#2ecc71);color:#05100a;}
        .wl-btn-wd{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#e8f0fe;}
        .wl-coin{display:flex;align-items:center;gap:0.85rem;padding:0.9rem 0;border-bottom:1px solid rgba(255,255,255,0.04);}
        .wl-coin:last-child{border-bottom:none;}
        .wl-coin-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;flex-shrink:0;}
        .wl-coin-info{flex:1;min-width:0;}
        .wl-coin-name{font-family:'Syne',sans-serif;font-weight:700;font-size:0.9rem;}
        .wl-coin-amt{font-size:0.75rem;color:#7a9bbf;}
        .wl-coin-right{text-align:right;}
        .wl-coin-val{font-family:'Syne',sans-serif;font-weight:700;font-size:0.9rem;}
        .wl-coin-ngn{font-size:0.7rem;color:#2ecc71;}
        .wl-coin-chg{font-size:0.7rem;}
      `}</style>

      <h1 className="r-page-title">Wallet</h1>
      <p className="r-page-sub">Your crypto & fiat balances</p>

      <div className="wl-balance">
        <div className="wl-bal-label">Total Balance</div>
        <div className="wl-bal-amount">$9,785.25</div>
        <div className="wl-bal-btc">≈ 0.2554 BTC • ₦16,047,810</div>
        <div className="wl-btn-row">
          <button className="wl-btn wl-btn-dep" onClick={()=>router.push("/deposit")}>⬆ Deposit</button>
          <button className="wl-btn wl-btn-wd" onClick={()=>router.push("/withdraw")}>⬇ Withdraw</button>
        </div>
      </div>

      <div className="r-card" style={{marginBottom:"1.2rem"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1rem",marginBottom:"0.9rem"}}>Assets</div>
        {[
          {icon:"₿",color:"#f7931a",bg:"#f7931a22",name:"Bitcoin",sym:"BTC",amt:"0.2217 BTC",val:"$9,250.75",ngn:"₦15,171,230",chg:"+1.2%",pos:true},
          {icon:"⟠",color:"#627eea",bg:"#627eea22",name:"Ethereum",sym:"ETH",amt:"0.65 ETH",val:"$2,470.20",ngn:"₦4,051,128",chg:"+0.8%",pos:true},
          {icon:"🔶",color:"#f3ba2f",bg:"#f3ba2f22",name:"BNB",sym:"BNB",amt:"2.35 BNB",val:"$1,820.30",ngn:"₦2,985,292",chg:"-0.3%",pos:false},
          {icon:"₮",color:"#26a17b",bg:"#26a17b22",name:"Tether",sym:"USDT",amt:"1,244 USDT",val:"$1,244.00",ngn:"₦2,040,160",chg:"0.0%",pos:true},
        ].map(c=>(
          <div key={c.sym} className="wl-coin">
            <div className="wl-coin-icon" style={{background:c.bg,color:c.color}}>{c.icon}</div>
            <div className="wl-coin-info">
              <div className="wl-coin-name">{c.sym}</div>
              <div className="wl-coin-amt">{c.amt}</div>
            </div>
            <div className="wl-coin-right">
              <div className="wl-coin-val">{c.val}</div>
              <div className="wl-coin-ngn">{c.ngn}</div>
              <div className="wl-coin-chg" style={{color:c.pos?"#2ecc71":"#e74c3c"}}>{c.chg}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="r-grid-3" style={{gap:"0.7rem"}}>
        {[{icon:"📤",label:"Send",path:"/withdraw"},{icon:"📥",label:"Receive",path:"/deposit"},{icon:"🔄",label:"Swap",path:"/transactions"}].map(a=>(
          <div key={a.label} className="r-card" style={{textAlign:"center",cursor:"pointer",padding:"1rem 0.5rem"}} onClick={()=>router.push(a.path)}>
            <div style={{fontSize:"1.4rem",marginBottom:"0.4rem"}}>{a.icon}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.82rem"}}>{a.label}</div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
