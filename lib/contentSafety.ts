const riskyPatterns: Array<[RegExp,string]> = [
  [/\bguarantee(?:d|s)?\b/i,"guaranteed outcome"],
  [/\brisk[- ]?free\b/i,"risk-free claim"],
  [/\bno risk\b/i,"no-risk claim"],
  [/\b(?:best|#1|number one)\b/i,"absolute ranking claim"],
  [/\b(?:instant|easy|sure) profit(?:s)?\b/i,"profit promise"],
  [/\b(?:make|earn) money fast\b/i,"earnings promise"],
  [/\bfree money\b/i,"free-money claim"],
  [/\bdouble your (?:money|deposit|investment)\b/i,"doubling promise"],
  [/\b(?:will|always) (?:win|profit|earn)\b/i,"outcome promise"],
  [/\bzero loss(?:es)?\b/i,"loss-free claim"],
];

export function editorialRiskReasons(value:string){
  const text=String(value||"").trim();
  return riskyPatterns.filter(([pattern])=>pattern.test(text)).map(([,reason])=>reason);
}

export function assertSafeEditorialCopy(title:string,excerpt="",body=""){
  const reasons=[...new Set([...editorialRiskReasons(title),...editorialRiskReasons(excerpt),...editorialRiskReasons(body)])];
  return {safe:reasons.length===0,reasons};
}

export function safePlatformSeoTitle(custom:string|null|undefined,name:string){
  const candidate=String(custom||"").trim();
  if(candidate && editorialRiskReasons(candidate).length===0)return candidate;
  return `${name} Review & Research Profile`;
}

export function safeUpdateTitle(title:string,platformName?:string|null){
  const clean=String(title||"").replace(/\s+/g," ").trim();
  if(clean && editorialRiskReasons(clean).length===0)return clean;
  return platformName?`Partner update: ${platformName}`:"Partner update";
}
