"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  ["Exchanges", "/exchanges"],
  ["Brokers", "/brokers"],
  ["Wallets", "/wallets"],
  ["Compare", "/compare"],
  ["Research", "/learn"],
  ["Updates", "/updates"],
  ["Markets", "/markets"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button className="ag-icon-btn tp-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close navigation" : "Open navigation"}>
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div className="tp-mobile-nav" id="mobile-nav">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link href="/search" onClick={() => setOpen(false)}>Search</Link>
        </div>
      )}
    </>
  );
}
