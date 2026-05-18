/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f3fae9",
          100: "#e4f3d0",
          500: "#6fbf12",
          600: "#4f9a0b",
          700: "#397407"
        },
        citrus: {
          500: "#ff6b00",
          600: "#e45700"
        },
        ink: "#171a1f"
      },
      boxShadow: {
        soft: "0 20px 80px rgba(23, 26, 31, 0.12)"
      }
    }
  },
  plugins: []
};
