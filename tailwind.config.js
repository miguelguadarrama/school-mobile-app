/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",     // if you use expo-router
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito_400Regular"],
        "nunito-bold": ["Nunito_700Bold"],
      },
      // optional: tiny starter tokens so you have “a look” without a full system
      colors: {
        primary: "#6C8CF5",
        secondary: "#FFB86B",
        surface: "#FFF8F1",
        text: "#2B2B2B",
        muted: "#63707A",
        border: "#E8E2DA",
      },
      borderRadius: {
        xl: "24px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};