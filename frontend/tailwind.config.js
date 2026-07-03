/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        primary: '#4f46e5', // Indigo 600
        secondary: '#a855f7', // Purple 500
        accent: '#10b981', // Emerald 500
      },
    },
  },
  plugins: [],
}
