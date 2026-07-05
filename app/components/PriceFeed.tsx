"use client";
import { useState, useEffect, useCallback } from "react";

interface CoinPrice { id:string; symbol:string; name:string; icon:string; color:string; price:number; change:number; prev:number; }

const COINS = [
  { id:"bitcoin",     symbol:"BTC",  name:"Bitcoin",  icon:"₿",  color:"#00c896" },
  { id:"ethereum",    symbol:"ETH",  name:"Ethereum", icon:"⟠",  color:"#627eea" },
  { id:"binancecoin", symbol:"BNB",  name:"BNB",      icon:"🔶", color:"#00c896" },
  { id:"tether",      symbol:"USDT", name:"Tether",   icon:"₮",  color:"#26a17b" },
  { id:"solana",      symbol:"SOL",  name:"Solana",   icon:"◎",  color:"#9945ff" },
  { id:"ripple",      symbol:"XRP",  name:"XRP",      icon:"✕",  color:"#346aa9" },
];

export function useLivePrices() {
  const [prices,      setPrices]      = useState<Record<string,CoinPrice>>({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const ids = COINS.map(c=>c.id).join(",");
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,{cache:"no-store"});
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPrices(prev => {
        const next: Record<string,CoinPrice> = {};
        COINS.forEach(c => {
          const d = data[c.id]; if (!d) return;
          next[c.symbol] = { ...c, price:d.usd, change:d.usd_24h_change??0, prev:prev[c.symbol]?.price??d.usd };
        });
        return next;
      });
      setLastUpdated(new Date()); setError(false);
    } catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPrices(); const t=setInterval(fetchPrices,30000); return()=>clearInterval(t); }, [fetchPrices]);
  return { prices, loading, error, lastUpdated, refresh:fetchPrices };
}

export function PriceTicker() {
  const { prices, loading, error } = useLivePrices();
  const list = Object.values(prices);
  return (
    <>
      <style>{`
        .ticker-wrap{overflow:hidden;background:rgba(6,15,12,0.95);border-bottom:1px solid rgba(46,204,113,0.1);height:34px;display:flex;align-items:center;}
        .ticker-track{display:flex;animation:tickerScroll 35s linear infinite;white-space:nowrap;}
        .ticker-track:hover{animation-play-state:paused;}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .ticker-item{display:inline-flex;align-items:center;gap:0.4rem;padding:0 1.2rem;font-size:0.78rem;}
        .ticker-sym{font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;}
        .ticker-dot{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.15);}
        .ticker-live{display:flex;align-items:center;gap:0.3rem;padding:0 0.8rem;font-size:0.68rem;color:#2ecc71;font-weight:700;white-space:nowrap;flex-shrink:0;border-right:1px solid rgba(46,204,113,0.2);}
        .t-pulse{width:6px;height:6px;border-radius:50%;background:#2ecc71;animation:tPulse 1.5s infinite;}
        @keyframes tPulse{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
      <div className="ticker-wrap">
        <div className="ticker-live"><div className="t-pulse"/>LIVE</div>
        {loading?<div style={{fontSize:"0.75rem",color:"#7a9bbf",padding:"0 1rem"}}>Loading prices…</div>
        :error?<div style={{fontSize:"0.75rem",color:"#ff4757",padding:"0 1rem"}}>Price feed unavailable</div>
        :<div className="ticker-track">
          {[...list,...list].map((c,i)=>(
            <span key={i} className="ticker-item">
              <span style={{color:c.color}}>{c.icon}</span>
              <span className="ticker-sym">{c.symbol}</span>
              <span style={{fontWeight:600}}>${c.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
              <span style={{fontSize:"0.72rem",fontWeight:700,color:c.change>=0?"#2ecc71":"#ff4757"}}>{c.change>=0?"+":""}{c.change.toFixed(2)}%</span>
              <span className="ticker-dot"/>
            </span>
          ))}
        </div>}
      </div>
    </>
  );
}

export function PriceTable() {
  const { prices, loading, error, lastUpdated, refresh } = useLivePrices();
  const list = Object.values(prices);
  const NGN = 1640;
  return (
    <>
      <style>{`
        .pt-wrap{background:#081a14;border:1px solid rgba(255,255,255,0.06);border-radius:18px;overflow:hidden;}
        .pt-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;border-bottom:1px solid rgba(255,255,255,0.06);}
        .pt-row{display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1.2rem;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
        .pt-row:last-child{border-bottom:none;}
        .pt-row:hover{background:rgba(255,255,255,0.03);}
        .pt-icon{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;flex-shrink:0;}
        .pt-skel{height:52px;background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;margin:0.5rem 1rem;border-radius:8px;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
      <div className="pt-wrap">
        <div className="pt-head">
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.95rem"}}>📊 Live Prices</div>
            {lastUpdated&&<div style={{fontSize:"0.72rem",color:"#7a9bbf"}}>Updated {lastUpdated.toLocaleTimeString()}</div>}
          </div>
          <button onClick={refresh} style={{padding:"0.3rem 0.7rem",background:"rgba(46,204,113,0.1)",border:"1px solid rgba(46,204,113,0.25)",borderRadius:"8px",color:"#2ecc71",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>↻ Refresh</button>
        </div>
        {loading?[1,2,3,4,5,6].map(i=><div key={i} className="pt-skel"/>)
        :error?<div style={{padding:"2rem",textAlign:"center",color:"#ff4757",fontSize:"0.85rem"}}>⚠️ Could not load prices.<br/><button onClick={refresh} style={{marginTop:"0.75rem",padding:"0.3rem 0.7rem",background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.3)",borderRadius:"8px",color:"#ff4757",cursor:"pointer"}}>Retry</button></div>
        :list.map(c=>(
          <div key={c.symbol} className="pt-row">
            <div className="pt-icon" style={{background:`${c.color}22`,color:c.color}}>{c.icon}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.88rem"}}>{c.name}</div><div style={{fontSize:"0.72rem",color:"#7a9bbf"}}>{c.symbol}</div></div>
            <div style={{textAlign:"right",marginRight:"0.5rem"}}><div style={{fontSize:"0.7rem",color:"#2ecc71"}}>₦{(c.price*NGN).toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.88rem"}}>${c.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div style={{fontSize:"0.72rem",color:c.change>=0?"#2ecc71":"#ff4757",fontWeight:700}}>{c.change>=0?"+":""}{c.change.toFixed(2)}%</div></div>
          </div>
        ))}
      </div>
    </>
  );
}
