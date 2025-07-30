import adapter from '@sveltejs/adapter-auto'; // [EN] We will change this to adapter-static for deployment. [IT] Lo cambieremo in adapter-static per il deployment.
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// [EN] Enables processing of <style> blocks with tools like PostCSS and TypeScript in <script> tags.
	// [IT] Abilita l'elaborazione dei blocchi <style> con strumenti come PostCSS e di TypeScript nei tag <script>.
	preprocess: vitePreprocess(),

	kit: {
		// [EN] The adapter is responsible for converting the SvelteKit app into a deployable format.
		// [IT] L'adattatore è responsabile della conversione dell'app SvelteKit in un formato distribuibile.
		adapter: adapter(),

		/**
		 * [EN] Path aliases for cleaner imports.
		 * The `$paraglide` alias must point to the directory where Paraglide
		 * generates its runtime code, as defined in `vite.config.ts`.
		 * ---
		 * [IT] Alias di percorso per importazioni più pulite.
		 * L'alias `$paraglide` deve puntare alla directory in cui Paraglide
		 * genera il suo codice di runtime, come definito in `vite.config.ts`.
		 */
		alias: {
			'$paraglide': './src/paraglide'
		}
	}
};

export default config;