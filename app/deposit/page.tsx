"use client";
import MobileLayout from "../components/MobileLayout";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const methods=[{id:"mobile",icon:"📱",title:"Mobile Money",sub:"MTN, Airtel"},{id:"bank",icon:"🏦",title:"Bank Transfer",sub:"Access Bank"},{id:"ussd",icon:"📟",title:"USSD",sub:"*737#"},{id:"card",icon:"💳",title:"Card",sub:"Visa, Mastercard"}];
const currencies=[{code:"USD",name:"US Dollar",flag:"🇺🇸",rate:1},{code:"USDT",name:"Tether",flag:"₮",rate:1},{code:"NGN",name:"Nigerian Naira",flag:"🇳🇬",rate:1640},{code:"KES",name:"Kenyan Shilling",flag:"🇰🇪",rate:129},{code:"GHS",name:"Ghanaian Cedi",flag:"🇬🇭",rate:15.2},{code:"ZAR",name:"South African Rand",flag:"🇿🇦",rate:18.6},{code:"TZS",name:"Tanzanian Shilling",flag:"🇹🇿",rate:2700},{code:"UGX",name:"Ugandan Shilling",flag:"🇺🇬",rate:3800},{code:"ETB",name:"Ethiopian Birr",flag:"🇪🇹",rate:57},{code:"XOF",name:"West African CFA",flag:"🌍",rate:615},{code:"EGP",name:"Egyptian Pound",flag:"🇪🇬",rate:48},{code:"MAD",name:"Moroccan Dirham",flag:"🇲🇦",rate:10.1}];

export default function DepositPage(){
  const router=useRouter();
  const [method,setMethod]=useState("mobile");
  const [fromAmt,setFromAmt]=useState("500.00");
  const [toAmt,setToAmt]=useState("");
  const [fromCur,setFromCur]=useState("USD");
  const [toCur,setToCur]=useState("NGN");
  const [showFromDrop,setShowFromDrop]=useState(false);
  const [showToDrop,setShowToDrop]=useState(false);
  const [confirmed,setConfirmed]=useState(false);
  const getRate=(code:string)=>currencies.find(c=>c.code===code)?.rate??1;
  const getFlag=(code:string)=>currencies.find(c=>c.code===code)?.flag??"";
  const calcTo=(from:string,fC:string,tC:string)=>((parseFloat(from||"0")/getRate(fC))*getRate(tC)).toFixed(2);
  const calcFrom=(to:string,fC:string,tC:string)=>((parseFloat(to||"0")/getRate(tC))*getRate(fC)).toFixed(2);
  const handleFromChange=(val:string)=>{setFromAmt(val);setToAmt(calcTo(val,fromCur,toCur));};
  const handleToChange=(val:string)=>{setToAmt(val);setFromAmt(calcFrom(val,fromCur,toCur));};
  const handleFromCur=(code:string)=>{setFromCur(code);setShowFromDrop(false);setToAmt(calcTo(fromAmt,code,toCur));};
  const handleToCur=(code:string)=>{setToCur(code);setShowToDrop(false);setToAmt(calcTo(fromAmt,fromCur,code));};
  const swap=()=>{setFromCur(toCur);setToCur(fromCur);setFromAmt(toAmt||calcTo(fromAmt,fromCur,toCur));setToAmt(fromAmt);};
  const numUSD=parseFloat(fromAmt)/getRate(fromCur);
  const fee=+(numUSD*0.01).toFixed(2);
  const displayTo=toAmt||calcTo(fromAmt,fromCur,toCur);

  return(
    <MobileLayout activePage="Deposit">
      <style>{`
        .dep-method-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.7rem;margin-bottom:1rem;}
        .dep-method{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:0.85rem;display:flex;align-items:center;gap:0.65rem;cursor:pointer;transition:all 0.2s;position:relative;}
        .dep-method.sel{border-color:#2ecc71;background:rgba(46,204,113,0.08);}
        .dep-method-icon{width:36px;height:36px;border-radius:9px;background:rgba(46,204,113,0.12);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
        .dep-method-title{font-family:'Syne',sans-serif;font-weight:700;font-size:0.82rem;}
        .dep-method-sub{font-size:0.68rem;color:#7a9bbf;}
        .dep-check{position:absolute;top:0.5rem;right:0.5rem;width:16px;height:16px;border-radius:50%;background:#2ecc71;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#06100d;font-weight:700;}
        .conv-row{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem;}
        .conv-box{flex:1;display:flex;align-items:center;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:0.75rem 0.9rem;gap:0.5rem;}
        .conv-box:focus-within{border-color:#2ecc71;}
        .conv-input{background:none;border:none;outline:none;font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:#e8f0fe;flex:1;min-width:0;width:100%;}
        .cur-btn{display:flex;align-items:center;gap:0.3rem;background:rgba(46,204,113,0.12);border:1px solid rgba(46,204,113,0.25);border-radius:9px;padding:0.45rem 0.7rem;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:0.82rem;color:#e8f0fe;white-space:nowrap;flex-shrink:0;}
        .cur-sel{position:relative;}
        .cur-drop{position:absolute;top:calc(100%+6px);right:0;width:200px;background:#0d1b2e;border:1px solid rgba(46,204,113,0.13);border-radius:13px;padding:0.4rem;z-index:300;max-height:220px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.6);}
        .cur-opt{display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.65rem;border-radius:8px;cursor:pointer;font-size:0.82rem;}
        .cur-opt:hover{background:rgba(46,204,113,0.1);}
        .cur-opt.active-opt{background:rgba(46,204,113,0.15);color:#2ecc71;font-weight:600;}
        .swap-btn{width:34px;height:34px;border-radius:50%;background:rgba(46,204,113,0.12);border:1px solid rgba(46,204,113,0.25);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.9rem;transition:all 0.25s;margin:0 auto;}
        .swap-btn:hover{transform:rotate(180deg);}
        .rate-note{font-size:0.72rem;color:#7a9bbf;margin-top:0.4rem;}
        .rate-note b{color:#2ecc71;}
        .review-row{display:flex;justify-content:space-between;padding:0.55rem 0;font-size:0.85rem;border-bottom:1px solid rgba(255,255,255,0.05);}
        .review-row:last-child{border-bottom:none;}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal{background:#0d1b2e;border:1px solid rgba(46,204,113,0.3);border-radius:22px;padding:2.2rem 1.5rem;max-width:340px;width:100%;text-align:center;}
      `}</style>

      {confirmed&&(<div className="modal-overlay"><div className="modal"><div style={{fontSize:"2.5rem",marginBottom:"0.8rem"}}>✅</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",marginBottom:"0.4rem"}}>Deposit Successful!</div><div style={{fontSize:"0.85rem",color:"#7a9bbf",marginBottom:"1.5rem"}}>{fromAmt} {fromCur} added to your wallet.</div><button className="r-btn-primary" onClick={()=>{setConfirmed(false);router.push("/dashboard");}}>Back to Dashboard</button></div></div>)}

      <h1 className="r-page-title">Deposit Funds</h1>
      <p className="r-page-sub">Add money to your Finova wallet</p>

      <div style={{display:"inline-flex",alignItems:"center",gap:"0.6rem",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(46,204,113,0.13)",borderRadius:"12px",padding:"0.6rem 1rem",marginBottom:"1.2rem",fontFamily:"'Syne',sans-serif",fontWeight:700}}>
        👛 Balance: $2,745.00
      </div>

      <div className="r-card" style={{marginBottom:"1rem"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"0.8rem"}}>Step 1 · Payment Method</div>
        <div className="dep-method-grid">
          {methods.map(m=>(<div key={m.id} className={`dep-method ${method===m.id?"sel":""}`} onClick={()=>setMethod(m.id)}><div className="dep-method-icon">{m.icon}</div><div><div className="dep-method-title">{m.title}</div><div className="dep-method-sub">{m.sub}</div></div>{method===m.id&&<div className="dep-check">✓</div>}</div>))}
        </div>
      </div>

      <div className="r-card" style={{marginBottom:"1rem"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"0.8rem"}}>Step 2 · Enter Amount</div>
        <div className="conv-row">
          <div className="conv-box"><input className="conv-input" type="number" value={fromAmt} onChange={e=>handleFromChange(e.target.value)} placeholder="0.00"/></div>
          <div className="cur-sel">
            <button className="cur-btn" onClick={()=>{setShowFromDrop(!showFromDrop);setShowToDrop(false);}}>{getFlag(fromCur)} {fromCur} ▾</button>
            {showFromDrop&&(<div className="cur-drop">{currencies.map(c=>(<div key={c.code} className={`cur-opt ${fromCur===c.code?"active-opt":""}`} onClick={()=>handleFromCur(c.code)}><span>{c.flag}</span><div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.78rem"}}>{c.code}</div><div style={{fontSize:"0.68rem",color:"#7a9bbf"}}>{c.name}</div></div></div>))}</div>)}
          </div>
        </div>
        <button className="swap-btn" onClick={swap}>🔄</button>
        <div className="conv-row" style={{marginTop:"0.5rem"}}>
          <div className="conv-box"><input className="conv-input" type="number" value={displayTo} onChange={e=>handleToChange(e.target.value)} placeholder="0.00"/></div>
          <div className="cur-sel">
            <button className="cur-btn" onClick={()=>{setShowToDrop(!showToDrop);setShowFromDrop(false);}}>{getFlag(toCur)} {toCur} ▾</button>
            {showToDrop&&(<div className="cur-drop">{currencies.map(c=>(<div key={c.code} className={`cur-opt ${toCur===c.code?"active-opt":""}`} onClick={()=>handleToCur(c.code)}><span>{c.flag}</span><div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.78rem"}}>{c.code}</div><div style={{fontSize:"0.68rem",color:"#7a9bbf"}}>{c.name}</div></div></div>))}</div>)}
          </div>
        </div>
        <div className="rate-note">📊 1 {fromCur} = <b>{(getRate(toCur)/getRate(fromCur)).toFixed(4)} {toCur}</b></div>
        <div style={{display:"flex",gap:"0.5rem",marginTop:"0.8rem",flexWrap:"wrap"}}>
          <span style={{fontSize:"0.75rem",color:"#7a9bbf",alignSelf:"center"}}>Quick:</span>
          {[100,200,500].map(v=>(<button key={v} onClick={()=>handleFromChange((+(parseFloat(fromAmt||"0")+v)).toFixed(2))} style={{background:"rgba(46,204,113,0.1)",border:"1px solid rgba(46,204,113,0.25)",borderRadius:"8px",padding:"0.3rem 0.65rem",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.75rem",color:"#2ecc71",cursor:"pointer"}}>+{v}</button>))}
        </div>
      </div>

      <div className="r-card" style={{marginBottom:"1.5rem"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"0.8rem"}}>Step 3 · Review</div>
        <div className="review-row"><span style={{color:"#7a9bbf"}}>You Send</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#2ecc71"}}>{fromAmt} {fromCur}</span></div>
        <div className="review-row"><span style={{color:"#7a9bbf"}}>You Get</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#2ecc71"}}>{displayTo} {toCur}</span></div>
        <div className="review-row"><span style={{color:"#7a9bbf"}}>Network Fee</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:700}}>${fee.toFixed(2)}</span></div>
        <div className="review-row"><span style={{color:"#7a9bbf"}}>USD Equivalent</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:700}}>${numUSD.toFixed(2)}</span></div>
        <button className="r-btn-primary" style={{marginTop:"1.2rem"}} onClick={()=>setConfirmed(true)}>Confirm Deposit</button>
      </div>
    </MobileLayout>
  );
}
