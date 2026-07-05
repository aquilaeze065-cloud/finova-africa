"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

export default function VerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved,     setSaved]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState("");

  // Profile details
  const [profile, setProfile] = useState({
    fullName:"", dob:"", gender:"", phone:"", altPhone:"",
    email:"", address:"", city:"", state:"", country:"Nigeria",
    occupation:"", maritalStatus:"", nationality:"Nigerian",
    bvn:"", nin:"",
    nokName:"", nokPhone:"", nokRelation:"", nokAddress:"",
  });

  // KYC document states
  const [idType,      setIdType]      = useState("nin");
  const [idFront,     setIdFront]     = useState(null);
  const [idBack,      setIdBack]      = useState(null);
  const [selfie,      setSelfie]      = useState(null);
  const [addressDoc,  setAddressDoc]  = useState(null);
  const [idFrontPrev, setIdFrontPrev] = useState(null);
  const [idBackPrev,  setIdBackPrev]  = useState(null);
  const [selfiePrev,  setSelfiePrev]  = useState(null);
  const [addrPrev,    setAddrPrev]    = useState(null);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  const idFrontRef   = useRef(null);
  const idBackRef    = useRef(null);
  const selfieRef    = useRef(null);
  const addressRef   = useRef(null);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
    if (u.profile) setProfile(p=>({...p,...u.profile}));
    if (u.kycSubmitted) setKycSubmitted(true);
    // pre-fill from signup
    if (u.name && !u.profile?.fullName) setProfile(p=>({...p, fullName:u.name, email:u.email||""}));
  },[]);

  function handleProfileChange(key, val) {
    setProfile(prev=>({...prev,[key]:val}));
  }

  function handleFileUpload(file, setFile, setPreview) {
    if (!file) return;
    setFile(file);
    if (file.type.startsWith("image/")) setPreview(URL.createObjectURL(file));
  }

  function showToast(msg: any) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  function saveProfile() {
    setLoading(true);
    setTimeout(()=>{
      const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
      u.profile = profile;
      u.profileComplete = !!(profile.fullName&&profile.dob&&profile.phone&&profile.address&&profile.nin);
      localStorage.setItem("nexora_user", JSON.stringify(u));
      setLoading(false);
      showToast("✅ Profile saved successfully!");
    },1200);
  }

  function submitKyc() {
    if (!idFront||!selfie) { showToast("⚠️ Please upload ID and selfie at minimum"); return; }
    setLoading(true);
    setTimeout(()=>{
      const u = JSON.parse(localStorage.getItem("nexora_user")||"{}");
      const kyc = JSON.parse(localStorage.getItem("nexora_kyc")||"{}");
      const entry = {
        stepId:"full_kyc", title:"Full KYC Verification",
        submittedAt: new Date().toISOString(),
        status:"pending",
        userId: u.userId, userName: u.name, userEmail: u.email,
        idType,
        files:[
          {key:"id_front",   label:"ID Front",         name:idFront?.name||"",    preview:idFrontPrev},
          {key:"id_back",    label:"ID Back",           name:idBack?.name||"",     preview:idBackPrev},
          {key:"selfie",     label:"Selfie with ID",    name:selfie?.name||"",     preview:selfiePrev},
          {key:"addr_doc",   label:"Proof of Address",  name:addressDoc?.name||"", preview:addrPrev},
        ],
        profile,
      };
      kyc["full_kyc"] = entry;
      localStorage.setItem("nexora_kyc", JSON.stringify(kyc));
      u.kycSubmitted = true;
      localStorage.setItem("nexora_user", JSON.stringify(u));
      setKycSubmitted(true);
      setLoading(false);
      showToast("✅ KYC submitted for review!");
    },2000);
  }

  const tabs = [
    {id:"profile",  icon:"👤", label:"Profile"},
    {id:"kyc",      icon:"🪪", label:"Documents"},
    {id:"nok",      icon:"👨‍👩‍👦", label:"Next of Kin"},
  ];

  const states = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
  const idTypes = [{v:"nin",l:"NIN Card"},{v:"passport",l:"Int. Passport"},{v:"drivers",l:"Driver's License"},{v:"voters",l:"Voter's Card"}];

  return (
    <MobileLayout activePage="Profile">
      <style>{`
        .vf-tabs{display:flex;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.12);border-radius:14px;padding:0.25rem;gap:0.25rem;margin-bottom:1.3rem;}
        .vf-tab{flex:1;padding:0.55rem 0.4rem;border-radius:10px;border:none;cursor:pointer;font-size:0.78rem;font-weight:600;transition:all 0.2s;background:none;color:#5a8a7a;display:flex;align-items:center;justify-content:center;gap:0.3rem;}
        .vf-tab.active{background:linear-gradient(135deg,#00a87a,#00c896);color:#050f0c;font-weight:700;}
        .vf-section{margin-bottom:1.2rem;}
        .vf-section-title{font-family:"Inter",serif;font-weight:700;font-size:0.9rem;color:#00c896;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;}
        .vf-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;}
        .vf-field{display:flex;flex-direction:column;gap:0.35rem;}
        .vf-field.full{grid-column:1/-1;}
        .vf-label{font-size:0.7rem;color:#5a8a7a;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
        .vf-input{background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.15);border-radius:11px;padding:0.72rem 0.9rem;font-size:0.88rem;color:#e8f8f4;font-family:"DM Sans",sans-serif;outline:none;width:100%;transition:border-color 0.2s;}
        .vf-input:focus{border-color:rgba(0,200,150,0.35);box-shadow:0 0 0 3px rgba(0,200,150,0.08);}
        select.vf-input{cursor:pointer;}
        select.vf-input option{background:#081a14;color:#e8f8f4;}
        .vf-upload{border:2px dashed rgba(0,200,150,0.2);border-radius:14px;padding:1.1rem;text-align:center;cursor:pointer;transition:all 0.2s;background:rgba(0,200,150,0.02);margin-bottom:0.75rem;}
        .vf-upload:hover{border-color:rgba(0,200,150,0.4);background:rgba(0,200,150,0.05);}
        .vf-upload.done{border-style:solid;border-color:rgba(0,200,150,0.35);background:rgba(0,200,150,0.06);}
        .vf-preview{width:100%;max-height:110px;object-fit:cover;border-radius:9px;margin-top:0.4rem;}
        .vf-upload-label{font-family:"Inter",serif;font-weight:700;font-size:0.85rem;color:#00c896;margin-bottom:0.2rem;}
        .vf-upload-hint{font-size:0.72rem;color:#5a8a7a;}
        .vf-id-tabs{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.9rem;}
        .vf-id-tab{padding:0.4rem 0.8rem;border-radius:20px;border:1px solid rgba(0,200,150,0.15);background:none;color:#5a8a7a;font-size:0.78rem;cursor:pointer;font-family:"DM Sans",sans-serif;transition:all 0.18s;}
        .vf-id-tab.active{background:rgba(0,200,150,0.12);border-color:rgba(0,200,150,0.35);color:#00c896;font-weight:600;}
        .vf-warning{background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2);border-radius:11px;padding:0.75rem;margin-bottom:1rem;font-size:0.78rem;color:#ff4757;line-height:1.5;}
        .vf-tip{background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.15);border-radius:11px;padding:0.75rem;margin-bottom:0.9rem;font-size:0.78rem;color:#5a8a7a;line-height:1.5;}
        .vf-tip b{color:#00c896;}
        .vf-pending{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:14px;padding:1.2rem;text-align:center;}
        .vf-save-btn{width:100%;padding:0.9rem;border:none;border-radius:13px;background:linear-gradient(135deg,#00a87a,#00c896);font-family:"Inter",serif;font-weight:700;font-size:1rem;color:#050f0c;cursor:pointer;box-shadow:0 0 20px rgba(0,200,150,0.25);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-top:1rem;}
        .vf-save-btn:hover{transform:translateY(-2px);}
        .vf-save-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .toast{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px)+90px);left:50%;transform:translateX(-50%);background:#081a14;border:1px solid rgba(0,200,150,0.3);border-radius:12px;padding:0.65rem 1.3rem;font-weight:700;font-size:0.85rem;z-index:800;animation:tIn 0.3s ease;white-space:nowrap;color:#00c896;}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .spinner{width:16px;height:16px;border:2px solid rgba(10,8,0,0.3);border-top-color:#050f0c;border-radius:50%;animation:spin 0.7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.vf-grid{grid-template-columns:1fr;}.vf-field.full{grid-column:1;}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.2rem"}}>
        <button onClick={()=>router.back()} style={{background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"10px",padding:"0.5rem 0.75rem",color:"#00c896",cursor:"pointer",fontSize:"0.85rem",fontFamily:"Inter,serif",fontWeight:700}}>← Back</button>
        <div>
          <div style={{fontFamily:"Inter,serif",fontWeight:800,fontSize:"1.2rem"}}>Identity Verification</div>
          <div style={{fontSize:"0.75rem",color:"#5a8a7a"}}>Complete all sections to verify your account</div>
        </div>
      </div>

      <div className="vf-tabs">
        {tabs.map((t: any) =>(
          <button key={t.id} className={"vf-tab"+(activeTab===t.id?" active":"")} onClick={()=>setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab==="profile"&&(
        <>
          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div className="vf-section-title">👤 Personal Information</div>
            <div className="vf-grid">
              <div className="vf-field full">
                <label className="vf-label">Full Legal Name *</label>
                <input className="vf-input" placeholder="As on government ID" value={profile.fullName} onChange={e=>handleProfileChange("fullName",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">Date of Birth *</label>
                <input className="vf-input" type="date" value={profile.dob} onChange={e=>handleProfileChange("dob",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">Gender *</label>
                <select className="vf-input" value={profile.gender} onChange={e=>handleProfileChange("gender",e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Prefer not to say</option>
                </select>
              </div>
              <div className="vf-field">
                <label className="vf-label">Marital Status</label>
                <select className="vf-input" value={profile.maritalStatus} onChange={e=>handleProfileChange("maritalStatus",e.target.value)}>
                  <option value="">Select</option>
                  <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                </select>
              </div>
              <div className="vf-field">
                <label className="vf-label">Nationality</label>
                <input className="vf-input" placeholder="e.g. Nigerian" value={profile.nationality} onChange={e=>handleProfileChange("nationality",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">Occupation</label>
                <input className="vf-input" placeholder="e.g. Trader" value={profile.occupation} onChange={e=>handleProfileChange("occupation",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">Phone Number *</label>
                <input className="vf-input" type="tel" placeholder="+234..." value={profile.phone} onChange={e=>handleProfileChange("phone",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">Alt. Phone</label>
                <input className="vf-input" type="tel" placeholder="+234..." value={profile.altPhone} onChange={e=>handleProfileChange("altPhone",e.target.value)}/>
              </div>
              <div className="vf-field full">
                <label className="vf-label">Email Address *</label>
                <input className="vf-input" type="email" value={profile.email} onChange={e=>handleProfileChange("email",e.target.value)}/>
              </div>
            </div>
          </div>

          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div className="vf-section-title">🏠 Address Information</div>
            <div className="vf-grid">
              <div className="vf-field full">
                <label className="vf-label">Residential Address *</label>
                <input className="vf-input" placeholder="House No, Street, Area" value={profile.address} onChange={e=>handleProfileChange("address",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">City / LGA *</label>
                <input className="vf-input" placeholder="e.g. Ikeja" value={profile.city} onChange={e=>handleProfileChange("city",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">State *</label>
                <select className="vf-input" value={profile.state} onChange={e=>handleProfileChange("state",e.target.value)}>
                  <option value="">Select State</option>
                  {states.map((s: any) =><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="vf-field">
                <label className="vf-label">Country</label>
                <input className="vf-input" value={profile.country} onChange={e=>handleProfileChange("country",e.target.value)}/>
              </div>
            </div>
          </div>

          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div className="vf-section-title">🔐 Identity Numbers</div>
            <div className="vf-tip"><b>Important:</b> Your BVN and NIN are required for compliance. They are encrypted and never shared with third parties.</div>
            <div className="vf-grid">
              <div className="vf-field">
                <label className="vf-label">BVN *</label>
                <input className="vf-input" placeholder="11 digit BVN" maxLength={11} value={profile.bvn} onChange={e=>handleProfileChange("bvn",e.target.value.replace(/\D/g,""))}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">NIN *</label>
                <input className="vf-input" placeholder="11 digit NIN" maxLength={11} value={profile.nin} onChange={e=>handleProfileChange("nin",e.target.value.replace(/\D/g,""))}/>
              </div>
            </div>
          </div>

          <button className="vf-save-btn" onClick={saveProfile} disabled={loading}>
            {loading?<><div className="spinner"/> Saving...</>:"Save Profile Details"}
          </button>
        </>
      )}

      {/* ── DOCUMENTS TAB ── */}
      {activeTab==="kyc"&&(
        <>
          {kycSubmitted?(
            <div className="vf-pending">
              <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>⏳</div>
              <div style={{fontFamily:"Inter,serif",fontWeight:800,fontSize:"1.1rem",color:"#00c896",marginBottom:"0.4rem"}}>Documents Under Review</div>
              <div style={{fontSize:"0.82rem",color:"#5a8a7a",lineHeight:1.5}}>Your documents have been submitted. Our team will verify within 24-48 hours.</div>
            </div>
          ):(
            <>
              <div className="r-card" style={{marginBottom:"1rem"}}>
                <div className="vf-section-title">🪪 Government ID</div>
                <div style={{marginBottom:"0.75rem"}}>
                  <div className="vf-label" style={{marginBottom:"0.5rem"}}>ID Type</div>
                  <div className="vf-id-tabs">
                    {idTypes.map((t: any) =>(
                      <button key={t.v} className={"vf-id-tab"+(idType===t.v?" active":"")} onClick={()=>setIdType(t.v)}>{t.l}</button>
                    ))}
                  </div>
                </div>
                <input type="file" accept="image/*,application/pdf" style={{display:"none"}} ref={idFrontRef} onChange={e=>handleFileUpload(e.target.files[0],setIdFront,setIdFrontPrev)}/>
                <input type="file" accept="image/*,application/pdf" style={{display:"none"}} ref={idBackRef}  onChange={e=>handleFileUpload(e.target.files[0],setIdBack,setIdBackPrev)}/>
                <div className={"vf-upload"+(idFront?" done":"")} onClick={()=>idFrontRef.current?.click()}>
                  {idFrontPrev?<><img src={idFrontPrev} className="vf-preview" alt="ID Front"/><div style={{fontSize:"0.72rem",color:"#00c896",marginTop:"0.3rem",fontWeight:600}}>✓ {idFront?.name}</div></>
                  :<><div style={{fontSize:"1.6rem",marginBottom:"0.3rem"}}>📄</div><div className="vf-upload-label">ID Front Side *</div><div className="vf-upload-hint">Tap to upload front of your {idTypes.find(t=>t.v===idType)?.l}</div></>}
                </div>
                <div className={"vf-upload"+(idBack?" done":"")} onClick={()=>idBackRef.current?.click()}>
                  {idBackPrev?<><img src={idBackPrev} className="vf-preview" alt="ID Back"/><div style={{fontSize:"0.72rem",color:"#00c896",marginTop:"0.3rem",fontWeight:600}}>✓ {idBack?.name}</div></>
                  :<><div style={{fontSize:"1.6rem",marginBottom:"0.3rem"}}>📄</div><div className="vf-upload-label">ID Back Side</div><div className="vf-upload-hint">Tap to upload back of your ID</div></>}
                </div>
                <div className="vf-tip"><b>Requirements:</b> All 4 corners visible · Clear image · Not expired · JPG/PNG/PDF max 5MB</div>
              </div>

              <div className="r-card" style={{marginBottom:"1rem"}}>
                <div className="vf-section-title">🤳 Selfie / Liveness Check *</div>
                <input type="file" accept="image/*" style={{display:"none"}} ref={selfieRef} onChange={e=>handleFileUpload(e.target.files[0],setSelfie,setSelfiePrev)}/>
                <div className={"vf-upload"+(selfie?" done":"")} onClick={()=>selfieRef.current?.click()}>
                  {selfiePrev?<><img src={selfiePrev} className="vf-preview" alt="Selfie"/><div style={{fontSize:"0.72rem",color:"#00c896",marginTop:"0.3rem",fontWeight:600}}>✓ {selfie?.name}</div></>
                  :<><div style={{fontSize:"1.6rem",marginBottom:"0.3rem"}}>🤳</div><div className="vf-upload-label">Selfie Holding Your ID *</div><div className="vf-upload-hint">Hold your ID next to your face, look at camera</div></>}
                </div>
                <div className="vf-tip"><b>Instructions:</b> Hold ID clearly visible · Face must be clear · Good lighting · No sunglasses or hat</div>
              </div>

              <div className="r-card" style={{marginBottom:"1.2rem"}}>
                <div className="vf-section-title">🏠 Proof of Address</div>
                <input type="file" accept="image/*,application/pdf" style={{display:"none"}} ref={addressRef} onChange={e=>handleFileUpload(e.target.files[0],setAddressDoc,setAddrPrev)}/>
                <div className={"vf-upload"+(addressDoc?" done":"")} onClick={()=>addressRef.current?.click()}>
                  {addrPrev?<><img src={addrPrev} className="vf-preview" alt="Address Doc"/><div style={{fontSize:"0.72rem",color:"#00c896",marginTop:"0.3rem",fontWeight:600}}>✓ {addressDoc?.name}</div></>
                  :<><div style={{fontSize:"1.6rem",marginBottom:"0.3rem"}}>📃</div><div className="vf-upload-label">Utility Bill / Bank Statement</div><div className="vf-upload-hint">Must show name & address, not older than 3 months</div></>}
                </div>
              </div>

              <div className="vf-warning">⚠️ <b>Important:</b> Submitting fake or altered documents is a criminal offence. Your account will be permanently banned and reported to relevant authorities.</div>

              <button className="vf-save-btn" onClick={submitKyc} disabled={loading||!idFront||!selfie}>
                {loading?<><div className="spinner"/> Submitting...</>:"Submit Documents for Review"}
              </button>
            </>
          )}
        </>
      )}

      {/* ── NEXT OF KIN TAB ── */}
      {activeTab==="nok"&&(
        <>
          <div className="r-card" style={{marginBottom:"1rem"}}>
            <div className="vf-section-title">👨‍👩‍👦 Next of Kin Details</div>
            <div className="vf-tip"><b>Why we need this:</b> In case of emergencies, your next of kin can be contacted regarding your savings and investments.</div>
            <div className="vf-grid">
              <div className="vf-field full">
                <label className="vf-label">Full Name *</label>
                <input className="vf-input" placeholder="Next of kin full name" value={profile.nokName} onChange={e=>handleProfileChange("nokName",e.target.value)}/>
              </div>
              <div className="vf-field">
                <label className="vf-label">Relationship *</label>
                <select className="vf-input" value={profile.nokRelation} onChange={e=>handleProfileChange("nokRelation",e.target.value)}>
                  <option value="">Select</option>
                  {["Spouse","Parent","Sibling","Child","Friend","Other"].map((r: any) =><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="vf-field">
                <label className="vf-label">Phone Number *</label>
                <input className="vf-input" type="tel" placeholder="+234..." value={profile.nokPhone} onChange={e=>handleProfileChange("nokPhone",e.target.value)}/>
              </div>
              <div className="vf-field full">
                <label className="vf-label">Address</label>
                <input className="vf-input" placeholder="Next of kin address" value={profile.nokAddress} onChange={e=>handleProfileChange("nokAddress",e.target.value)}/>
              </div>
            </div>
          </div>
          <button className="vf-save-btn" onClick={saveProfile} disabled={loading}>
            {loading?<><div className="spinner"/> Saving...</>:"Save Next of Kin Details"}
          </button>
        </>
      )}
    </MobileLayout>
  );
}
