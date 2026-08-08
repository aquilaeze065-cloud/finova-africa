"use client";
import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const NEXORA_SYSTEM = `You are NORA, NEXORA's official AI support assistant. You are friendly, professional, and knowledgeable about everything NEXORA.

NEXORA COMPLETE KNOWLEDGE BASE:

REGISTRATION & FEES:
- One-time $4 USDT registration fee required to activate account
- Fee must be paid to platform wallet address shown on signup form
- Upload payment screenshot as proof
- Admin approves within 24-48 hours
- Once approved: 52-week savings plan created automatically, dashboard unlocks

SAVINGS PLAN:
- Pay $3 USDT every week for 52 weeks
- Total contributions: $156 USDT over the year
- Interest: 35% APY = $54.60 earned
- Completion bonus: $15 USDT voucher
- Total payout: $225.60+ USDT
- Plan starts automatically after registration approval

PAYMENTS:
- Pay $3 USDT weekly to platform wallet address
- Upload screenshot as proof for every payment
- Admin reviews and approves each payment
- Once approved: savings week marked as paid, dashboard updates immediately
- Can pay via direct crypto OR local exchangers (for Naira/cash users)
- Supported networks: TRC-20 USDT (recommended, lowest fees), ERC-20, BEP-20

PENALTIES:
- Missing a payment = $4 USDT late penalty
- Must pay penalty before plan can continue
- 5 consecutive missed payments = contract terminated
- Interest forfeited if terminated, but principal contributions retained
- Penalty payment: same process as regular payment (send $4, upload screenshot, admin approves)

WITHDRAWALS:
- Only allowed after completing ALL 52 weeks
- Process: download clearance form → sign → upload form + payment receipt
- Admin reviews within 24-48 hours
- Early withdrawal NOT possible by design

SECURITY:
- AES-256 encryption
- Optional WhatsApp 2FA
- KYC verification required for full access
- Session timeout after 30 minutes
- Login history tracking

REFERRALS:
- Share your unique referral code from Dashboard
- Earn $1 USDT per successful referral
- No limit on referrals
- Bonus credited when referred user's account is approved

LOCAL EXCHANGERS:
- For users without crypto: local agents accept Naira bank transfers
- They convert to USDT and pay on your behalf
- Find them in Dashboard → Deposit → Exchanger tab

GROUP SAVINGS:
- Save with up to 5 friends toward shared goal
- Create group and share invite code
- Each member saves their own $3/week

KYC:
- Required for full account access
- Upload: Government ID, selfie with ID, proof of address
- Approved within 24-48 hours

CONTACT:
- WhatsApp support: available 24/7
- Telegram: @NexoraSupport
- Email: support@nexora.com
- Admin: admin@nexora.com

RULES FOR RESPONSES:
- Be helpful, warm, and concise
- If asked about payment issues, always ask for their registered email and transaction screenshot
- If you cannot resolve an issue, offer to connect them to a live support agent
- Never share or ask for passwords
- For urgent issues (missing payments, account locked, failed withdrawal) offer WhatsApp escalation
- Keep responses under 200 words unless detail is needed
- Use emojis sparingly for warmth`;

type Msg = {role:"user"|"assistant",content:string,time:string,isAgent?:boolean};

export default function LiveChat() {
  const [open,     setOpen]     = useState(false);
  const [msgs,     setMsgs]     = useState<Msg[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [unread,   setUnread]   = useState(0);
  const [showAgent,setShowAgent]= useState(false);
  const [agent,    setAgent]    = useState<any>(null);
  const [escalated,setEscalated]= useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    try {
      const team = JSON.parse(localStorage.getItem("nexora_support_team")||"[]");
      const active = team.find((a:any)=>a.active);
      if (active) setAgent(active);
    } catch {}
  },[]);

  useEffect(()=>{ if(open){ setUnread(0); setTimeout(()=>inputRef.current?.focus(),300); } },[open]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  function now() { return new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); }

  async function send() {
    const text = input.trim();
    if (!text||loading) return;
    const userMsg:Msg = {role:"user",content:text,time:now()};
    setMsgs(m=>[...m,userMsg]);
    setInput(""); setLoading(true);

    // Check if user wants live agent
    const wantsAgent = /live agent|human|person|speak to someone|real person|support agent|escalate|connect me/i.test(text);
    if (wantsAgent && agent) {
      setTimeout(()=>{
        setMsgs(m=>[...m,{
          role:"assistant",content:`Connecting you to our live support agent now! 🔗\n\nYou can reach **${agent.name}** directly on WhatsApp. They typically respond within minutes.`,
          time:now(),isAgent:true
        }]);
        setLoading(false);
        setEscalated(true);
      },800);
      return;
    }

    try {
      // Build conversation history
      const history = msgs.slice(-8).map(m=>({role:m.role,content:m.content}));
      history.push({role:"user",content:text});

      const res = await fetch(ANTHROPIC_API,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:400,
          system:NEXORA_SYSTEM,
          messages:history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text||"I'm having trouble connecting. Please try again or contact us on WhatsApp.";

      // Check if AI suggests escalation
      const shouldEscalate = reply.toLowerCase().includes("contact support")||reply.toLowerCase().includes("whatsapp")||reply.toLowerCase().includes("speak to");

      setMsgs(m=>[...m,{role:"assistant",content:reply,time:now()}]);
      if (shouldEscalate && agent && !escalated) {
        setTimeout(()=>{
          setShowAgent(true);
        },1000);
      }
    } catch {
      setMsgs(m=>[...m,{role:"assistant",content:"I'm having connection issues right now. Please reach us on WhatsApp for immediate help! 📱",time:now()}]);
    }
    setLoading(false);
  }

  // Initial greeting
  useEffect(()=>{
    if (open && msgs.length===0) {
      setTimeout(()=>{
        setMsgs([{
          role:"assistant",
          content:"Hi! 👋 I'm NORA, NEXORA's AI support assistant.\n\nI can help you with:\n• Registration & account setup\n• Savings plan details\n• Payment questions\n• Penalties & missed payments\n• Withdrawals\n• Referrals\n\nWhat can I help you with today?",
          time:now(),
        }]);
      },400);
    }
  },[open,msgs.length]);

  function formatMsg(text:string) {
    return text.split("\n").map((line,i)=>(
      <div key={i} style={{marginBottom:line===""?"0.35rem":"0"}}>
        {line.startsWith("•")?<span style={{paddingLeft:"0.3rem"}}>{line}</span>:
         line.startsWith("**")?<b style={{color:"#00c896"}}>{line.replace(/\*\*/g,"")}</b>:
         line||"\u00A0"}
      </div>
    ));
  }

  const QUICK = ["How do I pay weekly?","What if I miss a payment?","When can I withdraw?","How does referral work?","What is the penalty?"];

  return (
    <>
      {/* FAB */}
      <button onClick={()=>setOpen(o=>!o)} style={{position:"fixed",bottom:"80px",right:"16px",width:"52px",height:"52px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",boxShadow:"0 4px 20px rgba(0,200,150,0.5)",zIndex:800,transition:"all 0.22s",transform:open?"scale(0.9)":"scale(1)"}}>
        {open?"✕":"💬"}
        {!open&&unread>0&&<div style={{position:"absolute",top:"-2px",right:"-2px",background:"#ff4757",color:"#fff",borderRadius:"50%",width:"18px",height:"18px",fontSize:"0.58rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #050f0c"}}>{unread}</div>}
      </button>

      {open&&(
        <div style={{position:"fixed",bottom:"145px",right:"12px",width:"min(360px,calc(100vw-24px))",height:"520px",background:"#081a14",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"20px",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",zIndex:800,animation:"chatPop 0.25s ease",overflow:"hidden"}}>
          <style>{`
            @keyframes chatPop{from{opacity:0;transform:scale(0.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
            .chat-msg{max-width:85%;padding:0.62rem 0.85rem;border-radius:14px;font-size:0.8rem;line-height:1.6;}
            .chat-msg.user{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;margin-left:auto;border-bottom-right-radius:4px;}
            .chat-msg.bot{background:#0d2a1f;border:1px solid rgba(0,200,150,0.12);color:#e8f8f4;border-bottom-left-radius:4px;}
            .chat-msg.agent-card{background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.2);border-radius:12px;padding:0.75rem;margin-top:0.35rem;}
            .quick-btn{padding:0.32rem 0.72rem;border:1px solid rgba(0,200,150,0.18);border-radius:20px;background:rgba(0,200,150,0.06);color:#00c896;font-size:0.72rem;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap;flex-shrink:0;transition:all 0.15s;}
            .quick-btn:hover{border-color:rgba(0,200,150,0.35);background:rgba(0,200,150,0.1);}
            .typing span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#00c896;margin:0 2px;animation:bounce 1.2s infinite;}
            .typing span:nth-child(2){animation-delay:0.2s;}
            .typing span:nth-child(3){animation-delay:0.4s;}
            @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
          `}</style>

          {/* HEADER */}
          <div style={{padding:"0.85rem 1rem",borderBottom:"1px solid rgba(0,200,150,0.1)",display:"flex",alignItems:"center",gap:"0.65rem",background:"rgba(0,200,150,0.04)",flexShrink:0}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>🤖</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:"0.86rem"}}>NORA — NEXORA Support</div>
              <div style={{fontSize:"0.66rem",color:"#5a8a7a",display:"flex",alignItems:"center",gap:"0.3rem"}}><span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00ff88",display:"inline-block"}}/>Always online · AI-powered</div>
            </div>
            {agent&&(
              <a href={`https://wa.me/${agent.whatsapp}?text=Hi! I need help with my NEXORA account`} target="_blank" rel="noreferrer" style={{padding:"0.28rem 0.6rem",background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.25)",borderRadius:"8px",color:"#25d366",fontSize:"0.68rem",fontWeight:700,textDecoration:"none"}}>📱 Live</a>
            )}
          </div>

          {/* MESSAGES */}
          <div style={{flex:1,overflow:"auto",padding:"0.85rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:"0.15rem"}}>
                <div className={`chat-msg ${m.role==="user"?"user":"bot"}`}>
                  {formatMsg(m.content)}
                  {m.isAgent&&agent&&(
                    <div className="agent-card">
                      <div style={{fontWeight:700,fontSize:"0.78rem",color:"#25d366",marginBottom:"0.3rem"}}>👤 {agent.name} — Support Agent</div>
                      <a href={`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent("Hi! I need help with my NEXORA account.")}`} target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"0.4rem 0.85rem",background:"linear-gradient(135deg,#128c7e,#25d366)",color:"#fff",borderRadius:"8px",fontWeight:700,fontSize:"0.76rem",textDecoration:"none"}}>
                        Open WhatsApp →
                      </a>
                    </div>
                  )}
                </div>
                <div style={{fontSize:"0.58rem",color:"#3a5a4a",paddingRight:m.role==="user"?"0.2rem":"0",paddingLeft:m.role==="assistant"?"0.2rem":"0"}}>{m.time}</div>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",alignItems:"flex-start"}}>
                <div className="chat-msg bot"><div className="typing"><span/><span/><span/></div></div>
              </div>
            )}
            {showAgent&&agent&&!escalated&&(
              <div style={{background:"rgba(37,211,102,0.06)",border:"1px solid rgba(37,211,102,0.18)",borderRadius:"12px",padding:"0.75rem",margin:"0.35rem 0"}}>
                <div style={{fontSize:"0.76rem",color:"#5a8a7a",marginBottom:"0.5rem"}}>Would you like to speak with a live agent?</div>
                <a href={`https://wa.me/${agent.whatsapp}?text=Hi! I need help with NEXORA.`} target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"0.42rem 0.9rem",background:"linear-gradient(135deg,#128c7e,#25d366)",color:"#fff",borderRadius:"8px",fontWeight:700,fontSize:"0.76rem",textDecoration:"none"}} onClick={()=>setShowAgent(false)}>
                  📱 Chat with {agent.name}
                </a>
                <button onClick={()=>setShowAgent(false)} style={{marginLeft:"0.5rem",background:"none",border:"none",color:"#5a8a7a",fontSize:"0.72rem",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>No thanks</button>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* QUICK REPLIES */}
          {msgs.length<=1&&(
            <div style={{padding:"0 0.85rem 0.6rem",display:"flex",gap:"0.35rem",overflow:"auto",flexShrink:0,scrollbarWidth:"none"}}>
              {QUICK.map(q=>(
                <button key={q} className="quick-btn" onClick={()=>{ setInput(q); setTimeout(()=>send(),100); }}>{q}</button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div style={{padding:"0.7rem",borderTop:"1px solid rgba(0,200,150,0.08)",display:"flex",gap:"0.5rem",flexShrink:0}}>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
              placeholder="Ask anything about NEXORA..."
              style={{flex:1,background:"rgba(0,200,150,0.04)",border:"1px solid rgba(0,200,150,0.12)",borderRadius:"10px",padding:"0.6rem 0.85rem",fontSize:"0.82rem",color:"#e8f8f4",fontFamily:"Inter,sans-serif",outline:"none"}}
            />
            <button onClick={send} disabled={!input.trim()||loading} style={{width:"38px",height:"38px",borderRadius:"10px",background:"linear-gradient(135deg,#00a87a,#00c896)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",opacity:!input.trim()||loading?0.5:1,transition:"opacity 0.15s"}}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
