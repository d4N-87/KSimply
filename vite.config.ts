// [EN] Import plugins for Vite.
// [IT] Importa i plugin per Vite.
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// [EN] The Paraglide plugin must run before the SvelteKit plugin.
		// [IT] Il plugin di Paraglide deve essere eseguito prima di quello di SvelteKit.
		paraglideVitePlugin({
			// [EN] Path to the inlang project settings file.
			// [IT] Percorso al file di impostazioni del progetto inlang.
			project: './project.inlang',

			// [EN] Directory where Paraglide will generate its runtime files.
			// [IT] Directory in cui Paraglide genererà i suoi file di runtime.
			outdir: './src/paraglide',

			// [EN] Defines the priority for detecting the user's locale. 'url' is highest.
			// [IT] Definisce la priorità per rilevare la lingua dell'utente. 'url' ha la priorità massima.
			strategy: ['url', 'cookie', 'baseLocale'],

			// [EN] Defines the URL structure for language-based routing.
			// [IT] Definisce la struttura degli URL per il routing basato sulla lingua.
			urlPatterns: [
				{
					// [EN] A generic pattern that matches any path.
					// [IT] Un pattern generico che corrisponde a qualsiasi percorso.
					pattern: '/:path(.*)?',
					localized: [
						// [EN] More specific, prefixed paths must come first.
						// [IT] I percorsi più specifici, con prefisso, devono venire prima.
						['en', '/en/:path(.*)?'],
						['fr', '/fr/:path(.*)?'],
						['de', '/de/:path(.*)?'],
						['es', '/es/:path(.*)?'],
						['pt', '/pt/:path(.*)?'],
						['zh', '/zh/:path(.*)?'],
						
						// [EN] The base language path (without prefix) must be last.
						// [IT] Il percorso della lingua base (senza prefisso) deve essere per ultimo.
						['it', '/:path(.*)?']
					]
				}
			]
		}),
		sveltekit()
	],
	// [EN] Dependency optimization for Vite.
	// [IT] Ottimizzazione delle dipendenze per Vite.
	optimizeDeps: {
		include: ['lucide-svelte']
	}
});