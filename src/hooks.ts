// [EN] This file defines a universal hook for SvelteKit, running on both server and client.
// [IT] Questo file definisce un hook universale per SvelteKit, eseguito sia sul server che sul client.
import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$paraglide/runtime';

/**
 * [EN] The universal `reroute` hook. It runs first, on both the server and the client.
 * This is the critical piece that solves the initial "Not Found" error on the server.
 * ---
 * [IT] L'hook `reroute` universale. Viene eseguito per primo, sia sul server che sul client.
 * È questo il pezzo critico che risolve l'errore iniziale "Not Found" sul server.
 */
export const reroute: Reroute = ({ url }) => {
	// [EN] Before SvelteKit's router runs, this function strips the language prefix from the URL.
	// [IT] Prima che il router di SvelteKit venga eseguito, questa funzione rimuove il prefisso della lingua dall'URL.
	return deLocalizeUrl(url).pathname;
};