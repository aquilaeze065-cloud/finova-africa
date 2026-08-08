"use client";
import { useRef } from "react";

interface Props {
  screenshot: string;
  onUpload: (dataUrl: string) => void;
  label?: string;
}

export default function PaymentProof({ screenshot, onUpload, label="Upload Payment Screenshot *" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e:any) {
    const f = e.target.files?.[0];
    if (!f) return;
    // Max 5MB
    if (f.size > 5*1024*1024) { alert("Image too large. Max 5MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => onUpload(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div style={{marginBottom:"0.85rem"}}>
      <label style={{fontSize:"0.63rem",color:"#5a8a7a",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.06em",display:"block",marginBottom:"0.28rem"}}>{label}</label>
      <input type="file" accept="image/*,image/heic,image/heif" ref={fileRef} style={{display:"none"}} onChange={handleFile}/>
      <div
        onClick={()=>fileRef.current?.click()}
        style={{
          border:`2px dashed ${screenshot?"#00c896":"rgba(0,200,150,0.22)"}`,
          borderStyle:screenshot?"solid":"dashed",
          borderRadius:"13px",
          padding:"0.9rem",
          textAlign:"center",
          cursor:"pointer",
          background:screenshot?"rgba(0,200,150,0.04)":"none",
          transition:"all 0.2s",
          minHeight:"80px",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          gap:"0.35rem",
        }}
      >
        {screenshot?(
          <>
            <img src={screenshot} style={{maxHeight:"120px",maxWidth:"100%",borderRadius:"8px",objectFit:"contain"}} alt="Payment proof"/>
            <div style={{fontSize:"0.72rem",color:"#00c896",fontWeight:600}}>✓ Screenshot uploaded — tap to change</div>
          </>
        ):(
          <>
            <div style={{fontSize:"1.8rem"}}>📸</div>
            <div style={{fontWeight:600,fontSize:"0.84rem",color:"#e8f8f4"}}>Tap to upload proof</div>
            <div style={{fontSize:"0.7rem",color:"#5a8a7a"}}>Take a screenshot of your transfer confirmation</div>
          </>
        )}
      </div>
      {!screenshot&&(
        <div style={{fontSize:"0.7rem",color:"#ff4757",marginTop:"0.25rem"}}>⚠️ Required — payment cannot be approved without a screenshot</div>
      )}
    </div>
  );
}
