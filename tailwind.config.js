/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
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
        // MODIFICA: Unica One è il nostro nuovo font display
        display: ['Unica One', 'cursive'],
      },
      keyframes: {
        // MODIFICA: Nuova animazione per il logo
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '25%': { transform: 'translateY(-4px) rotate(1deg)' },
          '75%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        stripes: {
          '0%': { backgroundPosition: '1rem 0' },
          '100%': { backgroundPosition: '0 0' }
        }
      },
      animation: {
        // MODIFICA: Registrazione della nuova animazione
        'subtle-float': 'subtle-float 10s ease-in-out infinite',
        stripes: 'stripes 1s linear infinite'
      },
    }
  },
  plugins: [],
};