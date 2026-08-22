"use client";
import { useRouter } from "next/navigation";

export default function RiskPage() {
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
        .risk-warn{background:rgba(231,76,60,0.06);border:1px solid rgba(231,76,60,0.18);border-radius:12px;padding:1rem;margin-bottom:1.5rem;font-size:0.82rem;color:#ff4757;line-height:1.65;}
        .risk-warn b{display:block;font-family:"Inter",serif;font-size:0.9rem;margin-bottom:0.4rem;}
      `}</style>
      <div className="legal-bg">
        <div className="legal-header">
          <button className="legal-back" onClick={()=>router.back()}>← Back</button>
          <div>
            <div className="legal-title">Risk Disclosure</div>
            <div className="legal-date">Last updated: May 2026</div>
          </div>
        </div>

        <div className="risk-warn">
          <b>⚠️ Important Risk Warning</b>
          Investing in cryptocurrency and digital assets involves significant risk. You may lose some or all of your investment. Please read this disclosure carefully before using NEXORA.
        </div>

        {[
          {h:"1. Cryptocurrency Volatility", p:"Cryptocurrency prices are highly volatile and can fluctuate significantly in short periods. The value of your holdings may increase or decrease dramatically. Past performance does not guarantee future results."},
          {h:"2. No Guaranteed Returns", p:"While NEXORA offers a 20% APY target on savings plans, returns are subject to market conditions and platform performance. Projected returns are estimates and not guaranteed. The $10 bonus reward is subject to successful completion of all 52 weekly payments."},
          {h:"3. Regulatory Risk", p:"Cryptocurrency regulations vary by country and are subject to change. Changes in regulatory frameworks in your jurisdiction may affect your ability to use the platform or access your funds. NEXORA is working towards full regulatory compliance with EU MiCA and FSCA standards."},
          {h:"4. Technology Risk", p:"Like all digital platforms, NEXORA is subject to technical risks including system outages, cybersecurity threats, smart contract vulnerabilities, and internet connectivity issues. We employ industry-standard security measures to mitigate these risks."},
          {h:"5. Liquidity Risk", p:"Funds deposited in savings plans are locked for the contract period. You will not be able to access these funds before maturity. Do not deposit funds you may need for emergencies or short-term needs."},
          {h:"6. Counterparty Risk", p:"NEXORA is the counterparty to your savings agreement. In the unlikely event of company insolvency or cessation of operations, your funds may be at risk. We maintain segregated user funds to minimize this risk."},
          {h:"7. Know Your Risk Appetite", p:"Only invest funds you can afford to lose. Do not invest borrowed money. Consider consulting a qualified financial advisor before making investment decisions. NEXORA does not provide personal financial advice."},
          {h:"8. Compliance Note", p:"Built with compliance in mind. Regulatory alignment with EU MiCA and FSCA standards is part of our ongoing development. We are committed to operating transparently and within applicable legal frameworks across all jurisdictions we serve."},
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
