import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#111111",
        card: "#1a1a1a",
        border: "#2a2a2a",
      },
      animation: {
        pulse2: "pulse2 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        pulse2: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0.4)" },
          "50%": { boxShadow: "0 0 0 16px rgba(249,115,22,0)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
