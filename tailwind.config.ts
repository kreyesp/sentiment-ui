// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",                         // REQUIRED for next-themes
  content: ["./src/**/*.{js,ts,jsx,tsx}"],   // safe even on v4
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
