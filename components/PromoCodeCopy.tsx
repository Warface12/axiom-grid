"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function PromoCodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" className="promo-copy" onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>
    <span>{code}</span>{copied ? <Check size={15} /> : <Copy size={15} />}
  </button>;
}
