// src/hooks.ts
import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$paraglide/runtime';

/**
 * L'hook `reroute` universale. Viene eseguito per primo sia sul server
 * che sul client. È questo che risolve il "Not Found" iniziale.
 */
export const reroute: Reroute = ({ url }) => {
	return deLocalizeUrl(url).pathname;
};