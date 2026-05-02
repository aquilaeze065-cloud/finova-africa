"use client";
import { useState, useMemo } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems=[{icon:"🏠",label:"Dashboard"},{icon:"👛",label:"Wallet"},{icon:"⬆️",label:"Deposit"},{icon:"⬇️",label:"Withdraw"},{icon:"🕐",label:"Transactions"},{icon:"📈",label:"AI Trading"},{icon:"💰",label:"Savings"},{icon:"⚙️",label:"Settings"}];

const allTx=[
  {id:1, type:"Deposit",    crypto:"BTC",           icon:"₿",  color:"#f7931a",bg:"#f7931a22",amount:"+0.025 BTC",  usd:1050.20, ngn:null,    usdt:null, date:"Today, 2:45 PM",          category:"Deposits"},
  {id:2, type:"Deposit",    crypto:"ETH",           icon:"⟠",  color:"#627eea",bg:"#627eea22",amount:"+0.65 ETH",   usd:1520.50, ngn:null,    usdt:null, date:"Today, 9:15 AM",          category:"Deposits"},
  {id:3, type:"Deposit",    crypto:"ETH",           icon:"⟠",  color:"#627eea",bg:"#627eea22",amount:"+0.5 ETH",    usd:1235.29, ngn:null,    usdt:null, date:"Today, 9:15 AM",          category:"Deposits"},
  {id:4, type:"Deposit",    crypto:"BTC",           icon:"₿",  color:"#f7931a",bg:"#f7931a22",amount:"+2.8 BTC",    usd:null,    ngn:2310000, usdt:null, date:"Yesterday, 4:32 PM",      category:"Deposits"},
  {id:5, type:"Deposit",    crypto:"BNB",           icon:"🔶", color:"#f3ba2f",bg:"#f3ba2f22",amount:"+2.35 BNB",   usd:null,    ngn:1640000, usdt:null, date:"Yesterday, 4:32 PM",      category:"Deposits"},
  {id:6, type:"Receive",    crypto:"USDT (Tether)", icon:"₮",  color:"#26a17b",bg:"#26a17b22",amount:"+230 USDT",   usd:null,    ngn:null,    usdt:230,  date:"April 22, 2024 11:20 AM", category:"Deposits"},
  {id:7, type:"Receive",    crypto:"USDT (Tether)", icon:"₮",  color:"#26a17b",bg:"#26a17b22",amount:"+200 USDT",   usd:null,    ngn:null,    usdt:200,  date:"April 22, 2024 11:20 AM", category:"Deposits"},
  {id:8, type:"Receive",    crypto:"USDT (Tether)", icon:"₮",  color:"#26a17b",bg:"#26a17b22",amount:"+200 USDT",   usd:null,    ngn:328000,  usdt:200,  date:"April 23, 2024 11:20 AM", category:"Deposits"},
  {id:9, type:"Receive",    crypto:"USDT (Tether)", icon:"₮",  color:"#26a17b",bg:"#26a17b22",amount:"+200 USDT",   usd:null,    ngn:null,    usdt:200,  date:"April 23, 2024 11:20 AM", category:"Deposits"},
  {id:10,type:"Withdrawal", crypto:"BTC",           icon:"₿",  color:"#f7931a",bg:"#f7931a22",amount:"-0.015 BTC",  usd:630.00,  ngn:null,    usdt:null, date:"April 20, 2024 3:10 PM",  category:"Withdrawals"},
  {id:11,type:"Withdrawal", crypto:"NGN",           icon:"₦",  color:"#2ecc71",bg:"#2ecc7122",amount:"-₦500,000",   usd:null,    ngn:500000,  usdt:null, date:"April 19, 2024 10:00 AM", category:"Withdrawals"},
  {id:12,type:"Withdrawal", crypto:"USDT (Tether)", icon:"₮",  color:"#26a17b",bg:"#26a17b22",amount:"-150 USDT",   usd:null,    ngn:null,    usdt:150,  date:"April 18, 2024 2:30 PM",  category:"Withdrawals"},
  {id:13,type:"Swap",       crypto:"BTC→ETH",       icon:"🔄", color:"#a29bfe",bg:"#a29bfe22",amount:"0.01 BTC",    usd:420.00,  ngn:null,    usdt:null, date:"April 17, 2024 8:00 AM",  category:"Swaps"},
  {id:14,type:"Swap",       crypto:"USDT→NGN",      icon:"🔄", color:"#a29bfe",bg:"#a29bfe22",amount:"500 USDT",    usd:null,    ngn:820000,  usdt:500,  date:"April 16, 2024 5:45 PM",  category:"Swaps"},
  {id:15,type:"Swap",       crypto:"ETH→BNB",       icon:"🔄", color:"#a29bfe",bg:"#a29bfe22",amount:"0.3 ETH",     usd:738.00,  ngn:null,    usdt:null, date:"April 15, 2024 1:20 PM",  category:"Swaps"},
];

const PAGE_SIZE=9;

export default function TransactionsPage(){
  const router=useRouter();
  const [activeNav,setActiveNav]=useState("Transactions");
  const [tab,setTab]=useState("All");
  const [search,setSearch]=useState("");
  const [cryptoFilter,setCryptoFilter]=useState("All Crypto");
  const [timeFilter,setTimeFilter]=useState("All Time");
  const [page,setPage]=useState(1);
  const [showCryptoDrop,setShowCryptoDrop]=useState(false);
  const [showTimeDrop,setShowTimeDrop]=useState(false);

  const tabs=["All","Deposits","Withdrawals","Swaps"];
  const cryptoOpts=["All Crypto","BTC","ETH","BNB","USDT","NGN"];
  const timeOpts=["All Time","Today","Yesterday","This Week","This Month"];

  const filtered=useMemo(()=>{
    let d=allTx;
    if(tab!=="All") d=d.filter(t=>t.category===tab);
    if(cryptoFilter!=="All Crypto") d=d.filter(t=>t.crypto.includes(cryptoFilter));
    if(timeFilter==="Today") d=d.filter(t=>t.date.startsWith("Today"));
    if(timeFilter==="Yesterday") d=d.filter(t=>t.date.startsWith("Yesterday"));
    if(search) d=d.filter(t=>t.crypto.toLowerCase().includes(search.toLowerCase())||t.type.toLowerCase().includes(search.toLowerCase())||t.amount.toLowerCase().includes(search.toLowerCase()));
    return d;
  },[tab,search,cryptoFilter,timeFilter]);

  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const paginated=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  const handleNav=(label:string)=>{setActiveNav(label);const r:Record<string,string>={Dashboard:"/dashboard",Wallet:"/wallet",Deposit:"/deposit",Withdraw:"/withdraw",Transactions:"/transactions","AI Trading":"/ai-trading",Settings:"/settings"};if(r[label])router.push(r[label]);};

  const exportCSV=()=>{
    const rows=[["Type","Crypto","Amount","USD","NGN","USDT","Date"],...filtered.map(t=>[t.type,t.crypto,t.amount,t.usd??"-",t.ngn??"-",t.usdt??"-",t.date])];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="finova_transactions.csv";a.click();
  };

  type Tx = typeof allTx[0];
  const formatValue=(tx:Tx)=>{
    const parts=[];
    if(tx.usd) parts.push(<span key="usd" style={{color:"#7a9bbf",fontSize:"0.8rem"}}>${tx.usd.toLocaleString()}</span>);
    if(tx.ngn) parts.push(<span key="ngn" style={{color:"#2ecc71",fontSize:"0.8rem"}}>₦{tx.ngn.toLocaleString()}</span>);
    if(tx.usdt) parts.push(<span key="usdt" style={{color:"#26a17b",fontSize:"0.8rem"}}>${tx.usdt} USDT</span>);
    return parts;
  };

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#080f1a",color:"#e8f0fe",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--green:#2ecc71;--bg-card:#0f2038;--border:rgba(46,204,113,0.13);--muted:#7a9bbf;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#080f1a;}::-webkit-scrollbar-thumb{background:#1a3a5c;border-radius:10px;}
        .topbar{position:fixed;top:0;left:0;right:0;z-index:200;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;background:rgba(8,15,26,0.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
        .topbar-logo{display:flex;align-items:center;gap:0.5rem;font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;}
        .topbar-logo span{color:var(--green);}
        .topbar-right{display:flex;align-items:center;gap:1rem;}
        .notif-btn{position:relative;background:rgba(255,255,255,0.07);border:1px solid var(--border);border-radius:10px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .notif-badge{position:absolute;top:-4px;right:-4px;background:var(--green);color:#06100d;font-size:0.6rem;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
        .user-chip{display:flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.07);border:1px solid var(--border);border-radius:10px;padding:0.3rem 0.8rem;cursor:pointer;font-size:0.88rem;}
        .avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#27ae60,#1a6b40);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;}
        .layout{display:flex;padding-top:60px;min-height:100vh;}
        .sidebar{position:fixed;top:60px;left:0;bottom:0;width:190px;background:rgba(8,15,26,0.95);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:1.2rem 0.8rem;overflow-y:auto;z-index:100;}
        .sidebar-profile{display:flex;align-items:center;gap:0.7rem;padding:0.8rem;border-radius:12px;background:rgba(255,255,255,0.04);margin-bottom:1.5rem;}
        .sidebar-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#27ae60,#1a6b40);display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;flex-shrink:0;}
        .sidebar-name{font-family:'Syne',sans-serif;font-weight:700;font-size:0.9rem;}
        .sidebar-sub{font-size:0.72rem;color:var(--muted);}
        .nav-item{display:flex;align-items:center;gap:0.7rem;padding:0.65rem 0.9rem;border-radius:10px;cursor:pointer;font-size:0.88rem;font-weight:500;color:var(--muted);transition:all 0.18s;margin-bottom:2px;border:none;background:none;width:100%;text-align:left;}
        .nav-item:hover{background:rgba(255,255,255,0.05);color:#e8f0fe;}
        .nav-item.active{background:var(--green);color:#06100d;font-weight:700;}
        .sidebar-bottom{margin-top:auto;padding-top:1rem;border-top:1px solid var(--border);}
        .main{margin-left:190px;flex:1;padding:1.8rem 1.5rem;}
        .page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.6rem;margin-bottom:1.2rem;}
        .top-bar{display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem;flex-wrap:wrap;}
        .tabs{display:flex;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:12px;padding:0.25rem;gap:0.2rem;}
        .tab-btn{padding:0.45rem 1rem;border-radius:9px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:600;font-size:0.85rem;color:var(--muted);background:none;transition:all 0.18s;white-space:nowrap;}
        .tab-btn.active{background:var(--green);color:#06100d;}
        .tab-btn:hover:not(.active){color:#e8f0fe;}
        .search-box{display:flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.45rem 0.9rem;flex:1;min-width:160px;}
        .search-box:focus-within{border-color:var(--green);}
        .search-input{background:none;border:none;outline:none;font-size:0.88rem;color:#e8f0fe;flex:1;}
        .search-input::placeholder{color:var(--muted);}
        .filter-row{display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem;flex-wrap:wrap;}
        .filter-btn{display:flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:10px;padding:0.5rem 1rem;cursor:pointer;font-size:0.85rem;color:#e8f0fe;position:relative;transition:all 0.2s;}
        .filter-btn:hover{border-color:rgba(46,204,113,0.3);}
        .filter-drop{position:absolute;top:calc(100% + 6px);left:0;width:160px;background:#0d1b2e;border:1px solid var(--border);border-radius:12px;padding:0.4rem;z-index:300;box-shadow:0 12px 40px rgba(0,0,0,0.5);}
        .filter-opt{padding:0.5rem 0.7rem;border-radius:8px;cursor:pointer;font-size:0.83rem;transition:background 0.15s;}
        .filter-opt:hover{background:rgba(46,204,113,0.1);}
        .filter-opt.sel{background:rgba(46,204,113,0.15);color:var(--green);font-weight:600;}
        .export-btn{display:flex;align-items:center;gap:0.4rem;margin-left:auto;background:var(--green);border:none;border-radius:10px;padding:0.5rem 1.1rem;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:0.85rem;color:#06100d;transition:all 0.2s;}
        .export-btn:hover{background:#34d877;transform:translateY(-1px);}
        .table-card{background:var(--bg-card);border:1px solid var(--border);border-radius:18px;overflow:hidden;margin-bottom:1.5rem;}
        .tx-table{width:100%;border-collapse:collapse;}
        .tx-table th{font-size:0.78rem;color:var(--muted);font-weight:500;text-align:left;padding:0.9rem 1rem;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.02);}
        .tx-table td{padding:0.85rem 1rem;font-size:0.88rem;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle;}
        .tx-table tr:last-child td{border-bottom:none;}
        .tx-table tr:hover td{background:rgba(46,204,113,0.03);}
        .type-cell{display:flex;align-items:center;gap:0.5rem;}
        .type-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;flex-shrink:0;}
        .type-dep{background:rgba(46,204,113,0.15);color:var(--green);}
        .type-wd{background:rgba(231,76,60,0.15);color:#e74c3c;}
        .type-sw{background:rgba(162,155,254,0.15);color:#a29bfe;}
        .type-label{font-size:0.8rem;color:var(--muted);}
        .crypto-cell{display:flex;align-items:center;gap:0.6rem;}
        .crypto-icon{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;font-weight:700;}
        .crypto-name{font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;}
        .amount-pos{color:var(--green);font-family:'Syne',sans-serif;font-weight:700;}
        .amount-neg{color:#e74c3c;font-family:'Syne',sans-serif;font-weight:700;}
        .value-cell{display:flex;flex-direction:column;gap:0.15rem;}
        .date-cell{color:var(--muted);font-size:0.8rem;white-space:nowrap;}
        .arrow-cell{color:var(--muted);cursor:pointer;}
        .arrow-cell:hover{color:var(--green);}
        .empty-row td{text-align:center;padding:3rem;color:var(--muted);}
        .pagination{display:flex;align-items:center;justify-content:center;gap:0.4rem;padding:1rem;border-top:1px solid var(--border);}
        .pg-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:600;font-size:0.85rem;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all 0.18s;}
        .pg-btn:hover{border-color:rgba(46,204,113,0.4);color:#e8f0fe;}
        .pg-btn.active{background:var(--green);border-color:var(--green);color:#06100d;}
        .pg-btn:disabled{opacity:0.3;cursor:not-allowed;}
        .pg-label{font-size:0.82rem;color:var(--muted);margin:0 0.3rem;}
        @media(max-width:900px){.sidebar{width:60px;}.sidebar-profile,.sidebar-name,.sidebar-sub,.nav-label{display:none;}.nav-item{justify-content:center;padding:0.65rem;}.main{margin-left:60px;}}
      `}</style>

      <header className="topbar">
        <div className="topbar-logo"><svg width="24" height="24" viewBox="0 0 32 32" fill="none"><path d="M6 26L14 10L20 20L24 14L28 26" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="26" r="2" fill="#2ecc71"/></svg>Finova <span>Africa</span></div>
        <div className="topbar-right"><div className="notif-btn">🔔<span className="notif-badge">6</span></div><div className="user-chip"><div className="avatar">AX</div>Axion ▾</div></div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-profile"><div className="sidebar-avatar">AX</div><div><div className="sidebar-name">Axion</div><div className="sidebar-sub">Basic Account</div></div></div>
          {navItems.map(item=>(<button key={item.label} className={`nav-item ${activeNav===item.label?"active":""}`} onClick={()=>handleNav(item.label)}><span>{item.icon}</span><span className="nav-label">{item.label}</span></button>))}
          <div className="sidebar-bottom"><button className="nav-item" onClick={()=>router.push("/login")} style={{color:"#e74c3c"}}><span>🚪</span><span className="nav-label">Logout</span></button></div>
        </aside>

        <main className="main">
          <h1 className="page-title">Transactions</h1>
          <div className="top-bar">
            <div className="tabs">{tabs.map(t=>(<button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>{setTab(t);setPage(1);}}>{t}</button>))}</div>
            <div className="search-box"><span style={{color:"var(--muted)"}}>🔍</span><input className="search-input" placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
          </div>
          <div className="filter-row">
            <div className="filter-btn" onClick={()=>{setShowCryptoDrop(!showCryptoDrop);setShowTimeDrop(false);}}>
              🪙 {cryptoFilter} ▾
              {showCryptoDrop&&(<div className="filter-drop" onClick={e=>e.stopPropagation()}>{cryptoOpts.map(o=>(<div key={o} className={`filter-opt ${cryptoFilter===o?"sel":""}`} onClick={()=>{setCryptoFilter(o);setShowCryptoDrop(false);setPage(1);}}>{o}</div>))}</div>)}
            </div>
            <div className="filter-btn" onClick={()=>{setShowTimeDrop(!showTimeDrop);setShowCryptoDrop(false);}}>
              📅 {timeFilter} ▾
              {showTimeDrop&&(<div className="filter-drop" onClick={e=>e.stopPropagation()}>{timeOpts.map(o=>(<div key={o} className={`filter-opt ${timeFilter===o?"sel":""}`} onClick={()=>{setTimeFilter(o);setShowTimeDrop(false);setPage(1);}}>{o}</div>))}</div>)}
            </div>
            <button className="export-btn" onClick={exportCSV}>💾 Export CSV</button>
          </div>
          <div className="table-card">
            <table className="tx-table">
              <thead><tr><th>Type</th><th>Crypto</th><th>Amount</th><th>Value</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {paginated.length===0?(<tr className="empty-row"><td colSpan={6}>No transactions found</td></tr>):paginated.map(tx=>(
                  <tr key={tx.id}>
                    <td><div className="type-cell"><div className={`type-icon ${tx.type==="Withdrawal"?"type-wd":tx.type==="Swap"?"type-sw":"type-dep"}`}>{tx.type==="Withdrawal"?"↓":tx.type==="Swap"?"↔":"↑"}</div><span className="type-label">{tx.type}</span></div></td>
                    <td><div className="crypto-cell"><div className="crypto-icon" style={{background:tx.bg,color:tx.color}}>{tx.icon}</div><span className="crypto-name">{tx.crypto}</span></div></td>
                    <td><span className={tx.amount.startsWith("-")?"amount-neg":"amount-pos"}>{tx.amount}</span></td>
                    <td><div className="value-cell">{formatValue(tx)}</div></td>
                    <td className="date-cell">{tx.date}</td>
                    <td className="arrow-cell">›</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button className="pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              <span className="pg-label">Page</span>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(<button key={p} className={`pg-btn ${page===p?"active":""}`} onClick={()=>setPage(p)}>{p}</button>))}
              <button className="pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
