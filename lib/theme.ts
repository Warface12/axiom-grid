export type ThemeMode = "light" | "dark" | "auto";
export const THEME_KEY = "toppick-theme";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

export const THEME_BOOT_SCRIPT = `(()=>{try{var k=${JSON.stringify(THEME_KEY)};var v="toppick-theme-v";if(localStorage.getItem(v)!=="3"){localStorage.setItem(k,"dark");localStorage.setItem(v,"3")}var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="auto")t="dark";var d=document.documentElement;d.dataset.theme=t;var dark=t==="dark"||(t==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.scheme=dark?"dark":"light";d.style.colorScheme=dark?"dark":"light"}catch(e){}})();`;
