"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FAQPage() {
  const router = useRouter();
  const [open, setOpen] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  const SUPPORT_TEAM = typeof window!=="undefined" ? JSON.parse(localStorage.getItem("nexora_support_team")||"[]") : [];
  const agent = SUPPORT_TEAM.find((a:any)=>a.active);

  const faqs = [
    // REGISTRATION
    {id:"r1",cat:"registration",icon:"🚀",q:"How do I register on NEXORA?",a:"1. Click 'Create Account' on the login page\n2. Enter your full name, email and password\n3. Pay the $4 USDT registration fee to our wallet address shown on the form\n4. Upload a screenshot of your payment\n5. Sign your 52-week savings contract\n6. Verify via WhatsApp OTP\n7. Wait 24-48 hours for admin approval\n\nOnce approved your dashboard opens and your savings plan begins automatically!"},
    {id:"r2",cat:"registration",icon:"💳",q:"What is the $4 registration fee and why is it required?",a:"A one-time $4 USDT fee is required to activate your NEXORA account. This fee:\n• Covers account setup and verification costs\n• Shows your commitment to the savings plan\n• Keeps the platform secure and fraud-free\n\nThe fee is non-refundable. Once paid and approved by admin, your account is permanently activated and your 52-week savings plan begins."},
    {id:"r3",cat:"registration",icon:"⏰",q:"How long does account approval take?",a:"Account approval takes 24-48 hours after you submit your registration fee screenshot.\n\nDuring this time admin:\n• Verifies your payment screenshot\n• Confirms the $4 USDT transaction\n• Activates your account and creates your savings plan\n\nYou receive an in-app notification when approved. If you haven't heard after 48 hours, contact support on WhatsApp immediately."},
    // PAYMENTS
    {id:"p1",cat:"payments",icon:"💰",q:"How do I make my weekly $3 USDT payment?",a:"Two ways to pay your weekly $3 USDT:\n\n📱 Direct Crypto:\n1. Go to Dashboard → Deposit\n2. Copy the wallet address shown\n3. Send exactly $3 USDT (TRC-20 recommended — lowest fees)\n4. Screenshot the transaction confirmation\n5. Upload the screenshot as proof\n6. Admin approves and your savings update immediately\n\n💱 Via Local Exchanger:\n1. Go to Dashboard → Deposit → Exchanger tab\n2. Pick a verified exchanger\n3. Send Naira equivalent via bank transfer\n4. They convert and pay on your behalf"},
    {id:"p2",cat:"payments",icon:"📸",q:"Why do I need to upload a payment screenshot?",a:"Screenshots are required as proof of payment so our admin team can:\n• Verify the correct amount was sent ($3 USDT for savings, $4 for registration, $4 for penalty)\n• Confirm the payment went to the right wallet address\n• Protect you from payment errors\n• Credit your savings within hours\n\nAlways take a screenshot immediately after sending crypto. The screenshot should clearly show the amount, recipient address, and transaction status."},
    {id:"p3",cat:"payments",icon:"⚠️",q:"What happens if I miss a payment?",a:"If you miss your weekly payment:\n\n📅 Grace Period: Pay by end of the due day to avoid penalty.\n\n⚠️ Penalty Applied: $4 USDT late payment fee. You must pay this before continuing your plan.\n\n📉 5 Consecutive Missed Payments: Your contract is terminated. You forfeit all earned interest but keep your principal contributions.\n\nWe send you reminders before each payment is due. Set a weekly reminder on your phone — same day, same time every week!"},
    {id:"p4",cat:"payments",icon:"💸",q:"What is the $4 penalty payment?",a:"If you miss your weekly payment, a $4 USDT late penalty is applied.\n\nTo pay your penalty:\n1. Go to your Savings page — you'll see the penalty notice\n2. Click 'Pay Penalty'\n3. Send $4 USDT to our wallet address\n4. Upload the payment screenshot\n5. Admin approves and your plan resumes\n\nThe penalty is higher than the weekly payment ($4 vs $3) to encourage on-time payments. Missing 5 weeks terminates your contract."},
    {id:"p5",cat:"payments",icon:"🔍",q:"How long does payment approval take?",a:"Payment approval typically takes 1-6 hours depending on when you submit.\n\nFast approvals (1-2 hours): Weekdays 8AM-8PM WAT\nSlower approvals (up to 12 hours): Nights and weekends\n\nOnce approved, your savings dashboard updates instantly with the new week marked as paid. You also receive an in-app notification.\n\nIf your payment has been pending for more than 24 hours, contact support with your transaction screenshot."},
    // SAVINGS PLAN
    {id:"s1",cat:"savings",icon:"📊",q:"How does the 52-week savings plan work?",a:"The NEXORA savings plan works like this:\n\n• Pay $3 USDT every week for 52 weeks\n• Total contributions: $106 USDT\n• Interest earned: 20% APY = $31.20\n• Completion voucher: $10\n• Total payout: $197.20+ USDT\n\nYour admin-approved payments count toward your 52 weeks. The plan runs for exactly one year. When complete, you submit your clearance form and receive your full payout."},
    {id:"s2",cat:"savings",icon:"💎",q:"When can I withdraw my money?",a:"Withdrawal is ONLY allowed after completing all 52 weekly payments.\n\nWithdrawal process:\n1. Complete all 52 weeks\n2. Download and sign the clearance form\n3. Upload signed clearance form + your final payment receipt\n4. Admin reviews your documents (24-48 hours)\n5. Payment sent to your specified wallet\n\n⚠️ Early withdrawal is NOT possible by design — the 52-week commitment is what guarantees your 20% APY interest rate."},
    {id:"s3",cat:"savings",icon:"📈",q:"How is my 20% APY interest calculated?",a:"20% APY on your $106 total contributions:\n\n$106 × 20% = $31.20 interest earned\n$106 principal + $31.20 interest + $10 bonus = $197.20 USDT total payout\n\nInterest accrues from the date of each payment. The full amount is paid out when you complete all 52 weeks and your withdrawal request is approved by admin."},
    {id:"s4",cat:"savings",icon:"⛔",q:"What happens if my contract is terminated?",a:"Contract termination happens after 5 consecutive missed payments.\n\nIf terminated:\n❌ All earned interest (20% APY) is forfeited\n❌ Your savings plan closes permanently\n✅ Your principal contributions remain in your account\n✅ You can contact admin to arrange retrieval of contributions\n\nTo avoid termination: pay on time every week. Set phone reminders. Use our local exchangers if you struggle with crypto."},
    // SECURITY
    {id:"sec1",cat:"security",icon:"🔒",q:"Is my money safe with NEXORA?",a:"Yes. NEXORA implements multiple security layers:\n\n• AES-256 encryption for all data\n• 2FA via WhatsApp for login protection\n• KYC verification to prevent fraud\n• Session auto-timeout after 30 minutes\n• Brute force and DDoS protection\n• All transactions require admin approval\n• Login history so you can detect unauthorized access\n\nWe follow Nigerian NDPR data protection regulations and FATF anti-money laundering guidelines."},
    {id:"sec2",cat:"security",icon:"🪪",q:"Why is KYC required?",a:"KYC (Know Your Customer) is required because:\n\n1. It protects YOU: prevents fraudsters using your identity\n2. It's legally required: financial regulations mandate identity verification\n3. It unlocks full features: higher deposit/withdrawal limits\n4. It protects the platform: prevents money laundering\n\nYou need to upload: Government ID (NIN, passport, or driver's license), a selfie holding your ID, and proof of address. Your documents are encrypted and never shared."},
    // REFERRALS
    {id:"ref1",cat:"referrals",icon:"🎁",q:"How does the referral program work?",a:"Earning referrals is simple:\n\n1. Find your referral code on your Dashboard\n2. Share it with friends and family\n3. They register using your code\n4. Their account gets approved by admin\n5. You earn $1 USDT automatically!\n\nNo limit on referrals. Refer 50 people = $50 USDT bonus. Your referral earnings are visible in Dashboard → Progress → Referrals."},
    {id:"ref2",cat:"referrals",icon:"💵",q:"When do I receive my referral bonus?",a:"Your $1 USDT referral bonus is credited automatically when:\n• The person you referred registers with your code\n• They pay and submit their $4 registration fee\n• Admin approves their account\n\nYou receive an in-app notification: 'You earned $1 USDT referral bonus!'\n\nBonuses accumulate in your wallet balance. They can be withdrawn after completing your 52-week plan."},
    // TECHNICAL
    {id:"t1",cat:"technical",icon:"⚙️",q:"The app is slow or not loading. What should I do?",a:"Try these steps:\n\n1. Check your internet connection\n2. Refresh the page (pull down on mobile)\n3. Clear browser cache and cookies\n4. Try a different browser (Chrome works best)\n5. Open in incognito/private mode\n6. Wait 5-10 minutes — server may be briefly restarting\n\nFor best experience: Chrome on Android, Safari on iPhone. You can also install NEXORA as a home screen app (tap 'Add to Home Screen')."},
    {id:"t2",cat:"technical",icon:"🔑",q:"I forgot my password. How do I reset it?",a:"Contact our support team to reset your password:\n\n1. WhatsApp our support team (fastest)\n2. Email support@nexora.com\n3. Provide your registered email address\n4. Verify your identity with security questions\n5. We reset and send you a temporary password\n6. Login and change immediately\n\nTip: If you saved 'Remember me', you may still be logged in on your original device."},
    {id:"t3",cat:"technical",icon:"📱",q:"Can I use NEXORA on multiple devices?",a:"Yes! NEXORA works on any device with a browser:\n• Android phones and tablets\n• iPhones and iPads\n• Windows computers\n• Mac computers\n\nYour account syncs automatically across devices. Enable 2FA for extra security when using multiple devices.\n\nInstall as a home screen app for best experience — tap 'Add to Home Screen' when prompted."},
  ];

  const categories = [
    {id:"all",label:"All",icon:"❓"},
    {id:"registration",label:"Registration",icon:"🚀"},
    {id:"payments",label:"Payments",icon:"💰"},
    {id:"savings",label:"Savings Plan",icon:"📊"},
    {id:"security",label:"Security",icon:"🔒"},
    {id:"referrals",label:"Referrals",icon:"🎁"},
    {id:"technical",label:"Technical",icon:"⚙️"},
  ];

  const filtered = faqs.filter(f=>{
    const matchCat  = cat==="all"||f.cat===cat;
    const matchSearch = !search||f.q.toLowerCase().includes(search.toLowerCase())||f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"Inter",sans-serif;}
        .wrap{max-width:820px;margin:0 auto;padding:0 1.2rem 5rem;}
        .nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;position:sticky;top:0;background:rgba(5,15,12,0.96);backdrop-filter:blur(20px);z-index:100;border-bottom:1px solid rgba(0,200,150,0.07);}
        .logo{display:flex;align-items:center;gap:0.5rem;font-weight:800;cursor:pointer;}
        .logo-mark{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#00c896,#0066ff);display:flex;align-items:center;justify-content:center;}
        .nav-links{display:flex;gap:0.5rem;}
        .nav-btn{padding:0.38rem 0.85rem;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:"Inter",sans-serif;transition:all 0.15s;}
        .nav-btn.outline{background:none;border:1px solid rgba(0,200,150,0.2);color:#5a8a7a;}
        .nav-btn.solid{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;border:none;}
        .hero{text-align:center;padding:3rem 0 2.2rem;}
        .tag{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:0.32rem 0.9rem;font-size:0.73rem;color:#00c896;font-weight:600;margin-bottom:1rem;}
        .title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.5rem);margin-bottom:0.65rem;}
        .gr{background:linear-gradient(135deg,#00c896,#4dffc3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .search-box{position:relative;margin-bottom:1rem;}
        .search-inp{width:100%;background:#081a14;border:1px solid rgba(0,200,150,0.15);border-radius:13px;padding:0.82rem 1rem 0.82rem 2.8rem;font-size:0.88rem;color:#e8f8f4;font-family:"Inter",sans-serif;outline:none;transition:border-color 0.2s;}
        .search-inp:focus{border-color:rgba(0,200,150,0.4);}
        .si{position:absolute;left:0.9rem;top:50%;transform:translateY(-50%);font-size:0.95rem;color:#5a8a7a;}
        .sx{position:absolute;right:0.9rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#5a8a7a;cursor:pointer;font-size:0.95rem;}
        .cat-row{display:flex;gap:0.4rem;overflow-x:auto;margin-bottom:1rem;padding-bottom:0.2rem;scrollbar-width:none;}
        .cat-row::-webkit-scrollbar{display:none;}
        .cat-btn{display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.82rem;border-radius:20px;font-size:0.74rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.15s;border:none;font-family:"Inter",sans-serif;flex-shrink:0;}
        .cat-btn.on{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;}
        .cat-btn.off{background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.12);color:#5a8a7a;}
        .faq-count{font-size:0.73rem;color:#5a8a7a;margin-bottom:0.65rem;}
        .faq-item{background:#081a14;border:1px solid rgba(0,200,150,0.08);border-radius:13px;margin-bottom:0.45rem;overflow:hidden;transition:border-color 0.2s;}
        .faq-item.open{border-color:rgba(0,200,150,0.28);}
        .faq-q{display:flex;align-items:center;gap:0.65rem;padding:0.95rem 1rem;cursor:pointer;user-select:none;}
        .faq-q:hover{background:rgba(0,200,150,0.02);}
        .faq-q-text{flex:1;font-weight:600;font-size:0.87rem;line-height:1.35;}
        .faq-arrow{color:#5a8a7a;font-size:0.72rem;transition:transform 0.22s;flex-shrink:0;}
        .faq-arrow.open{transform:rotate(180deg);color:#00c896;}
        .faq-a{padding:0 1rem 0.95rem 2.4rem;font-size:0.79rem;color:#5a8a7a;line-height:1.85;white-space:pre-line;border-top:1px solid rgba(0,200,150,0.06);padding-top:0.7rem;margin:0 0 0 0;}
        .still{background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,102,255,0.04));border:1px solid rgba(0,200,150,0.18);border-radius:20px;padding:2.2rem 1.5rem;text-align:center;margin-top:2.5rem;}
        .still-title{font-family:"Syne",sans-serif;font-weight:800;font-size:1.25rem;margin-bottom:0.5rem;}
        .still-sub{font-size:0.83rem;color:#5a8a7a;margin-bottom:1.3rem;line-height:1.7;}
        .still-btns{display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;}
        .still-btn{padding:0.7rem 1.3rem;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;text-decoration:none;display:inline-block;font-family:"Inter",sans-serif;transition:all 0.18s;border:none;}
        .wa{background:linear-gradient(135deg,#128c7e,#25d366);color:#fff;}
        .tg{background:linear-gradient(135deg,#005fa3,#0088cc);color:#fff;}
        .em{background:none;border:1px solid rgba(0,200,150,0.22);color:#5a8a7a;}
        .em:hover{border-color:rgba(0,200,150,0.4);color:#00c896;}
        .no-res{text-align:center;padding:3rem;color:#5a8a7a;background:#081a14;border:1px solid rgba(0,200,150,0.07);border-radius:13px;}
      `}</style>

      <div style={{maxWidth:"820px",margin:"0 auto",padding:"0 1.2rem"}}>
        <nav className="nav">
          <div className="logo" onClick={()=>router.push("/")}>
            <div className="logo-mark"><svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M6 6L6 26L14 14L26 26L26 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <span style={{background:"linear-gradient(135deg,#00c896,#4dffc3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEXORA</span>
          </div>
          <div className="nav-links">
            <button className="nav-btn outline" onClick={()=>router.push("/about")}>About</button>
            <button className="nav-btn outline" onClick={()=>router.push("/contact")}>Contact</button>
            <button className="nav-btn solid"   onClick={()=>router.push("/login")}>Get Started</button>
          </div>
        </nav>
      </div>

      <div className="wrap">
        <div className="hero">
          <div className="tag">❓ Help Center</div>
          <h1 className="title">Frequently Asked <span className="gr">Questions</span></h1>
          <p style={{fontSize:"0.88rem",color:"#5a8a7a",maxWidth:"440px",margin:"0 auto",lineHeight:1.75}}>
            Everything about NEXORA savings plans, payments, penalties, and security. Can't find your answer? Chat with us 24/7.
          </p>
        </div>

        <div className="search-box">
          <span className="si">🔍</span>
          <input className="search-inp" placeholder="Search questions... e.g. 'penalty', 'withdraw', 'referral'" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search&&<button className="sx" onClick={()=>setSearch("")}>✕</button>}
        </div>

        <div className="cat-row">
          {categories.map(c=>(
            <button key={c.id} className={`cat-btn ${cat===c.id?"on":"off"}`} onClick={()=>setCat(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="faq-count">{filtered.length} question{filtered.length!==1?"s":""} found{search&&<span> for "<b style={{color:"#00c896"}}>{search}</b>"</span>}</div>

        {filtered.length===0?(
          <div className="no-res">
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔍</div>
            <div style={{fontWeight:700,marginBottom:"0.4rem"}}>No results found</div>
            <div style={{fontSize:"0.8rem"}}>Try different keywords or <button onClick={()=>{setSearch("");setCat("all");}} style={{background:"none",border:"none",color:"#00c896",cursor:"pointer",fontWeight:700,fontFamily:"Inter,sans-serif"}}>browse all questions</button></div>
          </div>
        ):filtered.map(faq=>(
          <div key={faq.id} className={`faq-item ${open===faq.id?"open":""}`}>
            <div className="faq-q" onClick={()=>setOpen(open===faq.id?null:faq.id)}>
              <span style={{fontSize:"1rem",flexShrink:0}}>{faq.icon}</span>
              <div className="faq-q-text">{faq.q}</div>
              <div className={`faq-arrow ${open===faq.id?"open":""}`}>▾</div>
            </div>
            {open===faq.id&&(
              <div className="faq-a">{faq.a}</div>
            )}
          </div>
        ))}

        <div className="still">
          <div style={{fontSize:"2rem",marginBottom:"0.6rem"}}>💬</div>
          <div className="still-title">Still need help?</div>
          <div className="still-sub">Our team is available 24/7 via WhatsApp and Telegram. We reply within minutes.</div>
          <div className="still-btns">
            <a href={`https://wa.me/${agent?.whatsapp||"2348000000000"}?text=${encodeURIComponent("Hi NEXORA Support! I have a question:")}`} target="_blank" rel="noreferrer" className="still-btn wa">📱 WhatsApp Support</a>
            <a href="https://t.me/NexoraSupport" target="_blank" rel="noreferrer" className="still-btn tg">✈️ Telegram Support</a>
            <a href="mailto:support@nexora.com" className="still-btn em">📧 Email Support</a>
          </div>
        </div>
      </div>
    </>
  );
}
