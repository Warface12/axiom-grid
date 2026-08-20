import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { BonusForm } from "@/components/admin/BonusForm";
import { getAdminBonuses, getAdminCasinos } from "@/lib/actions/admin";
export const dynamic="force-dynamic";
export default async function BonusesPage({searchParams}:{searchParams:Promise<{new?:string;edit?:string}>}){
 const p=await searchParams; const bonuses:any[]=await getAdminBonuses(); const casinos:any[]=await getAdminCasinos(); const editing=p.edit?bonuses.find(b=>b.id===p.edit):undefined;
 return <main className="admin-page-inner"><AdminHeader title="Bonuses" subtitle="Add and update current casino offers manually — fast, clear and without AI."/>
 <div style={{marginBottom:18}}><Link href="/admin/bonuses?new=1" className="primary-btn">+ Add Bonus</Link></div>
 <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Casino</th><th>Offer</th><th>Code</th><th>Wagering</th><th>Countries</th><th>Status</th><th>Action</th></tr></thead><tbody>{bonuses.length?bonuses.map(b=><tr key={b.id}><td>{b.casino?.name??"—"}</td><td><b>{b.title}</b></td><td>{b.promo_code??"—"}</td><td>{b.wagering_requirement??"—"}</td><td>{(b.eligible_countries??[]).join(", ")||"—"}</td><td>{b.active?"Active":"Hidden"}</td><td><Link href={`/admin/bonuses?edit=${b.id}`} className="secondary-btn">Edit</Link></td></tr>):<tr><td colSpan={7} style={{textAlign:"center",padding:30}}>No bonuses yet. Add the first current offer.</td></tr>}</tbody></table></div>
 {(p.new==="1"||editing)&&<BonusForm bonus={editing} casinos={casinos.map(c=>({id:c.id,name:c.name}))}/>}</main>
}
