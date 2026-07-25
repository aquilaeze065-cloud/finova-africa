"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface NGNRateProps {
  usdAmount: number;
  showTicker?: boolean;
  style?: React.CSSProperties;
}

export function useNGNRate() {
  const [rate, setRate] = useState<number>(1580);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // Try backend first
    fetch(`${API}/api/transactions/rates/ngn`)
      .then(r=>r.json())
      .then(d=>{ if(d.rate) { setRate(d.rate); setLoading(false); } })
      .catch(()=>{
        // Fallback to direct API
        fetch("https://open.er-api.com/v6/latest/USD")
          .then(r=>r.json())
          .then(d=>{ if(d.rates?.NGN) setRate(d.rates.NGN); })
          .catch(()=>{})
          .finally(()=>setLoading(false));
      });
  },[]);

  return { rate, loading };
}

export function USDToNGN({ usdAmount, style }: { usdAmount:number; style?:React.CSSProperties }) {
  const { rate, loading } = useNGNRate();
  if (loading || !usdAmount) return null;
  const ngn = (usdAmount * rate).toLocaleString("en-NG", { maximumFractionDigits:0 });
  return (
    <span style={{ fontSize:"0.72rem", color:"#5a8a7a", ...style }}>
      ≈ ₦{ngn}
    </span>
  );
}

export default function NGNRateTicker() {
  const { rate, loading } = useNGNRate();
  const [blink, setBlink] = useState(false);

  useEffect(()=>{
    const t = setInterval(()=>{ setBlink(true); setTimeout(()=>setBlink(false),500); }, 30000);
    return ()=>clearInterval(t);
  },[]);

  if (loading) return null;

  return (
    <div style={{
      display:"inline-flex",alignItems:"center",gap:"0.4rem",
      background:"rgba(0,200,150,0.06)",border:"1px solid rgba(0,200,150,0.12)",
      borderRadius:"8px",padding:"0.28rem 0.65rem",fontSize:"0.7rem",
      color:blink?"#00c896":"#5a8a7a",transition:"color 0.3s",
    }}>
      <span style={{fontSize:"0.65rem"}}>💱</span>
      <span style={{fontWeight:600,color:"#e8f8f4"}}>$1</span>
      <span>=</span>
      <span style={{fontWeight:700,color:"#00c896"}}>
        ₦{rate.toLocaleString("en-NG",{maximumFractionDigits:0})}
      </span>
      <span style={{fontSize:"0.58rem",color:"#3a6a5a"}}>LIVE</span>
    </div>
  );
}
