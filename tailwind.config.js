/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#2eb4b4', light: '#4dc9c9', dark: '#1a8f8f' },
        navy: { DEFAULT: '#174f9a', light: '#2468c2', dark: '#0d3570' },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-up': 'fadeInUp 0.7s ease forwards',
        'float': 'float 4s ease-in-out infinite',
        'blob': 'blobMove 8s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
    },
  },
  plugins: [],
};
