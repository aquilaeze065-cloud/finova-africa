"use client";
import MobileLayout from "../components/MobileLayout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
    if (!u.regFeePaid) { router.replace("/regfee"); }
  }
  useEffect(() => {
    const user = localStorage.getItem("finova_user");
    if (!user) router.replace("/login");
  }, []);

  return (
    <MobileLayout activePage="Dashboard">
      <style>{`
        .db-card{background:linear-gradient(135deg,rgba(46,204,113,0.12),rgba(15,32,56,0.95));border:1px solid rgba(46,204,113,0.2);border-radius:20px;padding:1.4rem;margin-bottom:1.2rem;position:relative;overflow:hidden;}
        .db-amount{font-family:"Syne",sans-serif;font-weight:800;font-size:2rem;color:#e8f0fe;}
        .db-sub{font-size:0.8rem;color:#7a9bbf;margin-top:0.3rem;}
        .db-stats{display:flex;gap:1.5rem;margin-top:1rem;flex-wrap:wrap;}
        .db-sv{font-family:"Syne",sans-serif;font-weight:700;font-size:0.88rem;}
        .db-sl{font-size:0.7rem;color:#7a9bbf;}
        .db-btns{display:flex;gap:0.8rem;margin-top:1.1rem;}
        .db-btn{flex:1;padding:0.65rem;border-radius:11px;border:none;cursor:pointer;font-family:"Syne",sans-serif;font-weight:700;font-size:0.85rem;transition:all 0.2s;}
        .db-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.7rem;margin-bottom:1.2rem;}
        @media(max-width:600px){.db-grid{grid-template-columns:repeat(2,1fr);}}
        .db-tile{background:#0f2038;border:1px solid rgba(46,204,113,0.13);border-radius:16px;padding:1rem 0.7rem;cursor:pointer;transition:all 0.2s;text-align:center;}
        .db-tile:hover{border-color:rgba(46,204,113,0.4);background:rgba(46,204,113,0.07);transform:translateY(-3px);}
        .db-tile-ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto 0.6rem;}
        .db-tile-t{font-family:"Syne",sans-serif;font-weight:700;font-size:0.82rem;margin-bottom:0.15rem;}
        .db-tile-s{font-size:0.68rem;color:#7a9bbf;}
        .db-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.9rem;}
        .db-hdr-t{font-family:"Syne",sans-serif;font-weight:700;font-size:1rem;}
        .db-all{background:none;border:none;color:#2ecc71;font-size:0.8rem;font-weight:600;cursor:pointer;}
        .db-row{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 0.5rem;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;border-radius:10px;margin:0 -0.5rem;transition:background 0.15s;}
        .db-row:last-child{border-bottom:none;}
        .db-row:hover{background:rgba(46,204,113,0.04);}
        .db-ic{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;font-weight:800;}
        .db-tic{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;font-weight:800;}
        .db-nc{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1.2rem;}
        .db-ncard{background:#0f2038;border:1px solid rgba(46,204,113,0.13);border-radius:16px;padding:1.1rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.8rem;}
        .db-ncard:hover{border-color:rgba(46,204,113,0.4);transform:translateY(-2px);}
        .db-ncard-ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .db-ncard-t{font-family:"Syne",sans-serif;font-weight:700;font-size:0.85rem;}
        .db-ncard-s{font-size:0.7rem;color:#7a9bbf;}
        @media(max-width:480px){.db-amount{font-size:1.7rem;}.db-nc{grid-template-columns:1fr;}}
      `}</style>

      <div className="db-card">
        <div style={{fontSize:"0.78rem",color:"#7a9bbf",marginBottom:"0.3rem"}}>Total Portfolio Balance</div>
        <div className="db-amount">$12,250.50</div>
        <div className="db-sub">approx. 20,090,820 NGN</div>
        <div className="db-stats">
          <div><div className="db-sv" style={{color:"#2ecc71"}}>+$320.40</div><div className="db-sl">24h Change</div></div>
          <div><div className="db-sv" style={{color:"#2ecc71"}}>+2.68%</div><div className="db-sl">24h %</div></div>
          <div><div className="db-sv">$18,420</div><div className="db-sl">Total Deposited</div></div>
        </div>
        <div className="db-btns">
          <button className="db-btn" style={{background:"linear-gradient(90deg,#27ae60,#2ecc71)",color:"#05100a"}} onClick={()=>router.push("/deposit")}>Deposit</button>
          <button className="db-btn" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#e8f0fe"}} onClick={()=>router.push("/withdraw")}>Withdraw</button>
        </div>
      </div>

      <div className="db-grid">
        {[
          {em:"⬆️",t:"Deposit",    s:"Add funds",     p:"/deposit"},
          {em:"⬇️",t:"Withdraw",   s:"Cash out",      p:"/withdraw"},
          {em:"📈",t:"AI Trading", s:"Auto trade",    p:"/ai-trading"},
          {em:"🕐",t:"History",    s:"Transactions",  p:"/transactions"},
          {em:"👛",t:"Wallet",     s:"My assets",     p:"/wallet"},
          {em:"💰",t:"Savings",    s:"Earn interest", p:"/savings"},
          {em:"🪪",t:"Verify ID",  s:"Complete KYC",  p:"/profile"},
          {em:"⚙️",t:"Settings",  s:"Preferences",   p:"/settings"},
        ].map(a=>(
          <div key={a.t} className="db-tile" onClick={()=>router.push(a.p)}>
            <div className="db-tile-ic" style={{background:"rgba(46,204,113,0.12)"}}>{a.em}</div>
            <div className="db-tile-t">{a.t}</div>
            <div className="db-tile-s">{a.s}</div>
          </div>
        ))}
      </div>

      <div className="r-card" style={{marginBottom:"1.2rem"}}>
        <div className="db-hdr">
          <div className="db-hdr-t">My Assets</div>
          <button className="db-all" onClick={()=>router.push("/wallet")}>See All</button>
        </div>
        {[
          {t:"BTC", color:"#f7931a",bg:"#f7931a22",val:"$9,250.75",ngn:"15,171,230",amt:"0.2217 BTC",chg:"+1.2%",pos:true},
          {t:"ETH", color:"#627eea",bg:"#627eea22",val:"$2,470.20",ngn:"4,051,128", amt:"0.65 ETH",  chg:"+0.8%",pos:true},
          {t:"BNB", color:"#f3ba2f",bg:"#f3ba2f22",val:"$285.55",  ngn:"468,302",   amt:"0.55 BNB",  chg:"-0.3%",pos:false},
          {t:"USDT",color:"#26a17b",bg:"#26a17b22",val:"$244.00",  ngn:"400,160",   amt:"244 USDT",  chg:"0.0%", pos:true},
        ].map(a=>(
          <div key={a.t} className="db-row" onClick={()=>router.push("/wallet")}>
            <div className="db-ic" style={{background:a.bg,color:a.color}}>{a.t.slice(0,1)}</div>
            <div style={{flex:1}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.88rem"}}>{a.t}</div><div style={{fontSize:"0.72rem",color:"#7a9bbf"}}>{a.amt}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:"0.88rem"}}>{a.val}</div><div style={{fontSize:"0.68rem",color:"#2ecc71"}}>N{a.ngn}</div><div style={{fontSize:"0.7rem",color:a.pos?"#2ecc71":"#e74c3c"}}>{a.chg}</div></div>
          </div>
        ))}
      </div>

      <div className="db-nc">
        {[
          {em:"📈",bg:"rgba(162,155,254,0.12)",t:"AI Trading",   s:"Live signals",  p:"/ai-trading"},
          {em:"🕐",bg:"rgba(243,156,18,0.12)", t:"Transactions", s:"Full history",  p:"/transactions"},
          {em:"👛",bg:"rgba(46,204,113,0.12)", t:"My Wallet",    s:"Manage assets", p:"/wallet"},
          {em:"🪪",bg:"rgba(52,152,219,0.12)", t:"KYC Verify",   s:"Unlock limits", p:"/profile"},
        ].map(c=>(
          <div key={c.t} className="db-ncard" onClick={()=>router.push(c.p)}>
            <div className="db-ncard-ic" style={{background:c.bg}}>{c.em}</div>
            <div style={{flex:1}}><div className="db-ncard-t">{c.t}</div><div className="db-ncard-s">{c.s}</div></div>
            <span style={{color:"#7a9bbf",fontSize:"1rem"}}>›</span>
          </div>
        ))}
      </div>

      <div className="r-card">
        <div className="db-hdr">
          <div className="db-hdr-t">Recent Transactions</div>
          <button className="db-all" onClick={()=>router.push("/transactions")}>See All</button>
        </div>
        {[
          {t:"BTC",bg:"#f7931a22",color:"#f7931a",name:"Bitcoin Deposit",  date:"Today, 2:45 PM",amt:"+$1,050.20",sub:"N1,722,328",sc:"#2ecc71",pos:true},
          {t:"ETH",bg:"#627eea22",color:"#627eea",name:"Ethereum Receive", date:"Today, 9:15 AM",amt:"+$1,520.50",sub:"N2,493,620",sc:"#2ecc71",pos:true},
          {t:"UDT",bg:"#26a17b22",color:"#26a17b",name:"USDT Transfer",    date:"Yesterday",     amt:"+$230.00",  sub:"$230 USDT", sc:"#26a17b",pos:true},
          {t:"NGN",bg:"#2ecc7122",color:"#2ecc71",name:"NGN Withdrawal",   date:"Apr 19",        amt:"-N500,000", sub:"$304 USD",  sc:"#e74c3c",pos:false},
        ].map((tx,i)=>(
          <div key={i} className="db-row" onClick={()=>router.push("/transactions")}>
            <div className="db-tic" style={{background:tx.bg,color:tx.color}}>{tx.t}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"0.86rem"}}>{tx.name}</div><div style={{fontSize:"0.7rem",color:"#7a9bbf"}}>{tx.date}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:"0.88rem",color:tx.pos?"#2ecc71":"#e74c3c"}}>{tx.amt}</div><div style={{fontSize:"0.68rem",color:tx.sc}}>{tx.sub}</div></div>
          </div>
        ))}
      </div>

    </MobileLayout>
  );
}
