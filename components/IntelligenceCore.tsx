"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { detectVisualTier } from "@/lib/visualQuality";
import { subscribeVisual, wakeVisuals } from "@/lib/visual/scheduler";

const BRANCHES = [
  { id: "exchanges", label: "Exchanges", href: "/exchanges", copy: "Compare spot, derivatives and funding as market-access products." },
  { id: "brokers", label: "Brokers", href: "/brokers", copy: "Look at forex, CFDs and multi-asset brokers in their own class." },
  { id: "wallets", label: "Wallets", href: "/wallets", copy: "See who holds the keys and how recovery is described." },
  { id: "dex", label: "DEXs", href: "/dex", copy: "Research on-chain venues without treating them like a CEX." },
  { id: "defi", label: "DeFi", href: "/defi", copy: "Read protocols as products — not slogans or invented yields." },
  { id: "tools", label: "Tools", href: "/tools", copy: "Find analytics, tax, cards and terminals from the job you need done." },
  { id: "markets", label: "Markets", href: "/markets", copy: "Check what your country changes about access and promotions." },
  { id: "opportunities", label: "Opportunities", href: "/opportunities", copy: "Sort cash, crypto, credit and points — they are not the same prize." },
];

function project(x: number, y: number, z: number, w: number, h: number, rotY: number, rotX: number) {
  const cy = Math.cos(rotY); const sy = Math.sin(rotY);
  const cx = Math.cos(rotX); const sx = Math.sin(rotX);
  const xz = x * cy - z * sy;
  const zz = x * sy + z * cy;
  const yy = y * cx - zz * sx;
  const zd = y * sx + zz * cx;
  const depth = 560 / (560 + zd);
  return { x: w * 0.5 + xz * depth, y: h * 0.48 + yy * depth, s: depth, z: zd };
}

export function IntelligenceCore() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const [lite, setLite] = useState(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tier = detectVisualTier();
    if (reduce || tier === "lite" || !canvas) {
      setLite(true);
      return;
    }
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) {
      setLite(true);
      return;
    }

    const radius = 156;
    const nodes = BRANCHES.map((_, i) => {
      const a = (i / BRANCHES.length) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * radius, y: Math.sin(a) * 22, z: Math.sin(a) * radius };
    });
    const sparks = Array.from({ length: tier === "high" ? 42 : 18 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 180,
      z: (Math.random() - 0.5) * 320,
    }));

    let rotY = 0.55;
    let rotX = 0.32;
    let tY = 0.55;
    let tX = 0.32;
    let visible = false;
    let interacting = 0;
    let lastDraw = 0;
    const dprCap = tier === "high" ? 1.35 : 1.1;

    let visW = 1;
    let visH = 1;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const rect = canvas!.getBoundingClientRect();
      visW = Math.max(1, rect.width);
      visH = Math.max(1, rect.height);
      canvas!.width = Math.max(1, Math.floor(visW * dpr));
      canvas!.height = Math.max(1, Math.floor(visH * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now: number) {
      const width = visW;
      const height = visH;
      const light = document.documentElement.dataset.scheme === "light";
      const cyan = light ? "11,143,184" : "55,217,255";
      ctx!.clearRect(0, 0, width, height);
      const g = ctx!.createRadialGradient(width * 0.5, height * 0.48, 8, width * 0.5, height * 0.48, Math.min(width, height) * 0.55);
      g.addColorStop(0, `rgba(${cyan},0.16)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);

      const origin = project(0, 0, 0, width, height, rotY, rotX);
      ctx!.strokeStyle = `rgba(${cyan},0.22)`;
      ctx!.lineWidth = 1.15;
      for (const n of nodes) {
        const p = project(n.x, n.y, n.z, width, height, rotY, rotX);
        ctx!.globalAlpha = 0.25 + p.s * 0.45;
        ctx!.beginPath();
        ctx!.moveTo(origin.x, origin.y);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
      for (const s of sparks) {
        const p = project(s.x, s.y, s.z, width, height, rotY, rotX);
        ctx!.fillStyle = `rgba(${cyan},${0.12 + p.s * 0.25})`;
        ctx!.fillRect(p.x, p.y, 1.4, 1.4);
      }
      if (tier === "high") {
        ctx!.shadowColor = `rgb(${cyan})`;
        ctx!.shadowBlur = 10;
      }
      ctx!.fillStyle = `rgb(${cyan})`;
      ctx!.beginPath();
      ctx!.arc(origin.x, origin.y, 12, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.shadowBlur = 0;
      nodes.forEach((n, i) => {
        const p = project(n.x, n.y, n.z, width, height, rotY, rotX);
        const on = i === activeRef.current;
        ctx!.fillStyle = on ? `rgb(${cyan})` : light ? "rgba(16,32,51,0.72)" : "rgba(200,236,255,0.88)";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, on ? 5.4 * p.s : 3.2 * p.s, 0, Math.PI * 2);
        ctx!.fill();
      });
      lastDraw = now;
    }

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.08);
      if (visible) wakeVisuals();
    }, { threshold: [0, 0.08, 0.2] });
    io.observe(canvas);

    const unsub = subscribeVisual((now, dt) => {
      if (!visible) return false;
      rotY += (tY - rotY) * 0.045;
      rotX += (tX - rotX) * 0.045;
      rotY += (interacting ? 0.00055 : 0.00028) * dt;
      const minGap = interacting ? 16 : 36;
      if (now - lastDraw >= minGap) draw(now);
      if (interacting > 0) interacting -= dt;
      return true;
    });

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      tY = 0.55 + ((e.clientX - rect.left) / rect.width - 0.5) * 0.85;
      tX = 0.32 + ((e.clientY - rect.top) / rect.height - 0.5) * 0.5;
      interacting = 1400;
      wakeVisuals();
    };
    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width; const h = rect.height;
      const px = e.clientX - rect.left; const py = e.clientY - rect.top;
      let best = activeRef.current; let dist = 48;
      nodes.forEach((n, i) => {
        const p = project(n.x, n.y, n.z, w, h, rotY, rotX);
        const d = Math.hypot(p.x - px, p.y - py);
        if (d < dist) { dist = d; best = i; }
      });
      setActive(best);
      interacting = 1400;
      wakeVisuals();
    };

    const ro = new ResizeObserver(() => { resize(); if (visible) wakeVisuals(); });
    ro.observe(canvas);
    resize();
    const first = canvas.getBoundingClientRect();
    visible = first.bottom > 0 && first.top < window.innerHeight;
    draw(performance.now());
    if (visible) wakeVisuals();
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onClick);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      unsub();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const current = BRANCHES[active];
  const svgNodes = BRANCHES.map((_, i) => {
    const a = (i / BRANCHES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 240 + Math.cos(a) * 148, y: 170 + Math.sin(a) * 52 };
  });
  return (
    <div className={`tp-core${lite ? " is-lite" : ""}`}>
      <div className="tp-core-stage">
        <svg viewBox="0 0 480 360" className="tp-core-svg" aria-hidden="true">
          <defs>
            <radialGradient id="tpCoreGlow" cx="50%" cy="48%" r="50%">
              <stop offset="0" stopColor="#37d9ff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#37d9ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="240" cy="170" rx="170" ry="70" fill="url(#tpCoreGlow)" />
          {svgNodes.map((n, i) => (
            <g key={BRANCHES[i].id}>
              <line x1="240" y1="170" x2={n.x} y2={n.y} stroke="#37d9ff" strokeOpacity={i === active ? 0.7 : 0.28} />
              <circle cx={n.x} cy={n.y} r={i === active ? 5 : 3.2} fill={i === active ? "#37d9ff" : "#c8ecff"} />
            </g>
          ))}
          <circle cx="240" cy="170" r="10" fill="#37d9ff" />
        </svg>
        {lite ? null : <canvas ref={ref} className="tp-core-canvas" aria-hidden="true" />}
      </div>
      <div className="tp-core-panel">
        <div className="tp-chip-rail" role="tablist" aria-label="Product map">
          {BRANCHES.map((b, i) => (
            <button key={b.id} type="button" role="tab" aria-selected={i === active} className={i === active ? "is-active" : ""} onClick={() => setActive(i)}>
              {b.label}
            </button>
          ))}
        </div>
        <p>{current.copy}</p>
        <Link href={current.href}>Explore {current.label}</Link>
      </div>
    </div>
  );
}
