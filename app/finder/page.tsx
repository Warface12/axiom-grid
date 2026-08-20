import { SmartFinder } from "@/components/SmartFinder";
import { getCasinos } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({ title:"Nivaro Match — Market-Aware Casino Matching | NivaroBet", description:"Use Nivaro Match to compare casinos already eligible for your market against the features that matter to you.", path:"/finder" });
export default async function FinderPage(){ const casinos=await getCasinos({limit:300}); return <main className="container page nmatch-page"><section className="nmatch-hero"><span>NIVARO MATCH™</span><h1>Your market first.<br/><em>Your preferences next.</em></h1><p>A transparent matching layer for casino discovery. Nivaro Match never overrides market eligibility and never predicts gambling outcomes.</p><div className="nmatch-principles"><b>01 · Market gate</b><b>02 · Preference match</b><b>03 · Evidence check</b></div></section><SmartFinder casinos={casinos as any}/></main>; }
