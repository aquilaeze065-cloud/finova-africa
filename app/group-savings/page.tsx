"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function GroupSavingsPage() {
  const router  = useRouter();
  const [groups,    setGroups]    = useState<any[]>([]);
  const [step,      setStep]      = useState<"list"|"create"|"join"|"detail">("list");
  const [selGroup,  setSelGroup]  = useState<any>(null);
  const [name,      setName]      = useState("");
  const [desc,      setDesc]      = useState("");
  const [goal,      setGoal]      = useState("780"); // 5 members × $156
  const [joinCode,  setJoinCode]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState("");
  const [user,      setUser]      = useState<any>(null);

  useEffect(()=>{
    try {
      const u = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");
      setUser(u);
    } catch {}
    loadGroups();
  },[]);

  function showMsg(msg:string){ setToast(msg); setTimeout(()=>setToast(""),3500); }

  function loadGroups() {
    try {
      const stored = JSON.parse(localStorage.getItem("nexora_groups")||"[]");
      setGroups(stored);
    } catch {}
  }

  function createGroup() {
    if(!name.trim()){showMsg("Group name required");return;}
    const code = "GRP"+Math.random().toString(36).substring(2,7).toUpperCase();
    const group = {
      id:"g_"+Date.now(), name:name.trim(), description:desc,
      goal_amount:parseFloat(goal)||780,current_amount:0,
      invite_code:code, max_members:5, status:"active",
      creator_id:user?.id, creator_name:user?.name,
      members:[{
        user_id:user?.id||"me", name:user?.name||"You",
        contributed:0, weeks_paid:0, isCreator:true,
      }],
      created_at:new Date().toISOString(),
    };
    const updated=[...groups,group];
    localStorage.setItem("nexora_groups",JSON.stringify(updated));
    setGroups(updated);
    setSelGroup(group);
    setStep("detail");
    setName(""); setDesc("");
    showMsg("✅ Group created!");
  }

  function joinGroup() {
    if(!joinCode.trim()){showMsg("Enter an invite code");return;}
    const found = groups.find(g=>g.invite_code===joinCode.trim().toUpperCase());
    if(!found){showMsg("Group not found. Check the invite code.");return;}
    if(found.members?.some((m:any)=>m.user_id===user?.id)){
      showMsg("You're already in this group!");
      setSelGroup(found); setStep("detail"); return;
    }
    if((found.members?.length||0)>=found.max_members){showMsg("Group is full (max 5 members)");return;}
    const updated=groups.map(g=>g.id===found.id?{
      ...g,members:[...(g.members||[]),{user_id:user?.id||"me",name:user?.name||"You",contributed:0,weeks_paid:0}]
    }:g);
    localStorage.setItem("nexora_groups",JSON.stringify(updated));
    setGroups(updated);
    const newGroup=updated.find(g=>g.id===found.id);
    setSelGroup(newGroup);
    setStep("detail");
    setJoinCode("");
    showMsg("✅ Joined group!");
  }

  const G="#00c896";
  const inp:React.CSSProperties={width:"100%",background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.72rem 0.9rem",fontSize:"0.88rem",color:"#e8f8f4",fontFamily:"Inter,sans-serif",outline:"none",marginBottom:"0.75rem"};
  const lbl:React.CSSProperties={fontSize:"0.63rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.05em",display:"block",marginBottom:"0.3rem"};
  const mainBtn:React.CSSProperties={width:"100%",padding:"0.85rem",border:"none",borderRadius:"11px",background:"linear-gradient(135deg,#00a87a,#00c896)",fontWeight:700,fontSize:"0.9rem",color:"#050f0c",cursor:"pointer",fontFamily:"Inter,sans-serif",marginBottom:"0.5rem"};
  const outBtn:React.CSSProperties={width:"100%",padding:"0.75rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"11px",background:"none",color:"#5a8a7a",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:"0.86rem"};

  return (
    <MobileLayout activePage="Savings">
      <style>{`
        .grp-card{background:#081a14;border:1px solid rgba(0,200,150,0.1);border-radius:16px;padding:1.1rem;margin-bottom:0.75rem;cursor:pointer;transition:all 0.2s;}
        .grp-card:hover{border-color:rgba(0,200,150,0.25);transform:translateY(-1px);}
        .prog-bar{height:7px;background:rgba(0,200,150,0.08);border-radius:7px;overflow:hidden;margin-top:0.5rem;}
        .prog-fill{height:100%;border-radius:7px;background:linear-gradient(90deg,#00a87a,#00c896);transition:width 0.5s;}
        .mem-row{display:flex;align-items:center;gap:0.6rem;padding:0.65rem 0;border-bottom:1px solid rgba(0,200,150,0.06);}
        .mem-row:last-child{border-bottom:none;}
        .mem-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00a87a,#00c896);display:flex;align-items:center;justify-content:center;fontWeight:700;fontSize:0.85rem;color:#050f0c;flexShrink:0;}
        .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.25);border-radius:11px;padding:0.6rem 1.2rem;fontWeight:700;font-size:0.82rem;z-index:999;color:#00c896;white-space:nowrap;}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.1rem"}}>
        {step!=="list"&&<button onClick={()=>setStep("list")} style={{background:"none",border:"none",color:"#5a8a7a",cursor:"pointer",fontSize:"0.9rem",padding:0}}>←</button>}
        <div>
          <div style={{fontWeight:800,fontSize:"1.05rem",color:G}}>
            {step==="list"?"👥 Group Savings":step==="create"?"✨ Create Group":step==="join"?"🔗 Join Group":"👥 "+selGroup?.name}
          </div>
          <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>
            {step==="list"?"Save together with up to 5 friends":step==="detail"?`${selGroup?.members?.length||1}/5 members`:""}
          </div>
        </div>
      </div>

      {/* LIST */}
      {step==="list"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1rem"}}>
            <button onClick={()=>setStep("create")} style={{...mainBtn,marginBottom:0}}>✨ Create Group</button>
            <button onClick={()=>setStep("join")} style={{...outBtn,marginBottom:0}}>🔗 Join Group</button>
          </div>

          {groups.length===0?(
            <div style={{textAlign:"center",padding:"3rem 1rem",color:"#5a8a7a",background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"14px"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.6rem"}}>👥</div>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:"#e8f8f4",marginBottom:"0.3rem"}}>No Groups Yet</div>
              <div style={{fontSize:"0.78rem",lineHeight:1.6}}>Create a group or join one with an invite code. Save together and motivate each other!</div>
            </div>
          ):(
            groups.map(g=>{
              const pct = Math.min(100,((g.current_amount||0)/g.goal_amount)*100);
              return (
                <div key={g.id} className="grp-card" onClick={()=>{setSelGroup(g);setStep("detail");}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.4rem"}}>
                    <div style={{fontWeight:700,fontSize:"0.9rem"}}>{g.name}</div>
                    <div style={{fontSize:"0.72rem",color:"#5a8a7a"}}>{g.members?.length||1}/{g.max_members} members</div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",marginBottom:"0.25rem"}}>
                    <span style={{color:G,fontWeight:700}}>${g.current_amount?.toFixed(2)||"0.00"}</span>
                    <span style={{color:"#5a8a7a"}}>of ${g.goal_amount?.toFixed(2)}</span>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{width:pct+"%"}}/></div>
                  <div style={{fontSize:"0.68rem",color:"#3a6a5a",marginTop:"0.4rem"}}>Code: <b style={{fontFamily:"monospace",color:G}}>{g.invite_code}</b></div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* CREATE */}
      {step==="create"&&(
        <div>
          <label style={lbl}>Group Name *</label>
          <input style={inp} placeholder="e.g. Lagos Squad Goals" value={name} onChange={e=>setName(e.target.value)}/>
          <label style={lbl}>Description (optional)</label>
          <input style={inp} placeholder="What are you saving for?" value={desc} onChange={e=>setDesc(e.target.value)}/>
          <label style={lbl}>Goal Amount (USDT)</label>
          <input style={inp} type="number" placeholder="780 (5 × $156)" value={goal} onChange={e=>setGoal(e.target.value)}/>
          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.1)",borderRadius:"10px",padding:"0.75rem",marginBottom:"0.85rem",fontSize:"0.76rem",color:"#5a8a7a",lineHeight:1.6}}>
            💡 Each member saves $3/week. With 5 members your group saves <b style={{color:G}}>$15/week</b> toward a shared goal of <b style={{color:G}}>${goal} USDT</b>.
          </div>
          <button style={mainBtn} onClick={createGroup} disabled={!name||loading}>Create Group</button>
          <button style={outBtn} onClick={()=>setStep("list")}>Cancel</button>
        </div>
      )}

      {/* JOIN */}
      {step==="join"&&(
        <div>
          <label style={lbl}>Invite Code</label>
          <input style={inp} placeholder="e.g. GRPABC12" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&joinGroup()}/>
          <div style={{fontSize:"0.76rem",color:"#5a8a7a",marginBottom:"0.85rem",lineHeight:1.6}}>
            Ask your friend for their group invite code and enter it above to join.
          </div>
          <button style={mainBtn} onClick={joinGroup} disabled={!joinCode}>Join Group</button>
          <button style={outBtn} onClick={()=>setStep("list")}>Cancel</button>
        </div>
      )}

      {/* DETAIL */}
      {step==="detail"&&selGroup&&(
        <>
          {/* Progress */}
          <div style={{background:"linear-gradient(135deg,rgba(0,200,150,0.08),#081a14)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"16px",padding:"1.1rem",marginBottom:"0.85rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.4rem"}}>
              <div>
                <div style={{fontWeight:800,fontSize:"1.3rem",color:"#e8f8f4"}}>${selGroup.current_amount?.toFixed(2)||"0.00"}</div>
                <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>of ${selGroup.goal_amount?.toFixed(2)} goal</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,fontSize:"0.9rem",color:G}}>{Math.round(((selGroup.current_amount||0)/selGroup.goal_amount)*100)}%</div>
                <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>complete</div>
              </div>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{width:Math.min(100,((selGroup.current_amount||0)/selGroup.goal_amount)*100)+"%"}}/></div>
          </div>

          {/* Invite code */}
          <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"12px",padding:"0.85rem",marginBottom:"0.85rem",display:"flex",alignItems:"center",gap:"0.75rem"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.65rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.2rem"}}>Invite Code</div>
              <div style={{fontFamily:"monospace",fontSize:"1.2rem",fontWeight:800,color:G,letterSpacing:"0.1em"}}>{selGroup.invite_code}</div>
            </div>
            <button onClick={()=>{ navigator.clipboard.writeText(selGroup.invite_code); showMsg("✅ Code copied!"); }}
              style={{padding:"0.45rem 0.9rem",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"8px",background:"rgba(0,200,150,0.08)",color:G,fontSize:"0.76rem",fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
              Copy
            </button>
          </div>

          {/* Members */}
          <div style={{background:"#081a14",border:"1px solid rgba(0,200,150,0.08)",borderRadius:"14px",padding:"0.9rem",marginBottom:"0.85rem"}}>
            <div style={{fontWeight:700,fontSize:"0.82rem",color:"#5a8a7a",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.65rem"}}>
              Members ({selGroup.members?.length||1}/{selGroup.max_members})
            </div>
            {(selGroup.members||[]).map((m:any,i:number)=>(
              <div key={m.user_id||i} className="mem-row">
                <div className="mem-av" style={{fontSize:"0.85rem",fontWeight:700,color:"#050f0c"}}>
                  {(m.name||"U").charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:"0.84rem"}}>{m.name||"Member"} {m.isCreator&&<span style={{fontSize:"0.6rem",color:G}}>👑 Creator</span>}</div>
                  <div style={{fontSize:"0.68rem",color:"#5a8a7a"}}>{m.weeks_paid||0} weeks · ${m.contributed?.toFixed(2)||"0.00"} contributed</div>
                </div>
                {(m.user_id===user?.id||m.isCreator)&&(
                  <span style={{fontSize:"0.65rem",background:"rgba(0,200,150,0.1)",color:G,border:"1px solid rgba(0,200,150,0.2)",borderRadius:"20px",padding:"0.12rem 0.45rem",fontWeight:700}}>YOU</span>
                )}
              </div>
            ))}
            {(selGroup.members?.length||0)<selGroup.max_members&&(
              <div style={{textAlign:"center",padding:"0.65rem",fontSize:"0.76rem",color:"#3a6a5a",borderTop:"1px dashed rgba(0,200,150,0.08)",marginTop:"0.35rem"}}>
                {selGroup.max_members-(selGroup.members?.length||0)} spot{selGroup.max_members-(selGroup.members?.length||1)!==1?"s":""} available — share your invite code!
              </div>
            )}
          </div>
          <button style={outBtn} onClick={()=>setStep("list")}>← Back to Groups</button>
        </>
      )}
    </MobileLayout>
  );
}
