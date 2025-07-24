import { sveltekit } from '@sveltejs/kit/vite';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		sveltekit()
	],
	// --- CORREZIONE PERFORMANCE ---
	// Diciamo a Vite di non riesaminare queste dipendenze ad ogni salvataggio
	optimizeDeps: {
		include: ['lucide-svelte', '@inlang/paraglide-sveltekit']
	}
});