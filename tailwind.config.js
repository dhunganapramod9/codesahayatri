/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Press Start 2P"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.85rem',
        'sm': '0.95rem',
        'base': '1.05rem',
        'lg': '1.15rem',
        'xl': '1.25rem',
        '2xl': '1.45rem',
        '3xl': '1.65rem',
        '4xl': '1.85rem',
      }
    },
  },
  plugins: [],
};