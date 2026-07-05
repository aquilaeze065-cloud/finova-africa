"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const OUR_WALLETS = [
  {id:"usdt_trc", icon:"₮", name:"USDT TRC-20", symbol:"USDT", color:"#26a17b", bg:"rgba(38,161,123,0.1)", address:"TFinovaAfricaUSDT1234567890ABCDEF", network:"TRON (TRC-20)"},
  {id:"usdt_erc", icon:"₮", name:"USDT ERC-20", symbol:"USDT", color:"#627eea", bg:"rgba(0,200,150,0.1)", address:"0xFinovaAfricaUSDT1234567890abcdef", network:"Ethereum (ERC-20)"},
  {id:"btc",      icon:"₿", name:"Bitcoin",     symbol:"BTC",  color:"#00c896", bg:"rgba(0,200,150,0.1)", address:"1FNovaAfricaBTC1234567890ABCDEF",    network:"Bitcoin Network"},
  {id:"bnb",      icon:"🔶",name:"BNB",          symbol:"BNB",  color:"#00c896", bg:"rgba(0,200,150,0.1)", address:"bnb1FNovaAfricaBNB1234567890abc",    network:"BNB Chain (BEP-20)"},
];

export default function DepositPage() {
  const router  = useRouter();
  const [method,    setMethod]   = useState<"direct"|"exchanger">("direct");
  const [selected,  setSelected] = useState<string|null>(null);
  const [copied,    setCopied]   = useState("");
  const [amount,    setAmount]   = useState("");
  const [txHash,    setTxHash]   = useState("");
  const [submitted, setSubmitted]= useState(false);
  const [exchangers,setExchangers]= useState<any[]>([]);
  const [selEx,     setSelEx]    = useState<any>(null);
  const [exCopied,  setExCopied] = useState("");

  const [platformWallets, setPlatformWallets] = useState<any[]>([]);

  useEffect(()=>{
    try {
      const saved = JSON.parse(localStorage.getItem("nexora_platform_wallets")||"[]");
      if (saved.length > 0) setPlatformWallets(saved);
    } catch {}
    try {
      const ex = JSON.parse(localStorage.getItem("nexora_exchangers")||"[]");
      setExchangers(ex.filter((e:any)=>e.active));
    } catch {}
  },[]);

  const wallet = OUR_WALLETS.find(w=>w.id===selected);

  function copy(text:string, key:string) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(()=>setCopied(""),2500);
  }

  function copyEx(text:string, key:string) {
    navigator.clipboard.writeText(text);
    setExCopied(key); setTimeout(()=>setExCopied(""),2500);
  }

  function handleSubmit() {
    if (!amount||parseFloat(amount)<=0) return;
    // Auto update savings progress
    try {
      const savings = JSON.parse(localStorage.getItem("nexora_savings")||"null");
      if (savings && savings.status==="active") {
        const dueWeek = savings.weeks?.find((w:any)=>w.status==="due"||w.status==="penalty");
        if (dueWeek) {
          const amt = dueWeek.status==="penalty"?4:2;
          dueWeek.status = "paid";
          dueWeek.paidAmount = amt;
          dueWeek.paidAt = new Date().toISOString();
          savings.totalPaid = (savings.totalPaid||0) + amt;
          localStorage.setItem("nexora_savings", JSON.stringify(savings));
        }
      }
      // Add notification
      const notifs = JSON.parse(localStorage.getItem("nexora_notifications")||"[]");
      notifs.unshift({id:Date.now().toString(),type:"deposit",icon:"✅",title:"Deposit Submitted!",body:`${amount} ${wallet?.symbol||"USDT"} deposit submitted successfully.`,read:false,time:new Date(),action:"/wallet"});
      localStorage.setItem("nexora_notifications", JSON.stringify(notifs));
    } catch {}
    setSubmitted(true);
  }

  return (
    <MobileLayout activePage="Deposit">
      <style>{`
        .dp-wrap{max-width:100%;overflow-x:hidden;padding-bottom:1rem;}
        .dp-method-tabs{display:flex;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:12px;padding:0.2rem;gap:0.2rem;margin-bottom:1rem;}
        .dp-method-tab{flex:1;padding:0.65rem 0.5rem;border-radius:10px;border:none;cursor:pointer;font-size:0.78rem;font-weight:600;transition:all 0.2s;background:none;color:#3a7a6a;text-align:center;line-height:1.3;}
        .dp-method-tab.active{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
        .dp-section{fontFamily:"Inter",serif;font-weight:600;font-size:0.82rem;color:#00c896;margin-bottom:0.6rem;margin-top:0.85rem;}
        .dp-coin{display:flex;align-items:center;gap:0.65rem;padding:0.8rem;background:rgba(6,18,14,0.8);border:1px solid rgba(0,200,150,0.1);border-radius:12px;cursor:pointer;margin-bottom:0.35rem;transition:all 0.18s;}
        .dp-coin:hover,.dp-coin.sel{border-color:rgba(0,200,150,0.35);background:rgba(0,200,150,0.05);}
        .dp-coin-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.95rem;font-weight:700;flex-shrink:0;}
        .dp-addr-box{background:rgba(0,0,0,0.4);border:1px solid rgba(0,200,150,0.15);border-radius:12px;padding:0.9rem;margin-bottom:0.75rem;}
        .dp-addr-row{display:flex;align-items:flex-start;gap:0.5rem;background:rgba(0,0,0,0.3);border-radius:8px;padding:0.6rem 0.7rem;}
        .dp-addr-text{flex:1;font-family:"Courier New",monospace;font-size:0.67rem;color:#00c896;word-break:break-all;line-height:1.4;}
        .dp-copy{padding:0.3rem 0.7rem;border-radius:7px;border:1px solid rgba(0,200,150,0.25);background:rgba(0,200,150,0.08);color:#00c896;font-size:0.68rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;}
        .dp-warn{background:rgba(231,76,60,0.06);border:1px solid rgba(231,76,60,0.15);border-radius:9px;padding:0.65rem;margin-bottom:0.75rem;font-size:0.72rem;color:#ff4757;line-height:1.5;}
        .dp-info{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:9px;padding:0.65rem;margin-bottom:0.75rem;font-size:0.74rem;color:#5a8a7a;line-height:1.5;}
        .dp-info b{color:#00c896;}
        .dp-input{width:100%;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.12);border-radius:10px;padding:0.65rem 0.85rem;font-size:0.86rem;color:#e8f8f4;outline:none;margin-bottom:0.65rem;font-family:"DM Sans",sans-serif;}
        .dp-input:focus{border-color:rgba(0,200,150,0.35);}
        .dp-btn{width:100%;padding:0.85rem;border:none;border-radius:11px;background:linear-gradient(135deg,#00a87a,#00c896);font-family:"Inter",serif;font-weight:700;font-size:0.9rem;color:#050f0c;cursor:pointer;box-shadow:0 0 16px rgba(0,200,150,0.18);transition:all 0.2s;margin-top:0.4rem;}
        .dp-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .ex-card{background:rgba(6,18,14,0.9);border:1px solid rgba(0,200,150,0.15);border-radius:14px;padding:1rem;margin-bottom:0.65rem;cursor:pointer;transition:all 0.18s;}
        .ex-card:hover,.ex-card.sel{border-color:rgba(0,200,150,0.4);background:rgba(0,200,150,0.05);}
        .ex-detail{background:rgba(0,0,0,0.35);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:0.75rem;margin-top:0.65rem;}
        .ex-row{display:flex;justify-content:space-between;align-items:center;padding:0.38rem 0;border-bottom:1px solid rgba(0,200,150,0.05);font-size:0.76rem;}
        .ex-row:last-child{border-bottom:none;}
        .dp-success{text-align:center;padding:1.5rem 0.5rem;}
      `}</style>

      <div className="dp-wrap">
        <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1.05rem",color:"#00c896",marginBottom:"0.25rem"}}>Deposit Funds</div>
        <div style={{fontSize:"0.72rem",color:"#3a7a6a",marginBottom:"1rem"}}>Add funds to your Finova wallet</div>

        {submitted ? (
          <div style={{background:"rgba(6,18,14,0.9)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"14px",padding:"1.5rem"}}>
            <div className="dp-success">
              <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>✅</div>
              <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"1rem",color:"#00c896",marginBottom:"0.4rem"}}>Deposit Submitted!</div>
              <div style={{fontSize:"0.78rem",color:"#5a8a7a",lineHeight:1.5,marginBottom:"1.2rem"}}>
                Your deposit of <b style={{color:"#00c896"}}>{amount} {wallet?.symbol||"USDT"}</b> has been submitted. Your savings progress has been updated.
              </div>
              <button className="dp-btn" onClick={()=>{setSubmitted(false);setAmount("");setTxHash("");setSelected(null);setSelEx(null);}}>
                Make Another Deposit
              </button>
              <button onClick={()=>router.push("/savings")} style={{width:"100%",padding:"0.7rem",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",background:"none",color:"#3a7a6a",cursor:"pointer",marginTop:"0.5rem",fontSize:"0.82rem"}}>
                View Savings Progress
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* METHOD TABS */}
            <div className="dp-method-tabs">
              <button className={"dp-method-tab"+(method==="direct"?" active":"")} onClick={()=>setMethod("direct")}>
                💼 Direct Crypto<br/><span style={{fontSize:"0.62rem",fontWeight:400}}>Send to our wallet</span>
              </button>
              <button className={"dp-method-tab"+(method==="exchanger"?" active":"")} onClick={()=>setMethod("exchanger")}>
                💱 Via Exchanger<br/><span style={{fontSize:"0.62rem",fontWeight:400}}>No crypto? Use exchanger</span>
              </button>
            </div>

            {/* DIRECT CRYPTO */}
            {method==="direct"&&(
              <>
                <div className="dp-info">
                  💡 <b>How it works:</b> Select a cryptocurrency, copy our wallet address, send from your crypto wallet, then confirm below. Your balance updates after network confirmation.
                </div>

                <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.82rem",color:"#00c896",marginBottom:"0.6rem"}}>
                  Step 1 — Select Cryptocurrency
                </div>
                {OUR_WALLETS.map(w=>(
                  <div key={w.id} className={"dp-coin"+(selected===w.id?" sel":"")} onClick={()=>setSelected(w.id)}>
                    <div className="dp-coin-icon" style={{background:w.bg,color:w.color}}>{w.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:"0.84rem"}}>{w.name}</div>
                      <div style={{fontSize:"0.68rem",color:"#3a7a6a"}}>{w.network}</div>
                    </div>
                    {selected===w.id&&<span style={{color:"#00c896",fontSize:"0.8rem"}}>✓</span>}
                  </div>
                ))}

                {wallet&&(
                  <>
                    <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.82rem",color:"#00c896",margin:"0.85rem 0 0.6rem"}}>
                      Step 2 — Send to This Address
                    </div>
                    <div className="dp-addr-box">
                      <div style={{fontSize:"0.65rem",color:"#3a7a6a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.5rem"}}>
                        NEXORA {wallet.symbol} Address ({wallet.network})
                      </div>
                      <div className="dp-addr-row">
                        <div className="dp-addr-text">{wallet.address}</div>
                        <button className="dp-copy" onClick={()=>copy(wallet.address,"addr")}>
                          {copied==="addr"?"✓ Copied":"Copy"}
                        </button>
                      </div>
                      <div style={{marginTop:"0.65rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.3rem"}}>
                        {[["Network",wallet.network],["Min. Deposit","0.01 "+wallet.symbol],["Processing","10-30 min"]].map(([l,v])=>(
                          <div key={l} style={{fontSize:"0.7rem"}}>
                            <span style={{color:"#3a7a6a"}}>{l}: </span>
                            <span style={{color:"#e8f8f4",fontWeight:600}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dp-warn">⚠️ Only send <b>{wallet.symbol}</b> via <b>{wallet.network}</b>. Wrong coin or network = permanent loss.</div>
                    <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.82rem",color:"#00c896",marginBottom:"0.6rem"}}>Step 3 — Confirm</div>
                    <input className="dp-input" type="number" placeholder={"Amount in "+wallet.symbol} value={amount} onChange={e=>setAmount(e.target.value)}/>
                    <input className="dp-input" placeholder="Transaction Hash (optional)" value={txHash} onChange={e=>setTxHash(e.target.value)}/>
                    <button className="dp-btn" onClick={handleSubmit} disabled={!amount||parseFloat(amount)<=0}>Confirm Deposit</button>
                  </>
                )}
              </>
            )}

            {/* EXCHANGER */}
            {method==="exchanger"&&(
              <>
                <div className="dp-info">
                  💱 <b>Don't have crypto?</b> Our trusted exchangers can help you convert your Naira or bank transfer into crypto and credit your Finova wallet. Contact any exchanger below, pay them, and your wallet will be credited automatically.
                </div>

                {exchangers.length===0?(
                  <div style={{textAlign:"center",padding:"2rem",color:"#3a7a6a",fontSize:"0.82rem",background:"rgba(6,18,14,0.8)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"12px"}}>
                    <div style={{fontSize:"1.8rem",marginBottom:"0.6rem"}}>💱</div>
                    No exchangers available at the moment.<br/>Please check back later or use direct crypto deposit.
                  </div>
                ):(
                  <>
                    <div style={{fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.82rem",color:"#00c896",marginBottom:"0.65rem"}}>
                      Select an Exchanger
                    </div>
                    {exchangers.map((ex:any)=>(
                      <div key={ex.id} className={"ex-card"+(selEx?.id===ex.id?" sel":"")} onClick={()=>setSelEx(selEx?.id===ex.id?null:ex)}>
                        <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                          <div style={{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.9rem",color:"#050f0c",flexShrink:0}}>
                            {ex.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:"0.86rem"}}>{ex.name}</div>
                            <div style={{fontSize:"0.7rem",color:"#3a7a6a"}}>{ex.country} · {ex.network||"Multiple networks"}</div>
                          </div>
                          <span style={{fontSize:"0.68rem",background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"20px",padding:"0.18rem 0.55rem",color:"#00c896",fontWeight:600}}>
                            Trusted ✓
                          </span>
                        </div>

                        {selEx?.id===ex.id&&(
                          <div className="ex-detail">
                            <div style={{fontFamily:"Inter,serif",fontWeight:700,fontSize:"0.82rem",color:"#00c896",marginBottom:"0.6rem"}}>Contact Details</div>
                            {[
                              ["📱 Phone",    ex.phone,    "phone"],
                              ["💬 WhatsApp", ex.whatsapp, "wa"],
                              ["🏦 Bank",     ex.bank,     null],
                              ["💳 Account",  ex.accountNo,"acc"],
                              ["👤 Acct Name",ex.accountName,null],
                            ].filter(([,v])=>v).map(([l,v,k])=>(
                              <div key={String(l)} className="ex-row">
                                <span style={{color:"#3a7a6a"}}>{l}</span>
                                <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                                  <span style={{fontWeight:600,color:"#e8f8f4",fontSize:"0.76rem"}}>{v}</span>
                                  {k&&<button className="dp-copy" onClick={(e)=>{e.stopPropagation();copyEx(String(v),String(k));}}>
                                    {exCopied===k?"✓":"Copy"}
                                  </button>}
                                </div>
                              </div>
                            ))}
                            {ex.walletAddress&&(
                              <div style={{marginTop:"0.5rem"}}>
                                <div style={{fontSize:"0.68rem",color:"#3a7a6a",marginBottom:"0.3rem"}}>💼 Exchanger Wallet Address</div>
                                <div className="dp-addr-row">
                                  <div className="dp-addr-text">{ex.walletAddress}</div>
                                  <button className="dp-copy" onClick={(e)=>{e.stopPropagation();copyEx(ex.walletAddress,"wallet");}}>
                                    {exCopied==="wallet"?"✓ Copied":"Copy"}
                                  </button>
                                </div>
                              </div>
                            )}
                            <div style={{marginTop:"0.75rem",background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"9px",padding:"0.65rem",fontSize:"0.73rem",color:"#5a8a7a",lineHeight:1.5}}>
                              📋 <b style={{color:"#00c896"}}>How to use exchanger:</b><br/>
                              1. Contact the exchanger via phone or WhatsApp<br/>
                              2. Tell them how much you want to deposit<br/>
                              3. Send payment to their bank account or wallet<br/>
                              4. They will credit your Finova account within 30 minutes<br/>
                              5. Check your savings dashboard to confirm
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {selEx&&(
                      <>
                        <div style={{marginTop:"0.85rem",fontFamily:"Inter,serif",fontWeight:600,fontSize:"0.82rem",color:"#00c896",marginBottom:"0.6rem"}}>
                          Confirm Your Deposit
                        </div>
                        <input className="dp-input" type="number" placeholder="Amount deposited (in USDT equivalent)" value={amount} onChange={e=>setAmount(e.target.value)}/>
                        <button className="dp-btn" onClick={handleSubmit} disabled={!amount||parseFloat(amount)<=0}>
                          I Have Paid the Exchanger
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}
