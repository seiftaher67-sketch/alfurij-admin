/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#F2B400',
        'dark': '#1A1A1A',
        'gray-dark': '#4A4A4A',
        'gray-light': '#F5F5F5',
        'border-gray-light': '#D6D6D6',
        sand: "#F4E6D8",
        sandLight: "#FDF7F1",
        sandDark: "#EFD8C5",
        textDark: "#4A3B2D",
        textSoft: "#8C7460",
        primary: "#C27B48",
        primaryDark: "#B36432",
      },
      boxShadow: {
        card: "6px 6px 14px rgba(0,0,0,0.08), -6px -6px 14px rgba(255,255,255,0.9)",
        insetSoft: "inset 3px 3px 6px rgba(0,0,0,0.06), inset -3px -3px 6px rgba(255,255,255,0.8)",
      },
      borderRadius: {
        soft: "16px",
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif']
      }
    },
  },
  plugins: [],
}
