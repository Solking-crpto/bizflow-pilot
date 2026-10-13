import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1F33",
          light: "#1E3A5F",
          muted: "#475569",
        },
        navy: {
          DEFAULT: "#12355B",
          dark: "#0A1F36",
          light: "#1B477A",
        },
        brand: {
          teal: "#0E9F8E",
          hover: "#0B8577",
          light: "#E6F7F5",
        },
        success: {
          DEFAULT: "#16794C",
          light: "#EAF6F0",
          border: "#A3D9BD",
        },
        warning: {
          DEFAULT: "#B45309",
          light: "#FEF3C7",
          border: "#FCD34D",
        },
        danger: {
          DEFAULT: "#B42318",
          light: "#FEE4E2",
          border: "#FECDCA",
        },
        info: {
          DEFAULT: "#1D4ED8",
          light: "#EFF6FF",
          border: "#BFDBFE",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },
        canvas: {
          DEFAULT: "#F5F7FA",
          subtle: "#EAEDF2",
        },
        border: {
          DEFAULT: "#E3E8EF",
          strong: "#CBD5E1",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["IBM Plex Mono", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(11, 31, 51, 0.05), 0 1px 2px -1px rgba(11, 31, 51, 0.03)",
        elevated: "0 4px 6px -1px rgba(11, 31, 51, 0.08), 0 2px 4px -2px rgba(11, 31, 51, 0.04)",
        modal: "0 10px 15px -3px rgba(11, 31, 51, 0.1), 0 4px 6px -4px rgba(11, 31, 51, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
