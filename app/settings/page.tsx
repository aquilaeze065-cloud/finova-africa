"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";

export default function SettingsPage() {
  const router  = useRouter();
  const [tab,    setTab]    = useState("profile");
  const [toast,  setToast]  = useState("");
  const [loading,setLoading]= useState(false);
  const [user,   setUser]   = useState(null);
  const photoRef = useRef(null);

  // Profile photo
  const [photo,     setPhoto]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Password
  const [curPass,  setCurPass]  = useState("");
  const [newPass,  setNewPass]  = useState("");
  const [confPass, setConfPass] = useState("");
  const [passErr,  setPassErr]  = useState("");

  // Notifications
  const [notifs, setNotifs] = useState({
    weeklyReminder:  true,
    paymentConfirm:  true,
    kycUpdates:      true,
    priceAlerts:     false,
    promotions:      false,
    adminMessages:   true,
  });

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
    setUser(u);
    if (u.photoPreview) setPhotoPreview(u.photoPreview);
    if (u.notifSettings) setNotifs(n=>({...n,...u.notifSettings}));
  },[]);

  function showToast(msg: any){ setToast(msg); setTimeout(()=>setToast(""),3000); }

  function handlePhotoChange(e: any) {
    const f = e.target.files?.[0]; if (!f) return;
    setPhoto(f);
    const prev = URL.createObjectURL(f);
    setPhotoPreview(prev);
  }

  function savePhoto() {
    if (!photo) return;
    setLoading(true);
    setTimeout(()=>{
      const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
      u.photoPreview = photoPreview;
      localStorage.setItem("finova_user", JSON.stringify(u));
      setLoading(false);
      showToast("✅ Profile photo updated!");
    },1000);
  }

  function changePassword() {
    setPassErr("");
    if (!curPass||!newPass||!confPass){ setPassErr("Please fill all fields"); return; }
    if (newPass.length<8){ setPassErr("New password must be at least 8 characters"); return; }
    if (newPass!==confPass){ setPassErr("Passwords do not match"); return; }
    setLoading(true);
    setTimeout(()=>{
      const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
      if (u.password && u.password!==curPass){ setLoading(false); setPassErr("Current password is incorrect"); return; }
      u.password = newPass;
      localStorage.setItem("finova_user", JSON.stringify(u));
      setCurPass(""); setNewPass(""); setConfPass("");
      setLoading(false);
      showToast("✅ Password changed successfully!");
    },1000);
  }

  function saveNotifs() {
    setLoading(true);
    setTimeout(()=>{
      const u = JSON.parse(localStorage.getItem("finova_user")||"{}");
      u.notifSettings = notifs;
      localStorage.setItem("finova_user", JSON.stringify(u));
      setLoading(false);
      showToast("✅ Notification preferences saved!");
    },800);
  }

  function toggleNotif(key: any){ setNotifs(prev=>({...prev,[key]:!prev[key]})); }

  const tabs = [
    {id:"profile", icon:"📸", label:"Photo"},
    {id:"password",icon:"🔒", label:"Password"},
    {id:"notifs",  icon:"🔔", label:"Notifications"},
  ];

  return (
    <MobileLayout activePage="Settings">
      <style>{`
        .st-tabs{display:flex;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.12);border-radius:14px;padding:0.25rem;gap:0.25rem;margin-bottom:1.3rem;}
        .st-tab{flex:1;padding:0.55rem 0.3rem;border-radius:10px;border:none;cursor:pointer;font-size:0.76rem;font-weight:600;transition:all 0.2s;background:none;color:#8a7040;display:flex;align-items:center;justify-content:center;gap:0.3rem;}
        .st-tab.active{background:linear-gradient(135deg,#b8960c,#d4af37);color:#0a0800;font-weight:700;}
        .st-label{font-size:0.7rem;color:#8a7040;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;display:block;}
        .st-input{width:100%;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:11px;padding:0.75rem 0.9rem;font-size:0.9rem;color:#f5e6c8;font-family:"DM Sans",sans-serif;outline:none;transition:border-color 0.2s;margin-bottom:0.85rem;}
        .st-input:focus{border-color:rgba(212,175,55,0.45);}
        .st-btn{width:100%;padding:0.9rem;border:none;border-radius:13px;background:linear-gradient(135deg,#b8960c,#d4af37);font-family:"Playfair Display",serif;font-weight:700;font-size:1rem;color:#0a0800;cursor:pointer;box-shadow:0 0 20px rgba(212,175,55,0.2);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-top:0.5rem;}
        .st-btn:hover{transform:translateY(-2px);}
        .st-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .st-err{background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.25);border-radius:9px;padding:0.6rem 0.8rem;font-size:0.8rem;color:#e74c3c;margin-bottom:0.8rem;}
        .st-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:0.9rem;background:rgba(212,175,55,0.03);border:1px solid rgba(212,175,55,0.08);border-radius:12px;margin-bottom:0.6rem;cursor:pointer;transition:all 0.18s;}
        .st-toggle-row:hover{border-color:rgba(212,175,55,0.2);}
        .st-toggle-info{flex:1;}
        .st-toggle-title{font-weight:600;font-size:0.88rem;margin-bottom:0.15rem;}
        .st-toggle-sub{font-size:0.72rem;color:#8a7040;}
        .st-toggle{width:44px;height:24px;border-radius:12px;position:relative;transition:background 0.25s;flex-shrink:0;border:none;cursor:pointer;}
        .st-toggle.on{background:linear-gradient(135deg,#b8960c,#d4af37);}
        .st-toggle.off{background:rgba(255,255,255,0.1);}
        .st-toggle-knob{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left 0.25s;box-shadow:0 1px 4px rgba(0,0,0,0.3);}
        .st-toggle.on .st-toggle-knob{left:22px;}
        .st-toggle.off .st-toggle-knob{left:2px;}
        .st-photo-wrap{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem 0;}
        .st-photo-av{width:100px;height:100px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#0a0800;border:3px solid rgba(212,175,55,0.4);overflow:hidden;cursor:pointer;position:relative;box-shadow:0 0 24px rgba(212,175,55,0.25);}
        .st-photo-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:1.2rem;opacity:0;transition:opacity 0.2s;}
        .st-photo-av:hover .st-photo-overlay{opacity:1;}
        .toast{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px)+90px);left:50%;transform:translateX(-50%);background:#120d00;border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:0.65rem 1.3rem;font-weight:700;font-size:0.85rem;z-index:800;animation:tIn 0.3s ease;white-space:nowrap;color:#d4af37;}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .spinner{width:16px;height:16px;border:2px solid rgba(10,8,0,0.3);border-top-color:#0a0800;border-radius:50%;animation:spin 0.7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {toast&&<div className="toast">{toast}</div>}

      <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:"1.3rem",marginBottom:"0.3rem"}}>⚙️ Settings</div>
      <div style={{fontSize:"0.82rem",color:"#8a7040",marginBottom:"1.2rem"}}>Manage your account preferences</div>

      <div className="st-tabs">
        {tabs.map((t: any) =>(
          <button key={t.id} className={"st-tab"+(tab===t.id?" active":"")} onClick={()=>setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* PHOTO TAB */}
      {tab==="profile"&&(
        <div className="r-card">
          <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.95rem",color:"#d4af37",marginBottom:"1rem"}}>📸 Profile Photo</div>
          <input type="file" accept="image/*" style={{display:"none"}} ref={photoRef} onChange={handlePhotoChange}/>
          <div className="st-photo-wrap">
            <div className="st-photo-av" onClick={()=>photoRef.current?.click()}
              style={{background:photoPreview?"transparent":"linear-gradient(135deg,#b8960c,#d4af37)"}}>
              {photoPreview
                ?<img src={photoPreview} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Profile"/>
                :<span>{user?.name?.charAt(0)?.toUpperCase()||"U"}</span>
              }
              <div className="st-photo-overlay">📷</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"1rem",marginBottom:"0.2rem"}}>{user?.name}</div>
              <div style={{fontSize:"0.78rem",color:"#8a7040"}}>{user?.email}</div>
              <div style={{fontSize:"0.72rem",color:"#8a7040",marginTop:"0.2rem"}}>ID: {user?.userId}</div>
            </div>
            <button onClick={()=>photoRef.current?.click()} style={{padding:"0.6rem 1.5rem",background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:"10px",color:"#d4af37",cursor:"pointer",fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.85rem"}}>
              Choose New Photo
            </button>
          </div>
          {photo&&(
            <button className="st-btn" onClick={savePhoto} disabled={loading}>
              {loading?<><div className="spinner"/> Saving...</>:"Save Profile Photo"}
            </button>
          )}
          <div style={{borderTop:"1px solid rgba(212,175,55,0.1)",paddingTop:"1rem",marginTop:"1rem"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.9rem",color:"#d4af37",marginBottom:"0.75rem"}}>Account Info</div>
            {[
              {l:"Account ID",    v:user?.userId||"—"},
              {l:"Member Since",  v:user?.createdAt?new Date(user.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—"},
              {l:"Account Status",v:user?.regFeePaid?"✅ Active":"⏳ Pending Activation"},
              {l:"KYC Status",    v:user?.kycSubmitted?"⏳ Under Review":"○ Not Submitted"},
              {l:"Contract",      v:user?.contractSigned?"✅ Signed":"—"},
            ].map((r: any) =>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:"1px solid rgba(212,175,55,0.06)",fontSize:"0.84rem"}}>
                <span style={{color:"#8a7040"}}>{r.l}</span>
                <span style={{fontWeight:600,color:"#f5e6c8",textAlign:"right",maxWidth:"60%",fontSize:"0.82rem"}}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASSWORD TAB */}
      {tab==="password"&&(
        <div className="r-card">
          <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.95rem",color:"#d4af37",marginBottom:"1rem"}}>🔒 Change Password</div>
          {passErr&&<div className="st-err">⚠️ {passErr}</div>}
          <label className="st-label">Current Password</label>
          <input className="st-input" type="password" placeholder="Your current password" value={curPass} onChange={e=>setCurPass(e.target.value)}/>
          <label className="st-label">New Password</label>
          <input className="st-input" type="password" placeholder="Min. 8 characters" value={newPass} onChange={e=>setNewPass(e.target.value)}/>
          <label className="st-label">Confirm New Password</label>
          <input className="st-input" type="password" placeholder="Repeat new password" value={confPass} onChange={e=>setConfPass(e.target.value)}/>
          <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.12)",borderRadius:"10px",padding:"0.75rem",fontSize:"0.78rem",color:"#8a7040",lineHeight:1.5,marginBottom:"0.5rem"}}>
            🔐 Tips: Use at least 8 characters, mix letters, numbers and symbols for a strong password.
          </div>
          <button className="st-btn" onClick={changePassword} disabled={loading}>
            {loading?<><div className="spinner"/> Updating...</>:"Update Password"}
          </button>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab==="notifs"&&(
        <div className="r-card">
          <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:"0.95rem",color:"#d4af37",marginBottom:"1rem"}}>🔔 Notification Preferences</div>
          {[
            {key:"weeklyReminder",  title:"Weekly Payment Reminder",   sub:"Get reminded before your weekly savings is due"},
            {key:"paymentConfirm",  title:"Payment Confirmations",     sub:"Notify me when payments are confirmed"},
            {key:"kycUpdates",      title:"KYC & Verification Updates", sub:"Get updates on your KYC review status"},
            {key:"priceAlerts",     title:"Crypto Price Alerts",        sub:"Get notified of major price movements"},
            {key:"promotions",      title:"Promotions & Bonuses",       sub:"Special offers and bonus opportunities"},
            {key:"adminMessages",   title:"Admin Messages",             sub:"Important messages from Finova Africa team"},
          ].map((n: any) =>(
            <div key={n.key} className="st-toggle-row" onClick={()=>toggleNotif(n.key)}>
              <div className="st-toggle-info">
                <div className="st-toggle-title">{n.title}</div>
                <div className="st-toggle-sub">{n.sub}</div>
              </div>
              <button className={"st-toggle "+(notifs[n.key]?"on":"off")}>
                <div className="st-toggle-knob"/>
              </button>
            </div>
          ))}
          <button className="st-btn" onClick={saveNotifs} disabled={loading}>
            {loading?<><div className="spinner"/> Saving...</>:"Save Preferences"}
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
