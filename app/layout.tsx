import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_NAME } from "@/lib/site";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({title:`${SITE_NAME} — Crypto Exchanges, Brokers & Wallets`,description:"Compare crypto exchanges, trading platforms and wallets with evidence-first research, transparent methodology and market-aware availability.",path:"/"}),
  verification:{google:process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION||undefined}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationJsonLd())}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteJsonLd())}}/></head><body><Header/><div id="main-content">{children}</div><Footer/></body></html>}
