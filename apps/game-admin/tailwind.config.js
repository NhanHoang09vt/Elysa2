/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        elysia: {
          dark: '#0e1117',
          panel: '#161922',
          border: '#2a2e3d',
          accent: '#d4af37', // Gold
          blue: '#1c69d4',   // Sapphire Blue
          crimson: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
