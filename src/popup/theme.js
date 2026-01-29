import { getLocal, setLocal } from "./storage.js";

const getPreferredTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const updateThemeToggleLabel = (theme, themeToggle, themeIcon) => {
  if (!themeToggle || !themeIcon) return;
  themeIcon.className = `theme-icon ${theme === "dark" ? "moon" : "sun"}`;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"
  );
};

const applyTheme = async (theme, themeToggle, themeIcon, persist = true) => {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeToggleLabel(theme, themeToggle, themeIcon);
  if (persist) {
    await setLocal({ theme });
  }
};

export const initTheme = async (themeToggle, themeIcon) => {
  if (!themeToggle || !themeIcon) return;
  const stored = await getLocal(["theme"]);
  const theme = stored.theme || getPreferredTheme();
  await applyTheme(theme, themeToggle, themeIcon, false);

  themeToggle.addEventListener("click", async () => {
    const current =
      document.documentElement.getAttribute("data-theme") || getPreferredTheme();
    const next = current === "dark" ? "light" : "dark";
    await applyTheme(next, themeToggle, themeIcon, true);
  });
};
