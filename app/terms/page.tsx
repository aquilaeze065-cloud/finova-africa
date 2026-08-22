"use client";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();
  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap");
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050f0c;color:#e8f8f4;font-family:"DM Sans",sans-serif;}
        .legal-bg{min-height:100vh;padding:1.5rem;max-width:760px;margin:0 auto;}
        .legal-header{display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid rgba(0,200,150,0.1);}
        .legal-back{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.15);border-radius:8px;padding:0.4rem 0.8rem;color:#00c896;cursor:pointer;font-size:0.8rem;font-family:"Inter",serif;font-weight:600;}
        .legal-title{font-family:"Inter",serif;font-weight:800;font-size:1.2rem;color:#00c896;}
        .legal-date{font-size:0.72rem;color:#3a7a6a;margin-top:0.15rem;}
        .legal-section{margin-bottom:1.5rem;}
        .legal-h{font-family:"Inter",serif;font-weight:700;font-size:0.95rem;color:#00c896;margin-bottom:0.6rem;padding-bottom:0.3rem;border-bottom:1px solid rgba(0,200,150,0.08);}
        .legal-p{font-size:0.82rem;color:#5a8a7a;line-height:1.75;margin-bottom:0.6rem;}
        .legal-p b{color:#e8f8f4;}
        .legal-list{list-style:none;padding:0;}
        .legal-list li{font-size:0.82rem;color:#5a8a7a;line-height:1.65;padding:0.3rem 0;padding-left:1rem;position:relative;}
        .legal-list li::before{content:"—";position:absolute;left:0;color:#00c896;}
        .legal-badge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:0.3rem 0.8rem;font-size:0.72rem;color:#00c896;margin-bottom:1.2rem;}
        .compliance-box{background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.15);border-radius:12px;padding:1rem;margin-bottom:1.5rem;}
        .compliance-title{font-family:"Inter",serif;font-weight:700;font-size:0.88rem;color:#00c896;margin-bottom:0.5rem;}
        .compliance-text{font-size:0.78rem;color:#5a8a7a;line-height:1.65;}
      `}</style>
      <div className="legal-bg">
        <div className="legal-header">
          <button className="legal-back" onClick={()=>router.back()}>← Back</button>
          <div>
            <div className="legal-title">Terms & Conditions</div>
            <div className="legal-date">Last updated: May 2026</div>
          </div>
        </div>

        <div className="legal-badge">👑 NEXORA Ltd — Legal Agreement</div>

        <div className="compliance-box">
          <div className="compliance-title">🏛️ Regulatory Compliance</div>
          <div className="compliance-text">
            Built with compliance in mind. NEXORA is committed to regulatory alignment with <b style={{color:"#e8f8f4"}}>EU MiCA (Markets in Crypto-Assets Regulation)</b> and <b style={{color:"#e8f8f4"}}>FSCA (Financial Sector Conduct Authority)</b> standards as part of our ongoing development and licensing roadmap. Our platform operates with full transparency and user protection at its core.
          </div>
        </div>

        {[
          {h:"1. Acceptance of Terms", p:"By creating an account on NEXORA, you agree to be bound by these Terms and Conditions. If you do not agree, do not use this platform. These terms constitute a legally binding agreement between you and NEXORA Ltd."},
          {h:"2. Registration Fee", p:"A one-time activation fee of 4 USDT is required to activate your account. This covers account registration (2 USDT) and virtual wallet creation (2 USDT). This fee is non-refundable once the account is activated."},
          {h:"3. Weekly Savings Commitment", p:"By signing the savings contract, you agree to contribute $2 USDT every week for 52 consecutive weeks. Late payments incur a double penalty ($4 USDT). Missing 5 consecutive weeks results in contract termination and forfeiture of accrued interest."},
          {h:"4. Returns & Interest", p:"NEXORA offers a 20% Annual Percentage Yield (APY) on weekly contributions. A $15 cash/food voucher is awarded upon successful completion of all 52 weeks. Total projected payout is $165.80. Returns are not guaranteed and may vary based on market conditions."},
          {h:"5. No Early Withdrawal", p:"Funds deposited into savings plans are locked for the agreed contract period. No early withdrawal is permitted under any circumstances including personal emergencies, illness, or force majeure events."},
          {h:"6. KYC & Identity Verification", p:"All users are required to complete identity verification (KYC) including government-issued ID, proof of address, and selfie. NEXORA complies with Anti-Money Laundering (AML) and Counter-Financing of Terrorism (CFT) regulations."},
          {h:"7. Prohibited Activities", p:"Users must not engage in money laundering, terrorist financing, fraud, market manipulation, or any illegal activities. Violation results in immediate account suspension and reporting to relevant authorities."},
          {h:"8. Governing Law", p:"These terms are governed by the laws of the Federal Republic of Nigeria and applicable international financial regulations. Disputes shall be resolved through binding arbitration."},
          {h:"9. Changes to Terms", p:"NEXORA reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the platform constitutes acceptance of updated terms."},
          {h:"10. Contact", p:"For legal inquiries: legal@nexora.com | Support: support@nexora.com"},
        ].map(s=>(
          <div key={s.h} className="legal-section">
            <div className="legal-h">{s.h}</div>
            <p className="legal-p">{s.p}</p>
          </div>
        ))}
      </div>
    </>
  );
}
