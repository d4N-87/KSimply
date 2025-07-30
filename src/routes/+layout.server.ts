import type { LayoutServerLoad } from './$types';

/**
 * [EN] This root server layout's `load` function is crucial for i18n.
 * It takes the `paraglide` object, which is populated by the server hook
 * with the current language context, and passes it to the client-side
 * layout component (`+layout.svelte`) via the `data` prop.
 * ---
 * [IT] La funzione `load` di questo layout server di root è cruciale per l'i18n.
 * Prende l'oggetto `paraglide`, che viene popolato dall'hook del server
 * con il contesto della lingua corrente, e lo passa al componente di layout
 * lato client (`+layout.svelte`) tramite la prop `data`.
 */
export const load: LayoutServerLoad = ({ locals }) => {
	return {
		paraglide: locals.paraglide
	};
};