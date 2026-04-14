/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0F14",
        surface: {
          DEFAULT: "#111827",
          elevated: "#161F2C"
        },
        accent: "#3B82F6",
        headline: "#F8FAFC",
        muted: "#94A3B8"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"]
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 28px rgba(59, 130, 246, 0.38)" }
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
