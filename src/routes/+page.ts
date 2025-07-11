// src/routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    try {
        // Usiamo la funzione 'fetch' fornita da SvelteKit
        const response = await fetch('/api/gpus');
        if (!response.ok) {
            throw new Error('Errore nel caricare la lista delle GPU');
        }
        const gpus = await response.json();
        
        // I dati restituiti qui saranno disponibili nella nostra pagina .svelte
        return {
            gpus: gpus
        };
    } catch (error) {
        console.error("Errore in +page.ts load:", error);
        // Restituiamo un array vuoto in caso di errore per non far crashare la pagina
        return {
            gpus: []
        };
    }
};