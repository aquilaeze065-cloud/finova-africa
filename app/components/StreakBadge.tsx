"use client";
import { useState, useEffect } from "react";

interface Props { weeks: any[]; }

export default function StreakBadge({ weeks }: Props) {
  const [streak, setStreak] = useState(0);
  const [best,   setBest]   = useState(0);

  useEffect(()=>{
    if(!weeks?.length) return;
    const sorted = [...weeks].sort((a,b)=>(a.week||a.week_number)-(b.week||b.week_number));
    let cur=0, top=0;
    for(let i=sorted.length-1;i>=0;i--) {
      if(sorted[i].status==="paid") { cur++; if(cur>top) top=cur; }
      else break;
    }
    setStreak(cur); setBest(top);
  },[weeks]);

  if(streak===0) return null;

  const cfg =
    streak>=20 ? {label:"🏆 Legend",    color:"#ffd700", bg:"rgba(255,215,0,0.12)",    border:"rgba(255,215,0,0.3)"}
    :streak>=10 ? {label:"💎 Diamond",   color:"#00bfff", bg:"rgba(0,191,255,0.1)",     border:"rgba(0,191,255,0.25)"}
    :streak>=5  ? {label:"🔥 On Fire",   color:"#ff6b35", bg:"rgba(255,107,53,0.1)",    border:"rgba(255,107,53,0.25)"}
    :streak>=3  ? {label:"⚡ Momentum",  color:"#00c896", bg:"rgba(0,200,150,0.1)",     border:"rgba(0,200,150,0.25)"}
    :             {label:"🌱 Growing",   color:"#10b981", bg:"rgba(16,185,129,0.08)",   border:"rgba(16,185,129,0.2)"};

  return (
    <div style={{
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      borderRadius:"16px", padding:"0.9rem 1rem",
      marginBottom:"0.85rem", display:"flex", alignItems:"center", gap:"0.85rem",
    }}>
      <div style={{textAlign:"center",flexShrink:0}}>
        <div style={{fontSize:"2.2rem",lineHeight:1}}>{cfg.label.split(" ")[0]}</div>
        <div style={{fontSize:"0.58rem",color:cfg.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"0.15rem"}}>Streak</div>
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:800,fontSize:"1rem",color:cfg.color,marginBottom:"0.12rem"}}>
          {cfg.label.split(" ").slice(1).join(" ")} — {streak} Week{streak!==1?"s":""}!
        </div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a",lineHeight:1.4}}>
          You've paid {streak} weeks in a row. {best>streak?`Best: ${best} weeks. `:""}Keep it going! 💪
        </div>
        <div style={{marginTop:"0.45rem",height:"5px",background:"rgba(255,255,255,0.06)",borderRadius:"5px",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:"5px",background:`linear-gradient(90deg,${cfg.color}88,${cfg.color})`,width:`${Math.min(100,streak/52*100)}%`,transition:"width 0.5s"}}/>
        </div>
      </div>
      <div style={{textAlign:"center",flexShrink:0}}>
        <div style={{fontSize:"1.3rem",fontWeight:800,color:cfg.color}}>{streak}</div>
        <div style={{fontSize:"0.58rem",color:"#5a8a7a"}}>of 52</div>
      </div>
    </div>
  );
}
