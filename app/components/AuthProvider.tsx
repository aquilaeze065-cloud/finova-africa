"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = { name: string; email: string; phone: string; country: string; };
type AuthCtx = {
  user: User | null;
  login:  (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, country: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => useContext(AuthContext)!;

const PUBLIC_ROUTES = ["/", "/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user,    setUser]    = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finova_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!user && !isPublic) { router.replace("/login"); return; }
    if (user  &&  isPublic) { router.replace("/dashboard"); return; }
  }, [user, checked, pathname]);

  const signup = async (name: string, email: string, phone: string, country: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 900));
    const newUser = { name, email, phone, country };
    setUser(newUser);
    localStorage.setItem("finova_user", JSON.stringify(newUser));
    localStorage.setItem("finova_pw", btoa(password));
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    try {
      const saved   = localStorage.getItem("finova_user");
      const savedPw = localStorage.getItem("finova_pw");
      if (saved && savedPw && savedPw === btoa(password)) {
        const u = JSON.parse(saved);
        if (u.email === email) { setUser(u); return true; }
      }
    } catch {}
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("finova_user");
    router.replace("/login");
  };

  if (!checked) return (
    <div style={{background:"#080f1a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"1rem"}}>
      <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
        <path d="M6 26L14 10L20 20L24 14L28 26" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="26" r="2" fill="#2ecc71"/>
      </svg>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#e8f0fe"}}>
        Finova <span style={{color:"#2ecc71"}}>Africa</span>
      </div>
      <div style={{width:"28px",height:"28px",border:"3px solid rgba(46,204,113,0.25)",borderTopColor:"#2ecc71",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
