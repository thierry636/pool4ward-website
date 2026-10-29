import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff3ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",
          700: "#4263eb",
          800: "#3b5bdb",
          900: "#364fc7",
          950: "#1e3a8a",
        },
        navy: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Version 2 — vert profond, fonds minéraux, accents sobres.
        // Les rapports de contraste de chaque couple texte/fond sont vérifiés
        // dans docs/version2/DESIGN.md (tous >= 4,5:1).
        forest: {
          50: "#eef4f0",
          100: "#d8e6dd",
          200: "#b3cdbd",
          300: "#8fc4ab",
          400: "#5da283",
          500: "#2f7d5c",
          600: "#1b6b4e",
          700: "#14573f",
          800: "#0f4130",
          900: "#0b241a",
          950: "#071a12",
        },
        mineral: {
          50: "#f5f2ea",
          100: "#ebe7db",
          200: "#ddd7c7",
          300: "#c9c2ae",
          400: "#a8a089",
          500: "#7d765f",
        },
        ochre: {
          200: "#f2d9a3",
          300: "#e8b964",
          400: "#d49d3c",
          500: "#b8821f",
          700: "#8a5a10",
          800: "#68430b",
        },
        river: {
          300: "#9cc3de",
          400: "#6aa0c7",
          600: "#2f6a93",
          800: "#1c4562",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      fontFamily: {
        // Geist (auto-hébergée via next/font) remplace Inter, qui était tirée de
        // Google Fonts : plus aucune requête tierce avant le premier rendu.
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif Fallback", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(66, 99, 235, 0.25)",
        "glow-teal": "0 0 60px -12px rgba(20, 184, 166, 0.25)",
        premium: "0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.04)",
        "premium-lg": "0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
