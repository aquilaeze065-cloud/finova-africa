"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WalletAddresses {
  btc:  string;
  eth:  string;
  usdt: string;
  bnb:  string;
}

export interface UserData {
  userId:    string;
  name:      string;
  email:     string;
  addresses: WalletAddresses;
  balances:  { btc: number; eth: number; usdt: number; bnb: number; ngn: number };
  transactions: TxRecord[];
  createdAt: string;
}

export interface TxRecord {
  id:     string;
  type:   "deposit" | "withdrawal" | "swap";
  crypto: string;
  amount: number;
  usdVal: number;
  ngnVal: number;
  to:     string;
  status: "confirmed" | "pending" | "failed";
  date:   string;
  hash:   string;
}

const hex = (n: number) =>
  Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
const b58c = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const b58  = (n: number) =>
  Array.from({ length: n }, () => b58c[Math.floor(Math.random() * 58)]).join("");

function genAddresses(): WalletAddresses {
  return {
    btc:  "1FNV" + b58(30),
    eth:  "0x" + hex(40),
    usdt: "T" + b58(33),
    bnb:  "bnb1" + hex(38),
  };
}
function genUserId() { return "FNV" + Date.now().toString(36).toUpperCase() + hex(4).toUpperCase(); }
function genHash()   { return "0x" + hex(64); }

interface WalletCtx {
  user:       UserData | null;
  isLoggedIn: boolean;
  register:   (name: string, email: string, password: string) => UserData;
  login:      (email: string, password: string) => boolean;
  logout:     () => void;
  addDeposit: (crypto: string, amount: number, usdVal: number) => TxRecord;
  totalUSD:   number;
  totalNGN:   number;
}

const Ctx  = createContext<WalletCtx | null>(null);
const KEY  = "nexora_user";
const NGN  = 1640;
const RATES: Record<string, number> = { btc: 42350, eth: 3800, usdt: 1, bnb: 320 };

const defaultBalances = { btc: 0, eth: 0, usdt: 0, bnb: 0, ngn: 0 };

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const parsed = JSON.parse(s);
        // ensure balances always exists
        if (!parsed.balances) parsed.balances = { ...defaultBalances };
        setUser(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user) { try { localStorage.setItem(KEY, JSON.stringify(user)); } catch {} }
  }, [user]);

  function register(name: string, email: string, _pw: string): UserData {
    const newUser: UserData = {
      userId:       genUserId(),
      name,
      email,
      addresses:    genAddresses(),
      balances:     { ...defaultBalances },
      transactions: [],
      createdAt:    new Date().toISOString(),
    };
    setUser(newUser);
    return newUser;
  }

  function login(_email: string, _pw: string): boolean {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const parsed = JSON.parse(s);
        if (!parsed.balances) parsed.balances = { ...defaultBalances };
        setUser(parsed);
        return true;
      }
    } catch {}
    return false;
  }

  function logout() { setUser(null); localStorage.removeItem(KEY); }

  function addDeposit(crypto: string, amount: number, usdVal: number): TxRecord {
    const tx: TxRecord = {
      id:     "tx_" + Date.now(),
      type:   "deposit",
      crypto,
      amount,
      usdVal,
      ngnVal: usdVal * NGN,
      to:     user?.addresses[crypto.toLowerCase() as keyof WalletAddresses] ?? "",
      status: "pending",
      date:   new Date().toISOString(),
      hash:   genHash(),
    };
    setUser(prev => {
      if (!prev) return prev;
      const k = crypto.toLowerCase() as keyof typeof defaultBalances;
      const bal = prev.balances ?? { ...defaultBalances };
      return {
        ...prev,
        balances:     { ...bal, [k]: (bal[k] ?? 0) + amount },
        transactions: [tx, ...(prev.transactions ?? [])],
      };
    });
    setTimeout(() => {
      setUser(prev => prev ? {
        ...prev,
        transactions: (prev.transactions ?? []).map(t =>
          t.id === tx.id ? { ...t, status: "confirmed" } : t
        ),
      } : prev);
    }, 3000);
    return tx;
  }

  const balances = user?.balances ?? defaultBalances;
  const totalUSD = Object.entries(balances).reduce((s, [k, v]) => {
    const val = typeof v === "number" ? v : 0;
    return s + (k === "ngn" ? val / NGN : val * (RATES[k] ?? 1));
  }, 0);

  return (
    <Ctx.Provider value={{
      user, isLoggedIn: !!user,
      register, login, logout, addDeposit,
      totalUSD, totalNGN: totalUSD * NGN,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWallet() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWallet must be used inside WalletProvider");
  return c;
}
