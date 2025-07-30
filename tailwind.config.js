import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  // [EN] Configure files to scan for Tailwind classes.
  // [IT] Configura i file da scansionare per le classi di Tailwind.
  content: ['./src/**/*.{html,js,svelte,ts}'],
  
  theme: {
    // [EN] Extend the default Tailwind theme with custom values.
    // [IT] Estende il tema di default di Tailwind con valori personalizzati.
    extend: {
      // [EN] Custom color palette for the application's design system.
      // [IT] Palette di colori personalizzata per il design system dell'applicazione.
      colors: {
        'background': '#030b17',
        'surface': 'rgb(19 28 48 / 0.7)',
        'border': 'rgb(55 65 81 / 0.5)',
        'primary-text': '#E5E7EB',
        'secondary-text': '#9CA3AF',
        'primary-accent': '#22d3ee', // Cyan
        'secondary-accent': '#fbbf24', // Amber
      },
      // [EN] Custom font families.
      // [IT] Famiglie di font personalizzate.
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // For body text
        display: ['Unica One', 'cursive'], // For headings and titles
      },
      // [EN] Custom keyframe animations.
      // [IT] Animazioni keyframe personalizzate.
      keyframes: {
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
      // [EN] Registering custom animations to be used as utility classes.
      // [IT] Registrazione delle animazioni personalizzate per l'uso come classi di utilità.
      animation: {
        'subtle-float': 'subtle-float 10s ease-in-out infinite',
        stripes: 'stripes 1s linear infinite'
      },
    }
  },
  plugins: [],
};