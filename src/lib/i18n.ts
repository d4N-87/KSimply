import { createI18n } from "@inlang/paraglide-sveltekit"
import * as runtime from "$paraglide/runtime.js"

// Con una configurazione pulita, il codice generato da Paraglide
// accetterà questa configurazione per gestire il routing.
export const i18n = createI18n(runtime, {
	pathnames: {
		'/': {
			it: '/',
			en: '/',
			fr: '/',
			de: '/',
			es: '/',
			pt: '/',
			zh: '/'
		}
	}
})