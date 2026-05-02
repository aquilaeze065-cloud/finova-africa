"use client";
import { useState, useRef, useEffect } from "react";

interface Message { id:string; from:"user"|"support"; text:string; time:string; }

const REPLIES = [
  "Thanks for reaching out! A support agent will be with you shortly. Average wait time is 2 minutes. 🕐",
  "I understand your concern. Can you provide more details so we can assist you better?",
  "Our team is reviewing your request. You will receive an update within 24 hours. 📧",
  "For urgent issues, you can also reach us at support@finovaafrica.com",
  "Is there anything else I can help you with today?",
  "Great news! Your issue has been escalated to our senior support team. 🎉",
];
let ri = 0;
const ts = () => new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

export default function LiveChat() {
  const [open,    setOpen]   = useState(false);
  const [msgs,    setMsgs]   = useState<Message[]>([{id:"0",from:"support",text:"👋 Hi! Welcome to Finova Africa support. How can we help you today?",time:ts()}]);
  const [input,   setInput]  = useState("");
  const [typing,  setTyping] = useState(false);
  const [unread,  setUnread] = useState(0);
  const [screen,  setScreen] = useState<"home"|"chat">("home");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(()=>{ if(open){setUnread(0);setTimeout(()=>inputRef.current?.focus(),300);} },[open]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,typing]);

  function send() {
    if(!input.trim()) return;
    const msg:Message={id:Date.now().toString(),from:"user",text:input.trim(),time:ts()};
    setMsgs(p=>[...p,msg]); setInput(""); setScreen("chat"); setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      const reply:Message={id:(Date.now()+1).toString(),from:"support",text:REPLIES[ri++%REPLIES.length],time:ts()};
      setMsgs(p=>[...p,reply]);
      if(!open) setUnread(u=>u+1);
    },1500+Math.random()*1500);
  }

  const quickActions=["💳 Deposit issue","🔄 Transaction stuck","🪪 KYC help","💰 Withdrawal delay","🔒 Account locked"];

  return (
    <>
      <style>{`
        .lc-fab{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 80px);right:1.2rem;z-index:500;}
        @media(min-width:769px){.lc-fab{bottom:1.5rem;}}
        .lc-btn{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#27ae60,#2ecc71);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 4px 24px rgba(46,204,113,0.5);transition:all 0.2s;position:relative;}
        .lc-btn:hover{transform:scale(1.08);}
        .lc-unread{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:#e74c3c;color:#fff;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #080f1a;}
        .lc-win{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 144px);right:1.2rem;width:340px;max-width:calc(100vw - 1.5rem);background:#0d1b2e;border:1px solid rgba(46,204,113,0.2);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.75);z-index:500;overflow:hidden;display:flex;flex-direction:column;animation:chatIn 0.25s ease;}
        @media(min-width:769px){.lc-win{bottom:5rem;}}
        @keyframes chatIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .lc-head{background:linear-gradient(135deg,rgba(46,204,113,0.15),rgba(10,22,40,0.9));padding:0.9rem 1rem;display:flex;align-items:center;gap:0.7rem;border-bottom:1px solid rgba(46,204,113,0.1);}
        .lc-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#27ae60,#2ecc71);display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;position:relative;}
        .lc-dot{position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#2ecc71;border:2px solid #0d1b2e;}
        .lc-home{padding:1rem;overflow-y:auto;max-height:380px;}
        .lc-qbtn{display:block;width:100%;text-align:left;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0.6rem 0.8rem;margin-bottom:0.4rem;cursor:pointer;font-size:0.84rem;color:#e8f0fe;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
        .lc-qbtn:hover{background:rgba(46,204,113,0.1);border-color:rgba(46,204,113,0.25);}
        .lc-start{width:100%;padding:0.75rem;border:none;border-radius:11px;margin-top:0.75rem;background:linear-gradient(90deg,#27ae60,#2ecc71);font-family:'Syne',sans-serif;font-weight:700;font-size:0.9rem;color:#05100a;cursor:pointer;}
        .lc-msgs{flex:1;overflow-y:auto;padding:0.85rem;max-height:300px;display:flex;flex-direction:column;gap:0.5rem;}
        .lc-msg{max-width:82%;display:flex;flex-direction:column;gap:0.15rem;}
        .lc-msg.user{align-self:flex-end;align-items:flex-end;}
        .lc-msg.support{align-self:flex-start;align-items:flex-start;}
        .lc-bubble{padding:0.55rem 0.85rem;border-radius:14px;font-size:0.84rem;line-height:1.45;word-break:break-word;}
        .lc-bubble.user{background:linear-gradient(135deg,#27ae60,#2ecc71);color:#05100a;border-bottom-right-radius:4px;}
        .lc-bubble.support{background:rgba(255,255,255,0.07);color:#e8f0fe;border-bottom-left-radius:4px;}
        .lc-time{font-size:0.62rem;color:#7a9bbf;}
        .lc-typing{display:flex;align-items:center;gap:0.35rem;padding:0.45rem 0.7rem;background:rgba(255,255,255,0.07);border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;}
        .lc-td{width:6px;height:6px;border-radius:50%;background:#7a9bbf;animation:tdot 1.2s infinite;}
        .lc-td:nth-child(2){animation-delay:0.2s;} .lc-td:nth-child(3){animation-delay:0.4s;}
        @keyframes tdot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        .lc-footer{padding:0.65rem;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:0.5rem;}
        .lc-input{flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.6rem 0.8rem;font-size:0.85rem;color:#e8f0fe;outline:none;font-family:'DM Sans',sans-serif;}
        .lc-input:focus{border-color:rgba(46,204,113,0.4);}
        .lc-send{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#27ae60,#2ecc71);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;}
      `}</style>

      <div className="lc-fab">
        <button className="lc-btn" onClick={()=>setOpen(!open)}>
          {open?"✕":"💬"}
          {!open&&unread>0&&<span className="lc-unread">{unread}</span>}
        </button>
      </div>

      {open&&(
        <div className="lc-win">
          <div className="lc-head">
            <div className="lc-av">🎧<div className="lc-dot"/></div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.88rem"}}>Finova Support</div>
              <div style={{fontSize:"0.68rem",color:"#2ecc71"}}>● Online · Replies in ~2 min</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#7a9bbf",fontSize:"1.1rem"}}>✕</button>
          </div>

          {screen==="home"&&(
            <div className="lc-home">
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"0.3rem"}}>Hi there! 👋</div>
              <div style={{fontSize:"0.78rem",color:"#7a9bbf",marginBottom:"1rem",lineHeight:1.4}}>Welcome to Finova Africa. We help with deposits, withdrawals, KYC and more.</div>
              <div style={{fontSize:"0.72rem",color:"#7a9bbf",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem"}}>Common Issues</div>
              {quickActions.map(q=>(
                <button key={q} className="lc-qbtn" onClick={()=>{setInput(q.replace(/^[^\s]+\s/,""));setScreen("chat");setTimeout(()=>inputRef.current?.focus(),100);}}>
                  {q}
                </button>
              ))}
              <button className="lc-start" onClick={()=>setScreen("chat")}>Start Live Chat →</button>
            </div>
          )}

          {screen==="chat"&&(
            <>
              <div className="lc-msgs">
                <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",cursor:"pointer",color:"#7a9bbf",fontSize:"0.8rem",marginBottom:"0.5rem",textAlign:"left"}}>← Back</button>
                {msgs.map(m=>(
                  <div key={m.id} className={`lc-msg ${m.from}`}>
                    <div className={`lc-bubble ${m.from}`}>{m.text}</div>
                    <div className="lc-time">{m.time}</div>
                  </div>
                ))}
                {typing&&<div className="lc-typing"><div className="lc-td"/><div className="lc-td"/><div className="lc-td"/></div>}
                <div ref={bottomRef}/>
              </div>
              <div className="lc-footer">
                <input ref={inputRef} className="lc-input" placeholder="Type a message…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
                <button className="lc-send" onClick={send}>➤</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
