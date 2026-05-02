"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "👛", label: "Wallet" },
  { icon: "⬆️", label: "Deposit" },
  { icon: "⬇️", label: "Withdraw" },
  { icon: "🕐", label: "Transactions" },
  { icon: "📈", label: "AI Trading" },
  { icon: "💰", label: "Savings" },
  { icon: "⚙️", label: "Settings" },
];
const methods = [
  { id:"mobile",icon:"📱",title:"Mobile Money", sub:"+234 • 6166",    badge:"MTN" },
  { id:"bank",  icon:"🏦",title:"Bank Transfer",sub:"Access Bank",    badge:"" },
  { id:"ussd",  icon:"📟",title:"USSD",         sub:"*737# and more", badge:"" },
  { id:"card",  icon:"💳",title:"Card Payment", sub:"Visa, Mastercard",badge:"" },
];
const currencies = [
  { code:"USD", name:"US Dollar",          flag:"🇺🇸", rate:1 },
  { code:"USDT",name:"Tether (USDT)",      flag:"₮",   rate:1 },
  { code:"NGN", name:"Nigerian Naira",     flag:"🇳🇬", rate:1640 },
  { code:"KES", name:"Kenyan Shilling",    flag:"🇰🇪", rate:129 },
  { code:"GHS", name:"Ghanaian Cedi",      flag:"🇬🇭", rate:15.2 },
  { code:"ZAR", name:"South African Rand", flag:"🇿🇦", rate:18.6 },
  { code:"TZS", name:"Tanzanian Shilling", flag:"🇹🇿", rate:2700 },
  { code:"UGX", name:"Ugandan Shilling",   flag:"🇺🇬", rate:3800 },
  { code:"ETB", name:"Ethiopian Birr",     flag:"🇪🇹", rate:57 },
  { code:"XOF", name:"West African CFA",   flag:"🌍",  rate:615 },
  { code:"EGP", name:"Egyptian Pound",     flag:"🇪🇬", rate:48 },
  { code:"MAD", name:"Moroccan Dirham",    flag:"🇲🇦", rate:10.1 },
];
const BALANCE_USD = 12250.50;

export default function WithdrawPage() {
  const router = useRouter();
  useEffect(() => {
    const user = localStorage.getItem("finova_user");
    if (!user) router.replace("/login");
  }, []);

  const [activeNav,setActiveNav]=useState("Withdraw");
  const [amount,setAmount]=useState("1500.00");
  const [currency,setCurrency]=useState("USD");
  const [showDrop,setShowDrop]=useState(false);
  const [method,setMethod]=useState("mobile");
  const [confirmed,setConfirmed]=useState(false);

  const getRate=(code:string)=>currencies.find(c=>c.code===code)?.rate??1;
  const getFlag=(code:string)=>currencies.find(c=>c.code===code)?.flag??"";
  const numAmt=parseFloat(amount)||0;
  const numUSD=numAmt/getRate(currency);
  const fee=+(numUSD*0.01).toFixed(2);
  const ngn=(numUSD*1640);
  const netNGN=((numUSD-fee)*1640);
  const balLocal=+(BALANCE_USD*getRate(currency)).toFixed(2);
  const insufficient=numUSD>BALANCE_USD;

  const handleCur=(code:string)=>{setCurrency(code);setShowDrop(false);setAmount((numUSD*getRate(code)).toFixed(2));};
  const handleNav=(label:string)=>{setActiveNav(label);const r:Record<string,string>={Dashboard:"/dashboard",Wallet:"/wallet",Deposit:"/deposit",Withdraw:"/withdraw",Transactions:"/transactions","AI Trading":"/ai-trading",Settings:"/settings"};if(r[label])router.push(r[label]);};

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#080f1a",color:"#e8f0fe",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--green:#2ecc71;--red:#e74c3c;--bg-card:#0f2038;--border:rgba(46,204,113,0.13);--muted:#7a9bbf;}
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
        .page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.6rem;margin-bottom:0.2rem;}
        .page-sub{font-size:0.88rem;color:var(--muted);margin-bottom:1.2rem;}
        .balance-pill{display:inline-flex;align-items:center;gap:0.7rem;background:rgba(255,255,255,0.07);border:1px solid var(--border);border-radius:14px;padding:0.7rem 1.2rem;margin-bottom:1.8rem;font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;}
        .balance-pill-icon{width:36px;height:36px;border-radius:10px;background:rgba(46,204,113,0.15);display:flex;align-items:center;justify-content:center;}
        .step-card{background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:1.4rem;margin-bottom:1.2rem;}
        .step-label{font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;margin-bottom:0.3rem;}
        .step-sub{font-size:0.8rem;color:var(--muted);margin-bottom:1rem;}
        .amount-row{display:flex;align-items:center;gap:0.6rem;}
        .amount-box{flex:1;display:flex;align-items:center;gap:0.6rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:0.8rem 1rem;}
        .amount-box.error{border-color:var(--red);box-shadow:0 0 0 3px rgba(231,76,60,0.12);}
        .amount-box:focus-within{border-color:var(--green);box-shadow:0 0 0 3px rgba(46,204,113,0.1);}
        .amount-symbol{font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:var(--green);padding-right:0.4rem;border-right:1px solid rgba(255,255,255,0.1);}
        .amount-input{background:none;border:none;outline:none;font-family:'Syne',sans-serif;font-weight:700;font-size:1.05rem;color:#e8f0fe;flex:1;min-width:60px;}
        .amount-equiv{font-size:0.8rem;color:var(--muted);white-space:nowrap;}
        .cur-selector{position:relative;flex-shrink:0;}
        .cur-btn{display:flex;align-items:center;gap:0.4rem;background:rgba(46,204,113,0.12);border:1px solid rgba(46,204,113,0.25);border-radius:10px;padding:0.5rem 0.8rem;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:0.85rem;color:#e8f0fe;white-space:nowrap;}
        .cur-dropdown{position:absolute;top:calc(100% + 6px);right:0;width:220px;background:#0d1b2e;border:1px solid var(--border);border-radius:14px;padding:0.5rem;z-index:300;max-height:250px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.6);}
        .cur-option{display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.7rem;border-radius:8px;cursor:pointer;font-size:0.85rem;}
        .cur-option:hover{background:rgba(46,204,113,0.1);}
        .cur-option.active-opt{background:rgba(46,204,113,0.15);color:var(--green);font-weight:600;}
        .cur-option-code{font-family:'Syne',sans-serif;font-weight:700;font-size:0.82rem;}
        .cur-option-name{font-size:0.72rem;color:var(--muted);}
        .balance-note{font-size:0.75rem;color:var(--muted);margin-top:0.6rem;}
        .balance-note.err{color:var(--red);}
        .quick-row{display:flex;align-items:center;gap:0.5rem;margin-top:0.8rem;flex-wrap:wrap;}
        .quick-label{font-size:0.78rem;color:var(--muted);}
        .quick-btn{background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.25);border-radius:8px;padding:0.35rem 0.7rem;font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;color:var(--green);cursor:pointer;}
        .max-btn{background:rgba(231,76,60,0.12);border:1px solid rgba(231,76,60,0.3);border-radius:8px;padding:0.35rem 0.7rem;font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;color:var(--red);cursor:pointer;}
        .method-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;}
        .method-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1rem;display:flex;align-items:center;gap:0.8rem;cursor:pointer;transition:all 0.2s;position:relative;}
        .method-card:hover{border-color:rgba(46,204,113,0.3);}
        .method-card.selected{border-color:var(--green);background:rgba(46,204,113,0.1);}
        .method-icon{width:40px;height:40px;border-radius:10px;background:rgba(46,204,113,0.12);border:1px solid rgba(46,204,113,0.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .method-badge{position:absolute;top:0.5rem;left:3.2rem;font-size:0.62rem;color:var(--green);font-weight:700;}
        .method-title{font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;}
        .method-sub{font-size:0.72rem;color:var(--muted);}
        .method-check{position:absolute;top:0.6rem;right:0.6rem;width:18px;height:18px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#06100d;font-weight:700;}
        .review-table{width:100%;border-collapse:collapse;}
        .review-table tr{border-bottom:1px solid rgba(255,255,255,0.05);}
        .review-table tr:last-child{border-bottom:none;}
        .review-table td{padding:0.7rem 0;font-size:0.88rem;}
        .review-table td:last-child{text-align:right;font-family:'Syne',sans-serif;font-weight:700;}
        .r-label{color:var(--muted);}
        .r-green{color:var(--green);}
        .r-red{color:var(--red);}
        .confirm-wrap{margin-top:1.5rem;}
        .btn-confirm{width:100%;padding:1rem;background:linear-gradient(90deg,#c0392b,#e74c3c);border:none;border-radius:14px;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;color:#fff;box-shadow:0 0 30px rgba(231,76,60,0.35);transition:all 0.2s;}
        .btn-confirm:hover:not(:disabled){transform:translateY(-2px);}
        .btn-confirm:disabled{opacity:0.4;cursor:not-allowed;}
        .confirm-note{text-align:center;font-size:0.78rem;color:var(--muted);margin-top:0.8rem;}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal{background:#0d1b2e;border:1px solid rgba(231,76,60,0.3);border-radius:24px;padding:2.5rem 2rem;max-width:380px;width:100%;text-align:center;}
        .modal-icon{width:72px;height:72px;border-radius:50%;background:rgba(231,76,60,0.1);border:2px solid rgba(231,76,60,0.4);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1.2rem;}
        .modal-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;margin-bottom:0.5rem;}
        .modal-sub{font-size:0.88rem;color:var(--muted);margin-bottom:1.8rem;}
        .btn-modal{width:100%;padding:0.85rem;background:var(--green);border:none;border-radius:12px;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:#06100d;}
        @media(max-width:900px){.sidebar{width:60px;}.sidebar-profile,.sidebar-name,.sidebar-sub,.nav-label{display:none;}.nav-item{justify-content:center;padding:0.65rem;}.main{margin-left:60px;}.method-grid{grid-template-columns:1fr;}}
      `}</style>

      {confirmed&&(<div className="modal-overlay"><div className="modal"><div className="modal-icon">💸</div><div className="modal-title">Withdrawal Successful!</div><div className="modal-sub">{amount} {currency} (≈ ${numUSD.toFixed(2)} USD) sent to your {methods.find(m=>m.id===method)?.title}.</div><button className="btn-modal" onClick={()=>{setConfirmed(false);router.push("/dashboard");}}>Back to Dashboard</button></div></div>)}

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
          <h1 className="page-title">Withdraw Funds</h1>
          <p className="page-sub">Securely withdraw money to your account.</p>
          <div className="balance-pill"><div className="balance-pill-icon">💼</div>₦ {(BALANCE_USD*1640).toLocaleString()}</div>

          <div className="step-card">
            <div className="step-label">Step 1: Amount</div>
            <div className="step-sub">Enter amount to withdraw:</div>
            <div className="amount-row">
              <div className={`amount-box ${insufficient?"error":""}`}>
                <span className="amount-symbol">$</span>
                <input className="amount-input" type="number" value={amount} onChange={e=>setAmount(e.target.value)} min="0" placeholder="0.00"/>
                <span className="amount-equiv">₦ {ngn.toLocaleString()}</span>
              </div>
              <div className="cur-selector">
                <button className="cur-btn" onClick={()=>setShowDrop(!showDrop)}>{getFlag(currency)} {currency} ▾</button>
                {showDrop&&(<div className="cur-dropdown">{currencies.map(c=>(<div key={c.code} className={`cur-option ${currency===c.code?"active-opt":""}`} onClick={()=>handleCur(c.code)}><span style={{fontSize:"1rem",width:"22px",textAlign:"center"}}>{c.flag}</span><div><div className="cur-option-code">{c.code}</div><div className="cur-option-name">{c.name}</div></div></div>))}</div>)}
              </div>
            </div>
            <div className={`balance-note ${insufficient?"err":""}`}>{insufficient?"⚠️ Insufficient balance!":`Balance: ${currency} ${balLocal.toLocaleString()}`}</div>
            <div className="quick-row">
              <span className="quick-label">Quick:</span>
              {[100,500,1000].map(v=>(<button key={v} className="quick-btn" onClick={()=>setAmount((+(parseFloat(amount||"0")+v)).toFixed(2))}>+{v}</button>))}
              <button className="max-btn" onClick={()=>setAmount(BALANCE_USD.toFixed(2))}>Max</button>
            </div>
          </div>

          <div className="step-card">
            <div className="step-label">Step 2: Payout Method</div>
            <div className="step-sub">Choose how you want to receive your money:</div>
            <div className="method-grid">
              {methods.map(m=>(<div key={m.id} className={`method-card ${method===m.id?"selected":""}`} onClick={()=>setMethod(m.id)}>{m.badge&&<span className="method-badge">{m.badge}</span>}<div className="method-icon">{m.icon}</div><div><div className="method-title">{m.title}</div><div className="method-sub">{m.sub}</div></div>{method===m.id&&<div className="method-check">✓</div>}</div>))}
            </div>
          </div>

          <div className="step-card">
            <div className="step-label">Step 3: Review &amp; Confirm</div>
            <div className="step-sub">Review your withdrawal details:</div>
            <table className="review-table">
              <tbody>
                <tr><td className="r-label">Withdrawal Amount</td><td><span className="r-green">+${numUSD.toFixed(2)}</span>&nbsp;&nbsp;₦ {ngn.toLocaleString()}</td></tr>
                <tr><td className="r-label">Network Fee</td><td><span className="r-red">${fee.toFixed(2)}</span>&nbsp;&nbsp;${fee.toFixed(2)}</td></tr>
                <tr><td className="r-label">Payout Method</td><td>{methods.find(m=>m.id===method)?.title}</td></tr>
                <tr><td className="r-label" style={{fontWeight:700,color:"#e8f0fe"}}>Net Payout</td><td style={{color:"var(--green)",fontSize:"1rem"}}>₦ {netNGN.toLocaleString()}</td></tr>
              </tbody>
            </table>
            <div className="confirm-wrap">
              <button className="btn-confirm" disabled={insufficient||numAmt<=0} onClick={()=>setConfirmed(true)}>Confirm Withdrawal</button>
              <p className="confirm-note">Funds will be sent to your selected payout method within minutes.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
