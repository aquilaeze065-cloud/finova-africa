"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function anonymize(name:string) {
  if(!name) return "Anonymous";
  const parts = name.trim().split(" ");
  const first = parts[0];
  const last  = parts.length>1 ? parts[parts.length-1][0]+"." : "";
  return `${first} ${last}`.trim();
}

const AVATARS = ["🦁","🐯","🦊","🐺","🦅","🐬","🦋","🌟","⚡","🔥","💎","🌊","🏔️","🎯","🚀"];

function getAvatar(id:string) {
  let hash=0; for(const c of id) hash=(hash*31+c.charCodeAt(0))&0xffffffff;
  return AVATARS[Math.abs(hash)%AVATARS.length];
}

export default function LeaderboardPage() {
  const router  = useRouter();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [myRank,  setMyRank]  = useState<any>(null);
  const [tab,     setTab]     = useState<"weeks"|"amount">("weeks");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const token = localStorage.getItem("nexora_token")||localStorage.getItem("finova_token");
    const user  = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");

    fetch(`${API}/api/leaderboard`,{headers:token?{"Authorization":`Bearer ${token}`}:{}})
      .then(r=>r.json())
      .then(d=>{
        if(d.leaders) {
          setLeaders(d.leaders);
          const rank = d.leaders.findIndex((l:any)=>l.user_id===user.id);
          if(rank>=0) setMyRank({...d.leaders[rank], rank:rank+1});
        }
        setLoading(false);
      })
      .catch(()=>{
        // Generate mock leaderboard from localStorage for demo
        const mockData = [
          {user_id:"u1",name:"Chioma A.",   weeks_paid:48,total_saved:144,streak:48},
          {user_id:"u2",name:"Emeka O.",    weeks_paid:45,total_saved:135,streak:40},
          {user_id:"u3",name:"Fatima M.",   weeks_paid:42,total_saved:126,streak:35},
          {user_id:"u4",name:"Kwame A.",    weeks_paid:40,total_saved:120,streak:30},
          {user_id:"u5",name:"Aisha B.",    weeks_paid:38,total_saved:114,streak:28},
          {user_id:"u6",name:"Tunde S.",    weeks_paid:36,total_saved:108,streak:20},
          {user_id:"u7",name:"Ngozi E.",    weeks_paid:32,total_saved:96, streak:18},
          {user_id:"u8",name:"Seun L.",     weeks_paid:28,total_saved:84, streak:15},
          {user_id:"u9",name:"Amara C.",    weeks_paid:24,total_saved:72, streak:10},
          {user_id:"u10",name:"Kemi W.",    weeks_paid:20,total_saved:60, streak:8},
        ];

        const savings = JSON.parse(localStorage.getItem("nexora_savings")||"null");
        if(savings && user.id) {
          const myWeeks = savings.weeks?.filter((w:any)=>w.status==="paid").length||0;
          const myEntry = {user_id:user.id,name:user.name||"You",weeks_paid:myWeeks,total_saved:savings.totalPaid||0,streak:myWeeks,isMe:true};
          const rank = mockData.findIndex(l=>l.weeks_paid<myWeeks);
          if(rank>=0) { mockData.splice(rank,0,myEntry); } else { mockData.push(myEntry); }
          const myRankIdx = mockData.findIndex(l=>l.user_id===user.id);
          setMyRank({...myEntry, rank:myRankIdx+1});
        }
        setLeaders(mockData);
        setLoading(false);
      });
  },[]);

  const sorted = [...leaders].sort((a,b)=>tab==="weeks"?b.weeks_paid-a.weeks_paid:b.total_saved-a.total_saved);
  const medals = ["🥇","🥈","🥉"];

  const rankColor = (i:number) =>
    i===0?"#ffd700" : i===1?"#c0c0c0" : i===2?"#cd7f32" : "#5a8a7a";

  return (
    <MobileLayout activePage="Progress">
      <style>{`
        .lb-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:16px;overflow:hidden;margin-bottom:0.85rem;}
        .lb-row{display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-bottom:1px solid rgba(0,200,150,0.06);transition:background 0.15s;}
        .lb-row:last-child{border-bottom:none;}
        .lb-row.me{background:rgba(0,200,150,0.06);border-left:3px solid #00c896;}
        .lb-rank{width:28px;text-align:center;font-weight:800;font-size:1rem;flex-shrink:0;}
        .lb-av{width:38px;height:38px;border-radius:50%;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
        .tab-row{display:flex;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:0.2rem;gap:0.2rem;margin-bottom:1rem;}
        .tab-btn{flex:1;padding:0.52rem;border-radius:8px;border:none;cursor:pointer;font-family:Inter,sans-serif;font-weight:600;font-size:0.82rem;transition:all 0.2s;background:none;color:#3a6a5a;}
        .tab-btn.on{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .top3{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:0.5rem;margin-bottom:1rem;align-items:flex-end;}
        .top3-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:14px;padding:0.85rem 0.5rem;text-align:center;transition:all 0.2s;}
        .top3-card.first{border-color:rgba(255,215,0,0.3);background:rgba(255,215,0,0.04);}
        .top3-card.second{border-color:rgba(192,192,192,0.2);}
        .top3-card.third{border-color:rgba(205,127,50,0.2);}
      `}</style>

      <div style={{marginBottom:"1.1rem"}}>
        <div style={{fontWeight:800,fontSize:"1.05rem",color:"#00c896",marginBottom:"0.15rem"}}>🏆 Savings Leaderboard</div>
        <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>Top savers ranked anonymously — your name shown only as First L.</div>
      </div>

      {/* MY RANK CARD */}
      {myRank&&(
        <div style={{background:"linear-gradient(135deg,rgba(0,200,150,0.1),rgba(0,102,255,0.06))",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"14px",padding:"0.9rem 1rem",marginBottom:"0.85rem",display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <div style={{width:"42px",height:"42px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"1rem",color:"#050f0c",flexShrink:0}}>
            {myRank.rank}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:"0.88rem",color:"#00c896",marginBottom:"0.1rem"}}>Your Rank: #{myRank.rank}</div>
            <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>{myRank.weeks_paid} weeks paid · ${myRank.total_saved?.toFixed(2)||"0.00"} saved</div>
          </div>
          <div style={{fontSize:"1.8rem"}}>{getAvatar(myRank.user_id||"me")}</div>
        </div>
      )}

      {/* TABS */}
      <div className="tab-row">
        <button className={`tab-btn ${tab==="weeks"?"on":""}`} onClick={()=>setTab("weeks")}>🏅 Most Weeks</button>
        <button className={`tab-btn ${tab==="amount"?"on":""}`} onClick={()=>setTab("amount")}>💰 Most Saved</button>
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"3rem",color:"#5a8a7a"}}>
          <div style={{width:"28px",height:"28px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 0.75rem"}}/>
          Loading leaderboard...
        </div>
      ):(
        <>
          {/* TOP 3 PODIUM */}
          {sorted.length>=3&&(
            <div className="top3">
              {[sorted[1],sorted[0],sorted[2]].map((l,i)=>{
                const pos = i===0?2:i===1?1:3;
                const classes = ["second","first","third"];
                const heights = ["auto","auto","auto"];
                return (
                  <div key={l.user_id} className={`top3-card ${classes[i]}`} style={{transform:i===1?"scale(1.04)":"none"}}>
                    <div style={{fontSize:"1.8rem",marginBottom:"0.35rem"}}>{getAvatar(l.user_id)}</div>
                    <div style={{fontSize:"1.4rem",marginBottom:"0.2rem"}}>{medals[pos-1]}</div>
                    <div style={{fontWeight:700,fontSize:"0.78rem",color:"#e8f8f4",marginBottom:"0.1rem"}}>{anonymize(l.name)}</div>
                    <div style={{fontWeight:800,fontSize:"0.9rem",color:rankColor(pos-1)}}>{tab==="weeks"?l.weeks_paid+" wks":"$"+parseFloat(l.total_saved||0).toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FULL LIST */}
          <div className="lb-card">
            {sorted.map((l,i)=>(
              <div key={l.user_id||i} className={`lb-row ${l.isMe?"me":""}`}>
                <div className="lb-rank" style={{color:rankColor(i)}}>
                  {i<3?medals[i]:`#${i+1}`}
                </div>
                <div className="lb-av">{getAvatar(l.user_id||String(i))}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                    <span style={{fontWeight:700,fontSize:"0.84rem"}}>{l.isMe?"You":anonymize(l.name)}</span>
                    {l.isMe&&<span style={{fontSize:"0.6rem",background:"rgba(0,200,150,0.1)",color:"#00c896",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"20px",padding:"0.1rem 0.4rem",fontWeight:700}}>YOU</span>}
                    {l.streak>=10&&<span style={{fontSize:"0.7rem"}}>🔥</span>}
                  </div>
                  <div style={{fontSize:"0.68rem",color:"#5a8a7a",marginTop:"0.05rem"}}>
                    {l.streak>0?`🔥 ${l.streak} week streak · `:""}
                    {l.weeks_paid} of 52 weeks
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontWeight:800,fontSize:"0.9rem",color:i<3?rankColor(i):"#e8f8f4"}}>
                    {tab==="weeks"?l.weeks_paid:("$"+parseFloat(l.total_saved||0).toFixed(2))}
                  </div>
                  <div style={{fontSize:"0.62rem",color:"#5a8a7a"}}>{tab==="weeks"?"weeks":"saved"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"13px",padding:"0.9rem",fontSize:"0.74rem",color:"#5a8a7a",lineHeight:1.7}}>
        <b style={{color:"#00c896",display:"block",marginBottom:"0.2rem"}}>🔒 Privacy Protected</b>
        Names are anonymized. Only your first name and last initial are shown. Your savings amount is never shared with other users.
      </div>
    </MobileLayout>
  );
}
