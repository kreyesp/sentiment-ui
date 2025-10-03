"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? systemTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm backdrop-blur hover:bg-white
                 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {mounted ? (isDark ? "🌙 Dark" : "☀️ Light") : "…"}
    </button>
  );
}
