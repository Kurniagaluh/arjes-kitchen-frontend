/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arjes: {
          bg: "#1A2F23",      // Hijau Tua
          surface: "#243E30", // Hijau agak terang
          text: "#F7F5EB",    // Cream
          gold: "#C5A059",    // Emas
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}