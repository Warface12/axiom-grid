"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketSwitcher } from "@/components/MarketSwitcher";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button className="ag-icon-btn tp-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}>
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div className="tp-drawer" id="mobile-nav">
          <button type="button" className="tp-drawer-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="tp-drawer-panel" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="tp-drawer-head">
              <b>Browse TopPick</b>
              <button type="button" className="ag-icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <ThemeToggle />
              <MarketSwitcher />
            </div>
            {[["Home", "/"], ["Compare", "/compare"], ["Finder", "/finder"], ["Search", "/search"], ["Research", "/learn"], ["Glossary", "/glossary"], ["Markets", "/markets"], ["Install app", "/apps"]].map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            {CATALOG.map((item) => (
              <Link key={item.id} href={`/${item.hub}`} onClick={() => setOpen(false)}>{item.plural}</Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
