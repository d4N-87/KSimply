// [EN] This file defines a client-side hook for SvelteKit.
// [IT] Questo file definisce un hook lato client per SvelteKit.
import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$paraglide/runtime';

/**
 * [EN] The `reroute` hook runs on the client before every navigation.
 * It translates a language-prefixed URL (e.g., /en/about) into a path
 * that the SvelteKit router can understand (e.g., /about), preventing client-side 404s.
 * ---
 * [IT] L'hook `reroute` viene eseguito sul client prima di ogni navigazione.
 * Traduce un URL con prefisso di lingua (es. /en/about) in un percorso
 * che il router di SvelteKit può capire (es. /about), prevenendo i 404 lato client.
 */
export const reroute: Reroute = ({ url }) => {
	// [EN] Use Paraglide's utility to remove the language prefix from the URL's pathname.
	// [IT] Usa l'utility di Paraglide per rimuovere il prefisso della lingua dal pathname dell'URL.
	return deLocalizeUrl(url).pathname;
};