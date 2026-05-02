"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    try {
      const visited  = localStorage.getItem("finova_visited");
      const loggedin = localStorage.getItem("finova_loggedin");
      const userRaw  = localStorage.getItem("finova_user");
      let user = null;
      if (userRaw && loggedin === "true") {
        user = JSON.parse(userRaw);
        if (!user.userId || !user.email) user = null;
      }
      if (user) {
        // Check if reg fee is paid and approved
        if (!user.regFeePaid) {
          router.replace("/regfee");
        } else {
          router.replace("/dashboard");
        }
      } else if (visited) {
        router.replace("/login");
      } else {
        router.replace("/welcome");
      }
    } catch { router.replace("/welcome"); }
  }, [router]);
  return (
    <div style={{minHeight:"100vh",background:"#0a0800",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:"56px",height:"56px",border:"3px solid rgba(212,175,55,0.2)",borderTop:"3px solid #d4af37",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/>
        <div style={{fontFamily:"Georgia,serif",fontSize:"0.85rem",color:"#d4af37",letterSpacing:"0.1em"}}>LOADING</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
