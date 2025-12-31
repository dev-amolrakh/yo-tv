/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        dark: {
          100: "#1e1e1e",
          200: "#2d2d2d",
          300: "#3d3d3d",
          400: "#4d4d4d",
          500: "#5d5d5d",
        },
      },
    },
  },
  plugins: [],
};
