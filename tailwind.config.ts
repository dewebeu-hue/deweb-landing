import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081832",
        muted: "#5d6e82",
        line: "#d8e5eb",
        teal: {
          DEFAULT: "#006d7b",
          dark: "#004d58",
          soft: "#e1f4f5",
        },
        orange: {
          DEFAULT: "#e95616",
          dark: "#bd3d08",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(8, 42, 61, 0.12)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
