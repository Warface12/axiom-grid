import {buildMetadata}from"@/lib/seo";import{SearchClient}from"@/components/SearchClient";
export const metadata=buildMetadata({title:"Search TopPick research",description:"Search guides, categories, glossary terms and published platform profiles. Empty inventories stay empty.",path:"/search",noIndex:true});
export default function Page(){return <main className="shell content-shell"><section className="tp-hub-hero"><p>SEARCH</p><h1>Find research, not filler.</h1><p>Search guides, glossary terms and published profiles.</p></section><SearchClient/></main>}
