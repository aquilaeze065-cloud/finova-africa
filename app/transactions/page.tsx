"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";
import { USDToNGN, useNGNRate } from "../components/NGNRate";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tx = {
  id: string;
  type: string;
  crypto: string;
  amount: number;
  usd_value: number;
  status: string;
  tx_hash?: string;
  network?: string;
  created_at: string;
};

function getTypeLabel(type:string) {
  switch(type) {
    case "savings_payment": return "Savings Payment";
    case "penalty":         return "Penalty Payment";
    case "deposit":         return "Deposit";
    case "withdrawal":      return "Withdrawal";
    case "referral_bonus":  return "Referral Bonus";
    case "interest":        return "Interest Credit";
    default: return type?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())||"Transaction";
  }
}

function getTypeIcon(type:string) {
  switch(type) {
    case "savings_payment": return "💰";
    case "penalty":         return "⚠️";
    case "deposit":         return "⬆️";
    case "withdrawal":      return "⬇️";
    case "referral_bonus":  return "🎁";
    case "interest":        return "📈";
    default: return "💳";
  }
}

async function generateReceiptPDF(tx: Tx, user: any, ngnRate: number) {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });

  const G  = [0, 200, 150];
  const BG = [5, 15, 12];
  const W  = 210;
  const ngnAmt = (tx.usd_value * ngnRate).toLocaleString("en-NG",{maximumFractionDigits:0});

  // Background
  doc.setFillColor(BG[0],BG[1],BG[2]);
  doc.rect(0,0,W,297,"F");

  // Header bar
  doc.setFillColor(8,26,20);
  doc.rect(0,0,W,45,"F");

  // Logo text
  doc.setTextColor(G[0],G[1],G[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica","bold");
  doc.text("◈ NEXORA",20,22);

  doc.setTextColor(90,138,122);
  doc.setFontSize(9);
  doc.setFont("helvetica","normal");
  doc.text("SMART FINANCE. BORDERLESS FUTURE.",20,30);

  // Receipt title
  doc.setTextColor(232,248,244);
  doc.setFontSize(13);
  doc.setFont("helvetica","bold");
  doc.text("TRANSACTION RECEIPT",20,40);

  // Status badge
  const isOk = tx.status==="confirmed"||tx.status==="approved"||tx.status==="completed";
  doc.setFillColor(isOk?0:255, isOk?200:71, isOk?150:87);
  doc.roundedRect(150,32,45,10,2,2,"F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(8);
  doc.setFont("helvetica","bold");
  doc.text(isOk?"✓ CONFIRMED":"PENDING",152,39);

  // Amount section
  doc.setFillColor(0,168,122);
  doc.rect(0,45,W,35,"F");

  doc.setTextColor(5,15,12);
  doc.setFontSize(10);
  doc.setFont("helvetica","normal");
  doc.text("AMOUNT",20,56);

  doc.setFontSize(26);
  doc.setFont("helvetica","bold");
  doc.text(`$${tx.usd_value?.toFixed(2)||"0.00"} USDT`,20,68);

  doc.setFontSize(11);
  doc.setFont("helvetica","normal");
  doc.text(`≈ ₦${ngnAmt}`,20,76);

  // Details section
  let y = 95;
  const details = [
    ["Transaction ID",  tx.id?.substring(0,18)+"..."],
    ["Date & Time",     new Date(tx.created_at).toLocaleString("en-GB",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})],
    ["Type",            getTypeLabel(tx.type)],
    ["Currency",        tx.crypto||"USDT"],
    ["Network",         tx.network||"TRC-20"],
    ["Status",          tx.status?.toUpperCase()||"PENDING"],
    ["NGN Rate",        `₦${ngnRate.toLocaleString("en-NG",{maximumFractionDigits:0})} / USDT`],
    ["Account",         user?.name||"Account Holder"],
    ["Email",           user?.email||""],
    ...(tx.tx_hash?[["TX Hash",tx.tx_hash.substring(0,24)+"..."]] as [string,string][]:[] as [string,string][]),
  ];

  details.forEach(([label,value],i)=>{
    const rowBg = i%2===0;
    if(rowBg){
      doc.setFillColor(8,26,20);
      doc.rect(15,y-5,W-30,10,"F");
    }
    doc.setTextColor(90,138,122);
    doc.setFontSize(8);
    doc.setFont("helvetica","normal");
    doc.text(label,20,y);
    doc.setTextColor(232,248,244);
    doc.setFont("helvetica","bold");
    doc.text(String(value),W-20,y,{align:"right"});
    y += 11;
  });

  // Footer
  y += 15;
  doc.setFillColor(8,26,20);
  doc.rect(15,y,W-30,25,"F");

  doc.setTextColor(0,200,150);
  doc.setFontSize(9);
  doc.setFont("helvetica","bold");
  doc.text("NEXORA FINANCE",W/2,y+9,{align:"center"});

  doc.setTextColor(58,90,74);
  doc.setFontSize(7);
  doc.setFont("helvetica","normal");
  doc.text("This is an automatically generated receipt. Contact support@nexora.com for queries.",W/2,y+15,{align:"center"});
  doc.text(`Generated: ${new Date().toLocaleString("en-GB")} | nexora.app`,W/2,y+20,{align:"center"});

  // Dotted border
  doc.setDrawColor(0,200,150);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2,3],0);
  doc.rect(10,10,W-20,277,"S");

  doc.save(`nexora-receipt-${tx.id?.substring(0,8)||"tx"}.pdf`);
}

export default function TransactionsPage() {
  const router = useRouter();
  const [txs,     setTxs]     = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [user,    setUser]    = useState<any>(null);
  const [downloading, setDownloading] = useState<string|null>(null);
  const { rate }  = useNGNRate();

  useEffect(()=>{
    try { setUser(JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}")); } catch {}
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    if(!token){ window.location.replace("/login"); return; }

    fetch(`${API}/api/transactions`,{headers:{"Authorization":`Bearer ${token}`}})
      .then(r=>r.json())
      .then(d=>{ if(d.transactions) setTxs(d.transactions); setLoading(false); })
      .catch(()=>{
        // Fallback to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem("nexora_payments")||"[]");
          const mapped = stored.map((p:any)=>({
            id:         p.id||"tx_"+Date.now(),
            type:       p.type||"savings_payment",
            crypto:     p.currency||"USDT",
            amount:     parseFloat(p.amount)||3,
            usd_value:  parseFloat(p.amount)||3,
            status:     p.status||"pending",
            tx_hash:    p.txHash||null,
            network:    p.network||"TRC-20",
            created_at: p.submittedAt||p.creditedAt||new Date().toISOString(),
          }));
          setTxs(mapped);
        } catch {}
        setLoading(false);
      });
  },[]);

  async function downloadReceipt(tx: Tx) {
    setDownloading(tx.id);
    try {
      await generateReceiptPDF(tx, user, rate);
    } catch(e) {
      console.error("PDF error:", e);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  const filtered = filter==="all" ? txs : txs.filter(t=>t.type===filter||t.status===filter);
  const filters  = [
    {id:"all",             label:"All"},
    {id:"savings_payment", label:"Savings"},
    {id:"deposit",         label:"Deposits"},
    {id:"penalty",         label:"Penalties"},
    {id:"confirmed",       label:"Confirmed"},
    {id:"pending",         label:"Pending"},
  ];

  const statusColor = (s:string) =>
    s==="confirmed"||s==="approved"||s==="completed" ? "#00c896"
    : s==="pending" ? "#f39c12"
    : s==="rejected" ? "#ff4757"
    : "#5a8a7a";

  return (
    <MobileLayout activePage="History">
      <style>{`
        .tx-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:16px;overflow:hidden;margin-bottom:0.85rem;}
        .tx-item{display:flex;align-items:center;gap:0.75rem;padding:0.9rem 1rem;border-bottom:1px solid rgba(0,200,150,0.06);transition:background 0.15s;}
        .tx-item:last-child{border-bottom:none;}
        .tx-item:hover{background:rgba(0,200,150,0.02);}
        .tx-icon{width:40px;height:40px;border-radius:11px;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.12);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .filter-row{display:flex;gap:0.35rem;overflow-x:auto;margin-bottom:1rem;padding-bottom:0.25rem;scrollbar-width:none;}
        .filter-row::-webkit-scrollbar{display:none;}
        .filter-btn{padding:0.35rem 0.85rem;border-radius:20px;font-size:0.72rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.18s;font-family:Inter,sans-serif;flex-shrink:0;}
        .filter-btn.on{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;border:none;}
        .filter-btn.off{background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.12);color:#5a8a7a;}
        .dl-btn{display:flex;align-items:center;gap:0.25rem;padding:0.28rem 0.6rem;border:1px solid rgba(0,200,150,0.18);border-radius:7px;background:rgba(0,200,150,0.06);color:#00c896;font-size:0.65rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap;transition:all 0.18s;}
        .dl-btn:hover{border-color:rgba(0,200,150,0.35);background:rgba(0,200,150,0.1);}
        .dl-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .empty{text-align:center;padding:3rem 1rem;color:#5a8a7a;}
        .hash{font-family:monospace;font-size:0.62rem;color:#3a6a5a;word-break:break-all;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{marginBottom:"1.1rem"}}>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:"#00c896",marginBottom:"0.15rem"}}>Transaction History</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>All your payments and credits · Download receipts as PDF</div>
      </div>

      {/* FILTERS */}
      <div className="filter-row">
        {filters.map(f=>(
          <button key={f.id} className={`filter-btn ${filter===f.id?"on":"off"}`} onClick={()=>setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">
          <div style={{width:"28px",height:"28px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 0.75rem"}}/>
          Loading transactions...
        </div>
      ) : filtered.length===0 ? (
        <div className="empty">
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📋</div>
          No {filter==="all"?"transactions":filter} found yet.<br/>
          <span style={{fontSize:"0.76rem"}}>Transactions appear here after you make payments.</span>
        </div>
      ) : (
        <>
          <div style={{fontSize:"0.7rem",color:"#5a8a7a",marginBottom:"0.5rem",fontWeight:600}}>
            {filtered.length} transaction{filtered.length!==1?"s":""} · Tap PDF to download receipt
          </div>
          <div className="tx-card">
            {filtered.map((tx,i)=>(
              <div key={tx.id||i} className="tx-item">
                <div className="tx-icon">{getTypeIcon(tx.type)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.1rem"}}>
                    <span style={{fontWeight:700,fontSize:"0.84rem"}}>{getTypeLabel(tx.type)}</span>
                    <span style={{fontWeight:800,fontSize:"0.88rem",color:"#00c896"}}>${tx.usd_value?.toFixed(2)||tx.amount?.toFixed(2)||"0.00"}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.18rem"}}>
                    <USDToNGN usdAmount={tx.usd_value||tx.amount||0}/>
                    <span style={{fontSize:"0.65rem",fontWeight:700,color:statusColor(tx.status)}}>
                      {tx.status?.toUpperCase()||"PENDING"}
                    </span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:"0.67rem",color:"#3a5a4a"}}>
                      {new Date(tx.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                    </span>
                    <button
                      className="dl-btn"
                      disabled={downloading===tx.id}
                      onClick={()=>downloadReceipt(tx)}
                    >
                      {downloading===tx.id
                        ?<><span style={{width:"10px",height:"10px",border:"1.5px solid rgba(0,200,150,0.3)",borderTop:"1.5px solid #00c896",borderRadius:"50%",display:"inline-block",animation:"spin 0.6s linear infinite"}}/> Generating</>
                        :<>📄 PDF Receipt</>
                      }
                    </button>
                  </div>
                  {tx.tx_hash&&(
                    <div className="hash" style={{marginTop:"0.2rem"}}>
                      🔗 {tx.tx_hash.substring(0,20)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* INFO BOX */}
      <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"13px",padding:"0.9rem 1rem",fontSize:"0.74rem",color:"#5a8a7a",lineHeight:1.7}}>
        <b style={{color:"#00c896",display:"block",marginBottom:"0.3rem"}}>ℹ️ About Receipts</b>
        PDF receipts include your transaction ID, date, amount in USDT and NGN equivalent, network, and status. Keep them for your records.
      </div>
    </MobileLayout>
  );
}
