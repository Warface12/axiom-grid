"use client";

import { useEffect, useRef, useState } from "react";
import { detectVisualTier, type VisualTier } from "@/lib/visualQuality";

export function useLiveScene(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [tier, setTier] = useState<VisualTier>("balanced");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setTier(detectVisualTier());
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let shown = false;
    const sync = () => setLive(shown && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      shown = entry.isIntersecting;
      sync();
    }, { threshold, rootMargin: "80px" });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [threshold]);

  return { ref, live, tier };
}

export function useParallax(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (!window.matchMedia("(pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const x = ((event.clientX - box.left) / Math.max(1, box.width)) - 0.5;
      const y = ((event.clientY - box.top) / Math.max(1, box.height)) - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const reset = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, [enabled]);

  return ref;
}
