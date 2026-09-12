import type{NextConfig}from"next";
const securityHeaders=[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"X-Frame-Options",value:"DENY"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=()"},{key:"Cross-Origin-Opener-Policy",value:"same-origin"},{key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"}];
const nextConfig:NextConfig={
  reactStrictMode:true,
  poweredByHeader:false,
  compress:true,
  distDir: process.env.NEXT_DEV_DIST || ".next",
  experimental:{optimizePackageImports:["lucide-react"]},
  async headers(){return[{source:"/:path*",headers:securityHeaders}]},
  async redirects(){return[
    {source:"/guides",destination:"/learn",permanent:true},
    {source:"/guides/:slug",destination:"/learn/:slug",permanent:true},
    {source:"/cards",destination:"/crypto-cards",permanent:true},
    {source:"/onramps",destination:"/on-ramps",permanent:true},
    {source:"/on-ramp",destination:"/on-ramps",permanent:true},
    {source:"/reward",destination:"/rewards",permanent:true},
    {source:"/nfts",destination:"/nft",permanent:true},
    {source:"/bridge",destination:"/bridges",permanent:true},
    {source:"/copy",destination:"/copy-trading",permanent:true},
    {source:"/l2",destination:"/layer2",permanent:true},
    {source:"/stablecoin",destination:"/stablecoins",permanent:true},
    {source:"/kyc",destination:"/identity",permanent:true},
    {source:"/yield-farming",destination:"/yield",permanent:true},
    {source:"/discover",destination:"/niches",permanent:true},
  ]},
};
export default nextConfig;
