"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveScene } from "@/lib/visual/live";

const LAYERS = [
  { id: "custodial", title: "Custodial", copy: "The operator can move the balance. Account recovery is their process, not a seed phrase." },
  { id: "self", title: "Self-custody", copy: "You (or your device) authorize transfers. Backup, phishing and device loss become your risk." },
  { id: "keys", title: "Keys", copy: "Whoever holds the secret can move the asset. Slogans do not change that." },
  { id: "recovery", title: "Recovery", copy: "A recovery kit is not a password reset. Anyone who copies it can empty the wallet." },
  { id: "access", title: "Permissions", copy: "Apps, APIs and approvals can spend without taking the seed. Review what you signed." },
];

export function SecurityVault() {
  const { ref, live } = useLiveScene();
  const [active, setActive] = useState(0);
  const current = LAYERS[active];
  return (
    <section className="tp-chapter tp-chapter--vault" aria-label="Custody models">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Security / custody</p>
          <h2>Who can move the asset?</h2>
          <p className="tp-lead">That is the first security question. An exchange balance, a custodial wallet and a hardware device fail in different ways.</p>
        </header>
        <div ref={ref} className={`tp-vault${live ? " is-live" : ""}`}>
          <div className="tp-vault-stack" aria-hidden="true">
            {LAYERS.map((layer, index) => (
              <button
                key={layer.id}
                type="button"
                className={`tp-vault-plate${index === active ? " is-active" : ""}`}
                style={{ ["--i" as string]: String(index) }}
                onClick={() => setActive(index)}
              >
                <b>{layer.title}</b>
              </button>
            ))}
            <span className="tp-vault-lock" />
          </div>
          <article className="tp-vault-copy">
            <h3>{current.title}</h3>
            <p>{current.copy}</p>
            <Link href="/security">Open security research</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
