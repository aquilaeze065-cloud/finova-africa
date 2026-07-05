"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const COINS = [
  { key:"btc",  name:"Bitcoin",      symbol:"BTC",  icon:"₿",  color:"#f7931a", bg:"rgba(247,147,26,0.1)"  },
  { key:"eth",  name:"Ethereum",     symbol:"ETH",  icon:"⟠",  color:"#627eea", bg:"rgba(98,126,234,0.1)"  },
  { key:"usdt", name:"Tether USDT",  symbol:"USDT", icon:"₮",  color:"#26a17b", bg:"rgba(38,161,123,0.1)"  },
  { key:"bnb",  name:"BNB",          symbol:"BNB",  icon:"◈",  color:"#f3ba2f", bg:"rgba(243,186,47,0.1)"  },
];

export default function WalletPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<any>(null);
  const [balances,setBalances]= useState({btc:0, eth:0, usdt:0, bnb:0, ngn:0});
  const [addrs,   setAddrs]   = useState<any>({});
  const [copied,  setCopied]  = useState("");

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");
    setUser(u);
    // Always start with zero balances - only real deposits update this
    setBalances({btc:0, eth:0, usdt:0, bnb:0, ngn:0});
    // Get wallet addresses
    if (u.addresses) setAddrs(u.addresses);
  },[]);

  function copy(text:string, key:string) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(()=>setCopied(""),2500);
  }

  const totalUSD = 0; // Zero until real deposit

  return (
    <MobileLayout activePage="Wallet">
      <style>{`
        .wl-card{background:#081a14;border:1px solid rgba(0,200,150,0.12);border-radius:16px;padding:1.1rem;margin-bottom:0.85rem;}
        .wl-coin-row{display:flex;align-items:center;gap:0.75rem;padding:0.85rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .wl-coin-row:last-child{border-bottom:none;}
        .wl-coin-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;flex-shrink:0;}
        .wl-addr-box{background:rgba(0,0,0,0.3);border-radius:8px;padding:0.5rem 0.7rem;display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem;}
        .wl-addr-text{flex:1;font-family:"Courier New",monospace;font-size:0.62rem;color:#3a6a5a;word-break:break-all;line-height:1.3;}
        .wl-copy{padding:0.22rem 0.6rem;border-radius:6px;border:1px solid rgba(0,200,150,0.2);background:rgba(0,200,150,0.06);color:#00c896;font-size:0.65rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;}
        .wl-bal{font-weight:700;font-size:0.9rem;color:#e8f8f4;}
        .wl-usd{font-size:0.7rem;color:#5a8a7a;}
      `}</style>

      <div style={{marginBottom:"1rem"}}>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:"#00c896",marginBottom:"0.15rem"}}>My Wallet</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Your crypto wallet addresses and balances</div>
      </div>

      {/* TOTAL BALANCE */}
      <div className="wl-card" style={{background:"linear-gradient(135deg,rgba(0,200,150,0.07),#081a14)",marginBottom:"1rem"}}>
        <div style={{fontSize:"0.68rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.2rem"}}>Total Portfolio Value</div>
        <div style={{fontWeight:800,fontSize:"1.8rem",color:"#e8f8f4"}}>$0.00</div>
        <div style={{fontSize:"0.72rem",color:"#3a6a5a",marginTop:"0.15rem"}}>Balance updates after your first deposit</div>
      </div>

      {/* COIN LIST */}
      <div className="wl-card">
        {COINS.map(c=>{
          const bal = balances[c.key as keyof typeof balances] || 0;
          const addrKey = c.key === "usdt" ? "usdt_trc20_address" : `${c.key}_address`;
          const addr = addrs[addrKey] || addrs[c.key] || "";
          return (
            <div key={c.key} className="wl-coin-row">
              <div className="wl-coin-icon" style={{background:c.bg,color:c.color}}>{c.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.2rem"}}>
                  <div>
                    <span style={{fontWeight:700,fontSize:"0.86rem"}}>{c.name}</span>
                    <span style={{fontSize:"0.68rem",color:"#5a8a7a",marginLeft:"0.4rem"}}>{c.symbol}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="wl-bal">{bal.toFixed(4)} {c.symbol}</div>
                    <div className="wl-usd">$0.00</div>
                  </div>
                </div>
                {addr && (
                  <div className="wl-addr-box">
                    <div className="wl-addr-text">{addr}</div>
                    <button className="wl-copy" onClick={()=>copy(addr, c.key)}>
                      {copied===c.key?"✓":"Copy"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPOSIT CTA */}
      <div style={{display:"flex",gap:"0.6rem",marginTop:"0.5rem"}}>
        <button onClick={()=>router.push("/deposit")} style={{flex:1,padding:"0.85rem",border:"none",borderRadius:"12px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.88rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
          ⬆️ Deposit
        </button>
        <button onClick={()=>router.push("/withdraw")} style={{flex:1,padding:"0.85rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"12px",background:"none",fontWeight:700,fontSize:"0.88rem",color:"#5a8a7a",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
          ⬇️ Withdraw
        </button>
      </div>
    </MobileLayout>
  );
}
