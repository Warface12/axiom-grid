export type ThemeMode = "light" | "dark" | "auto";
export const THEME_KEY = "toppick-theme";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

export const THEME_BOOT_SCRIPT = `(()=>{try{var k=${JSON.stringify(THEME_KEY)};var t=localStorage.getItem(k)||"auto";if(t!=="light"&&t!=="dark"&&t!=="auto")t="auto";var d=document.documentElement;d.dataset.theme=t;var dark=t==="dark"||(t==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.scheme=dark?"dark":"light";d.style.colorScheme=dark?"dark":"light"}catch(e){}})();`;
