"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const token    = localStorage.getItem("finova_token");
        const visited  = localStorage.getItem("finova_visited");

        if (token) {
          // Verify token with backend
          const res = await fetch(`${API}/api/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const user = await res.json();
            // Update localStorage with fresh data
            localStorage.setItem("finova_user",     JSON.stringify(user));
            localStorage.setItem("finova_loggedin", "true");

            if (!user.reg_fee_paid) {
              router.replace("/regfee");
            } else {
              router.replace("/dashboard");
            }
          } else {
            // Token expired or invalid - clear and redirect
            localStorage.removeItem("finova_token");
            localStorage.removeItem("finova_user");
            localStorage.removeItem("finova_loggedin");
            if (visited) {
              router.replace("/login");
            } else {
              router.replace("/welcome");
            }
          }
        } else if (visited) {
          router.replace("/login");
        } else {
          router.replace("/welcome");
        }
      } catch(err) {
        // Network error - use cached data
        const userRaw  = localStorage.getItem("finova_user");
        const loggedin = localStorage.getItem("finova_loggedin");
        const visited  = localStorage.getItem("finova_visited");
        if (userRaw && loggedin === "true") {
          const user = JSON.parse(userRaw);
          if (!user.reg_fee_paid) {
            router.replace("/regfee");
          } else {
            router.replace("/dashboard");
          }
        } else if (visited) {
          router.replace("/login");
        } else {
          router.replace("/welcome");
        }
      }
    }
    checkAuth();
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
