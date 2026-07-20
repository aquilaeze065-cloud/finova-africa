/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key:"X-Frame-Options",           value:"DENY" },
          { key:"X-Content-Type-Options",     value:"nosniff" },
          { key:"X-XSS-Protection",           value:"1; mode=block" },
          { key:"Referrer-Policy",            value:"strict-origin-when-cross-origin" },
          { key:"Permissions-Policy",         value:"camera=(), microphone=(), geolocation=(), payment=()" },
          { key:"Strict-Transport-Security",  value:"max-age=63072000; includeSubDomains; preload" },
          { key:"Cross-Origin-Opener-Policy", value:"same-origin" },
          { key:"Cross-Origin-Embedder-Policy",value:"unsafe-none" },
          {
            key:"Content-Security-Policy",
            value:[
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.coingecko.com https://finova-africa-production.up.railway.app https://wa.me",
              "frame-src 'none'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
};
module.exports = nextConfig;
