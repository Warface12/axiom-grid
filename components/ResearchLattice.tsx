"use client";

import { useEffect, useRef } from "react";
import { detectVisualTier } from "@/lib/visualQuality";
import { subscribeVisual, wakeVisuals } from "@/lib/visual/scheduler";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

export function ResearchLattice() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tier = detectVisualTier();
    if (reduce || tier === "lite") return;

    let visible = false;
    let lastDraw = 0;
    const pointer = { x: 0, y: 0, active: false };
    const nodes: Node[] = [];
    const count = tier === "high" ? 28 : 14;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === "high" ? 1.25 : 1);
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes.length = 0;
      const { width, height } = canvas!.getBoundingClientRect();
      for (let i = 0; i < count; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 1.1 + Math.random() * 1.4,
        });
      }
    }

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.05);
      if (visible) wakeVisuals();
    }, { threshold: [0, 0.05] });
    io.observe(canvas);

    const unsub = subscribeVisual((now, dt) => {
      if (!visible) return false;
      const { width, height } = canvas.getBoundingClientRect();
      for (const n of nodes) {
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 120) {
            n.vx -= (dx / d) * 0.008;
            n.vy -= (dy / d) * 0.008;
          }
        }
        n.x += n.vx * dt * 0.06;
        n.y += n.vy * dt * 0.06;
        n.vx *= 0.995;
        n.vy *= 0.995;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      if (now - lastDraw < (pointer.active ? 16 : 40)) return true;
      lastDraw = now;
      ctx.clearRect(0, 0, width, height);
      const light = document.documentElement.dataset.scheme === "light";
      const nodeColor = light ? "rgba(20,70,120,0.55)" : "rgba(70,215,255,0.55)";
      const lineColor = light ? "rgba(30,80,130,0.12)" : "rgba(70,215,255,0.12)";
      const maxDist = tier === "high" ? 120 : 90;
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxDist) {
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = 1 - d / maxDist;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = nodeColor;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    });

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      wakeVisuals();
    };
    const onLeave = () => { pointer.active = false; };
    resize();
    seed();
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    const onResize = () => { resize(); seed(); };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      unsub();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="tp-lattice" aria-hidden="true" />;
}
