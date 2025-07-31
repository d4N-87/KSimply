// [EN] This file defines a server-side hook for SvelteKit.
// [IT] Questo file definisce un hook lato server per SvelteKit.
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$paraglide/server';

/**
 * [EN] The `handle` hook runs on the server for every request after a route has been matched.
 * It uses the Paraglide middleware to set the correct language context for the request.
 * ---
 * [IT] L'hook `handle` viene eseguito sul server per ogni richiesta dopo che una rotta è stata trovata.
 * Usa il middleware di Paraglide per impostare il corretto contesto della lingua per la richiesta.
 */
export const handle: Handle = ({ event, resolve }) => {
	// [EN] Pass the request to the Paraglide middleware.
	// [IT] Passa la richiesta al middleware di Paraglide.
	return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		// [EN] Overwrite the original request with the "delocalized" one provided by the middleware.
		// [IT] Sovrascrive la richiesta originale con quella "delocalizzata" fornita dal middleware.
		event.request = localizedRequest;

		// [EN] Make the current language available to server-side `load` functions via `event.locals`.
		// [IT] Rende la lingua corrente disponibile alle funzioni `load` lato server tramite `event.locals`.
		event.locals.paraglide = { lang: locale };

		// [EN] Continue processing the request, and transform the final HTML.
		// [IT] Continua l'elaborazione della richiesta e trasforma l'HTML finale.
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				// [EN] Replace the %lang% placeholder in `app.html` with the detected locale.
				// [IT] Sostituisce il placeholder %lang% in `app.html` con la lingua rilevata.
				return html.replace('%lang%', locale);
			}
		});
	});
};