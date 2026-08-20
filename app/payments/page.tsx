import Link from "next/link";
import { ArrowRight, Banknote, Bitcoin, CreditCard, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Casino Payment Methods & Withdrawal Context | NivaroBet",
  description: "Research casino payment methods, deposit and withdrawal context, KYC considerations and market availability.",
  path: "/payments",
});

const methods = [
  [CreditCard, "Cards", "Card deposits can be convenient, but availability, limits and withdrawal routing vary by operator and market."],
  [Landmark, "Bank transfers", "Bank-based funding can involve different processing windows, reference requirements and withdrawal procedures."],
  [WalletCards, "E-wallets", "Wallet availability is market-dependent and should be checked alongside fees, limits and verification rules."],
  [Bitcoin, "Crypto", "Crypto support does not remove KYC, market restrictions or operator-specific withdrawal conditions."],
] as const;

export default function PaymentsPage(){
  return <main className="nvx-static-page container">
    <header className="nvx-static-hero"><small>PAYMENT LENS</small><h1>Follow the money flow, not just the deposit button.</h1><p>Payment research should cover how funds enter, how withdrawals leave, what verification may be required and whether a method is actually available in the reader's market.</p></header>
    <section className="nvx-method-grid">{methods.map(([Icon,title,text])=><article key={title}><Icon size={22}/><h2>{title}</h2><p>{text}</p></article>)}</section>
    <section className="nvx-static-band"><Banknote size={24}/><div><small>WHAT WE TRACK</small><h2>Deposit options, withdrawal context, limits, KYC and freshness.</h2><p>NivaroBet does not treat a payment logo as enough evidence. Where reliable data is available, the profile should distinguish supported methods, material limits, withdrawal information and the date those details were checked.</p></div></section>
    <section className="nvx-static-cta"><ShieldCheck size={20}/><div><b>Payment information can change.</b><p>Always confirm current terms and eligibility directly with the operator before acting.</p></div><Link href="/how-we-verify">How we verify <ArrowRight size={15}/></Link></section>
  </main>;
}
