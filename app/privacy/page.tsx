"use client";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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
        .legal-badge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.15);border-radius:20px;padding:0.3rem 0.8rem;font-size:0.72rem;color:#00c896;margin-bottom:1.2rem;}
      `}</style>
      <div className="legal-bg">
        <div className="legal-header">
          <button className="legal-back" onClick={()=>router.back()}>← Back</button>
          <div>
            <div className="legal-title">Privacy Policy</div>
            <div className="legal-date">Last updated: May 2026</div>
          </div>
        </div>
        <div className="legal-badge">🔒 NDPR & GDPR Compliant</div>
        {[
          {h:"1. Information We Collect", p:"We collect your full name, email address, phone number, date of birth, government-issued ID, proof of address, selfie/liveness check, Bank Verification Number (BVN), National Identity Number (NIN), transaction history, and device/browser information for security purposes."},
          {h:"2. How We Use Your Data", p:"Your data is used for: account management and authentication, KYC/AML compliance verification, fraud prevention and security monitoring, transaction processing, regulatory reporting, and platform improvement. We never sell your personal data to third parties for marketing."},
          {h:"3. Data Storage & Security", p:"All data is encrypted using AES-256 encryption. We use secure, compliant cloud servers. Access to personal data is strictly controlled and limited to authorized personnel. Regular security audits are conducted to maintain data integrity."},
          {h:"4. Data Sharing", p:"We may share data with: licensed KYC/AML verification providers, payment processors, regulatory authorities when legally required, and law enforcement when presented with valid legal orders. All third parties are bound by strict data processing agreements."},
          {h:"5. Your Rights", p:"Under NDPR and GDPR, you have the right to: access your personal data, correct inaccurate data, request deletion of your data, object to processing, data portability. Submit requests to: privacy@nexora.com"},
          {h:"6. Cookies", p:"We use essential cookies for authentication and security. Analytics cookies are optional and require your consent. You can manage cookie preferences in your browser settings."},
          {h:"7. Data Retention", p:"Account data is retained for 7 years after account closure as required by financial regulations. You may request earlier deletion subject to legal and regulatory requirements."},
          {h:"8. Contact", p:"Data Protection Officer: privacy@nexora.com | Address: NEXORA Ltd, Lagos, Nigeria"},
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
