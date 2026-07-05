"use client";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Nexora Support Widget */}
        <Script
          src="https://cdn.nexora.com/support.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
