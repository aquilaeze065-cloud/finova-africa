"use client";
import { useEffect, useState, useCallback } from "react";

interface Props { week: number; onDone: ()=>void; }

export default function MilestoneConfetti({ week, onDone }: Props) {
  const [particles, setParticles] = useState<any[]>([]);

  const MILESTONES: Record<number,{title:string,sub:string,icon:string,color:string}> = {
    10: { title:"10 Weeks Strong! 🔥", sub:"You're building incredible habits!", icon:"🏅",color:"#f39c12" },
    26: { title:"Half Way There! 🚀",  sub:"26 weeks done — you're unstoppable!",icon:"🥈",color:"#00c896" },
    52: { title:"CHAMPION! 🏆",        sub:"52 weeks! Collect your full payout!", icon:"🏆",color:"#ffd700" },
  };

  const milestone = MILESTONES[week];

  useEffect(()=>{
    const colors=["#00c896","#ffd700","#ff6b9d","#00bfff","#ff8c00","#7c3aed","#10b981"];
    const pts = Array.from({length:80},(_,i)=>({
      id:i, x:Math.random()*100, y:-10-Math.random()*20,
      color:colors[Math.floor(Math.random()*colors.length)],
      size:4+Math.random()*8, speed:2+Math.random()*4,
      drift:(Math.random()-0.5)*3, rotation:Math.random()*360,
      shape:Math.random()>0.5?"circle":"rect",
    }));
    setParticles(pts);

    // Animate
    let frame=0;
    const interval = setInterval(()=>{
      frame++;
      setParticles(prev=>prev.map(p=>({
        ...p, y:p.y+p.speed, x:p.x+p.drift*Math.sin(frame*0.05),
        rotation:p.rotation+3,
      })).filter(p=>p.y<120));
    },16);

    const timer = setTimeout(()=>{ clearInterval(interval); onDone(); }, 5000);
    return ()=>{ clearInterval(interval); clearTimeout(timer); };
  },[onDone]);

  if(!milestone) return null;

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,pointerEvents:"none"}}>
      {/* Confetti particles */}
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`,top:`${p.y}%`,
          width:`${p.size}px`,height:`${p.size}px`,
          borderRadius:p.shape==="circle"?"50%":"2px",
          background:p.color,
          transform:`rotate(${p.rotation}deg)`,
          opacity:p.y>100?0:1,
          transition:"opacity 0.3s",
        }}/>
      ))}

      {/* Milestone card */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        pointerEvents:"auto",
        background:"linear-gradient(135deg,#081a14,#060f0c)",
        border:`2px solid ${milestone.color}`,
        borderRadius:"24px",padding:"2rem 1.5rem",
        textAlign:"center",width:"min(340px,90vw)",
        boxShadow:`0 0 60px ${milestone.color}55`,
        animation:"milPop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <style>{`
          @keyframes milPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.5)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
          @keyframes milShine{0%,100%{box-shadow:0 0 60px ${milestone.color}55}50%{box-shadow:0 0 100px ${milestone.color}88}}
        `}</style>
        <div style={{fontSize:"4rem",marginBottom:"0.5rem",animation:"milShine 1.5s infinite"}}>{milestone.icon}</div>
        <div style={{fontWeight:900,fontSize:"1.3rem",color:milestone.color,marginBottom:"0.4rem",fontFamily:"Inter,sans-serif"}}>{milestone.title}</div>
        <div style={{fontSize:"0.88rem",color:"#5a8a7a",lineHeight:1.6,marginBottom:"1.2rem"}}>{milestone.sub}</div>
        <div style={{background:`rgba(0,200,150,0.08)`,border:"1px solid rgba(0,200,150,0.15)",borderRadius:"11px",padding:"0.75rem",marginBottom:"1rem",fontSize:"0.8rem",color:"#5a8a7a"}}>
          Week <b style={{color:milestone.color,fontSize:"1.1rem"}}>{week}</b> of 52 completed 🎯
        </div>
        <button
          onClick={onDone}
          style={{padding:"0.85rem 2rem",border:"none",borderRadius:"12px",background:`linear-gradient(135deg,${milestone.color},${milestone.color}cc)`,color:"#050f0c",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",fontFamily:"Inter,sans-serif",width:"100%"}}
        >
          Keep Saving! 💪
        </button>
      </div>
    </div>
  );
}
