// CORREZIONE: Entrambe le importazioni ora usano l'alias `$paraglide`
// per puntare al codice generato localmente.
import type { ParaglideLocals, AvailableLanguageTag } from '$paraglide/runtime';

declare global {
	namespace App {
		/**
		 * [EN] Augments the SvelteKit `Locals` interface to include Paraglide's context.
		 * This makes the language context available in `event.locals` for server-side code.
		 * ---
		 * [IT] Estende l'interfaccia `Locals` di SvelteKit per includere il contesto di Paraglide.
		 * Questo rende il contesto della lingua disponibile in `event.locals` per il codice lato server.
		 */
		interface Locals {
			paraglide: ParaglideLocals;
		}
	}
}

export {};