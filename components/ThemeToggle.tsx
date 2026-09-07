"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_KEY, type ThemeMode, isThemeMode } from "@/lib/theme";

const order: ThemeMode[] = ["auto", "light", "dark"];

function resolveScheme(mode: ThemeMode) {
  return mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark"
    : "light";
}

function paint(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  const scheme = resolveScheme(mode);
  root.dataset.scheme = scheme;
  root.style.colorScheme = scheme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", scheme === "dark" ? "#050a11" : "#f3f6fb");
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const next = isThemeMode(stored) ? stored : "auto";
    setMode(next);
    paint(next);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      const current = localStorage.getItem(THEME_KEY);
      if (!isThemeMode(current) || current === "auto") paint("auto");
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  function apply(next: ThemeMode) {
    setMode(next);
    localStorage.setItem(THEME_KEY, next);
    paint(next);
  }

  function cycle() {
    apply(order[(order.indexOf(mode) + 1) % order.length]);
  }

  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;
  const label = mode === "auto" ? "Theme: system" : mode === "dark" ? "Theme: dark" : "Theme: light";

  return (
    <button className="ag-icon-btn tp-theme" onClick={cycle} aria-label={label} title={label}>
      <Icon size={17} />
    </button>
  );
}
