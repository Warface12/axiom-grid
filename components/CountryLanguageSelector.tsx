"use client";

import { Check, ChevronDown, Globe2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GEO_MARKETS, marketPath } from "@/lib/geo";

type Choice = { label: string; path: string; market: string; language: string; flag: string; code: string };

const choices: Choice[] = [
  { label: "International · EN", path: "/", market: "International", language: "English", flag: "◎", code: "INT" },
  ...GEO_MARKETS.filter(m => m.code !== "ca").flatMap(m => m.languages.map(lang => ({
    label: `${m.name} · ${lang.code.toUpperCase()}`,
    path: marketPath(m.code, lang.code),
    market: m.name,
    language: lang.label,
    flag: m.flag,
    code: m.code.toUpperCase(),
  }))),
  { label: "Ontario · EN", path: "/markets/ca/en/ontario", market: "Ontario", language: "English", flag: "🇨🇦", code: "CA-ON" },
];

export function CountryLanguageSelector() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState("International · EN");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const exact = choices.find(c => pathname === c.path);
    const stored = window.localStorage.getItem("nivaro-market-label");
    if (exact) setSelected(exact.label); else if (stored && choices.some(c => c.label === stored)) setSelected(stored);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (choice: Choice) => {
    window.localStorage.setItem("nivaro-market-label", choice.label);
    window.localStorage.setItem("nivaro-market-path", choice.path);
    setSelected(choice.label);
    setOpen(false);
    router.push(choice.path);
  };

  const selectedChoice = choices.find(c => c.label === selected) || choices[0];

  const dialog = open ? (
    <div className="geo-modal-layer">
      <button className="geo-modal-backdrop" aria-label="Close country and language selector" onClick={() => setOpen(false)} />
      <div ref={dialogRef} className="geo-switcher-menu geo-switcher-menu-portal" role="dialog" aria-modal="true" aria-labelledby="geo-title">
        <div className="geo-switcher-menu-head">
          <div>
            <div id="geo-title" className="geo-switcher-title">Choose your market</div>
            <small>Casinos, offers and language adapt to your selected region.</small>
          </div>
          <button type="button" className="geo-switcher-close" aria-label="Close" onClick={() => setOpen(false)}><X size={17}/></button>
        </div>
        <div className="geo-current-market"><Globe2 size={18}/><span><small>Current market</small><strong>{selectedChoice.market} · {selectedChoice.language}</strong></span></div>
        <div className="geo-choice-list">
          {choices.map(choice => (
            <button type="button" className={`geo-choice ${selected === choice.label ? "selected" : ""}`} key={choice.label} onClick={() => choose(choice)}>
              <span className="geo-choice-flag" aria-hidden="true">{choice.flag}</span>
              <span className="geo-choice-copy"><strong>{choice.market}</strong><small>{choice.language} · {choice.code}</small></span>
              <span className="geo-choice-check">{selected === choice.label ? <Check size={15}/> : null}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return <div className="geo-switcher">
    <button ref={triggerRef} type="button" className="geo-switcher-trigger" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-haspopup="dialog" aria-label={`Country and language: ${selected}`}>
      <Globe2 size={17}/><span>{selected}</span><ChevronDown size={14}/>
    </button>
    {mounted && dialog ? createPortal(dialog, document.body) : null}
  </div>;
}
