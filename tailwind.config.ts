import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#142f33",
        muted: "#435c5d",
        line: "#cad5ce",
        teal: {
          DEFAULT: "#075c61",
          dark: "#074f53",
          soft: "#e2eee5",
        },
        orange: {
          DEFAULT: "#e95616",
          dark: "#a63d0b",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(8, 42, 61, 0.12)",
      },
      fontFamily: {
        sans: [
          "DM Sans Variable",
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
