import type { PageLoad } from './$types';

/**
 * [EN] This universal `load` function runs on both server and client.
 * It fetches the initial data required for the main page, such as the list
 * of available GPUs and all model names, by calling internal API endpoints.
 * ---
 * [IT] Questa funzione `load` universale viene eseguita sia sul server che sul client.
 * Recupera i dati iniziali necessari per la pagina principale, come la lista
 * delle GPU disponibili e tutti i nomi dei modelli, chiamando gli endpoint API interni.
 * @param {object} context - The SvelteKit load context, containing the `fetch` function.
 * @returns An object containing the data needed to render the page.
 */
export const load: PageLoad = async ({ fetch }) => {
	try {
		// [EN] Fetch both data sets in parallel for efficiency.
		// [IT] Esegue entrambe le chiamate API in parallelo per efficienza.
		const gpuResponsePromise = fetch('/api/gpus');
		const modelResponsePromise = fetch('/api/models');

		const [gpuResponse, modelResponse] = await Promise.all([
			gpuResponsePromise,
			modelResponsePromise
		]);

		if (!gpuResponse.ok) {
			throw new Error('Errore nel caricare la lista delle GPU');
		}
		if (!modelResponse.ok) {
			throw new Error('Errore nel caricare la lista dei modelli');
		}

		const gpus = await gpuResponse.json();
		const allModelNames = await modelResponse.json();

		// [EN] Return both data sets to be available in the page component.
		// [IT] Restituisce entrambi i set di dati per renderli disponibili nel componente della pagina.
		return {
			gpus: gpus,
			allModelNames: allModelNames
		};
	} catch (error) {
		console.error('Errore in +page.ts load:', error);
		// [EN] Return empty arrays on error to prevent the page from crashing.
		// [IT] Restituisce array vuoti in caso di errore per non far crashare la pagina.
		return {
			gpus: [],
			allModelNames: []
		};
	}
};