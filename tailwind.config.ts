import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        mist: "#F4F7F9",
        ocean: "#0E7490",
        leaf: "#1F8A70",
        amber: "#B7791F",
        danger: "#B42318"
      }
    }
  },
  plugins: []
};

export default config;
