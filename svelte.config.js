import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			// CORREZIONE: Facciamo puntare l'alias alla directory di output
			// corretta definita nel tuo vite.config.ts.
			'$paraglide': './src/lib/paraglide'
		}
	}
};
export default config;