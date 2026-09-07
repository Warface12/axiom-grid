"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_KEY, type ThemeMode, isThemeMode } from "@/lib/theme";

const modes: { id: ThemeMode; label: string; Icon: typeof Moon }[] = [
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "light", label: "Light", Icon: Sun },
  { id: "auto", label: "Auto", Icon: Monitor },
];

function resolveScheme(mode: ThemeMode) {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function paintTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  const scheme = resolveScheme(mode);
  root.dataset.scheme = scheme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", scheme === "dark" ? "#050a11" : "#f3f6fb");
}

export function ThemeControls() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const next = isThemeMode(stored) ? stored : "dark";
    setMode(next);
    paintTheme(next);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (localStorage.getItem(THEME_KEY) === "auto") paintTheme("auto");
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  function apply(next: ThemeMode) {
    setMode(next);
    localStorage.setItem(THEME_KEY, next);
    paintTheme(next);
  }

  return (
    <div className="tp-theme-pills" role="group" aria-label="Theme">
      {modes.map(({ id, label, Icon }) => (
        <button key={id} type="button" className={mode === id ? "is-active" : ""} aria-pressed={mode === id} onClick={() => apply(id)}>
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
