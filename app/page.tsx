"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(()=>{
    const token    = localStorage.getItem("nexora_token");
    const loggedin = localStorage.getItem("nexora_loggedin");
    const visited  = localStorage.getItem("nexora_visited");
    const userRaw  = localStorage.getItem("nexora_user");

    if (!token || loggedin !== "true" || !userRaw) {
      // Not logged in
      if (visited) router.replace("/login");
      else router.replace("/welcome");
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      if (user.account_status === "active" || user.reg_fee_paid) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  },[]);

  return (
    <div style={{minHeight:"100vh",background:"#050f0c",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"32px",height:"32px",border:"2px solid rgba(0,200,150,0.2)",borderTop:"2px solid #00c896",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
