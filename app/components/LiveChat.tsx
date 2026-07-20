"use client";
import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const NEXORA_FAQ = [
  { q:["how does nexora work","how it works","what is nexora","explain nexora"], a:"NEXORA is a crypto savings platform. You save $3 USDT every week for 52 weeks (1 year) and earn 35% APY. At the end you receive your savings plus interest. It's simple, disciplined saving!" },
  { q:["weekly payment","how much","weekly savings","weekly contribution"], a:"You save $3 USDT every week. That's only about ₦5,000 per week! Over 52 weeks you contribute $156 USDT total." },
  { q:["interest","apy","how much will i earn","returns","profit"], a:"NEXORA offers 35% APY on your contributions. On a $156 total contribution, you earn approximately $54.60 in interest. Your total payout is around $210+ USDT plus a $15 voucher!" },
  { q:["penalty","late payment","missed payment","overdue"], a:"If you miss a weekly payment, a $4 USDT penalty applies. Missing 5 consecutive weeks terminates your contract and you forfeit your interest. Always try to pay on time!" },
  { q:["referral","refer","invite","referral code","bonus"], a:"You get a unique referral code when you sign up! Share it with friends. When they register using your code, you earn a $5 USDT referral bonus credited to your account automatically." },
  { q:["deposit","how to deposit","send money","usdt","payment method"], a:"Go to Deposit on your dashboard. You can send crypto directly (BTC, ETH, USDT, BNB) to our wallet address, or use our trusted local exchangers who accept bank transfers and mobile money." },
  { q:["exchanger","local exchanger","no crypto","bank transfer"], a:"Don't have crypto? No problem! Our trusted local exchangers accept Naira bank transfers and mobile money. They convert it to USDT and credit your wallet within 30 minutes." },
  { q:["withdraw","cash out","withdrawal","how to withdraw"], a:"You can withdraw from your wallet balance to mobile money, bank transfer, or crypto wallet. Go to Withdraw on your dashboard. Note: savings plan funds are locked until week 52." },
  { q:["kyc","verification","verify","identity"], a:"KYC verification requires your government ID (NIN/Passport/Driver's License), a selfie holding your ID, and proof of address. It's required to unlock full withdrawal limits." },
  { q:["contract","agreement","52 weeks","duration"], a:"Your savings contract runs for exactly 52 weeks (1 year). During this period, savings funds are locked. At maturity you receive everything plus interest and a $15 voucher!" },
  { q:["register","sign up","how to join","create account"], a:"Click 'Create Account', enter your name, email and password, sign the savings contract, then verify via WhatsApp OTP. You're ready to start saving immediately!" },
  { q:["safe","secure","trust","legitimate","real"], a:"NEXORA is built with bank-grade security — encryption, KYC verification, and compliance with EU MiCA and FSCA standards. Your funds and data are protected at all times." },
  { q:["support","help","contact","agent","human"], a:"You can reach our support team directly via WhatsApp for immediate assistance. Click the 'Chat on WhatsApp' button below to connect with a live agent now!" },
  { q:["voucher","bonus","reward","completion reward"], a:"Complete all 52 weekly payments and you receive a $15 cash or food voucher as a reward on top of your interest earnings. It's our way of celebrating your discipline!" },
  { q:["password","forgot password","reset password","login problem"], a:"If you have trouble logging in, make sure you're using the correct email and password. Use the 'Remember me' option to stay logged in. For password reset, contact our support team." },
  { q:["wallet","wallet address","my wallet","balance"], a:"Your wallet holds BTC, ETH, USDT, and BNB. Your balance starts at $0 and grows as you deposit. You can view all your wallet addresses on the Wallet page." },
  { q:["payout","how much at end","total payout","what do i get"], a:"At 52 weeks: $156 contributed + ~$54.60 interest (35% APY) + $15 voucher = approximately $225+ USDT total payout. The exact amount depends on your payment history." },
];

function findAnswer(msg: string): string | null {
  const lower = msg.toLowerCase();
  for (const faq of NEXORA_FAQ) {
    if (faq.q.some(q => lower.includes(q) || q.split(" ").some(w => w.length > 4 && lower.includes(w)))) {
      return faq.a;
    }
  }
  return null;
}

type Message = { role:"user"|"bot"|"typing"; text:string; time:string; };

export default function LiveChat() {
  const [open,     setOpen]    = useState(false);
  const [messages, setMessages]= useState<Message[]>([]);
  const [input,    setInput]   = useState("");
  const [agents,   setAgents]  = useState<any[]>([]);
  const [selAgent, setSelAgent]= useState<any>(null);
  const [loading,  setLoading] = useState(false);
  const [userName, setUserName]= useState("");
  const [userEmail,setUserEmail]= useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    try {
      const team = JSON.parse(localStorage.getItem("nexora_support_team")||"[]");
      const active = team.filter((a:any)=>a.active!==false);
      setAgents(active);
      if (active.length>0) setSelAgent(active[0]);
    } catch {}
    try {
      const u = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");
      if (u.name)  setUserName(u.name);
      if (u.email) setUserEmail(u.email);
    } catch {}
  },[]);

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  useEffect(()=>{
    if (open && messages.length===0) {
      setTimeout(()=>{
        addBotMessage(`👋 Hi${userName?` ${userName.split(" ")[0]}`:""}! I'm the NEXORA AI Assistant.\n\nI can help you with:\n• How savings & interest works\n• Referral bonuses\n• Deposits & withdrawals\n• Penalties & missed payments\n• Account & KYC verification\n\nWhat would you like to know?`);
      },500);
    }
    if (open) setTimeout(()=>inputRef.current?.focus(),300);
  },[open]);

  function addBotMessage(text: string) {
    const msg: Message = { role:"bot", text, time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) };
    setMessages(prev=>[...prev, msg]);
  }

  async function sendMessage() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { role:"user", text:msg, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMessages(prev=>[...prev, userMsg]);
    setLoading(true);

    // Show typing indicator
    setMessages(prev=>[...prev, {role:"typing",text:"",time:""}]);

    await new Promise(r=>setTimeout(r, 800));

    // Remove typing indicator
    setMessages(prev=>prev.filter(m=>m.role!=="typing"));
    setLoading(false);

    // Try local FAQ first
    const localAnswer = findAnswer(msg);
    if (localAnswer) {
      // Check if it's a support/contact question
      const needsHuman = msg.toLowerCase().match(/agent|human|person|support|help|contact|speak|talk/);
      addBotMessage(localAnswer);
      if (needsHuman && agents.length>0) {
        setTimeout(()=>{
          addBotMessage("🔗 You can also connect directly with our support team on WhatsApp:");
        },500);
      }
      return;
    }

    // Try Claude API for complex questions
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:300,
          messages:[{role:"user",content:msg}],
          system:`You are NEXORA's helpful AI assistant. NEXORA is a crypto savings platform where users save $3 USDT/week for 52 weeks, earning 35% APY. Key facts:
- Weekly savings: $3 USDT
- Duration: 52 weeks (1 year)
- Interest: 35% APY
- Late penalty: $4 USDT
- 5 missed weeks = contract terminated
- Referral bonus: $5 USDT per referral
- Completion reward: $15 voucher
- Total payout: ~$225+ USDT

Answer the user's question briefly and helpfully. If you cannot answer confidently or the question is about their specific account, say you'll connect them with a human agent. Keep responses under 3 sentences.`,
        }),
      });
      const data = await resp.json();
      if (data.content?.[0]?.text) {
        addBotMessage(data.content[0].text);
      } else throw new Error("No response");
    } catch {
      // Fallback - redirect to human
      addBotMessage("I'm not sure about that one! Let me connect you with our support team who can give you a precise answer. Click 'Chat on WhatsApp' below to speak with an agent right away! 💬");
    }
  }

  function openWhatsApp() {
    const agent = selAgent||agents[0];
    if (!agent?.whatsapp) {
      alert("Support team not configured. Please email support@nexora.com");
      return;
    }
    const lastQ = [...messages].reverse().find(m=>m.role==="user")?.text||"Hello";
    const text = `*NEXORA Support*\n\n👤 *User:* ${userName||"Guest"}\n📧 *Email:* ${userEmail||"N/A"}\n\n💬 *Question:*\n${lastQ}\n\n_via NEXORA AI Chat_`;
    window.open(`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <>
      <style>{`
        .lc-wrap{position:fixed;bottom:80px;right:14px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
        @media(min-width:769px){.lc-wrap{bottom:28px;}}
        .lc-fab{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#00a87a,#00c896);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,200,150,0.55);transition:all 0.2s;position:relative;}
        .lc-fab:hover{transform:scale(1.08);}
        .lc-dot{position:absolute;top:1px;right:1px;width:12px;height:12px;background:#00ff88;border-radius:50%;border:2px solid #050f0c;animation:lcp 2s infinite;}
        @keyframes lcp{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
        .lc-panel{width:310px;max-width:calc(100vw - 24px);background:#081a14;border:1px solid rgba(0,200,150,0.22);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.75);overflow:hidden;animation:lcs 0.22s cubic-bezier(0.34,1.56,0.64,1);transform-origin:bottom right;}
        @keyframes lcs{from{opacity:0;transform:scale(0.85) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .lc-head{background:linear-gradient(135deg,rgba(0,200,150,0.12),rgba(0,102,255,0.06));padding:0.85rem 1rem;border-bottom:1px solid rgba(0,200,150,0.1);display:flex;align-items:center;gap:0.6rem;}
        .lc-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00a87a,#00c896);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.82rem;color:#050f0c;flex-shrink:0;}
        .lc-msgs{height:280px;overflow-y:auto;padding:0.85rem;display:flex;flex-direction:column;gap:0.6rem;scroll-behavior:smooth;}
        .lc-msgs::-webkit-scrollbar{width:3px;}
        .lc-msgs::-webkit-scrollbar-thumb{background:rgba(0,200,150,0.2);border-radius:3px;}
        .lc-bubble{max-width:88%;padding:0.6rem 0.8rem;border-radius:12px;font-size:0.78rem;line-height:1.55;font-family:"Inter",sans-serif;white-space:pre-wrap;}
        .lc-bubble.bot{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.12);color:#e8f8f4;align-self:flex-start;border-radius:4px 12px 12px 12px;}
        .lc-bubble.user{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;align-self:flex-end;border-radius:12px 4px 12px 12px;font-weight:500;}
        .lc-bubble.typing{background:rgba(0,200,150,0.06);align-self:flex-start;padding:0.5rem 0.9rem;}
        .lc-time{font-size:0.58rem;color:#3a5a4a;margin-top:0.15rem;font-family:"Inter",sans-serif;}
        .lc-time.right{text-align:right;}
        .lc-msg-wrap.right{align-self:flex-end;text-align:right;}
        .lc-msg-wrap{display:flex;flex-direction:column;}
        .lc-input-area{padding:0.75rem 0.9rem;border-top:1px solid rgba(0,200,150,0.08);}
        .lc-input-row{display:flex;gap:0.4rem;margin-bottom:0.55rem;}
        .lc-inp{flex:1;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.15);border-radius:10px;padding:0.55rem 0.7rem;font-size:0.8rem;color:#e8f8f4;outline:none;font-family:"Inter",sans-serif;}
        .lc-inp:focus{border-color:rgba(0,200,150,0.4);}
        .lc-send{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#00a87a,#00c896);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .lc-send:disabled{opacity:0.4;cursor:not-allowed;}
        .lc-wa{width:100%;padding:0.55rem;border:none;border-radius:9px;background:linear-gradient(135deg,#128c7e,#25d366);color:#fff;font-family:"Inter",sans-serif;font-weight:700;font-size:0.76rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.35rem;transition:all 0.18s;}
        .lc-wa:hover{transform:translateY(-1px);}
        .lc-footer{padding:0.4rem 0.9rem 0.6rem;text-align:center;font-size:0.58rem;color:#2a4a3a;border-top:1px solid rgba(0,200,150,0.05);}
        .typing-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#00c896;animation:td 1.2s infinite;margin:0 2px;}
        .typing-dot:nth-child(2){animation-delay:0.2s;}
        .typing-dot:nth-child(3){animation-delay:0.4s;}
        @keyframes td{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        .lc-close{margin-left:auto;background:none;border:none;cursor:pointer;color:#5a8a7a;font-size:0.95rem;}
        .lc-close:hover{color:#e8f8f4;}
        .lc-quick{display:flex;gap:0.3rem;flex-wrap:wrap;padding:0 0.85rem 0.6rem;}
        .lc-q{padding:0.25rem 0.6rem;border-radius:20px;font-size:0.65rem;border:1px solid rgba(0,200,150,0.18);background:rgba(0,200,150,0.04);color:#5a8a7a;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.15s;}
        .lc-q:hover{border-color:rgba(0,200,150,0.35);color:#00c896;background:rgba(0,200,150,0.08);}
      `}</style>

      <div className="lc-wrap">
        {open&&(
          <div className="lc-panel">
            {/* HEAD */}
            <div className="lc-head">
              <div className="lc-av">N</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"0.86rem",color:"#e8f8f4",fontFamily:"Inter,sans-serif"}}>NEXORA Support</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.3rem",marginTop:"0.1rem"}}>
                  <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00ff88",display:"inline-block"}}/>
                  <span style={{fontSize:"0.6rem",color:"#00c896",fontFamily:"Inter,sans-serif"}}>AI Assistant + Live Agents</span>
                </div>
              </div>
              <button className="lc-close" onClick={()=>setOpen(false)}>✕</button>
            </div>

            {/* MESSAGES */}
            <div className="lc-msgs">
              {messages.map((m,i)=>(
                <div key={i} className={`lc-msg-wrap ${m.role==="user"?"right":""}`}>
                  {m.role==="typing" ? (
                    <div className="lc-bubble typing">
                      <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
                    </div>
                  ) : (
                    <>
                      <div className={`lc-bubble ${m.role}`}>{m.text}</div>
                      {m.time&&<div className={`lc-time ${m.role==="user"?"right":""}`}>{m.time}</div>}
                    </>
                  )}
                </div>
              ))}
              <div ref={msgEndRef}/>
            </div>

            {/* QUICK QUESTIONS */}
            {messages.length<=1&&(
              <div className="lc-quick">
                {["How does it work?","Weekly payment?","Referral bonus?","Late penalty?","How to deposit?"].map(q=>(
                  <button key={q} className="lc-q" onClick={()=>{setInput(q);setTimeout(()=>sendMessage(),100);}}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT */}
            <div className="lc-input-area">
              <div className="lc-input-row">
                <input
                  ref={inputRef}
                  className="lc-inp"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&!loading&&sendMessage()}
                />
                <button className="lc-send" onClick={sendMessage} disabled={!input.trim()||loading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#050f0c">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
              {agents.length>0&&(
                <button className="lc-wa" onClick={openWhatsApp}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat with Live Agent on WhatsApp
                </button>
              )}
            </div>
            <div className="lc-footer">NEXORA AI · Powered by Claude · support@nexora.com</div>
          </div>
        )}

        {/* FAB */}
        <button className="lc-fab" onClick={()=>setOpen(o=>!o)}>
          {open
            ?<svg width="18" height="18" viewBox="0 0 24 24" fill="#050f0c"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            :<svg width="22" height="22" viewBox="0 0 24 24" fill="#050f0c"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          }
          {!open&&<div className="lc-dot"/>}
        </button>
      </div>
    </>
  );
}
