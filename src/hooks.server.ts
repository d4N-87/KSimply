// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$paraglide/server';

/**
 * L'hook `handle` viene eseguito sul server dopo che la rotta è stata trovata.
 * Usa il middleware di Paraglide per impostare la lingua corretta per la richiesta.
 */
export const handle: Handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		event.locals.paraglide = { lang: locale };

		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale);
			}
		});
	});
};