import { i18n } from '$lib/i18n';

// TENTATIVO FINALE: Rimuoviamo `sequence`.
// L'ipotesi è che `i18n.handle()` (ora che è correttamente configurato
// in `i18n.ts`) restituisca già un handler perfettamente compatibile
// con SvelteKit. `sequence` potrebbe essere un'inutile complicazione
// che interferisce con la riscrittura dell'URL.
export const handle = i18n.handle();