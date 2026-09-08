"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { MarketSwitcher } from "@/components/MarketSwitcher";
import { ThemeControls } from "@/components/ThemeControls";

const explore = [
  ["Home", "/"],
  ["Finder", "/finder"],
  ["Compare", "/compare"],
  ["Research", "/research"],
  ["Learn", "/learn"],
  ["Opportunities", "/opportunities"],
  ["Markets", "/markets"],
  ["Account", "/account"],
  ["Install app", "/apps"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.toggleAttribute("data-nav-open", open);
    if (open) closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-nav-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button className="ag-icon-btn tp-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <div className="tp-drawer" id="mobile-nav">
          <button type="button" className="tp-drawer-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="tp-drawer-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <div className="tp-drawer-head">
              <b id={titleId}>Browse TopPick</b>
              <button type="button" ref={closeRef} className="ag-icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <p className="tp-drawer-label">Explore</p>
            {explore.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            <p className="tp-drawer-label">Product classes</p>
            {CATALOG.map((item) => (
              <Link key={item.id} href={`/${item.hub}`} onClick={() => setOpen(false)}>{item.plural}</Link>
            ))}
            <p className="tp-drawer-label">Market</p>
            <MarketSwitcher />
            <p className="tp-drawer-label">Appearance</p>
            <ThemeControls />
            <Link className="tp-drawer-partner" href="/partners" onClick={() => setOpen(false)}>Partner workspace</Link>
            <Link href="/account" onClick={() => setOpen(false)}>User account</Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
