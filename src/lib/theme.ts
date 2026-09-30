/**
 * Light/dark theme. The theme is the `dark` class on <html>, which the shadcn
 * tokens in globals.css switch on. The site is dark unless a visitor picks
 * light with the theme switch; their choice is saved in localStorage.
 */

export type Theme = "light" | "dark";

/** The theme for visitors who haven't picked one. */
export const DEFAULT_THEME: Theme = "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Inlined into <head> by the root layout. The server renders DEFAULT_THEME;
 * this runs while the HTML is parsed, before the first paint, and swaps in a
 * saved choice, so a visitor who picked the other theme never sees a flash of
 * the default. Must stay self-contained: it runs before any bundle has loaded.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=(t==="light"||t==="dark"?t:"${DEFAULT_THEME}")==="dark";var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  // Native scrollbars and form controls follow along too.
  root.style.colorScheme = theme;
}

/** The visitor's saved choice, or null if they've never picked one. */
export function storedTheme(): Theme | null {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    // Storage can be blocked (private modes, strict privacy settings).
    return null;
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Still applied for this page view, just not remembered.
  }
}
