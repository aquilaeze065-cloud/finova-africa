"use client";
import { useState, useEffect, useRef } from "react";

const TELEGRAM_LINK = "https://t.me/Nexora_Alerts";

type Msg = {
  role: "user"|"assistant";
  content: string;
  time: string;
};

const ANSWERS: Record<string,string> = {
  "register":     "To register on NEXORA:\n\n1. Click Create Account\n2. Fill name, email, password\n3. Send $4 USDT to our wallet address\n4. Upload payment screenshot\n5. Admin approves in 24-48 hours\n\nDashboard opens automatically after approval!",
  "pay":          "To make your weekly payment:\n\n1. Go to Dashboard then Deposit\n2. Copy the wallet address\n3. Send exactly $3 USDT (TRC-20)\n4. Screenshot the transaction\n5. Upload screenshot as proof\n\nAdmin approves and savings update immediately!",
  "withdraw":     "Withdrawal only after completing ALL 52 weeks.\n\nAfter 52 weeks:\n1. Download and sign clearance form\n2. Upload signed form plus payment receipt\n3. Admin reviews in 24-48 hours\n4. Payment sent to your wallet\n\nEarly withdrawal is NOT possible.",
  "penalty":      "If you miss a payment:\n\n- $4 USDT late penalty is applied\n- Pay penalty same way as regular payment\n- Admin approves and plan resumes\n- 5 missed payments = contract terminated!\n\nSet a weekly reminder to never miss!",
  "referral":     "Referral program:\n\n- Earn $1 USDT per successful referral\n- Find your code on Dashboard\n- Share with friends and family\n- Bonus credited when friend is approved\n- No limit on referrals!",
  "interest":     "Your savings returns:\n\n- Weekly: $3 USDT\n- Duration: 52 weeks\n- Total saved: $156 USDT\n- Interest 35% APY: $54.60\n- Completion bonus: $15\n- Total payout: $225.60+ USDT",
  "kyc":          "KYC Verification needs:\n\n1. Government ID (NIN, passport, or license)\n2. Selfie holding your ID\n3. Proof of address (utility bill)\n\nGo to Dashboard then Verify ID.\nApproved within 24-48 hours.",
  "exchanger":    "No crypto? Use local exchangers!\n\n- Accept Naira bank transfers\n- They convert to USDT for you\n- No crypto knowledge needed\n\nFind them at Dashboard then Deposit then Exchanger tab.",
  "plan":         "NEXORA 52-Week Savings Plan:\n\n- Registration fee: $4 USDT once\n- Weekly payment: $3 USDT\n- Duration: 52 weeks\n- Total saved: $156 USDT\n- Interest: 35% APY\n- Completion bonus: $15\n- Total payout: $225.60+ USDT",
  "registration fee": "Registration fee:\n\n- Amount: $4 USDT one-time only\n- Send to wallet address on signup form\n- Upload payment screenshot\n- Admin approves in 24-48 hours\n- Dashboard unlocks after approval",
  "missed":       "If you miss a payment:\n\n- $4 USDT penalty is applied\n- 5 consecutive misses = terminated\n- Interest forfeited if terminated\n- Pay penalty to resume plan\n\nContact Telegram if you need help!",
  "wallet":       "Your NEXORA wallet:\n\n- Receives credited payments from admin\n- Use it to pay weekly savings\n- Click Pay from Wallet on dashboard\n- Auto-debit happens when payment is due\n- Check balance on your dashboard",
  "balance":      "Your wallet balance is shown on your Dashboard.\n\nWhen admin approves your payment:\n- USDT is added to your wallet\n- You can move it to savings manually\n- Or auto-debit handles it automatically\n\nCheck Dashboard for current balance!",
};

function getAnswer(text: string): string|null {
  const lower = text.toLowerCase();
  for (const [key, answer] of Object.entries(ANSWERS)) {
    if (lower.includes(key)) return answer;
  }
  return null;
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
}

export default function LiveChat() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState<Msg[]>([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const [agent,   setAgent]   = useState<any>(null);
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
    if (open) {
      setUnread(0);
      setTimeout(()=>inputRef.current?.focus(), 300);
    }
  },[open]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs, loading]);

  useEffect(()=>{
    if (open && msgs.length===0) {
      setTimeout(()=>{
        setMsgs([{
          role:"assistant",
          content:"Hi! I am NORA, your NEXORA savings assistant!\n\nI can answer common questions instantly. For account-specific help, our team is on Telegram.\n\nWhat would you like to know?",
          time:nowTime(),
        }]);
      },300);
    }
  },[open]);

  async function send(text?: string) {
    const msg = (text||input).trim();
    if (!msg||loading) return;
    setInput("");

    const userMsg: Msg = { role:"user", content:msg, time:nowTime() };
    setMsgs(m=>[...m, userMsg]);
    setLoading(true);

    await new Promise(r=>setTimeout(r,700));

    const wantsHuman = /live agent|human|real person|speak to|support agent|connect me/i.test(msg);
    const answer     = getAnswer(msg);

    if (wantsHuman) {
      setMsgs(m=>[...m,{
        role:"assistant",
        content:"Connecting you to our team now! Tap the button below to open Telegram.",
        time:nowTime(),
      }]);
      setLoading(false);
      setTimeout(()=>{
        setMsgs(m=>[...m,{role:"assistant",content:"__TG__",time:nowTime()}]);
      },600);
    } else if (answer) {
      setMsgs(m=>[...m,{
        role:"assistant",
        content:answer+"\n\nNeed more help? Our team is on Telegram!",
        time:nowTime(),
      }]);
      setLoading(false);
      setTimeout(()=>{
        setMsgs(m=>[...m,{role:"assistant",content:"__TG__",time:nowTime()}]);
      },1500);
    } else {
      setMsgs(m=>[...m,{
        role:"assistant",
        content:"Great question! Our support team on Telegram can answer this in detail and help with your specific account.\n\nThey respond within minutes!",
        time:nowTime(),
      }]);
      setLoading(false);
      setTimeout(()=>{
        setMsgs(m=>[...m,{role:"assistant",content:"__TG__",time:nowTime()}]);
      },800);
    }
  }

  function renderContent(content: string) {
    if (content === "__TG__") {
      return (
        <div style={{display:"flex",flexDirection:"column" as const,gap:"0.5rem",padding:"0.25rem 0"}}>
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"0.65rem 1.1rem",background:"linear-gradient(135deg,#005fa3,#0088cc)",color:"#fff",borderRadius:"11px",fontWeight:700,fontSize:"0.82rem",textDecoration:"none"}}
          >
            ✈️ Open Telegram — @Nexora_Alerts
          </a>
          {agent&&(
            <a
              href={"https://wa.me/"+agent.whatsapp+"?text="+encodeURIComponent("Hi! I need help with my NEXORA account.")}
              target="_blank"
              rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"0.55rem 1rem",background:"linear-gradient(135deg,#128c7e,#25d366)",color:"#fff",borderRadius:"10px",fontWeight:700,fontSize:"0.78rem",textDecoration:"none"}}
            >
              📱 WhatsApp Support
            </a>
          )}
        </div>
      );
    }
    return (
      <div style={{fontSize:"0.8rem",lineHeight:1.65,whiteSpace:"pre-line" as const}}>
        {content}
      </div>
    );
  }

  const QUICK = [
    {l:"How to pay?",      q:"How do I pay weekly?"},
    {l:"Savings plan",     q:"Tell me about the savings plan"},
    {l:"Missed payment",   q:"What if I miss a payment?"},
    {l:"Withdraw",         q:"When can I withdraw?"},
    {l:"Referral",         q:"How does referral work?"},
    {l:"No crypto",        q:"I don't have crypto exchanger"},
  ];

  return (
    <>
      <style>{`
        @keyframes chatIn{from{opacity:0;transform:scale(0.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .nmsg{max-width:88%;padding:0.62rem 0.85rem;border-radius:14px;}
        .nmsg.user{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;margin-left:auto;border-bottom-right-radius:4px;}
        .nmsg.bot{background:#0d2718;border:1px solid rgba(0,200,150,0.13);color:#e8f8f4;border-bottom-left-radius:4px;}
        .qbtn{padding:0.3rem 0.7rem;border:1px solid rgba(0,200,150,0.2);border-radius:20px;background:rgba(0,200,150,0.06);color:#00c896;font-size:0.71rem;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap;flex-shrink:0;transition:all 0.15s;}
        .qbtn:hover{border-color:rgba(0,200,150,0.4);background:rgba(0,200,150,0.1);}
        .typing span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#00c896;margin:0 2px;animation:tb 1.2s infinite;}
        .typing span:nth-child(2){animation-delay:.2s;}
        .typing span:nth-child(3){animation-delay:.4s;}
        @keyframes tb{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .cinp{flex:1;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.14);border-radius:10px;padding:0.58rem 0.82rem;font-size:0.82rem;color:#e8f8f4;font-family:Inter,sans-serif;outline:none;}
        .cinp:focus{border-color:rgba(0,200,150,0.38);}
        .csend{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#00a87a,#00c896);border:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .csend:disabled{opacity:0.4;cursor:not-allowed;}
      `}</style>

      {/* FAB */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{position:"fixed",bottom:"80px",right:"16px",width:"54px",height:"54px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",boxShadow:"0 4px 24px rgba(0,200,150,0.55)",zIndex:800,transition:"transform 0.2s",transform:open?"scale(0.88)":"scale(1)"}}
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
        <div style={{position:"fixed",bottom:"148px",right:"12px",width:"min(355px,calc(100vw - 24px))",height:"510px",background:"#081a14",border:"1px solid rgba(0,200,150,0.22)",borderRadius:"20px",display:"flex",flexDirection:"column" as const,boxShadow:"0 20px 60px rgba(0,0,0,0.85)",zIndex:800,animation:"chatIn 0.25s ease",overflow:"hidden"}}>

          {/* HEADER */}
          <div style={{padding:"0.85rem 1rem",borderBottom:"1px solid rgba(0,200,150,0.1)",background:"rgba(0,200,150,0.04)",display:"flex",alignItems:"center",gap:"0.65rem",flexShrink:0}}>
            <div style={{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,#00a87a,#00c896)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>🤖</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:"0.88rem",color:"#e8f8f4"}}>NORA — NEXORA Support</div>
              <div style={{fontSize:"0.66rem",color:"#5a8a7a",display:"flex",alignItems:"center",gap:"0.3rem"}}>
                <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00ff88",display:"inline-block"}}/>
                Online · Instant answers
              </div>
            </div>
            <a href={TELEGRAM_LINK} target="_blank" rel="noreferrer" style={{padding:"0.28rem 0.65rem",background:"rgba(0,136,204,0.15)",border:"1px solid rgba(0,136,204,0.3)",borderRadius:"8px",color:"#0088cc",fontSize:"0.7rem",fontWeight:700,textDecoration:"none",flexShrink:0}}>
              ✈️ Telegram
            </a>
          </div>

          {/* MESSAGES */}
          <div style={{flex:1,overflow:"auto",padding:"0.82rem",display:"flex",flexDirection:"column" as const,gap:"0.45rem"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column" as const,alignItems:m.role==="user"?"flex-end":"flex-start",gap:"0.1rem"}}>
                {m.content==="__TG__"?(
                  <div style={{padding:"0.25rem 0"}}>
                    {renderContent("__TG__")}
                  </div>
                ):(
                  <div className={"nmsg "+(m.role==="user"?"user":"bot")}>
                    {renderContent(m.content)}
                  </div>
                )}
                <div style={{fontSize:"0.58rem",color:"#3a5a4a",padding:"0 0.2rem"}}>{m.time}</div>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",alignItems:"flex-start"}}>
                <div className="nmsg bot">
                  <div className="typing"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* QUICK REPLIES */}
          {msgs.length<=1&&!loading&&(
            <div style={{padding:"0 0.75rem 0.5rem",flexShrink:0}}>
              <div style={{fontSize:"0.65rem",color:"#3a6a5a",marginBottom:"0.3rem",fontWeight:600}}>Quick questions:</div>
              <div style={{display:"flex",gap:"0.3rem",overflowX:"auto",scrollbarWidth:"none" as const}}>
                {QUICK.map(b=>(
                  <button key={b.q} className="qbtn" onClick={()=>send(b.q)}>{b.l}</button>
                ))}
              </div>
            </div>
          )}

          {/* TELEGRAM FOOTER */}
          <div style={{padding:"0.5rem 0.75rem",borderTop:"1px solid rgba(0,200,150,0.07)",background:"rgba(0,136,204,0.04)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.5rem"}}>
            <span style={{fontSize:"0.68rem",color:"#5a8a7a"}}>Need account help?</span>
            <a href={TELEGRAM_LINK} target="_blank" rel="noreferrer" style={{padding:"0.3rem 0.8rem",background:"linear-gradient(135deg,#005fa3,#0088cc)",color:"#fff",borderRadius:"8px",fontWeight:700,fontSize:"0.72rem",textDecoration:"none",flexShrink:0}}>
              ✈️ Telegram
            </a>
          </div>

          {/* INPUT */}
          <div style={{padding:"0.65rem 0.75rem",borderTop:"1px solid rgba(0,200,150,0.08)",display:"flex",gap:"0.45rem",flexShrink:0}}>
            <input
              ref={inputRef}
              className="cinp"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="Ask about NEXORA savings..."
            />
            <button className="csend" onClick={()=>send()} disabled={!input.trim()||loading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
