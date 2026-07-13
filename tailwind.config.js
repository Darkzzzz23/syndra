module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        muted: "#f5f5f7",
        foreground: "#0f0f0f",
        "muted-foreground": "#7a7a8a",
        border: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};