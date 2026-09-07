"use client";

import { useEffect, useState } from "react";

type PlatformHint = "windows" | "android" | "ios" | "desktop" | "unknown";

function hintFromUA(ua: string): PlatformHint {
  const v = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(v)) return "ios";
  if (/android/.test(v)) return "android";
  if (/windows/.test(v)) return "windows";
  if (/mac os|linux/.test(v)) return "desktop";
  return "unknown";
}

export function InstallHub() {
  const [hint, setHint] = useState<PlatformHint>("unknown");
  const [manual, setManual] = useState<PlatformHint | "auto">("auto");
  const [deferred, setDeferred] = useState<{ prompt: () => Promise<void> } | null>(null);
  const [installed, setInstalled] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setHint(hintFromUA(navigator.userAgent));
    setStandalone(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      const ev = e as Event & { prompt: () => Promise<void> };
      setDeferred(ev);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
  }, []);

  const view = manual === "auto" ? hint : manual;

  return (
    <div>
      <p className="tp-muted">Detected from this browser: <b>{hint}</b>. Change the platform if that is wrong — we never force an installer from user-agent alone.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 20px" }}>
        {(["auto", "windows", "android", "ios", "desktop"] as const).map((id) => (
          <button key={id} className="ag-icon-btn" style={{ padding: "0 12px", width: "auto" }} onClick={() => setManual(id)} aria-pressed={(manual === "auto" ? hint : manual) === id || manual === id}>
            {id === "auto" ? "Use detected" : id}
          </button>
        ))}
      </div>
      {standalone || installed ? <p><b>TopPick is already running as an installed app in this window.</b></p> : null}
      <div className="tp-app-grid">
        <article className="tp-app-card">
          <small>WEB APP</small>
          <b>Install TopPick</b>
          <p>Works on Chromium browsers for Windows, Android and many desktops when the browser offers installation. iPhone uses Add to Home Screen.</p>
          {deferred ? (
            <button className="primary-btn" type="button" onClick={() => deferred.prompt()}>Install web app</button>
          ) : view === "ios" ? (
            <p>On iPhone/iPad: tap Share, then <b>Add to Home Screen</b>. Apple does not allow a silent install button for PWAs.</p>
          ) : (
            <p>If your browser supports it, an install prompt will appear here. Otherwise use the browser’s Install / Add to Home Screen command.</p>
          )}
        </article>
        <article className="tp-app-card" aria-disabled="true">
          <small>WINDOWS</small>
          <b>Native package</b>
          <p>No signed Windows installer is published yet. Use the installable web app. A packaged desktop build will appear here only after a real signed artifact exists.</p>
          <button type="button" className="primary-btn" disabled>Download unavailable</button>
        </article>
        <article className="tp-app-card" aria-disabled="true">
          <small>ANDROID</small>
          <b>Play / signed APK</b>
          <p>Signing credentials and a store listing are required before any APK can be offered. Unsigned development builds are not published as the production app.</p>
          <button type="button" className="primary-btn" disabled>Download unavailable</button>
        </article>
        <article className="tp-app-card" aria-disabled="true">
          <small>IPHONE / iOS</small>
          <b>App Store</b>
          <p>A native iOS app cannot be installed from an arbitrary IPA on this site. Until Apple distribution is available, use Add to Home Screen.</p>
          <button type="button" className="primary-btn" disabled>App Store listing unavailable</button>
        </article>
      </div>
    </div>
  );
}
