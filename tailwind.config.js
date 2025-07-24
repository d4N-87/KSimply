/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'; // <-- Usa 'import' invece di 'require'

export default { // <-- Usa 'export default' invece di 'module.exports'
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'background': '#030b17',
        'surface': 'rgb(19 28 48 / 0.7)',
        'border': 'rgb(55 65 81 / 0.5)',
        'primary-text': '#E5E7EB',
        'secondary-text': '#9CA3AF',
        'primary-accent': '#22d3ee',
        'secondary-accent': '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      keyframes: {
        stripes: {
          '0%': { backgroundPosition: '1rem 0' },
          '100%': { backgroundPosition: '0 0' }
        }
      },
      animation: {
        stripes: 'stripes 1s linear infinite'
      },
    }
  },
  plugins: [],
};

