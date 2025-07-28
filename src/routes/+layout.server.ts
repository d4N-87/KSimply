import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	// --- SPIA SUL SERVER ---
	// Ad ogni cambio di pagina, stampiamo nella console del TERMINALE
	// il contenuto di `locals.paraglide`.
	// Questo è il test più importante: ci dice se l'hook sta funzionando.
	console.log('[SERVER DEBUG] Valore di locals.paraglide:', locals.paraglide);
	// -----------------------

	return {
		paraglide: locals.paraglide
	};
};