/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// --- NUOVA SEZIONE ---
			keyframes: {
				stripes: {
					'0%': { backgroundPosition: '1rem 0' },
					'100%': { backgroundPosition: '0 0' }
				}
			},
			animation: {
				stripes: 'stripes 1s linear infinite'
			}
			// --- FINE NUOVA SEZIONE ---
		}
	},
	plugins: []
};