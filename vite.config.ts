import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// Il plugin di SvelteKit va messo DOPO Paraglide
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/paraglide', // Usiamo la tua outdir originale
			strategy: ['url', 'cookie', 'baseLocale'], // Diamo priorità all'URL
			urlPatterns: [
				// Definiamo il pattern per il routing con prefisso di lingua
				{
					pattern: '/:path(.*)?',
					localized: [
						// I percorsi con prefisso vanno prima
						['en', '/en/:path(.*)?'],
						['fr', '/fr/:path(.*)?'],
						['de', '/de/:path(.*)?'],
						['es', '/es/:path(.*)?'],
						['pt', '/pt/:path(.*)?'],
						['zh', '/zh/:path(.*)?'],
						// Il percorso della lingua di base (senza prefisso) va per ultimo
						['it', '/:path(.*)?']
					]
				}
			]
		}),
		sveltekit()
	],
	optimizeDeps: {
		include: ['lucide-svelte']
	}
});