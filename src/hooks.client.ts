// src/hooks.client.ts
import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$paraglide/runtime';

/**
 * L'hook `reroute` viene eseguito sul client prima di ogni navigazione.
 * Traduce l'URL con prefisso di lingua in un percorso che il router
 * di SvelteKit può capire, prevenendo i 404 lato client.
 */
export const reroute: Reroute = ({ url }) => {
	return deLocalizeUrl(url).pathname;
};