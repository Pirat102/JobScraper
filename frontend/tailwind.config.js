/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border-color)",
        background: "var(--background-color)",
        primary: {
          DEFAULT: "var(--primary-color)",
          hover: "var(--primary-hover)",
        },
        card: "var(--card-background)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        }
      }
    },
  },
  plugins: [],
}