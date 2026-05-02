import type { Metadata } from "next";
import { WalletProvider } from "./context/WalletContext";

export const metadata: Metadata = {
  title: "Finova Africa",
  description: "Your African Crypto & Fintech Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
