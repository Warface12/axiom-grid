import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
export const metadata:Metadata={...buildMetadata({title:"Axiom Grid — Digital Asset Intelligence",description:"Independent research for crypto exchanges, brokers, wallets, fees, security and market access.",path:"/"}),verification:{google:process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION||undefined},icons:{icon:[{url:"/axiom-mark.svg",type:"image/svg+xml"}],apple:"/axiom-mark.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationJsonLd())}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteJsonLd())}}/></head><body><Header/><div id="main-content">{children}</div><Footer/></body></html>}
