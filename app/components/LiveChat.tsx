"use client";
import { useState, useEffect, useRef } from "react";

export default function LiveChat() {
  const [open,    setOpen]    = useState(false);
  const [message, setMessage] = useState("");
  const [agents,  setAgents]  = useState<any[]>([]);
  const [selAgent,setSelAgent]= useState<any>(null);
  const [sent,    setSent]    = useState(false);
  const [name,    setName]    = useState("");
  const [userEmail, setUserEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    function load() {
      try {
        const team = JSON.parse(localStorage.getItem("nexora_support_team")||"[]");
        const active = team.filter((a:any)=>a.active!==false);
        setAgents(active);
        if (active.length>0) setSelAgent(active[0]);
      } catch {}
      try {
        const u = JSON.parse(localStorage.getItem("nexora_user")||localStorage.getItem("finova_user")||"{}");
        if (u.name) setName(u.name);
        if (u.email) setUserEmail(u.email);
      } catch {}
    }
    load();
    window.addEventListener("storage", load);
    const t = setInterval(load, 3000);
    return ()=>{ window.removeEventListener("storage", load); clearInterval(t); };
  },[]);

  useEffect(()=>{
    if (open && inputRef.current) setTimeout(()=>inputRef.current?.focus(), 200);
  },[open]);

  function send() {
    if (!message.trim()) return;
    const agent = selAgent || agents[0];
    const wa = agent?.whatsapp || "";
    const text = `*NEXORA Support Request*\n\n👤 *Name:* ${name||"Guest"}\n📧 *Email:* ${userEmail||"N/A"}\n\n💬 *Message:*\n${message.trim()}\n\n_Sent from NEXORA App_`;
    if (wa) {
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
      setSent(true); setMessage("");
      setTimeout(()=>setSent(false), 4000);
    } else {
      alert("Our support team is setting up. Please try again soon.");
    }
  }

  return (
    <>
      <style>{`
        .lc-wrap { position:fixed; bottom:80px; right:16px; z-index:9999; display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
        @media(min-width:769px){ .lc-wrap { bottom:28px; } }

        /* FAB BUTTON */
        .lc-fab { width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#00a87a,#00c896); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 20px rgba(0,200,150,0.55),0 0 0 0 rgba(0,200,150,0.4); animation:lc-ring 2.5s infinite; transition:transform 0.2s,box-shadow 0.2s; position:relative; }
        .lc-fab:hover { transform:scale(1.08); box-shadow:0 6px 28px rgba(0,200,150,0.7); }
        @keyframes lc-ring { 0%,100%{ box-shadow:0 4px 20px rgba(0,200,150,0.55),0 0 0 0 rgba(0,200,150,0.4); } 50%{ box-shadow:0 4px 20px rgba(0,200,150,0.55),0 0 0 10px rgba(0,200,150,0); } }
        .lc-dot { position:absolute; top:1px; right:1px; width:13px; height:13px; background:#00ff88; border-radius:50%; border:2.5px solid #050f0c; }

        /* PANEL */
        .lc-panel { width:300px; max-width:calc(100vw - 24px); background:#081a14; border:1px solid rgba(0,200,150,0.22); border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.75); overflow:hidden; animation:lc-pop 0.22s cubic-bezier(0.34,1.56,0.64,1); transform-origin:bottom right; }
        @keyframes lc-pop { from{opacity:0;transform:scale(0.85) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }

        /* PANEL HEAD */
        .lc-head { background:linear-gradient(135deg,rgba(0,200,150,0.15),rgba(0,102,255,0.08)); padding:1rem; border-bottom:1px solid rgba(0,200,150,0.1); display:flex; align-items:center; gap:0.65rem; }
        .lc-head-av { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#00a87a,#00c896); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem; color:#050f0c; flex-shrink:0; border:2px solid rgba(0,200,150,0.4); }
        .lc-head-info { flex:1; }
        .lc-head-name { font-weight:700; font-size:0.88rem; font-family:Inter,sans-serif; color:#e8f8f4; }
        .lc-head-status { display:flex; align-items:center; gap:0.3rem; margin-top:0.15rem; }
        .lc-online-dot { width:7px; height:7px; border-radius:50%; background:#00ff88; animation:lc-pulse 2s infinite; }
        @keyframes lc-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        .lc-online-text { font-size:0.62rem; color:#00c896; font-family:Inter,sans-serif; }
        .lc-close { background:none; border:none; cursor:pointer; color:#5a8a7a; font-size:1rem; padding:0.2rem; line-height:1; transition:color 0.18s; }
        .lc-close:hover { color:#e8f8f4; }

        /* AGENT SELECTOR */
        .lc-agents { display:flex; gap:0.35rem; flex-wrap:wrap; padding:0.6rem 0.9rem 0; }
        .lc-agent-btn { display:flex; align-items:center; gap:0.25rem; padding:0.22rem 0.55rem; border-radius:20px; font-size:0.68rem; cursor:pointer; border:1px solid rgba(0,200,150,0.12); background:none; color:#5a8a7a; transition:all 0.15s; font-family:Inter,sans-serif; }
        .lc-agent-btn.sel { border-color:rgba(0,200,150,0.35); background:rgba(0,200,150,0.08); color:#00c896; font-weight:600; }

        /* BODY */
        .lc-body { padding:0.85rem 0.9rem; }
        .lc-bubble { background:rgba(0,200,150,0.06); border-radius:0 12px 12px 12px; padding:0.65rem 0.75rem; margin-bottom:0.75rem; font-size:0.77rem; color:#5a8a7a; line-height:1.55; font-family:Inter,sans-serif; }
        .lc-bubble b { color:#00c896; }
        .lc-input-row { display:flex; gap:0.4rem; margin-bottom:0.55rem; }
        .lc-inp { flex:1; background:rgba(0,200,150,0.04); border:1px solid rgba(0,200,150,0.15); border-radius:10px; padding:0.6rem 0.75rem; font-size:0.81rem; color:#e8f8f4; outline:none; font-family:Inter,sans-serif; transition:border-color 0.2s; }
        .lc-inp:focus { border-color:rgba(0,200,150,0.4); }
        .lc-send-btn { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,#00a87a,#00c896); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#050f0c; flex-shrink:0; transition:transform 0.18s; }
        .lc-send-btn:hover { transform:scale(1.08); }
        .lc-send-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
        .lc-wa-btn { width:100%; padding:0.62rem; border:none; border-radius:11px; background:linear-gradient(135deg,#128c7e,#25d366); color:#fff; font-family:Inter,sans-serif; font-weight:700; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem; transition:all 0.18s; }
        .lc-wa-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(37,211,102,0.4); }
        .lc-sent { text-align:center; padding:0.35rem; background:rgba(0,200,150,0.07); border:1px solid rgba(0,200,150,0.15); border-radius:9px; font-size:0.73rem; color:#00c896; margin-top:0.5rem; font-family:Inter,sans-serif; }
        .lc-offline { text-align:center; padding:1rem; font-size:0.76rem; color:#5a8a7a; line-height:1.6; font-family:Inter,sans-serif; }

        /* FOOTER */
        .lc-panel-footer { padding:0.5rem 0.9rem 0.75rem; text-align:center; font-size:0.6rem; color:#2a5a4a; font-family:Inter,sans-serif; border-top:1px solid rgba(0,200,150,0.06); }

        /* TOOLTIP */
        .lc-tooltip { background:#081a14; border:1px solid rgba(0,200,150,0.2); border-radius:10px; padding:0.35rem 0.8rem; font-size:0.74rem; color:#e8f8f4; font-family:Inter,sans-serif; font-weight:600; white-space:nowrap; box-shadow:0 4px 16px rgba(0,0,0,0.4); animation:lc-pop 0.2s ease; }
      `}</style>

      <div className="lc-wrap">
        {/* PANEL */}
        {open && (
          <div className="lc-panel">
            {/* HEAD */}
            <div className="lc-head">
              <div className="lc-head-av">
                {selAgent ? selAgent.name.charAt(0).toUpperCase() : "N"}
              </div>
              <div className="lc-head-info">
                <div className="lc-head-name">NEXORA Support</div>
                <div className="lc-head-status">
                  <div className="lc-online-dot"/>
                  <span className="lc-online-text">
                    {selAgent ? selAgent.name.split(" ")[0] + " · " : ""}{selAgent?.role||"Support Team"} · Online
                  </span>
                </div>
              </div>
              <button className="lc-close" onClick={()=>setOpen(false)}>✕</button>
            </div>

            {/* AGENT SELECTOR */}
            {agents.length > 1 && (
              <div className="lc-agents">
                {agents.map((a:any)=>(
                  <button key={a.id||a.whatsapp} className={"lc-agent-btn"+(selAgent?.whatsapp===a.whatsapp?" sel":"")} onClick={()=>setSelAgent(a)}>
                    {a.name.charAt(0).toUpperCase()} {a.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}

            {/* BODY */}
            <div className="lc-body">
              {agents.length === 0 ? (
                <div className="lc-offline">
                  <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>💬</div>
                  Our support team is being set up.<br/>
                  Please check back shortly or email us at<br/>
                  <b style={{color:"#00c896"}}>support@nexora.com</b>
                </div>
              ) : (
                <>
                  <div className="lc-bubble">
                    👋 Hi{name ? `, <b>${name.split(" ")[0]}</b>` : ""}! How can we help you today?<br/>
                    Type your message and we'll reply on <b>WhatsApp</b> right away!
                  </div>
                  <div className="lc-input-row">
                    <input
                      ref={inputRef}
                      className="lc-inp"
                      placeholder="Type your message..."
                      value={message}
                      onChange={e=>setMessage(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&send()}
                    />
                    <button className="lc-send-btn" onClick={send} disabled={!message.trim()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#050f0c">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    </button>
                  </div>
                  <button className="lc-wa-btn" onClick={send}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </button>
                  {sent && <div className="lc-sent">✅ Opening WhatsApp... We'll reply shortly!</div>}
                </>
              )}
            </div>
            <div className="lc-panel-footer">Powered by NEXORA · support@nexora.com</div>
          </div>
        )}

        {/* TOOLTIP */}
        {!open && <div className="lc-tooltip">💬 Need help?</div>}

        {/* FAB */}
        <button className="lc-fab" onClick={()=>setOpen(o=>!o)} aria-label="Support Chat">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#050f0c">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#050f0c">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          )}
          {!open && <div className="lc-dot"/>}
        </button>
      </div>
    </>
  );
}
