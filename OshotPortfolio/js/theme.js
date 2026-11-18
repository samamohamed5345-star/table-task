(() => {
  "use strict";

  const KEY = "oshot_theme";
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const isLight = theme === "light";
    btn.setAttribute("aria-pressed", String(isLight));
    btn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    try { localStorage.setItem(KEY, theme); } catch {}
  }

  btn.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  });

  applyTheme(document.documentElement.dataset.theme || "dark");
})();
