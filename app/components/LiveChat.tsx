"use client";
import { useState, useEffect, useRef } from "react";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Msg = {
  role: "user"|"assistant";
  content: string;
  time: string;
  showAgent?: boolean;
};

export default function LiveChat() {
  const [open,      setOpen]      = useState(false);
  const [msgs,      setMsgs]      = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [unread,    setUnread]    = useState(0);
  const [agent,     setAgent]     = useState<any>(null);
  const [showEsc,   setShowEsc]   = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    try {
      const team  = JSON.parse(localStorage.getItem("nexora_support_team")||"[]");
      const found = team.find((a:any)=>a.active);
      if (found) setAgent(found);
    } catch {}
  },[]);

  useEffect(()=>{
    if (open) { setUnread(0); setTimeout(()=>inputRef.current?.focus(),300); }
  },[open]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs,loading]);

  // Greeting on first open
  useEffect(()=>{
    if (open && msgs.length===0) {
      setTimeout(()=>{
        setMsgs([{
          role:"assistant",
          content:"Hi! 👋 I'm NORA, your NEXORA savings assistant.\n\nI can help you with:\n• How to register & pay\n• Savings plan details & returns\n• Missed payments & penalties\n• Withdrawal process\n• Referral rewards\n• Any NEXORA question!\n\nWhat can I help you with?",
          time:now(),
        }]);
      },300);
    }
  },[open]);

  function now() {
    return new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  }

  const QUICK_REPLIES = [
    "How do I pay weekly?",
    "What if I miss a payment?",
    "When can I withdraw?",
    "How does referral work?",
    "What is the penalty fee?",
  ];

  async function send(text?: string) {
    const msg = (text||input).trim();
    if (!msg || loading) return;
    setInput("");

    // Check for escalation keywords
    const wantsHuman = /live agent|human|real person|speak to someone|support agent|escalate|connect me|live support/i.test(msg);

    const userMsg: Msg = { role:"user", content:msg, time:now() };
    setMsgs(m=>[...m, userMsg]);
    setLoading(true);

    if (wantsHuman) {
      setTimeout(()=>{
        setMsgs(m=>[...m,{
          role:"assistant",
          content:`Of course! Let me connect you to a live agent now. 🔗\n\nOur support team responds within minutes on WhatsApp.`,
          time:now(),
          showAgent:true,
        }]);
        setLoading(false);
      },600);
      return;
    }

    try {
      // Build messages for API — only role and content
      const history = [...msgs, userMsg].map(m=>({
        role:    m.role,
        content: m.content,
      }));

      const res = await fetch(`${BACKEND}/api/chat`, {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ messages: history }),
        signal:  AbortSignal.timeout(20000),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Server error");
      }

      const reply = data.reply || "I couldn't get a response. Please try again.";

      // Check if response suggests escalation
      const suggEsc = /contact.*support|whatsapp|speak.*agent|call.*us/i.test(reply);

      setMsgs(m=>[...m,{
        role:"assistant",
        content:reply,
        time:now(),
        showAgent: suggEsc && !!agent,
      }]);

      if (suggEsc && agent) setShowEsc(true);

    } catch(err:any) {
      let errMsg = "I'm having trouble connecting right now. 😔";
      if (err.name==="AbortError"||err.name==="TimeoutError") {
        errMsg = "Response took too long. Please try again or contact us on WhatsApp.";
      } else if (err.message) {
        errMsg = err.message.includes("fetch")||err.message.includes("network")
          ? "Can't reach the server. Check your internet connection or contact WhatsApp support."
          : err.message;
      }
      setMsgs(m=>[...m,{role:"assistant",content:errMsg,time:now(),showAgent:!!agent}]);
    }
    setLoading(false);
  }

  function formatText(text:string) {
    return text.split("\n").map((line,i)=>{
      if (line.startsWith("• ")) return <div key={i} style={{paddingLeft:"0.5rem",marginBottom:"0.1rem"}}>• {line.slice(2)}</div>;
      if (line==="") return <div key={i} style={{height:"0.3rem"}}/>;
      return <div key={i}>{line}</div>;
    });
  }

  return (
    <>
      <style>{`
        @keyframes chatIn{from{opacity:0;transform:scale(0.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .chat-bubble{max-width:86%;font-size:0.81rem;line-height:1.65;padding:0.62rem 0.85rem;border-radius:14px;}
        .chat-bubble.user{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;margin-left:auto;border-bottom-right-radius:4px;}
        .chat-bubble.bot{background:#0d2718;border:1px solid rgba(0,200,150,0.13);color:#e8f8f4;border-bottom-left-radius:4px;}
        .agent-pill{display:inline-flex;align-items:center;gap:0.4rem;margin-top:0.5rem;padding:0.42rem 0.85rem;background:linear-gradient(135deg,#128c7e,#25d366);color:#fff;border-radius:9px;font-weight:700;font-size:0.75rem;text-decoration:none;transition:opacity 0.15s;}
        .agent-pill:hover{opacity:0.88;}
        .qbtn{padding:0.3rem 0.68rem;border:1px solid rgba(0,200,150,0.2);border-radius:20px;background:rgba(0,200,150,0.06);color:#00c896;font-size:0.71rem;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap;flex-shrink:0;transition:all 0.15s;}
        .qbtn:hover{border-color:rgba(0,200,150,0.4);background:rgba(0,200,150,0.1);}
        .typing span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#00c896;margin:0 2px;animation:tb 1.2s infinite;}
        .typing span:nth-child(2){animation-delay:.2s;}
        .typing span:nth-child(3){animation-delay:.4s;}
        @keyframes tb{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .chat-input{flex:1;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.14);border-radius:10px;padding:0.58rem 0.82rem;font-size:0.82rem;color:#e8f8f4;font-family:Inter,sans-serif;outline:none;transition:border-color 0.18s;}
        .chat-input:focus{border-color:rgba(0,200,150,0.38);}
        .send-btn{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#00a87a,#00c896);border:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:opacity 0.15s;flex-shrink:0;}
        .send-btn:disabled{opacity:0.4;cursor:not-allowed;}
      `}</style>

      {/* CHAT FAB */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{
          position:"fixed",bottom:"80px",right:"16px",
          width:"52px",height:"52px",borderRadius:"50%",
          background:"linear-gradient(135deg,#00a87a,#00c896)",
          border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"1.4rem",
          boxShadow:"0 4px 24px rgba(0,200,150,0.5)",
          zIndex:800,
          transition:"transform 0.2s",
          transform:open?"scale(0.88)":"scale(1)",
        }}
      >
        {open?"✕":"💬"}
        {!open&&unread>0&&(
          <div style={{position:"absolute",top:"-3px",right:"-3px",background:"#ff4757",color:"#fff",borderRadius:"50%",width:"18px",height:"18px",fontSize:"0.58rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #050f0c"}}>
            {unread}
          </div>
        )}
      </button>

      {/* CHAT WINDOW */}
      {open&&(
        <div style={{
          position:"fixed",bottom:"145px",right:"12px",
          width:"min(355px,calc(100vw - 24px))",height:"500px",
          background:"#081a14",
          border:"1px solid rgba(0,200,150,0.22)",
          borderRadius:"20px",
          display:"flex",flexDirection:"column",
          boxShadow:"0 20px 60px rgba(0,0,0,0.85)",
          zIndex:800,
          animation:"chatIn 0.25s ease",
          overflow:"hidden",
        }}>

          {/* HEADER */}
          <div style={{
            padding:"0.8rem 1rem",
            borderBottom:"1px solid rgba(0,200,150,0.1)",
            background:"rgba(0,200,150,0.04)",
            display:"flex",alignItems:"center",gap:"0.65rem",
            flexShrink:0,
          }}>
            <div style={{
              width:"36px",height:"36px",borderRadius:"50%",
              background:"linear-gradient(135deg,#00a87a,#00c896)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1rem",flexShrink:0,
            }}>🤖</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:"0.86rem",color:"#e8f8f4"}}>NORA — AI Support</div>
              <div style={{fontSize:"0.65rem",color:"#5a8a7a",display:"flex",alignItems:"center",gap:"0.3rem"}}>
                <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00ff88",display:"inline-block"}}/>
                Always online · Powered by Claude AI
              </div>
            </div>
            {agent&&(
              <a
                href={`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent("Hi! I need help with my NEXORA account.")}`}
                target="_blank"
                rel="noreferrer"
                style={{padding:"0.26rem 0.6rem",background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.25)",borderRadius:"8px",color:"#25d366",fontSize:"0.68rem",fontWeight:700,textDecoration:"none",flexShrink:0}}
              >
                📱 Agent
              </a>
            )}
          </div>

          {/* MESSAGES */}
          <div style={{flex:1,overflow:"auto",padding:"0.8rem",display:"flex",flexDirection:"column",gap:"0.45rem"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:"0.12rem"}}>
                <div className={`chat-bubble ${m.role==="user"?"user":"bot"}`}>
                  {formatText(m.content)}
                  {m.showAgent&&agent&&(
                    <div style={{marginTop:"0.55rem"}}>
                      <a
                        href={`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent("Hi! I need help with my NEXORA account.")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="agent-pill"
                      >
                        📱 Chat with {agent.name} on WhatsApp
                      </a>
                    </div>
                  )}
                  {m.showAgent&&!agent&&(
                    <div style={{marginTop:"0.55rem"}}>
                      <a href="https://wa.me/2348000000000?text=Hi+NEXORA+Support!" target="_blank" rel="noreferrer" className="agent-pill">
                        📱 WhatsApp Support
                      </a>
                    </div>
                  )}
                </div>
                <div style={{fontSize:"0.58rem",color:"#3a5a4a",padding:"0 0.2rem"}}>{m.time}</div>
              </div>
            ))}

            {loading&&(
              <div style={{display:"flex",alignItems:"flex-start"}}>
                <div className="chat-bubble bot">
                  <div className="typing"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* QUICK REPLIES — only on first message */}
          {msgs.length<=1&&!loading&&(
            <div style={{
              padding:"0 0.8rem 0.55rem",
              display:"flex",gap:"0.32rem",
              overflowX:"auto",flexShrink:0,
              scrollbarWidth:"none",
            }}>
              {QUICK_REPLIES.map(q=>(
                <button key={q} className="qbtn" onClick={()=>send(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* ESCALATION PROMPT */}
          {showEsc&&agent&&(
            <div style={{
              margin:"0 0.8rem 0.55rem",
              padding:"0.6rem 0.75rem",
              background:"rgba(37,211,102,0.06)",
              border:"1px solid rgba(37,211,102,0.18)",
              borderRadius:"10px",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              flexShrink:0,
            }}>
              <span style={{fontSize:"0.74rem",color:"#5a8a7a"}}>Want to speak with a live agent?</span>
              <div style={{display:"flex",gap:"0.4rem"}}>
                  {agent && (
                    <a
                      href={`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent("Hi! I need help with my NEXORA account.")}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{padding:"0.28rem 0.7rem",background:"linear-gradient(135deg,#128c7e,#25d366)",color:"#fff",borderRadius:"8px",fontWeight:700,fontSize:"0.72rem",textDecoration:"none"}}
                      onClick={()=>setShowEsc(false)}
                    >
                      📱 Yes
                    </a>
                  )}
                <button onClick={()=>setShowEsc(false)} style={{background:"none",border:"none",color:"#5a8a7a",fontSize:"0.72rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>No</button>
              </div>
            </div>
          )}

          {/* INPUT */}
          <div style={{
            padding:"0.65rem 0.75rem",
            borderTop:"1px solid rgba(0,200,150,0.08)",
            display:"flex",gap:"0.45rem",
            flexShrink:0,
          }}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="Ask anything about NEXORA..."
            />
            <button
              className="send-btn"
              onClick={()=>send()}
              disabled={!input.trim()||loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
